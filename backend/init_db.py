import os

from dotenv import load_dotenv

load_dotenv()

from app import create_app, db
from app.models.user import User
from app.models.wallet import Wallet


def init_database():
    app = create_app(os.getenv('FLASK_ENV', 'production'))
    with app.app_context():
        db.create_all()

        username = os.getenv('INITIAL_ADMIN_USERNAME')
        email = os.getenv('INITIAL_ADMIN_EMAIL')
        password = os.getenv('INITIAL_ADMIN_PASSWORD')
        if not any((username, email, password)):
            print('Database initialized. No administrator was created; configure INITIAL_ADMIN_* to bootstrap one.')
            return
        if not all((username, email, password)) or len(password) < 16:
            raise RuntimeError('Set INITIAL_ADMIN_USERNAME, INITIAL_ADMIN_EMAIL, and a 16+ character INITIAL_ADMIN_PASSWORD together.')
        existing_admin = User.query.filter_by(role='admin').first()
        if existing_admin:
            if existing_admin.username != username.strip() or existing_admin.email.lower() != email.strip().lower():
                raise RuntimeError('An administrator already exists. Use its username and email to rotate its password.')
            existing_admin.set_password(password)
            db.session.commit()
            print('Administrator password updated. Remove the bootstrap environment variables now.')
            return
        if User.query.filter(
                (User.username == username) | (User.email == email.lower())).first():
            raise RuntimeError('The requested initial administrator username or email is already in use.')

        admin = User(username=username.strip(), email=email.strip().lower(), role='admin', is_active=True)
        admin.set_password(password)
        db.session.add(admin)
        db.session.flush()
        db.session.add(Wallet(user_id=admin.id, balance=0))
        db.session.commit()
        print('Initial administrator created. Remove the bootstrap environment variables now.')


if __name__ == '__main__':
    init_database()
