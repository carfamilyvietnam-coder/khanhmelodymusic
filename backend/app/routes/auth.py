import re

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required
from app import db
from app.models.user import User
from app.models.wallet import Wallet
from app.security import current_user

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    username = data.get('username')
    password = data.get('password')
    if not isinstance(username, str) or not isinstance(password, str) or not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.query.filter_by(username=username.strip()).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401
    if not user.is_active:
        return jsonify({'error': 'Account is deactivated'}), 403

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role},
    )
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
        },
    }), 200


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    if not all(isinstance(value, str) and value.strip() for value in (username, email, password)):
        return jsonify({'error': 'Username, email, and password are required'}), 400
    username, email = username.strip(), email.strip().lower()
    if not 3 <= len(username) <= 50 or not re.fullmatch(r'[\w.-]+', username):
        return jsonify({'error': 'Username must be 3-50 characters and use letters, numbers, dots, underscores or hyphens'}), 400
    if len(password) < 8 or len(password) > 72:
        return jsonify({'error': 'Password must be between 8 and 72 characters'}), 400
    if not re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', email) or len(email) > 254:
        return jsonify({'error': 'A valid email address is required'}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 409

    user = User(username=username, email=email, role='member')
    user.set_password(password)
    db.session.add(user)
    try:
        db.session.flush()
        db.session.add(Wallet(user_id=user.id, balance=0))
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception('Failed to register a member')
        return jsonify({'error': 'Registration could not be completed'}), 500

    return jsonify({'message': 'User registered successfully', 'user': user.to_dict()}), 201


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user = current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict()), 200
