# KhanhMelody Backend API

Backend API cho dự án KhanhMelody - Ứng dụng nghe nhạc bản quyền. Xây dựng với Flask (Python), PostgreSQL database, và Cloudflare R2 storage.

## 📋 Mục Lục

- [Tổng Quan](#tổng-quan)
- [Tính Năng](#tính-năng)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
- [Cài Đặt](#cài-đặt)
- [Cấu Hình](#cấu-hình)
- [Khởi Tạo Database](#khởi-tạo-database)
- [Chạy Ứng Dụng](#chạy-ứng-dụng)
- [API Documentation](#api-documentation)
- [Kiểm Thử API](#kiểm-thử-api)
- [Deployment](#deployment)

## 🎯 Tổng Quan

Backend API cung cấp các endpoint cho:
- Xác thực người dùng (Authentication)
- Quản lý bài hát (Songs CRUD)
- Quản lý người dùng (Users CRUD)
- Quản lý ví tiền (Wallet Management)
- Theo dõi doanh thu (Revenue Tracking)
- Upload file lên Cloudflare R2

## ✨ Tính Năng

- **JWT Authentication**: Xác thực bảo mật với JWT tokens
- **Role-based Access Control**: Phân quyền Admin/User
- **RESTful API**: Thiết kế API RESTful chuẩn
- **PostgreSQL Database**: Cơ sở dữ liệu quan hệ mạnh mẽ
- **Cloudflare R2 Integration**: Lưu trữ file trên R2
- **CORS Support**: Hỗ trợ cross-origin requests
- **Database Migrations**: Quản lý schema với Flask-Migrate

## 📁 Cấu Trúc Dự Án

```
khanhmelody-backend/
├── app/
│   ├── __init__.py          # Flask app initialization
│   ├── config.py            # Configuration settings
│   ├── models/              # Database models
│   │   ├── __init__.py
│   │   ├── user.py          # User model
│   │   ├── song.py          # Song model
│   │   ├── wallet.py        # Wallet model
│   │   └── transaction.py   # Transaction model
│   └── routes/              # API routes
│       ├── __init__.py
│       ├── auth.py          # Authentication endpoints
│       ├── songs.py         # Song management endpoints
│       ├── users.py         # User management endpoints
│       ├── revenue.py       # Revenue tracking endpoints
│       ├── wallets.py       # Wallet management endpoints
│       └── upload.py        # File upload endpoints
├── init_db.py               # Database initialization script
├── run.py                   # Application entry point
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
└── README.md               # This file
```

## 💻 Yêu Cầu Hệ Thống

- **Python**: 3.8 hoặc cao hơn
- **PostgreSQL**: 12 hoặc cao hơn
- **pip**: Python package manager
- **Virtual Environment** (khuyến nghị)

## 🚀 Cài Đặt

### 1. Clone dự án

```bash
cd D:\khanhmelody\backend
```

### 2. Tạo virtual environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Cài đặt dependencies

```bash
pip install -r requirements.txt
```

### 4. Cài đặt PostgreSQL

**Windows:**
- Download từ: https://www.postgresql.org/download/windows/
- Cài đặt với password: `postgres` (hoặc thay đổi trong .env)

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

### 5. Tạo database

```bash
# Đăng nhập vào PostgreSQL
psql -U postgres

# Tạo database
CREATE DATABASE khanhmelody;

# Thoát
\q
```

## ⚙️ Cấu Hình

### 1. Copy file environment template

```bash
copy .env.example .env
```

### 2. Cập nhật file .env

```bash
# Flask Configuration
FLASK_ENV=development
FLASK_APP=run.py

# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/khanhmelody

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-change-in-production

# Cloudflare R2 Configuration
R2_BUCKET_NAME=khanhmelody
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_key_here
R2_PUBLIC_URL=https://khanhmelody.r2.dev
```

**Lưu ý:**
- Thay `your_password` bằng password PostgreSQL của bạn
- Thay `your-secret-key` bằng secret key mạnh
- Cập nhật thông tin R2 từ Cloudflare Dashboard

## 🗄️ Khởi Tạo Database

Chạy script khởi tạo database:

```bash
python init_db.py
```

Script này sẽ:
- Tạo tất cả các bảng trong database
- Tạo admin user mặc định
- Thêm sample songs
- Thêm sample users

**Thông tin đăng nhập mặc định:**
- Admin: `admin` / `admin123`
- User1: `user1` / `user123`
- User2: `user2` / `user123`
- User3: `user3` / `user123`

## 🏃 Chạy Ứng Dụng

### Development Mode

```bash
python run.py
```

Server sẽ chạy tại: `http://0.0.0.0:8882`

### Production Mode với Gunicorn

```bash
gunicorn -w 4 -b 0.0.0.0:8882 run:app
```

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/login
Đăng nhập và nhận JWT token

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@khanhmelody.com",
    "role": "admin"
  }
}
```

#### POST /api/register
Đăng ký user mới

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123"
}
```

#### GET /api/me
Lấy thông tin user hiện tại

**Headers:**
```
Authorization: Bearer <token>
```

### Songs Endpoints

#### GET /api/admin/songs
Lấy danh sách tất cả bài hát

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Em Của Ngày Hôm Qua",
    "artist": "Sơn Tùng M-TP",
    "album": "m-tp",
    "genre": "Pop",
    "price": 50000,
    "audio_url": "https://khanhmelody.r2.dev/songs/song1.mp3",
    "play_count": 1500000,
    "download_count": 50000,
    "duration": 240,
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T10:30:00"
  }
]
```

#### POST /api/admin/songs
Thêm bài hát mới (Admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Bài Hát Mới",
  "artist": "Ca Sĩ",
  "album": "Album",
  "genre": "Pop",
  "price": 50000,
  "audio_url": "https://khanhmelody.r2.dev/songs/new-song.mp3",
  "duration": 240
}
```

#### PUT /api/admin/songs/:id
Cập nhật bài hát (Admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Title Updated",
  "artist": "Artist Updated",
  "price": 60000
}
```

#### DELETE /api/admin/songs/:id
Xóa bài hát (Admin only)

**Headers:**
```
Authorization: Bearer <token>
```

### Users Endpoints

#### GET /api/admin/users
Lấy danh sách tất cả users (Admin only)

**Headers:**
```
Authorization: Bearer <token>
```

#### POST /api/admin/users
Thêm user mới (Admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "user",
  "is_active": true,
  "wallet_balance": 100000
}
```

#### PUT /api/admin/users/:id
Cập nhật user (Admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "username": "updated_username",
  "role": "admin",
  "is_active": false
}
```

#### DELETE /api/admin/users/:id
Xóa user (Admin only)

**Headers:**
```
Authorization: Bearer <token>
```

### Revenue Endpoints

#### GET /api/admin/revenue
Lấy thống kê doanh thu (Admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_revenue": 150000000,
  "total_transactions": 1250,
  "transactions": [
    {
      "id": 1,
      "user_id": 1,
      "song_id": 1,
      "song_title": "Em Của Ngày Hôm Qua",
      "amount": 50000,
      "transaction_type": "purchase",
      "status": "completed",
      "created_at": "2024-01-15T10:30:00"
    }
  ],
  "monthly_revenue": [
    {
      "month": "2024-01",
      "revenue": 4000000
    }
  ]
}
```

### Wallets Endpoints

#### GET /api/admin/wallets
Lấy danh sách tất cả ví (Admin only)

**Headers:**
```
Authorization: Bearer <token>
```

#### POST /api/admin/wallets/:id/topup
Nạp tiền vào ví (Admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 100000
}
```

#### POST /api/admin/wallets/:id/deduct
Trừ tiền từ ví (Admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 50000
}
```

### Upload Endpoints

#### POST /api/upload/r2
Upload file lên Cloudflare R2

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: File cần upload
- `objectKey`: Tên file (tùy chọn)

**Response:**
```json
{
  "message": "File uploaded successfully",
  "url": "https://khanhmelody.r2.dev/songs/song1.mp3",
  "objectKey": "songs/song1.mp3"
}
```

#### POST /api/upload/presigned-url
Tạo presigned URL cho direct upload

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "objectKey": "songs/song1.mp3",
  "fileType": "audio/mpeg"
}
```

**Response:**
```json
{
  "presignedUrl": "https://...",
  "publicUrl": "https://khanhmelody.r2.dev/songs/song1.mp3",
  "objectKey": "songs/song1.mp3"
}
```

## 🧪 Kiểm Thử API

### Sử dụng cURL

**1. Login để lấy token:**
```bash
curl -X POST http://192.168.0.125:8882/api/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

**2. Lưu token vào biến:**
```bash
# Windows PowerShell
$TOKEN = "your_token_here"

# Linux/Mac
TOKEN="your_token_here"
```

**3. Test lấy danh sách songs:**
```bash
curl http://192.168.0.125:8882/api/admin/songs \
  -H "Authorization: Bearer $TOKEN"
```

**4. Test thêm song mới:**
```bash
curl -X POST http://192.168.0.125:8882/api/admin/songs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Test Song\",\"artist\":\"Test Artist\",\"price\":50000}"
```

### Sử dụng Postman

1. Import collection hoặc tạo request mới
2. Set base URL: `http://192.168.0.125:8882`
3. Login trước để lấy token
4. Add header `Authorization: Bearer <token>` cho các request cần authentication

### Sử dụng Python requests

```python
import requests

BASE_URL = "http://192.168.0.125:8882"

# Login
response = requests.post(f"{BASE_URL}/api/login", json={
    "username": "admin",
    "password": "admin123"
})
token = response.json()['access_token']

# Get songs
headers = {"Authorization": f"Bearer {token}"}
response = requests.get(f"{BASE_URL}/api/admin/songs", headers=headers)
print(response.json())
```

## 🚀 Deployment

### Deployment với Gunicorn

```bash
# Install gunicorn
pip install gunicorn

# Run with 4 workers
gunicorn -w 4 -b 0.0.0.0:8882 run:app
```

### Deployment với Systemd (Linux)

Tạo file `/etc/systemd/system/khanhmelody.service`:

```ini
[Unit]
Description=KhanhMelody Backend API
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/khanhmelody/backend
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/gunicorn -w 4 -b 0.0.0.0:8882 run:app
Restart=always

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
sudo systemctl start khanhmelody
sudo systemctl enable khanhmelody
```

### Deployment với Docker (Tùy chọn)

Tạo `Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8882

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8882", "run:app"]
```

Build và run:
```bash
docker build -t khanhmelody-backend .
docker run -p 8882:8882 --env-file .env khanhmelody-backend
```

## 🔒 Security Notes

- **Production Environment:**
  - Thay đổi `JWT_SECRET_KEY` thành key mạnh
  - Sử dụng HTTPS cho production
  - Cấu hình firewall để giới hạn access
  - Regular database backups
  - Monitor logs for suspicious activity

- **Database:**
  - Sử dụng strong password cho PostgreSQL
  - Limit database user permissions
  - Enable SSL connections

## 🐛 Troubleshooting

### Database connection error
- Kiểm tra PostgreSQL đang chạy
- Xác nhận DATABASE_URL trong .env đúng
- Test connection: `psql -U postgres -d khanhmelody`

### Port already in use
- Kiểm tra process đang dùng port 8882: `netstat -ano | findstr :8882`
- Kill process hoặc đổi port trong `run.py`

### R2 upload error
- Xác nhận R2 credentials trong .env
- Kiểm tra bucket name tồn tại
- Verify R2 account permissions

## 📝 License

Dự án KhanhMelody - Bản quyền © 2024

## 📞 Support

Nếu có vấn đề, liên hệ:
- Email: admin@khanhmelody.com
- Website: https://khanhmelodymussic.com
