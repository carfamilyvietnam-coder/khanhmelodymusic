from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app(config_name='production'):
    app = Flask(__name__)

    from app.config import config
    selected_config = config.get(config_name)
    if selected_config is None:
        raise ValueError(f'Unknown application configuration: {config_name}')
    app.config.from_object(selected_config)

    if not app.config.get('SQLALCHEMY_DATABASE_URI'):
        raise RuntimeError('DATABASE_URL must be configured')
    if config_name == 'production':
        for setting in ('SECRET_KEY', 'JWT_SECRET_KEY'):
            value = app.config.get(setting)
            if (
                not value
                or len(value) < 32
                or value.strip() != value
                or '<' in value
                or '>' in value
                or value.startswith('development-only-')
            ):
                raise RuntimeError(
                    f'{setting} must be set to a random value of at least 32 characters in production')
        if app.config['SECRET_KEY'] == app.config['JWT_SECRET_KEY']:
            raise RuntimeError('SECRET_KEY and JWT_SECRET_KEY must be different values in production')

    CORS(app, origins=app.config['CORS_ORIGINS'], allow_headers=['Authorization', 'Content-Type'])
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    @jwt.additional_claims_loader
    def add_role_claim(identity):
        from app.models.user import User
        try:
            user = db.session.get(User, int(identity))
        except (TypeError, ValueError):
            user = None
        return {'role': user.role if user else 'invalid'}

    @jwt.token_in_blocklist_loader
    def reject_inactive_users(jwt_header, jwt_payload):
        from app.models.user import User
        try:
            user = db.session.get(User, int(jwt_payload['sub']))
        except (TypeError, ValueError, KeyError):
            return True
        return user is None or not user.is_active

    from app.routes.auth import auth_bp
    from app.routes.songs import songs_bp
    from app.routes.users import users_bp
    from app.routes.revenue import revenue_bp
    from app.routes.wallets import wallets_bp
    from app.routes.upload import upload_bp

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(songs_bp, url_prefix='/api')
    app.register_blueprint(users_bp, url_prefix='/api/admin')
    app.register_blueprint(revenue_bp, url_prefix='/api/admin')
    app.register_blueprint(wallets_bp, url_prefix='/api/admin')
    app.register_blueprint(upload_bp, url_prefix='/api')
    return app
