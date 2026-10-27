from decimal import Decimal, InvalidOperation

from flask import Blueprint, current_app, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.user import User
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.security import admin_required, current_user, login_required

users_bp = Blueprint('users', __name__)


def parse_non_negative_balance(value):
    try:
        balance = Decimal(str(value))
        if balance != balance.quantize(Decimal('0.01')):
            return None
    except (InvalidOperation, TypeError, ValueError):
        return None
    return balance if balance.is_finite() and Decimal('0') <= balance <= Decimal('99999999.99') else None


@users_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    """Get all users"""
    try:
        users = User.query.all()
        return jsonify([user.to_dict() for user in users]), 200
    except Exception:
        db.session.rollback()
        current_app.logger.exception('Could not list users')
        return jsonify({'error': 'Internal server error'}), 500


@users_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
@login_required
def get_user(user_id):
    """Get single user by ID"""
    try:
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        if current_user().id != user.id and current_user().role != 'admin':
            return jsonify({'error': 'Access denied'}), 403
        return jsonify(user.to_dict()), 200
    except Exception:
        db.session.rollback()
        current_app.logger.exception('Could not retrieve user')
        return jsonify({'error': 'Internal server error'}), 500


@users_bp.route('/users', methods=['POST'])
@jwt_required()
@admin_required
def create_user():
    """Create new user (admin only)"""
    try:
        data = request.get_json(silent=True) or {}
        
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'member')
        if role not in ('admin', 'member', 'user'):
            return jsonify({'error': 'Invalid user role'}), 400
        if role == 'user':
            role = 'member'
        is_active = data.get('is_active', True)
        wallet_balance = parse_non_negative_balance(data.get('wallet_balance', 0))
        if wallet_balance is None:
            return jsonify({'error': 'Wallet balance must be a non-negative number'}), 400
        
        if not all([username, email, password]):
            return jsonify({'error': 'Username, email, and password are required'}), 400
        
        # Check if username or email already exists
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        # Create new user
        user = User(username=username, email=email, role=role, is_active=is_active)
        user.set_password(password)
        
        db.session.add(user)
        db.session.flush()
        
        # Create wallet for new user
        wallet = Wallet(user_id=user.id, balance=wallet_balance)
        db.session.add(wallet)
        if wallet_balance > 0:
            db.session.add(Transaction(
                user_id=user.id,
                amount=wallet_balance,
                transaction_type='adjustment',
                status='completed',
            ))
        db.session.commit()
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception:
        db.session.rollback()
        current_app.logger.exception('Could not create user')
        return jsonify({'error': 'Internal server error'}), 500


@users_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_user(user_id):
    """Update user (admin only)"""
    try:
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json(silent=True) or {}
        if 'role' in data and data['role'] not in ('admin', 'member', 'user'):
            return jsonify({'error': 'Invalid user role'}), 400
        
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        user.role = 'member' if data.get('role') == 'user' else data.get('role', user.role)
        user.is_active = data.get('is_active', user.is_active)
        
        # Update password if provided
        if data.get('password'):
            user.set_password(data['password'])
        
        # Update wallet balance if provided
        if 'wallet_balance' in data:
            wallet_balance = parse_non_negative_balance(data['wallet_balance'])
            if wallet_balance is None:
                return jsonify({'error': 'Wallet balance must be a non-negative number'}), 400
            wallet = Wallet.query.filter_by(user_id=user.id).with_for_update().first()
            if not wallet:
                return jsonify({'error': 'User wallet not found'}), 404
            adjustment = wallet_balance - Decimal(str(wallet.balance or 0))
            if adjustment:
                wallet.balance = wallet_balance
                db.session.add(Transaction(
                    user_id=user.id,
                    amount=adjustment,
                    transaction_type='adjustment',
                    status='completed',
                ))
        
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception:
        db.session.rollback()
        current_app.logger.exception('Could not update user')
        return jsonify({'error': 'Internal server error'}), 500


@users_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_user(user_id):
    """Delete user (admin only)"""
    try:
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Prevent deleting self
        if user_id == current_user().id:
            return jsonify({'error': 'Cannot delete yourself'}), 400
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'}), 200
        
    except Exception:
        db.session.rollback()
        current_app.logger.exception('Could not delete user')
        return jsonify({'error': 'Internal server error'}), 500


@users_bp.route('/users/<int:user_id>/toggle-status', methods=['PUT'])
@jwt_required()
@admin_required
def toggle_user_status(user_id):
    """Toggle user active status (admin only)"""
    try:
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.is_active = not user.is_active
        db.session.commit()
        
        return jsonify({
            'message': f'User {"activated" if user.is_active else "deactivated"} successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception:
        db.session.rollback()
        current_app.logger.exception('Could not change user status')
        return jsonify({'error': 'Internal server error'}), 500
