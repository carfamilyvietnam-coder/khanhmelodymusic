import os
import tempfile

from dotenv import load_dotenv

load_dotenv()

from app import create_app
from app.models.song import Song
from app.routes.upload import get_r2_client, normalize_audio_key
from app.streams import publish_stream_catalog, transcode_and_publish


app = create_app(os.getenv('FLASK_ENV', 'production'))

with app.app_context():
    client = get_r2_client()
    private_bucket = app.config['R2_BUCKET_NAME']
    songs = Song.query.order_by(Song.created_at.desc()).all()

    for index, song in enumerate(songs, start=1):
        key = normalize_audio_key(song.audio_url)
        suffix = os.path.splitext(key)[1] or '.audio'
        with tempfile.TemporaryDirectory(prefix='khanhmelody-source-') as source_dir:
            source_path = os.path.join(source_dir, f'original{suffix}')
            client.download_file(private_bucket, key, source_path)
            transcode_and_publish(source_path, key, client=client)
        print(f'Converted {index}/{len(songs)}')

    catalog_url = publish_stream_catalog(songs)
    print(f'Published {len(songs)} songs to {catalog_url}')
