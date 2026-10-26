from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.transaction import Transaction
from sqlalchemy import func
from datetime import datetime, timedelta

revenue_bp = Blueprint('revenue', __name__)

@revenue_bp.route('/revenue', methods=['GET'])
@jwt_required()
def get_revenue():
    """Get revenue statistics"""
    try:
        # Calculate total revenue
        total_revenue = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.status == 'completed'
        ).scalar() or 0
        
        # Count total transactions
        total_transactions = Transaction.query.filter_by(status='completed').count()
        
        # Get recent transactions
        recent_transactions = Transaction.query.filter_by(status='completed').order_by(
            Transaction.created_at.desc()
        ).limit(100).all()
        
        # Calculate monthly revenue for the last 6 months
        monthly_revenue = []
        for i in range(6):
            month_start = datetime.now() - timedelta(days=30 * (i + 1))
            month_end = datetime.now() - timedelta(days=30 * i)
            
            month_revenue = db.session.query(func.sum(Transaction.amount)).filter(
                Transaction.status == 'completed',
                Transaction.created_at >= month_start,
                Transaction.created_at < month_end
            ).scalar() or 0
            
            monthly_revenue.append({
                'month': month_end.strftime('%Y-%m'),
                'revenue': float(month_revenue)
            })
        
        return jsonify({
            'total_revenue': float(total_revenue),
            'total_transactions': total_transactions,
            'transactions': [t.to_dict() for t in recent_transactions],
            'monthly_revenue': monthly_revenue[::-1]  # Reverse to show oldest to newest
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@revenue_bp.route('/revenue/songs', methods=['GET'])
@jwt_required()
def get_revenue_by_song():
    """Get revenue breakdown by song"""
    try:
        from app.models.song import Song
        
        # Get revenue per song
        song_revenue = db.session.query(
            Song.id,
            Song.title,
            Song.artist,
            func.sum(Transaction.amount).label('total_revenue'),
            func.count(Transaction.id).label('total_sales')
        ).join(
            Transaction, Song.id == Transaction.song_id
        ).filter(
            Transaction.status == 'completed'
        ).group_by(
            Song.id
        ).order_by(
            func.sum(Transaction.amount).desc()
        ).all()
        
        result = []
        for song in song_revenue:
            result.append({
                'song_id': song.id,
                'title': song.title,
                'artist': song.artist,
                'total_revenue': float(song.total_revenue) if song.total_revenue else 0,
                'total_sales': song.total_sales
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
