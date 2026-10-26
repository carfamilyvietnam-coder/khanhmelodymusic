from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.song import Song
from app.models.user import User

songs_bp = Blueprint('songs', __name__)

@songs_bp.route('/songs', methods=['GET'])
@jwt_required()
def get_songs():
    """Get all songs"""
    try:
        songs = Song.query.all()
        return jsonify([song.to_dict() for song in songs]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@songs_bp.route('/songs/<int:song_id>', methods=['GET'])
@jwt_required()
def get_song(song_id):
    """Get single song by ID"""
    try:
        song = Song.query.get(song_id)
        if not song:
            return jsonify({'error': 'Song not found'}), 404
        return jsonify(song.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@songs_bp.route('/songs', methods=['POST'])
@jwt_required()
def create_song():
    """Create new song"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        
        song = Song(
            title=data.get('title'),
            artist=data.get('artist'),
            album=data.get('album'),
            genre=data.get('genre'),
            price=data.get('price', 0),
            audio_url=data.get('audio_url'),
            duration=data.get('duration')
        )
        
        db.session.add(song)
        db.session.commit()
        
        return jsonify({
            'message': 'Song created successfully',
            'song': song.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@songs_bp.route('/songs/<int:song_id>', methods=['PUT'])
@jwt_required()
def update_song(song_id):
    """Update song"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        song = Song.query.get(song_id)
        if not song:
            return jsonify({'error': 'Song not found'}), 404
        
        data = request.get_json()
        
        song.title = data.get('title', song.title)
        song.artist = data.get('artist', song.artist)
        song.album = data.get('album', song.album)
        song.genre = data.get('genre', song.genre)
        song.price = data.get('price', song.price)
        song.audio_url = data.get('audio_url', song.audio_url)
        song.duration = data.get('duration', song.duration)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Song updated successfully',
            'song': song.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@songs_bp.route('/songs/<int:song_id>', methods=['DELETE'])
@jwt_required()
def delete_song(song_id):
    """Delete song"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        song = Song.query.get(song_id)
        if not song:
            return jsonify({'error': 'Song not found'}), 404
        
        db.session.delete(song)
        db.session.commit()
        
        return jsonify({'message': 'Song deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@songs_bp.route('/songs/<int:song_id>/play', methods=['POST'])
@jwt_required()
def increment_play_count(song_id):
    """Increment song play count"""
    try:
        song = Song.query.get(song_id)
        if not song:
            return jsonify({'error': 'Song not found'}), 404
        
        song.play_count += 1
        db.session.commit()
        
        return jsonify({'message': 'Play count incremented', 'play_count': song.play_count}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@songs_bp.route('/songs/<int:song_id>/download', methods=['POST'])
@jwt_required()
def increment_download_count(song_id):
    """Increment song download count"""
    try:
        song = Song.query.get(song_id)
        if not song:
            return jsonify({'error': 'Song not found'}), 404
        
        song.download_count += 1
        db.session.commit()
        
        return jsonify({'message': 'Download count incremented', 'download_count': song.download_count}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
