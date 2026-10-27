from decimal import Decimal, InvalidOperation

from flask import Blueprint, current_app, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.security import admin_required, current_user, login_required

wallets_bp = Blueprint('wallets', __name__)


def parse_positive_amount(value):
    try:
        amount = Decimal(str(value))
        if amount != amount.quantize(Decimal('0.01')):
            return None
    except (InvalidOperation, TypeError, ValueError):
        return None
    return amount if amount.is_finite() and Decimal('0') < amount <= Decimal('99999999.99') else None


@wallets_bp.route('/wallets', methods=['GET'])
@jwt_required()
@admin_required
def get_wallets():
    """Get all wallets"""
    try:
        wallets = Wallet.query.all()
        return jsonify([wallet.to_dict() for wallet in wallets]), 200
    except Exception:
        db.session.rollback()
        current_app.logger.exception('Could not list wallets')
        return jsonify({'error': 'Internal server error'}), 500


@wallets_bp.route('/wallets/<int:wallet_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_wallet(wallet_id):
    """Get single wallet by ID"""
    try:
        wallet = db.session.get(Wallet, wallet_id)
        if not wallet:
            return jsonify({'error': 'Wallet not found'}), 404
        return jsonify(wallet.to_dict()), 200
    except Exception:
        db.session.rollback()
        current_app.logger.exception('Could not retrieve wallet')
        return jsonify({'error': 'Internal server error'}), 500


@wallets_bp.route('/wallets/user/<int:user_id>', methods=['GET'])
@jwt_required()
@login_required
def get_user_wallet(user_id):
    """Get wallet by user ID"""
    try:
        wallet = Wallet.query.filter_by(user_id=user_id).first()
        if not wallet:
            return jsonify({'error': 'Wallet not found'}), 404
        user = current_user()
        if user.id != user_id and user.role != 'admin':
            return jsonify({'error': 'Access denied'}), 403
        return jsonify(wallet.to_dict()), 200
    except Exception:
        db.session.rollback()
        current_app.logger.exception('Could not retrieve user wallet')
        return jsonify({'error': 'Internal server error'}), 500


@wallets_bp.route('/wallets/<int:wallet_id>/topup', methods=['POST'])
@jwt_required()
@admin_required
def topup_wallet(wallet_id):
    """Top up wallet balance"""
    try:
        wallet = Wallet.query.filter_by(id=wallet_id).with_for_update().first()
        if not wallet:
            return jsonify({'error': 'Wallet not found'}), 404
        
        data = request.get_json(silent=True) or {}
        amount = parse_positive_amount(data.get('amount'))
        if amount is None:
            return jsonify({'error': 'Amount must be greater than 0'}), 400
        if Decimal(str(wallet.balance or 0)) + amount > Decimal('99999999.99'):
            return jsonify({'error': 'Wallet balance exceeds the supported limit'}), 400
        
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
        
    except Exception:
        db.session.rollback()
        current_app.logger.exception('Could not top up wallet')
        return jsonify({'error': 'Internal server error'}), 500


@wallets_bp.route('/wallets/<int:wallet_id>/deduct', methods=['POST'])
@jwt_required()
@admin_required
def deduct_wallet(wallet_id):
    """Deduct from wallet balance"""
    try:
        wallet = Wallet.query.filter_by(id=wallet_id).with_for_update().first()
        if not wallet:
            return jsonify({'error': 'Wallet not found'}), 404
        
        data = request.get_json(silent=True) or {}
        amount = parse_positive_amount(data.get('amount'))
        if amount is None:
            return jsonify({'error': 'Amount must be greater than 0'}), 400
        
        if wallet.balance < amount:
            return jsonify({'error': 'Insufficient balance'}), 400
        
        wallet.balance -= amount
        
        # Create transaction record
        transaction = Transaction(
            user_id=wallet.user_id,
            amount=-amount,
            transaction_type='adjustment',
            status='completed'
        )
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'Amount deducted successfully',
            'wallet': wallet.to_dict()
        }), 200
        
    except Exception:
        db.session.rollback()
        current_app.logger.exception('Could not deduct from wallet')
        return jsonify({'error': 'Internal server error'}), 500


@wallets_bp.route('/wallets/<int:wallet_id>/toggle-status', methods=['PUT'])
@jwt_required()
@admin_required
def toggle_wallet_status(wallet_id):
    """Toggle wallet active status"""
    try:
        wallet = db.session.get(Wallet, wallet_id)
        if not wallet:
            return jsonify({'error': 'Wallet not found'}), 404
        
        wallet.is_active = not wallet.is_active
        db.session.commit()
        
        return jsonify({
            'message': f'Wallet {"activated" if wallet.is_active else "deactivated"} successfully',
            'wallet': wallet.to_dict()
        }), 200
        
    except Exception:
        db.session.rollback()
        current_app.logger.exception('Could not change wallet status')
        return jsonify({'error': 'Internal server error'}), 500
