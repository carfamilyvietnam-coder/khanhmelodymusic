from datetime import datetime
from app import db

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    song_id = db.Column(db.Integer, db.ForeignKey('songs.id'), nullable=True)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    transaction_type = db.Column(db.String(20), default='purchase')  # purchase, refund, topup
    status = db.Column(db.String(20), default='completed')  # pending, completed, failed
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        """Convert transaction object to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'song_id': self.song_id,
            'song_title': self.song.title if self.song else None,
            'amount': float(self.amount) if self.amount else 0,
            'transaction_type': self.transaction_type,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<Transaction {self.id} - {self.amount}>'
