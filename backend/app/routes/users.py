from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.wallet import Wallet

users_bp = Blueprint('users', __name__)

@users_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    """Get all users"""
    try:
        users = User.query.all()
        return jsonify([user.to_dict() for user in users]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@users_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """Get single user by ID"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@users_bp.route('/users', methods=['POST'])
@jwt_required()
def create_user():
    """Create new user (admin only)"""
    try:
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'user')
        is_active = data.get('is_active', True)
        wallet_balance = data.get('wallet_balance', 0)
        
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
        db.session.commit()
        
        # Create wallet for new user
        wallet = Wallet(user_id=user.id, balance=wallet_balance)
        db.session.add(wallet)
        db.session.commit()
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@users_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """Update user (admin only)"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        user.role = data.get('role', user.role)
        user.is_active = data.get('is_active', user.is_active)
        
        # Update password if provided
        if data.get('password'):
            user.set_password(data['password'])
        
        # Update wallet balance if provided
        if 'wallet_balance' in data and user.wallet:
            user.wallet.balance = data['wallet_balance']
        
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@users_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """Delete user (admin only)"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Prevent deleting self
        if user_id == current_user_id:
            return jsonify({'error': 'Cannot delete yourself'}), 400
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@users_bp.route('/users/<int:user_id>/toggle-status', methods=['PUT'])
@jwt_required()
def toggle_user_status(user_id):
    """Toggle user active status (admin only)"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.is_active = not user.is_active
        db.session.commit()
        
        return jsonify({
            'message': f'User {"activated" if user.is_active else "deactivated"} successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
