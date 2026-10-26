"""
Database initialization script for KhanhMelody
Run this script to create the database and initial data
"""
from app import create_app, db
from app.models.user import User
from app.models.song import Song
from app.models.wallet import Wallet
from app.models.transaction import Transaction

def init_database():
    """Initialize database with tables and sample data"""
    app = create_app()
    
    with app.app_context():
        # Create all tables
        print("Creating database tables...")
        db.create_all()
        print("Tables created successfully!")
        
        # Check if admin user already exists
        admin = User.query.filter_by(username='admin').first()
        
        if not admin:
            print("Creating admin user...")
            admin = User(
                username='admin',
                email='admin@khanhmelody.com',
                role='admin',
                is_active=True
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            
            # Create wallet for admin
            admin_wallet = Wallet(user_id=admin.id, balance=0)
            db.session.add(admin_wallet)
            db.session.commit()
            print("Admin user created successfully!")
            print("Username: admin")
            print("Password: admin123")
        else:
            print("Admin user already exists")
        
        # Add sample songs if none exist
        if Song.query.count() == 0:
            print("Adding sample songs...")
            sample_songs = [
                Song(
                    title='Em Của Ngày Hôm Qua',
                    artist='Sơn Tùng M-TP',
                    album='m-tp',
                    genre='Pop',
                    price=50000,
                    audio_url='https://khanhmelody.r2.dev/songs/song1.mp3',
                    play_count=1500000,
                    download_count=50000,
                    duration=240
                ),
                Song(
                    title='Hoa Hải Đường',
                    artist='Jack',
                    album='Jack',
                    genre='Pop',
                    price=45000,
                    audio_url='https://khanhmelody.r2.dev/songs/song2.mp3',
                    play_count=2000000,
                    download_count=80000,
                    duration=210
                ),
                Song(
                    title='Bước Qua Mùa Cô Đơn',
                    artist='Vũ.',
                    album='Vũ.',
                    genre='Ballad',
                    price=40000,
                    audio_url='https://khanhmelody.r2.dev/songs/song3.mp3',
                    play_count=3000000,
                    download_count=120000,
                    duration=255
                ),
                Song(
                    title='Có Chăng Chỉ Là Giấc Mơ',
                    artist='Reddy',
                    album='Reddy',
                    genre='Pop',
                    price=35000,
                    audio_url='https://khanhmelody.r2.dev/songs/song4.mp3',
                    play_count=800000,
                    download_count=30000,
                    duration=195
                ),
                Song(
                    title='Muốn Nói Với Em',
                    artist='Hoàng Dũng',
                    album='Hoàng Dũng',
                    genre='Ballad',
                    price=40000,
                    audio_url='https://khanhmelody.r2.dev/songs/song5.mp3',
                    play_count=1200000,
                    download_count=45000,
                    duration=225
                )
            ]
            
            for song in sample_songs:
                db.session.add(song)
            
            db.session.commit()
            print(f"Added {len(sample_songs)} sample songs!")
        else:
            print("Sample songs already exist")
        
        # Add sample users if none exist
        if User.query.filter_by(role='user').count() == 0:
            print("Adding sample users...")
            sample_users = [
                {
                    'username': 'user1',
                    'email': 'user1@example.com',
                    'password': 'user123',
                    'wallet_balance': 500000
                },
                {
                    'username': 'user2',
                    'email': 'user2@example.com',
                    'password': 'user123',
                    'wallet_balance': 250000
                },
                {
                    'username': 'user3',
                    'email': 'user3@example.com',
                    'password': 'user123',
                    'wallet_balance': 100000,
                    'is_active': False
                }
            ]
            
            for user_data in sample_users:
                user = User(
                    username=user_data['username'],
                    email=user_data['email'],
                    role='user',
                    is_active=user_data.get('is_active', True)
                )
                user.set_password(user_data['password'])
                db.session.add(user)
                db.session.commit()
                
                # Create wallet
                wallet = Wallet(
                    user_id=user.id,
                    balance=user_data['wallet_balance']
                )
                db.session.add(wallet)
                db.session.commit()
            
            print(f"Added {len(sample_users)} sample users!")
        else:
            print("Sample users already exist")
        
        print("\nDatabase initialization completed successfully!")
        print("\nLogin credentials:")
        print("Admin: admin / admin123")
        print("User1: user1 / user123")
        print("User2: user2 / user123")
        print("User3: user3 / user123")

if __name__ == '__main__':
    init_database()
