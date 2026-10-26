from datetime import datetime
from app import db

class Song(db.Model):
    __tablename__ = 'songs'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False, index=True)
    artist = db.Column(db.String(255), nullable=False, index=True)
    album = db.Column(db.String(255))
    genre = db.Column(db.String(50), index=True)
    price = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    audio_url = db.Column(db.Text)
    play_count = db.Column(db.Integer, default=0)
    download_count = db.Column(db.Integer, default=0)
    duration = db.Column(db.Integer)  # Duration in seconds
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with transactions
    transactions = db.relationship('Transaction', backref='song', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert song object to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'artist': self.artist,
            'album': self.album,
            'genre': self.genre,
            'price': float(self.price) if self.price else 0,
            'audio_url': self.audio_url,
            'play_count': self.play_count,
            'download_count': self.download_count,
            'duration': self.duration,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Song {self.title} by {self.artist}>'
