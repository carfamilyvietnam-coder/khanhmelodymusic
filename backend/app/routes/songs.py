from decimal import Decimal, InvalidOperation

from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import jwt_required
from sqlalchemy import select

from app import db
from app.models.song import Song
from app.models.transaction import Transaction
from app.models.wallet import Wallet
from app.security import admin_required, current_user, login_required

songs_bp = Blueprint('songs', __name__)


def has_paid(user_id, song_id):
    return Transaction.query.filter_by(
        user_id=user_id,
        song_id=song_id,
        transaction_type='purchase',
        status='completed',
    ).first() is not None


def can_access_song(user, song):
    return user.role == 'admin' or Decimal(str(song.price or 0)) <= 0 or has_paid(user.id, song.id)


def song_stream_url(song, as_attachment=False):
    from app.routes.upload import create_read_url
    return create_read_url(song.audio_url, as_attachment=as_attachment)


@songs_bp.route('/songs', methods=['GET'])
@jwt_required()
@login_required
def get_songs():
    return jsonify([song.to_dict() for song in Song.query.order_by(Song.created_at.desc()).all()]), 200


@songs_bp.route('/songs/<int:song_id>', methods=['GET'])
@jwt_required()
@login_required
def get_song(song_id):
    song = db.session.get(Song, song_id)
    if not song:
        return jsonify({'error': 'Song not found'}), 404
    return jsonify(song.to_dict()), 200


@songs_bp.route('/admin/songs', methods=['GET'])
@jwt_required()
@admin_required
def get_admin_songs():
    return jsonify([song.to_dict() for song in Song.query.order_by(Song.created_at.desc()).all()]), 200


@songs_bp.route('/admin/songs', methods=['POST'])
@jwt_required()
@admin_required
def create_song():
    data = request.get_json(silent=True) or {}
    title, artist, audio_key = data.get('title'), data.get('artist'), data.get('audio_url')
    if not all(isinstance(value, str) and value.strip() for value in (title, artist, audio_key)):
        return jsonify({'error': 'Title, artist, and an uploaded audio object key are required'}), 400
    if not audio_key.startswith('audio/') or '..' in audio_key or audio_key.startswith('/'):
        return jsonify({'error': 'Audio must reference an uploaded audio object'}), 400
    try:
        price = Decimal(str(data.get('price', 0)))
        if not price.is_finite() or price < 0 or price > Decimal('99999999.99') or price != price.quantize(Decimal('0.01')):
            raise InvalidOperation
        duration = data.get('duration')
        duration = int(duration) if duration is not None else None
        if duration is not None and duration < 0:
            raise ValueError
    except (InvalidOperation, TypeError, ValueError):
        return jsonify({'error': 'Price and duration must be valid non-negative numbers'}), 400

    song = Song(
        title=title.strip(),
        artist=artist.strip(),
        album=data.get('album'),
        genre=data.get('genre'),
        price=price,
        audio_url=audio_key,
        duration=duration,
    )
    db.session.add(song)
    db.session.commit()
    return jsonify({'message': 'Song created successfully', 'song': song.to_dict()}), 201


@songs_bp.route('/admin/songs/<int:song_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_song(song_id):
    song = db.session.get(Song, song_id)
    if not song:
        return jsonify({'error': 'Song not found'}), 404
    data = request.get_json(silent=True) or {}
    for field in ('title', 'artist', 'album', 'genre'):
        if field in data:
            if field in ('title', 'artist') and (not isinstance(data[field], str) or not data[field].strip()):
                return jsonify({'error': f'{field} cannot be empty'}), 400
            setattr(song, field, data[field].strip() if isinstance(data[field], str) else data[field])
    if 'price' in data:
        try:
            price = Decimal(str(data['price']))
            if not price.is_finite() or price < 0 or price > Decimal('99999999.99') or price != price.quantize(Decimal('0.01')):
                raise InvalidOperation
            song.price = price
        except (InvalidOperation, TypeError, ValueError):
            return jsonify({'error': 'Price must be a non-negative number'}), 400
    if 'duration' in data:
        try:
            duration = int(data['duration'])
            if duration < 0:
                raise ValueError
            song.duration = duration
        except (TypeError, ValueError):
            return jsonify({'error': 'Duration must be a non-negative integer'}), 400
    db.session.commit()
    return jsonify({'message': 'Song updated successfully', 'song': song.to_dict()}), 200


@songs_bp.route('/admin/songs/<int:song_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_song(song_id):
    song = db.session.get(Song, song_id)
    if not song:
        return jsonify({'error': 'Song not found'}), 404
    from app.routes.upload import delete_object
    if song.audio_url:
        try:
            delete_object(song.audio_url)
        except (RuntimeError, ValueError):
            current_app.logger.exception('Failed to delete song object from R2')
            return jsonify({'error': 'Could not remove song from storage'}), 503
    db.session.delete(song)
    db.session.commit()
    return jsonify({'message': 'Song deleted successfully'}), 200


@songs_bp.route('/songs/<int:song_id>/stream', methods=['GET'])
@jwt_required()
@login_required
def stream_song(song_id):
    song = db.session.get(Song, song_id)
    if not song:
        return jsonify({'error': 'Song not found'}), 404
    user = current_user()
    if not can_access_song(user, song):
        return jsonify({'error': 'Purchase is required to listen to this song'}), 403
    try:
        url = song_stream_url(song)
    except (RuntimeError, ValueError):
        current_app.logger.exception('Could not generate private song URL')
        return jsonify({'error': 'Song storage is unavailable'}), 503
    song.play_count = (song.play_count or 0) + 1
    db.session.commit()
    return jsonify({'stream_url': url}), 200


@songs_bp.route('/songs/<int:song_id>/play', methods=['POST'])
@jwt_required()
@login_required
def increment_play_count(song_id):
    return stream_song(song_id)


@songs_bp.route('/songs/<int:song_id>/download', methods=['POST'])
@jwt_required()
@login_required
def download_song(song_id):
    song = db.session.get(Song, song_id)
    if not song:
        return jsonify({'error': 'Song not found'}), 404
    user = current_user()

    if can_access_song(user, song):
        try:
            url = song_stream_url(song, as_attachment=True)
        except (RuntimeError, ValueError):
            current_app.logger.exception('Could not generate private song URL')
            return jsonify({'error': 'Song storage is unavailable'}), 503
        song.download_count = (song.download_count or 0) + 1
        db.session.commit()
        return jsonify({'stream_url': url, 'already_purchased': True}), 200

    wallet = Wallet.query.filter_by(user_id=user.id).with_for_update().first()
    if has_paid(user.id, song.id):
        try:
            url = song_stream_url(song, as_attachment=True)
        except (RuntimeError, ValueError):
            current_app.logger.exception('Could not generate private song URL')
            return jsonify({'error': 'Song storage is unavailable'}), 503
        song.download_count = (song.download_count or 0) + 1
        db.session.commit()
        return jsonify({'stream_url': url, 'already_purchased': True}), 200
    price = Decimal(str(song.price or 0))
    if not wallet or not wallet.is_active:
        return jsonify({'error': 'An active wallet is required to purchase this song'}), 400
    if Decimal(str(wallet.balance or 0)) < price:
        return jsonify({'error': 'Insufficient wallet balance'}), 409

    try:
        url = song_stream_url(song, as_attachment=True)
    except (RuntimeError, ValueError):
        current_app.logger.exception('Could not generate private song URL')
        return jsonify({'error': 'Song storage is unavailable'}), 503

    wallet.balance = Decimal(str(wallet.balance)) - price
    song.download_count = (song.download_count or 0) + 1
    db.session.add(Transaction(
        user_id=user.id,
        song_id=song.id,
        amount=price,
        transaction_type='purchase',
        status='completed',
    ))
    db.session.commit()
    return jsonify({'stream_url': url, 'already_purchased': False}), 200


@songs_bp.route('/my-downloads', methods=['GET'])
@jwt_required()
@login_required
def get_my_downloads():
    user = current_user()
    purchases = db.session.execute(
        select(Transaction.song_id)
        .where(
            Transaction.user_id == user.id,
            Transaction.transaction_type == 'purchase',
            Transaction.status == 'completed',
            Transaction.song_id.is_not(None),
        )
        .distinct()
    ).scalars().all()
    songs = Song.query.filter(Song.id.in_(purchases)).all() if purchases else []
    return jsonify([song.to_dict() for song in songs]), 200
