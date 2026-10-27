# Hướng Dẫn Thiết Lập KhanhMelody - 4 Bước Cần Làm

## Bước 1: Cập Nhật Thông Tin Cloudflare R2 Trong File .env

### 1.1 Lấy thông tin từ Cloudflare Dashboard

1. **Đăng nhập Cloudflare**
   - Truy cập: https://dash.cloudflare.com/
   - Đăng nhập tài khoản Cloudflare của bạn

2. **Tạo hoặc xác nhận bucket R2**
   - Chọn "R2" từ menu bên trái
   - Nếu chưa có bucket, click "Create Bucket"
   - Đặt tên: `khanhmelody`
   - Chọn region (khuyến nghị: Automatic)
   - Click "Create Bucket"

3. **Lấy Account ID**
   - Tại trang R2, nhìn lên góc phải màn hình
   - Copy "Account ID" (dạng chuỗi 32 ký tự)

4. **Tạo API Token cho R2**
   - Vào: R2 > Manage R2 API Tokens
   - Click "Create API Token"
   - Chọn template: "Admin Read & Write" hoặc custom với permissions:
     - Object Read
     - Object Write
   - Click "Continue to summary"
   - Click "Create Token"
   - **QUAN TRỌNG:** Copy ngay "Access Key ID" và "Secret Access Key" (chỉ hiện 1 lần)

5. **Lấy Public URL**
   - Vào bucket `khanhmelody`
   - Tab "Settings"
   - Tìm "Public Access"
   - Nếu chưa bật, bật "Allow Access"
   - URL sẽ là: `https://<account-id>.r2.cloudflarestorage.com/<bucket-name>`
   - Hoặc nếu đã setup custom domain: `https://khanhmelody.r2.dev`

### 1.2 Cập nhật file .env

Mở file `.env` tại `D:\khanhmelody\frontend\admin\.env` và cập nhật:

```bash
# API Configuration
VITE_API_BASE_URL=http://192.168.0.125:8882/api

# Domain Configuration
VITE_DOMAIN=khanhmelodymussic.com

# Cloudflare R2 Configuration
VITE_R2_BUCKET_NAME=khanhmelody
VITE_R2_ACCOUNT_ID=thay_bang_account_id_cua_ban
# R2 credentials must be configured on the backend only.
# Never expose R2 credentials to browser code.
VITE_R2_PUBLIC_URL=https://khanhmelody.r2.dev
```

**Thay thế các giá trị:**
- `thay_bang_account_id_cua_ban` → Account ID đã copy từ Cloudflare
- `thay_bang_access_key_id` → Access Key ID đã copy
- `thay_bang_secret_access_key` → Secret Access Key đã copy

### 1.3 Kiểm tra cấu hình

Sau khi cập nhật, restart development server:
```bash
npm run dev
```

---

## Bước 2: Cấu Hình DNS Cho Domain khanhmelodymussic.com

### 2.1 Mua Domain (nếu chưa có)

1. Truy cập một trong các nhà đăng ký:
   - Cloudflare Registrar (https://www.cloudflare.com/products/registrar/)
   - Namecheap (https://www.namecheap.com)
   - GoDaddy (https://www.godaddy.com)
   - hoặc nhà đăng ký Việt Nam: Pavietnam, Matbao, Tenten

2. Tìm và mua domain: `khanhmelodymussic.com`

### 2.2 Cấu hình DNS trên Cloudflare (khuyến nghị)

**Nếu sử dụng Cloudflare:**

1. **Thêm site vào Cloudflare**
   - Đăng nhập Cloudflare Dashboard
   - Click "Add a Site"
   - Nhập: `khanhmelodymussic.com`
   - Chọn plan (Free là đủ)
   - Cloudflare sẽ scan DNS records hiện tại

2. **Cập nhật Nameservers**
   - Cloudflare sẽ cung cấp 2 nameservers (ví dụ: `anna.ns.cloudflare.com`, `bob.ns.cloudflare.com`)
   - Đăng nhập vào nơi bạn mua domain
   - Tìm mục "Nameservers" hoặc "DNS Management"
   - Thay đổi nameservers sang nameservers của Cloudflare
   - Lưu thay đổi (có thể mất 24-48h để propagate)

3. **Thêm DNS Record**
   - Trong Cloudflare Dashboard cho site `khanhmelodymussic.com`
   - Vào "DNS" > "Records"
   - Click "Add Record"
   - Type: `A`
   - Name: `@` (hoặc để trống cho root domain)
   - IPv4 address: `192.168.0.125`
   - Proxy status: Chọn "Proxied" (đám mây màu cam) để bảo vệ và CDN
   - TTL: Auto
   - Click "Save"

4. **Thêm record cho www (tùy chọn)**
   - Type: `CNAME`
   - Name: `www`
   - Target: `khanhmelodymussic.com`
   - Proxy status: Proxied
   - Click "Save"

**Nếu KHÔNG sử dụng Cloudflare:**

1. Đăng nhập vào nơi mua domain
2. Tìm "DNS Management" hoặc "DNS Records"
3. Thêm A Record:
   - Type: A
   - Host/Name: @
   - Value: 192.168.0.125
   - TTL: 3600 hoặc mặc định
4. Lưu thay đổi

### 2.3 Kiểm tra DNS

Sau khi cấu hình, kiểm tra bằng:
```bash
# Windows
nslookup khanhmelodymussic.com

# Hoặc online: https://dnschecker.org/
```

---

## Bước 3: Thiết Lập Port Forwarding Trên Router Cho Cổng 8882

### 3.1 Xác định thông tin router

1. **Tìm IP của router**
   - Windows: Mở Command Prompt, gõ `ipconfig`
   - Tìm "Default Gateway" (thường là 192.168.0.1 hoặc 192.168.1.1)
   - Đây là IP của router

2. **Đăng nhập router**
   - Mở trình duyệt, truy cập IP router (ví dụ: http://192.168.0.1)
   - Đăng nhập với username/password (thường ở mặt dưới router hoặc mặc định: admin/admin, admin/password)
   - Nếu quên, reset router và dùng mặc định

### 3.2 Thiết lập Port Forwarding

**Các bước chung (có thể khác tùy router):**

1. **Tìm mục Port Forwarding**
   - Tìm trong menu: "Advanced", "NAT", "Firewall", hoặc "Virtual Server"
   - Tên có thể là: "Port Forwarding", "Virtual Server", "Port Mapping"

2. **Thêm rule mới**
   - Click "Add" hoặc "Create New Rule"
   - Điền thông tin:
     - **Service Name:** KhanhMelody API (hoặc bất kỳ tên nào)
     - **External Port / WAN Port:** 8882
     - **Internal Port / LAN Port:** 8882
     - **Internal IP / LAN IP:** 192.168.0.125 (IP máy chủ backend)
     - **Protocol:** TCP (hoặc Both TCP/UDP)
     - **Enable:** Check/Yes

3. **Lưu cấu hình**
   - Click "Apply", "Save", hoặc "OK"
   - Router có thể cần reboot

### 3.3 Các router phổ biến và vị trí menu

**TP-Link:**
- Advanced > NAT Forwarding > Virtual Servers
- Hoặc: Forwarding > Virtual Servers

**ASUS:**
- WAN > Virtual Server / Port Forwarding

**D-Link:**
- Advanced > Port Forwarding / Virtual Server

**Netgear:**
- Advanced > Advanced Setup > Port Forwarding / Port Triggering

**Viettel/FTTH routers:**
- Advanced > NAT > Port Forwarding
- Hoặc: Application > Port Forwarding

### 3.4 Kiểm tra Port Forwarding

1. **Kiểm tra từ mạng nội bộ**
   - Truy cập: http://192.168.0.125:8882
   - Nếu backend đang chạy, sẽ thấy response

2. **Kiểm tra từ bên ngoài**
   - Sử dụng điện thoại 4G (không cùng WiFi)
   - Truy cập: http://<public-ip-cua-ban>:8882
   - Hoặc dùng tool online: https://www.yougetsignal.com/tools/open-ports/
   - Nhập IP public và port 8882

3. **Lấy IP Public**
   - Truy cập: https://whatismyipaddress.com/
   - Hoặc: https://ipinfo.io/

### 3.4 Lưu ý quan trọng

- **Security:** Port forwarding mở cổng ra internet, cần:
  - Đảm bảo backend có authentication
  - Sử dụng HTTPS (SSL certificate)
  - Cấu hình firewall trên server
  - Giới hạn IP nếu có thể

- **Dynamic IP:** Nếu IP public thay đổi:
  - Sử dụng Dynamic DNS (DDNS) service
  - Cloudflare có DDNS miễn phí

---

## Bước 4: Phát Triển Backend API

### 4.1 Công nghệ khuyến nghị

**Python (Flask/FastAPI) - Khuyên dùng:**
```bash
# Flask
pip install flask flask-cors flask-jwt-extended sqlalchemy psycopg2-binary

# FastAPI (hiện đại hơn)
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose[cryptography] passlib[bcrypt]
```

**Node.js (Express):**
```bash
npm install express cors bcryptjs jsonwebtoken pg sequelize
```

### 4.2 Cấu trúc dự án Backend

```
khanhmelody-backend/
├── app/
│   ├── __init__.py
│   ├── models/
│   │   ├── user.py
│   │   ├── song.py
│   │   ├── transaction.py
│   │   └── wallet.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── songs.py
│   │   ├── users.py
│   │   ├── revenue.py
│   │   └── upload.py
│   └── config.py
├── requirements.txt
└── main.py
```

### 4.3 Các API Endpoint cần thiết

#### 4.3.1 Authentication Endpoints

**POST /api/login**
```python
# Request body
{
  "username": "admin",
  "password": "<configured-admin-password>"
}

# Response
{
  "access_token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@khanhmelody.com",
    "role": "admin"
  }
}
```

#### 4.3.2 Songs Endpoints

**GET /api/admin/songs**
- Lấy danh sách tất cả bài hát
- Headers: `Authorization: Bearer <token>`

**POST /api/admin/songs**
- Thêm bài hát mới
- Headers: `Authorization: Bearer <token>`
- Body: `{ title, artist, album, genre, price, audio_url }`

**PUT /api/admin/songs/:id**
- Cập nhật bài hát
- Headers: `Authorization: Bearer <token>`

**DELETE /api/admin/songs/:id**
- Xóa bài hát
- Headers: `Authorization: Bearer <token>`

#### 4.3.3 Users Endpoints

**GET /api/admin/users**
- Lấy danh sách users
- Headers: `Authorization: Bearer <token>`

**POST /api/admin/users**
- Thêm user mới
- Headers: `Authorization: Bearer <token>`

**PUT /api/admin/users/:id**
- Cập nhật user
- Headers: `Authorization: Bearer <token>`

**DELETE /api/admin/users/:id**
- Xóa user
- Headers: `Authorization: Bearer <token>`

#### 4.3.4 Revenue Endpoints

**GET /api/admin/revenue**
- Lấy dữ liệu doanh thu
- Headers: `Authorization: Bearer <token>`
- Response:
```json
{
  "total_revenue": 150000000,
  "total_transactions": 1250,
  "transactions": [
    { "id": 1, "amount": 50000, "created_at": "2024-01-15T10:30:00" }
  ]
}
```

#### 4.3.5 Wallets Endpoints

**GET /api/admin/wallets**
- Lấy danh sách ví
- Headers: `Authorization: Bearer <token>`

#### 4.3.6 R2 Upload Endpoint

**POST /api/upload/r2**
- Upload file lên R2
- Headers: `Authorization: Bearer <token>`
- Body: FormData với `file` và `objectKey`
- Response:
```json
{
  "url": "https://khanhmelody.r2.dev/songs/audio-file.mp3"
}
```

### 4.4 Ví dụ Backend với Flask (Python)

**Cài đặt:**
```bash
pip install flask flask-cors flask-jwt-extended sqlalchemy psycopg2-binary boto3
```

**File: main.py**
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from datetime import timedelta
import os

app = Flask(__name__)
CORS(app)

# JWT Config
app.config['JWT_SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
jwt = JWTManager(app)

# Database config (PostgreSQL)
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost/khanhmelody')

# R2 Config
R2_BUCKET = os.getenv('R2_BUCKET_NAME', 'khanhmelody')
R2_ACCESS_KEY = os.getenv('R2_ACCESS_KEY_ID')
R2_SECRET_KEY = os.getenv('R2_SECRET_ACCESS_KEY')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    # TODO: Verify with database
    if username == 'admin' and password == '<configured-admin-password>':
        access_token = create_access_token(identity=username)
        return jsonify({
            'access_token': access_token,
            'user': {'username': username, 'role': 'admin'}
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/admin/songs', methods=['GET'])
@jwt_required()
def get_songs():
    # TODO: Fetch from database
    return jsonify([])

@app.route('/api/admin/songs', methods=['POST'])
@jwt_required()
def add_song():
    data = request.json
    # TODO: Save to database
    return jsonify({'message': 'Song added'}), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8882, debug=True)
```

### 4.5 Database Schema (PostgreSQL)

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Songs table
CREATE TABLE songs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    album VARCHAR(255),
    genre VARCHAR(50),
    price DECIMAL(10, 2) NOT NULL,
    audio_url TEXT,
    play_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallets table
CREATE TABLE wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    balance DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    song_id INTEGER REFERENCES songs(id),
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.6 Chạy Backend

```bash
# Python Flask
python main.py

# Hoặc với gunicorn (production)
gunicorn -w 4 -b 0.0.0.0:8882 main:app

# FastAPI
uvicorn main:app --host 0.0.0.0 --port 8882

# Node.js Express
node server.js
```

### 4.7 Kiểm tra Backend

```bash
# Test login
curl -X POST http://192.168.0.125:8882/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<configured-admin-password>"}'

# Test songs endpoint (sau khi có token)
curl http://192.168.0.125:8882/api/admin/songs \
  -H "Authorization: Bearer <your_token>"
```

---

## Tóm Tắt Thứ Tự Thực Hiện

1. ✅ **Cập nhật .env** - Lấy thông tin từ Cloudflare R2 và điền vào file
2. ✅ **Cấu hình DNS** - Trỏ domain khanhmelodymussic.com về IP 192.168.0.125
3. ✅ **Port Forwarding** - Mở cổng 8882 trên router để truy cập từ bên ngoài
4. ✅ **Phát triển Backend** - Tạo API server tại port 8882 với các endpoint cần thiết

Sau khi hoàn thành 4 bước, cập nhật `USE_MOCK_DATA = false` trong `App.jsx` để sử dụng backend thật.
