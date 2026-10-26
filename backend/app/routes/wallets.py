from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.wallet import Wallet
from app.models.user import User
from app.models.transaction import Transaction

wallets_bp = Blueprint('wallets', __name__)

@wallets_bp.route('/wallets', methods=['GET'])
@jwt_required()
def get_wallets():
    """Get all wallets"""
    try:
        wallets = Wallet.query.all()
        return jsonify([wallet.to_dict() for wallet in wallets]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@wallets_bp.route('/wallets/<int:wallet_id>', methods=['GET'])
@jwt_required()
def get_wallet(wallet_id):
    """Get single wallet by ID"""
    try:
        wallet = Wallet.query.get(wallet_id)
        if not wallet:
            return jsonify({'error': 'Wallet not found'}), 404
        return jsonify(wallet.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@wallets_bp.route('/wallets/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_wallet(user_id):
    """Get wallet by user ID"""
    try:
        wallet = Wallet.query.filter_by(user_id=user_id).first()
        if not wallet:
            return jsonify({'error': 'Wallet not found'}), 404
        return jsonify(wallet.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@wallets_bp.route('/wallets/<int:wallet_id>/topup', methods=['POST'])
@jwt_required()
def topup_wallet(wallet_id):
    """Top up wallet balance"""
    try:
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        wallet = Wallet.query.get(wallet_id)
        if not wallet:
            return jsonify({'error': 'Wallet not found'}), 404
        
        data = request.get_json()
        amount = data.get('amount', 0)
        
        if amount <= 0:
            return jsonify({'error': 'Amount must be greater than 0'}), 400
        
        wallet.balance += amount
        
        # Create transaction record
        transaction = Transaction(
            user_id=wallet.user_id,
            amount=amount,
            transaction_type='topup',
            status='completed'
        )
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'Wallet topped up successfully',
            'wallet': wallet.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@wallets_bp.route('/wallets/<int:wallet_id>/deduct', methods=['POST'])
@jwt_required()
def deduct_wallet(wallet_id):
    """Deduct from wallet balance"""
    try:
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        wallet = Wallet.query.get(wallet_id)
        if not wallet:
            return jsonify({'error': 'Wallet not found'}), 404
        
        data = request.get_json()
        amount = data.get('amount', 0)
        
        if amount <= 0:
            return jsonify({'error': 'Amount must be greater than 0'}), 400
        
        if wallet.balance < amount:
            return jsonify({'error': 'Insufficient balance'}), 400
        
        wallet.balance -= amount
        
        # Create transaction record
        transaction = Transaction(
            user_id=wallet.user_id,
            amount=amount,
            transaction_type='purchase',
            status='completed'
        )
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'Amount deducted successfully',
            'wallet': wallet.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@wallets_bp.route('/wallets/<int:wallet_id>/toggle-status', methods=['PUT'])
@jwt_required()
def toggle_wallet_status(wallet_id):
    """Toggle wallet active status"""
    try:
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        wallet = Wallet.query.get(wallet_id)
        if not wallet:
            return jsonify({'error': 'Wallet not found'}), 404
        
        wallet.is_active = not wallet.is_active
        db.session.commit()
        
        return jsonify({
            'message': f'Wallet {"activated" if wallet.is_active else "deactivated"} successfully',
            'wallet': wallet.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
