from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import os
import qrcode
from io import BytesIO
import base64

app = Flask(__name__)
app.config['SECRET_KEY'] = 'khanhmelody-secret-key-2024'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///khanhmelody.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'jwt-secret-key-2024'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
app.config['UPLOAD_FOLDER'] = 'uploads/songs'
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='member')  # 'admin' or 'member'
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    wallet = db.relationship('Wallet', backref='user', uselist=False, lazy=True)
    downloads = db.relationship('Download', backref='user', lazy=True)

class Wallet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    balance = db.Column(db.Float, default=0.0)
    is_active = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    transactions = db.relationship('Transaction', backref='wallet', lazy=True)

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    wallet_id = db.Column(db.Integer, db.ForeignKey('wallet.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(20), nullable=False)  # 'deposit' or 'purchase'
    status = db.Column(db.String(20), default='pending')  # 'pending', 'completed', 'failed'
    payment_method = db.Column(db.String(50))  # 'qr', 'barcode'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    download_id = db.Column(db.Integer, db.ForeignKey('download.id'), nullable=True)

class Song(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    artist = db.Column(db.String(200), nullable=False)
    album = db.Column(db.String(200))
    genre = db.Column(db.String(100))
    duration = db.Column(db.Integer)  # in seconds
    file_path = db.Column(db.String(500), nullable=False)
    cover_image = db.Column(db.String(500))
    price = db.Column(db.Float, default=50000.0)  # 50,000 VND
    play_count = db.Column(db.Integer, default=0)
    download_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    downloads = db.relationship('Download', backref='song', lazy=True)

class Download(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    song_id = db.Column(db.Integer, db.ForeignKey('song.id'), nullable=False)
    transaction_id = db.Column(db.Integer, db.ForeignKey('transaction.id'), nullable=True)
    downloaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    transactions = db.relationship('Transaction', backref='download', uselist=False, foreign_keys='Transaction.download_id')

# Initialize database
with app.app_context():
    db.create_all()
    # Create default admin if not exists
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        hashed_password = bcrypt.generate_password_hash('admin123').decode('utf-8')
        admin = User(username='admin', email='admin@khanhmelody.com', 
                    password=hashed_password, role='admin')
        db.session.add(admin)
        db.session.commit()
        print("Default admin account created: username=admin, password=admin123")

# Helper functions
def generate_qr_code(transaction_id, amount):
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr_data = f"KHANHMELODY|{transaction_id}|{amount}"
    qr.add_data(qr_data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return img_str

# Authentication Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(username=data['username'], email=data['email'], password=hashed_password)
    db.session.add(user)
    db.session.commit()
    
    # Create wallet for user
    wallet = Wallet(user_id=user.id)
    db.session.add(wallet)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully', 'user_id': user.id}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    
    if user and bcrypt.check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role
            }
        }), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

# Admin Routes
@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if current_user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    users = User.query.all()
    return jsonify([{
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'role': u.role,
        'is_active': u.is_active,
        'created_at': u.created_at.isoformat(),
        'wallet_balance': u.wallet.balance if u.wallet else 0
    } for u in users]), 200

@app.route('/api/admin/users/<int:user_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def manage_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if current_user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    user = User.query.get_or_404(user_id)
    
    if request.method == 'PUT':
        data = request.json
        user.is_active = data.get('is_active', user.is_active)
        user.role = data.get('role', user.role)
        db.session.commit()
        return jsonify({'message': 'User updated successfully'}), 200
    
    if request.method == 'DELETE':
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'}), 200

@app.route('/api/admin/songs', methods=['GET', 'POST'])
@jwt_required()
def manage_songs():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if current_user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    if request.method == 'GET':
        songs = Song.query.all()
        return jsonify([{
            'id': s.id,
            'title': s.title,
            'artist': s.artist,
            'album': s.album,
            'genre': s.genre,
            'duration': s.duration,
            'price': s.price,
            'play_count': s.play_count,
            'download_count': s.download_count,
            'created_at': s.created_at.isoformat()
        } for s in songs]), 200
    
    if request.method == 'POST':
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        song = Song(
            title=request.form.get('title'),
            artist=request.form.get('artist'),
            album=request.form.get('album'),
            genre=request.form.get('genre'),
            duration=int(request.form.get('duration', 0)),
            file_path=file_path,
            price=float(request.form.get('price', 50000)),
            created_by=current_user_id
        )
        db.session.add(song)
        db.session.commit()
        
        return jsonify({'message': 'Song uploaded successfully', 'song_id': song.id}), 201

@app.route('/api/admin/songs/<int:song_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def update_delete_song(song_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if current_user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    song = Song.query.get_or_404(song_id)
    
    if request.method == 'PUT':
        data = request.json
        song.title = data.get('title', song.title)
        song.artist = data.get('artist', song.artist)
        song.album = data.get('album', song.album)
        song.genre = data.get('genre', song.genre)
        song.price = data.get('price', song.price)
        db.session.commit()
        return jsonify({'message': 'Song updated successfully'}), 200
    
    if request.method == 'DELETE':
        # Delete file from filesystem
        if os.path.exists(song.file_path):
            os.remove(song.file_path)
        db.session.delete(song)
        db.session.commit()
        return jsonify({'message': 'Song deleted successfully'}), 200

@app.route('/api/admin/revenue', methods=['GET'])
@jwt_required()
def get_revenue():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if current_user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    transactions = Transaction.query.filter_by(type='purchase', status='completed').all()
    total_revenue = sum(t.amount for t in transactions)
    
    return jsonify({
        'total_revenue': total_revenue,
        'total_transactions': len(transactions),
        'transactions': [{
            'id': t.id,
            'amount': t.amount,
            'created_at': t.created_at.isoformat()
        } for t in transactions]
    }), 200

@app.route('/api/admin/wallets', methods=['GET'])
@jwt_required()
def get_all_wallets():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if current_user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    wallets = Wallet.query.all()
    return jsonify([{
        'id': w.id,
        'user_id': w.user_id,
        'username': w.user.username,
        'balance': w.balance,
        'is_active': w.is_active
    } for w in wallets]), 200

# Member Routes
@app.route('/api/songs', methods=['GET'])
@jwt_required()
def get_songs():
    songs = Song.query.all()
    return jsonify([{
        'id': s.id,
        'title': s.title,
        'artist': s.artist,
        'album': s.album,
        'genre': s.genre,
        'duration': s.duration,
        'price': s.price
    } for s in songs]), 200

@app.route('/api/songs/<int:song_id>/stream', methods=['GET'])
@jwt_required()
def stream_song(song_id):
    song = Song.query.get_or_404(song_id)
    song.play_count += 1
    db.session.commit()
    return send_from_directory(os.path.dirname(song.file_path), 
                               os.path.basename(song.file_path))

@app.route('/api/wallet', methods=['GET', 'POST'])
@jwt_required()
def manage_wallet():
    current_user_id = get_jwt_identity()
    wallet = Wallet.query.filter_by(user_id=current_user_id).first()
    
    if request.method == 'GET':
        return jsonify({
            'balance': wallet.balance,
            'is_active': wallet.is_active
        }), 200
    
    if request.method == 'POST':
        data = request.json
        amount = float(data.get('amount', 0))
        
        transaction = Transaction(
            wallet_id=wallet.id,
            amount=amount,
            type='deposit',
            payment_method=data.get('payment_method', 'qr')
        )
        db.session.add(transaction)
        db.session.commit()
        
        # Generate QR code
        qr_code = generate_qr_code(transaction.id, amount)
        
        return jsonify({
            'transaction_id': transaction.id,
            'qr_code': qr_code,
            'amount': amount,
            'status': 'pending'
        }), 201

@app.route('/api/wallet/activate', methods=['POST'])
@jwt_required()
def activate_wallet():
    current_user_id = get_jwt_identity()
    wallet = Wallet.query.filter_by(user_id=current_user_id).first()
    wallet.is_active = True
    db.session.commit()
    return jsonify({'message': 'Wallet activated successfully'}), 200

@app.route('/api/songs/<int:song_id>/download', methods=['POST'])
@jwt_required()
def download_song(song_id):
    current_user_id = get_jwt_identity()
    song = Song.query.get_or_404(song_id)
    wallet = Wallet.query.filter_by(user_id=current_user_id).first()
    
    if not wallet or not wallet.is_active:
        return jsonify({'error': 'Wallet not activated'}), 400
    
    if wallet.balance < song.price:
        return jsonify({'error': 'Insufficient balance'}), 400
    
    # Check if already downloaded
    existing_download = Download.query.filter_by(
        user_id=current_user_id, song_id=song_id
    ).first()
    
    if existing_download:
        return send_from_directory(os.path.dirname(song.file_path), 
                                   os.path.basename(song.file_path))
    
    # Create transaction and download
    transaction = Transaction(
        wallet_id=wallet.id,
        amount=song.price,
        type='purchase',
        status='completed'
    )
    wallet.balance -= song.price
    song.download_count += 1
    
    download = Download(
        user_id=current_user_id,
        song_id=song_id,
        transaction_id=transaction.id
    )
    
    db.session.add(transaction)
    db.session.add(download)
    db.session.commit()
    
    return send_from_directory(os.path.dirname(song.file_path), 
                               os.path.basename(song.file_path))

@app.route('/api/my-downloads', methods=['GET'])
@jwt_required()
def get_my_downloads():
    current_user_id = get_jwt_identity()
    downloads = Download.query.filter_by(user_id=current_user_id).all()
    
    return jsonify([{
        'id': d.id,
        'song_id': d.song_id,
        'title': d.song.title,
        'artist': d.song.artist,
        'downloaded_at': d.downloaded_at.isoformat()
    } for d in downloads]), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8882)
