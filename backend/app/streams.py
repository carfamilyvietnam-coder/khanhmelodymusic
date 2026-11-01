import json
import os
import subprocess
import tempfile
from pathlib import Path
from urllib.parse import quote

import imageio_ffmpeg
from botocore.exceptions import BotoCoreError, ClientError
from flask import current_app

from app.models.song import Song


def stream_bucket_config():
    config = current_app.config
    bucket = config.get('R2_STREAM_BUCKET_NAME')
    public_url = config.get('R2_STREAM_PUBLIC_URL', '').rstrip('/')
    private_bucket = config.get('R2_BUCKET_NAME')
    if not bucket or not public_url:
        raise RuntimeError('R2_STREAM_BUCKET_NAME and R2_STREAM_PUBLIC_URL must be configured')
    if bucket.lower() == str(private_bucket or '').lower():
        raise RuntimeError('The public stream bucket must be separate from the private audio bucket')
    return bucket, public_url


def stream_prefix(audio_reference):
    from app.routes.upload import normalize_audio_key

    key = normalize_audio_key(audio_reference)
    stem = Path(key).stem
    if not stem or stem in ('.', '..') or '/' in stem or '\\' in stem:
        raise ValueError('Invalid audio object key')
    return f'streams/{stem}'


def playlist_url(audio_reference):
    _, public_url = stream_bucket_config()
    playlist_key = f'{stream_prefix(audio_reference)}/index.m3u8'
    return f'{public_url}/{quote(playlist_key, safe="/")}'


def transcode_to_hls(input_path, output_dir):
    playlist_path = Path(output_dir) / 'index.m3u8'
    segment_pattern = Path(output_dir) / 'segment_%05d.ts'
    command = [
        imageio_ffmpeg.get_ffmpeg_exe(),
        '-nostdin',
        '-hide_banner',
        '-loglevel', 'error',
        '-y',
        '-i', os.fspath(input_path),
        '-map', '0:a:0',
        '-vn',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-ac', '2',
        '-ar', '44100',
        '-f', 'hls',
        '-hls_time', '6',
        '-hls_playlist_type', 'vod',
        '-hls_flags', 'independent_segments',
        '-hls_segment_filename', os.fspath(segment_pattern),
        os.fspath(playlist_path),
    ]
    try:
        subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True,
            timeout=current_app.config.get('HLS_TRANSCODE_TIMEOUT', 1800),
        )
    except (OSError, subprocess.SubprocessError) as error:
        details = getattr(error, 'stderr', None)
        current_app.logger.error('Audio HLS conversion failed: %s', details or error)
        raise RuntimeError('Could not convert audio into HLS') from error
    if not playlist_path.is_file() or not list(Path(output_dir).glob('segment_*.ts')):
        raise RuntimeError('Audio conversion did not create an HLS playlist and segments')
    return playlist_path


def upload_hls(output_dir, audio_reference, client=None):
    bucket, _ = stream_bucket_config()
    prefix = stream_prefix(audio_reference)
    if client is None:
        from app.routes.upload import get_r2_client
        client = get_r2_client()

    try:
        files = sorted(Path(output_dir).glob('*'))
        if not any(path.name == 'index.m3u8' for path in files):
            raise RuntimeError('HLS playlist is missing')
        for path in files:
            if not path.is_file():
                continue
            content_type = (
                'application/vnd.apple.mpegurl'
                if path.suffix == '.m3u8'
                else 'video/mp2t'
            )
            cache_control = (
                'public, max-age=60'
                if path.suffix == '.m3u8'
                else 'public, max-age=31536000, immutable'
            )
            client.upload_file(
                os.fspath(path),
                bucket,
                f'{prefix}/{path.name}',
                ExtraArgs={
                    'ContentType': content_type,
                    'CacheControl': cache_control,
                },
            )
    except (BotoCoreError, ClientError, OSError, RuntimeError) as error:
        try:
            delete_hls(audio_reference, client=client)
        except (BotoCoreError, ClientError, RuntimeError):
            current_app.logger.exception('Could not clean up incomplete HLS upload')
        raise RuntimeError('Could not publish HLS audio to Cloudflare R2') from error


def delete_hls(audio_reference, client=None):
    bucket = current_app.config.get('R2_STREAM_BUCKET_NAME')
    if not bucket:
        return
    if client is None:
        from app.routes.upload import get_r2_client
        client = get_r2_client()
    prefix = f'{stream_prefix(audio_reference)}/'
    paginator = client.get_paginator('list_objects_v2')
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
        objects = [{'Key': item['Key']} for item in page.get('Contents', [])]
        if objects:
            client.delete_objects(Bucket=bucket, Delete={'Objects': objects, 'Quiet': True})


def publish_stream_catalog(songs=None):
    bucket, public_url = stream_bucket_config()
    if songs is None:
        songs = Song.query.order_by(Song.created_at.desc()).all()
    catalog = []
    for song in songs:
        item = song.to_dict()
        item['stream_url'] = playlist_url(song.audio_url)
        catalog.append(item)

    from app.routes.upload import get_r2_client

    body = json.dumps(catalog, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    try:
        get_r2_client().put_object(
            Bucket=bucket,
            Key='catalog/songs.json',
            Body=body,
            ContentType='application/json; charset=utf-8',
            CacheControl='public, max-age=60',
        )
    except (BotoCoreError, ClientError) as error:
        raise RuntimeError('Could not publish the public song catalog') from error
    return f'{public_url}/catalog/songs.json'


def transcode_and_publish(input_path, audio_reference, client=None):
    with tempfile.TemporaryDirectory(prefix='khanhmelody-hls-') as output_dir:
        transcode_to_hls(input_path, output_dir)
        upload_hls(output_dir, audio_reference, client=client)
    return playlist_url(audio_reference)
