from datetime import datetime

from app import db


class GuestCustomer(db.Model):
    __tablename__ = 'guest_customers'

    phone = db.Column(db.String(16), primary_key=True)
    is_blocked = db.Column(db.Boolean, nullable=False, default=False, index=True)
    blocked_at = db.Column(db.DateTime)
    block_reason = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    claims = db.relationship('GuestDownloadClaim', backref='customer', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'phone': self.phone,
            'is_blocked': self.is_blocked,
            'blocked_at': self.blocked_at.isoformat() if self.blocked_at else None,
            'block_reason': self.block_reason,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class GuestDownloadClaim(db.Model):
    __tablename__ = 'guest_download_claims'

    id = db.Column(db.Integer, primary_key=True)
    customer_phone = db.Column(
        db.String(16),
        db.ForeignKey('guest_customers.phone', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )
    customer_name = db.Column(db.String(100), nullable=False)
    transfer_reference = db.Column(db.String(120), nullable=False, index=True)
    song_id = db.Column(db.Integer, nullable=False, index=True)
    song_title = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_verified = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            'id': self.id,
            'customer_phone': self.customer_phone,
            'customer_name': self.customer_name,
            'transfer_reference': self.transfer_reference,
            'song_id': self.song_id,
            'song_title': self.song_title,
            'amount': float(self.amount),
            'payment_verified': self.payment_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
