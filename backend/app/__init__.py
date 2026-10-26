from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_name='default'):
    app = Flask(__name__)
    
    # Load configuration
    if config_name == 'testing':
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
    else:
        app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
            'DATABASE_URL',
            'postgresql://postgres:postgres@localhost:5432/khanhmelody'
        )
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'khanhmelody-secret-key-change-in-production')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 24 hours
    
    # Initialize extensions
    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.songs import songs_bp
    from app.routes.users import users_bp
    from app.routes.revenue import revenue_bp
    from app.routes.wallets import wallets_bp
    from app.routes.upload import upload_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(songs_bp, url_prefix='/api/admin')
    app.register_blueprint(users_bp, url_prefix='/api/admin')
    app.register_blueprint(revenue_bp, url_prefix='/api/admin')
    app.register_blueprint(wallets_bp, url_prefix='/api/admin')
    app.register_blueprint(upload_bp, url_prefix='/api')
    
    return app
