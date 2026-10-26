import os
from datetime import timedelta

class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'khanhmelody-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # R2 Configuration
    R2_BUCKET_NAME = os.getenv('R2_BUCKET_NAME', 'khanhmelody')
    R2_ACCOUNT_ID = os.getenv('R2_ACCOUNT_ID')
    R2_ACCESS_KEY_ID = os.getenv('R2_ACCESS_KEY_ID')
    R2_SECRET_ACCESS_KEY = os.getenv('R2_SECRET_ACCESS_KEY')
    R2_PUBLIC_URL = os.getenv('R2_PUBLIC_URL', 'https://khanhmelody.r2.dev')


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'postgresql://postgres:postgres@localhost:5432/khanhmelody'
    )


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///test.db'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
