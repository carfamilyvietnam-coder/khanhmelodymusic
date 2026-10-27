from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity

from app import db
from app.models.user import User


def current_user():
    identity = get_jwt_identity()
    if identity is None:
        return None
    try:
        user_id = int(identity)
    except (TypeError, ValueError):
        return None
    user = db.session.get(User, user_id)
    if user is None or not user.is_active:
        return None
    return user


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        user = current_user()
        if user is None:
            return jsonify({'error': 'Active account required'}), 401
        return view(*args, **kwargs)

    return wrapped


def admin_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        user = current_user()
        if user is None:
            return jsonify({'error': 'Active account required'}), 401
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return view(*args, **kwargs)

    return wrapped
