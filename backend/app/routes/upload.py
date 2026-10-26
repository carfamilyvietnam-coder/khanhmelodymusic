from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
import boto3
from botocore.client import Config
import os
from werkzeug.utils import secure_filename
import uuid

upload_bp = Blueprint('upload', __name__)

# R2 Configuration
R2_BUCKET = os.getenv('R2_BUCKET_NAME', 'khanhmelody')
R2_ACCOUNT_ID = os.getenv('R2_ACCOUNT_ID')
R2_ACCESS_KEY = os.getenv('R2_ACCESS_KEY_ID')
R2_SECRET_KEY = os.getenv('R2_SECRET_ACCESS_KEY')
R2_PUBLIC_URL = os.getenv('R2_PUBLIC_URL', 'https://khanhmelody.r2.dev')

# Allowed file extensions
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg', 'm4a', 'jpg', 'jpeg', 'png', 'webp'}

def get_r2_client():
    """Initialize R2 client"""
    return boto3.client(
        's3',
        endpoint_url=f'https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com',
        aws_access_key_id=R2_ACCESS_KEY,
        aws_secret_access_key=R2_SECRET_KEY,
        config=Config(signature_version='s3v4'),
        region_name='auto'
    )

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('/upload/r2', methods=['POST'])
@jwt_required()
def upload_to_r2():
    """Upload file to Cloudflare R2"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        object_key = request.form.get('objectKey')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Generate object key if not provided
        if not object_key:
            file_extension = file.filename.rsplit('.', 1)[1].lower()
            object_key = f"{uuid.uuid4()}.{file_extension}"
        else:
            object_key = secure_filename(object_key)
        
        # Upload to R2
        s3_client = get_r2_client()
        s3_client.upload_fileobj(
            file,
            R2_BUCKET,
            object_key,
            ExtraArgs={'ContentType': file.content_type}
        )
        
        # Generate public URL
        public_url = f"{R2_PUBLIC_URL}/{object_key}"
        
        return jsonify({
            'message': 'File uploaded successfully',
            'url': public_url,
            'objectKey': object_key
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@upload_bp.route('/upload/presigned-url', methods=['POST'])
@jwt_required()
def generate_presigned_url():
    """Generate presigned URL for direct upload to R2"""
    try:
        data = request.get_json()
        object_key = data.get('objectKey')
        file_type = data.get('fileType')
        
        if not object_key:
            return jsonify({'error': 'objectKey is required'}), 400
        
        s3_client = get_r2_client()
        
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Bucket=R2_BUCKET,
            Key=object_key,
            ContentType=file_type,
            ExpiresIn=3600  # 1 hour
        )
        
        public_url = f"{R2_PUBLIC_URL}/{object_key}"
        
        return jsonify({
            'presignedUrl': presigned_url,
            'publicUrl': public_url,
            'objectKey': object_key
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@upload_bp.route('/upload/delete', methods=['POST'])
@jwt_required()
def delete_from_r2():
    """Delete file from R2"""
    try:
        data = request.get_json()
        object_key = data.get('objectKey')
        
        if not object_key:
            return jsonify({'error': 'objectKey is required'}), 400
        
        s3_client = get_r2_client()
        s3_client.delete_object(
            Bucket=R2_BUCKET,
            Key=object_key
        )
        
        return jsonify({'message': 'File deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
