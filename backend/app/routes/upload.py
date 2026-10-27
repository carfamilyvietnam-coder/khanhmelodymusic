import uuid

import boto3
from botocore.client import Config
from botocore.exceptions import BotoCoreError, ClientError
from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename

from app.security import admin_required

upload_bp = Blueprint('upload', __name__)

ALLOWED_TYPES = {
    'mp3': ('audio', 'audio/mpeg'),
    'wav': ('audio', 'audio/wav'),
    'ogg': ('audio', 'audio/ogg'),
    'm4a': ('audio', 'audio/mp4'),
    'flac': ('audio', 'audio/flac'),
    'jpg': ('covers', 'image/jpeg'),
    'jpeg': ('covers', 'image/jpeg'),
    'png': ('covers', 'image/png'),
    'webp': ('covers', 'image/webp'),
}


def get_r2_client():
    config = current_app.config
    required = ('R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME')
    if any(not config.get(name) for name in required):
        raise RuntimeError('R2 storage is not configured')
    return boto3.client(
        's3',
        endpoint_url=f"https://{config['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com",
        aws_access_key_id=config['R2_ACCESS_KEY_ID'],
        aws_secret_access_key=config['R2_SECRET_ACCESS_KEY'],
        config=Config(signature_version='s3v4'),
        region_name='auto',
    )


def normalize_audio_key(file_reference):
    if not isinstance(file_reference, str):
        raise ValueError('Invalid audio reference')
    public_url = current_app.config.get('R2_PUBLIC_URL', '').rstrip('/')
    if public_url and file_reference.startswith(public_url + '/'):
        file_reference = file_reference[len(public_url) + 1:]
    if not file_reference.startswith(('audio/', 'songs/')) or '..' in file_reference or file_reference.startswith('/'):
        raise ValueError('Invalid audio object key')
    return file_reference


def create_read_url(file_reference, as_attachment=False):
    key = normalize_audio_key(file_reference)
    config = current_app.config
    params = {'Bucket': config['R2_BUCKET_NAME'], 'Key': key}
    if as_attachment:
        filename = secure_filename(key.rsplit('/', 1)[-1]) or 'audio'
        params['ResponseContentDisposition'] = f'attachment; filename="{filename}"'
    try:
        return get_r2_client().generate_presigned_url(
            'get_object',
            Params=params,
            ExpiresIn=3600,
        )
    except (BotoCoreError, ClientError) as error:
        raise RuntimeError('Could not generate private storage URL') from error


def delete_object(file_reference):
    key = normalize_audio_key(file_reference)
    config = current_app.config
    try:
        get_r2_client().delete_object(Bucket=config['R2_BUCKET_NAME'], Key=key)
    except (BotoCoreError, ClientError) as error:
        raise RuntimeError('Could not delete storage object') from error


def file_metadata(file):
    if not file or not file.filename:
        raise ValueError('No file selected')
    safe_name = secure_filename(file.filename)
    if '.' not in safe_name:
        raise ValueError('File type not allowed')
    extension = safe_name.rsplit('.', 1)[1].lower()
    if extension not in ALLOWED_TYPES:
        raise ValueError('File type not allowed')
    prefix, expected_type = ALLOWED_TYPES[extension]
    if file.mimetype != expected_type:
        raise ValueError('File content type does not match its extension')
    return prefix, extension, expected_type


@upload_bp.route('/upload/r2', methods=['POST'])
@jwt_required()
@admin_required
def upload_to_r2():
    file = request.files.get('file')
    try:
        prefix, extension, content_type = file_metadata(file)
    except ValueError as error:
        return jsonify({'error': str(error)}), 400
    object_key = f'{prefix}/{uuid.uuid4().hex}.{extension}'
    try:
        get_r2_client().upload_fileobj(
            file,
            current_app.config['R2_BUCKET_NAME'],
            object_key,
            ExtraArgs={'ContentType': content_type},
        )
    except (BotoCoreError, ClientError, RuntimeError):
        current_app.logger.exception('R2 upload failed')
        return jsonify({'error': 'File could not be uploaded to storage'}), 503
    return jsonify({'message': 'File uploaded successfully', 'objectKey': object_key}), 201


@upload_bp.route('/upload/presigned-url', methods=['POST'])
@jwt_required()
@admin_required
def generate_presigned_url():
    data = request.get_json(silent=True) or {}
    extension = data.get('extension')
    if not isinstance(extension, str) or extension.lower() not in ALLOWED_TYPES:
        return jsonify({'error': 'A supported file extension is required'}), 400
    extension = extension.lower()
    prefix, _, content_type = ALLOWED_TYPES[extension]
    object_key = f'{prefix}/{uuid.uuid4().hex}.{extension}'
    try:
        presigned_url = get_r2_client().generate_presigned_url(
            'put_object',
            Params={
                'Bucket': current_app.config['R2_BUCKET_NAME'],
                'Key': object_key,
                'ContentType': content_type,
            },
            ExpiresIn=900,
        )
    except (BotoCoreError, ClientError, RuntimeError):
        current_app.logger.exception('Could not generate an R2 upload URL')
        return jsonify({'error': 'Storage is unavailable'}), 503
    return jsonify({'presignedUrl': presigned_url, 'objectKey': object_key}), 200


@upload_bp.route('/upload/delete', methods=['POST'])
@jwt_required()
@admin_required
def delete_from_r2():
    data = request.get_json(silent=True) or {}
    object_key = data.get('objectKey')
    try:
        if not isinstance(object_key, str) or not object_key.startswith(('audio/', 'covers/')):
            raise ValueError('Invalid storage object key')
        if '..' in object_key or object_key.startswith('/'):
            raise ValueError('Invalid storage object key')
        get_r2_client().delete_object(
            Bucket=current_app.config['R2_BUCKET_NAME'],
            Key=object_key,
        )
    except ValueError as error:
        return jsonify({'error': str(error)}), 400
    except (BotoCoreError, ClientError, RuntimeError):
        current_app.logger.exception('R2 delete failed')
        return jsonify({'error': 'File could not be deleted from storage'}), 503
    return jsonify({'message': 'File deleted successfully'}), 200
