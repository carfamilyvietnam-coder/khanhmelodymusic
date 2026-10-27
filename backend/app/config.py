import os
from datetime import timedelta


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_TOKEN_LOCATION = ['headers']
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024
    DEFAULT_CORS_ORIGINS = [
        'https://khanhmelodymussic.com',
        'https://www.khanhmelodymussic.com',
        'https://khanhmelody-admin.pages.dev',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
    ]
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv('CORS_ORIGINS', ','.join(DEFAULT_CORS_ORIGINS)).split(',')
        if origin.strip()
    ]
    R2_BUCKET_NAME = os.getenv('R2_BUCKET_NAME', 'khanhmelody')
    R2_ACCOUNT_ID = os.getenv('R2_ACCOUNT_ID')
    R2_ACCESS_KEY_ID = os.getenv('R2_ACCESS_KEY_ID')
    R2_SECRET_ACCESS_KEY = os.getenv('R2_SECRET_ACCESS_KEY')
    R2_PUBLIC_URL = os.getenv('R2_PUBLIC_URL', 'https://khanhmelody.r2.dev')


class DevelopmentConfig(Config):
    DEBUG = True
    SECRET_KEY = os.getenv('SECRET_KEY', 'development-only-secret-change-before-deploy')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'development-only-jwt-secret-change-before-deploy')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///khanhmelody.db')


class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite://'
    SECRET_KEY = 'test-secret-for-testing-only-at-least-32-characters'
    JWT_SECRET_KEY = 'test-jwt-secret-for-testing-only-at-least-32-characters'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': ProductionConfig,
}
