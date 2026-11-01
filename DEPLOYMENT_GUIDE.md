# KhanhMelody - Hướng dẫn Triển khai Production

## 📋 Tổng quan

Hướng dẫn này giúp bạn triển khai KhanhMelody lên production server và công khai website.

## 🔧 Bước 1: Cấu hình Backend Production

### 1.1 Cập nhật .env cho Production

Mở file `D:\khanhmelody\backend\.env` và cập nhật:

```bash
# Flask Configuration
FLASK_ENV=production
FLASK_APP=run.py

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/khanhmelody

# JWT Configuration
JWT_SECRET_KEY=<generate-a-random-secret-at-least-32-characters>

# Cloudflare R2 Configuration
R2_BUCKET_NAME=khanhmelody
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_key_here
R2_PUBLIC_URL=https://cdn.khanhmelodymussic.com
```

**Quan trọng:** Thay đổi `JWT_SECRET_KEY` thành một chuỗi ngẫu nhiên mạnh cho production.

### 1.2 Cấu hình R2 Credentials

Đăng nhập Cloudflare Dashboard → R2 → Manage R2 API Tokens:
1. Tạo API Token với quyền đọc/ghi
2. Copy Account ID, Access Key, Secret Key
3. Cập nhật vào file `.env`

### 1.3 Khởi động Backend Production

**Windows:**
```bash
cd D:\khanhmelody\backend
start_production.bat
```

**Linux/Mac:**
```bash
cd /path/to/khanhmelody/backend
source venv/bin/activate
gunicorn -w 4 -b 0.0.0.0:8882 run:app
```

Backend sẽ chạy trên `http://0.0.0.0:8882`

## 🌐 Bước 2: Cấu hình Cloudflare DNS

### 2.1 Cấu hình Domain Chính

Đăng nhập Cloudflare Dashboard → khanhmelodymussic.com → DNS → Records

**Thêm các records sau:**

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| A | @ | [IP Server của bạn] | Proxied (☁️) |
| CNAME | api | [IP Server của bạn] | Proxied (☁️) |

Website chạy tại tên miền gốc. HLS được phục vụ từ URL R2 công khai của bucket, không dùng hostname website làm kho nhạc.

### 2.2 Cấu hình R2 Custom Domain

Giữ bucket `khanhmelody` cũ nguyên trạng. Bucket `khanhmelody-v2` công khai chỉ chứa playlist/segment HLS. Website tiếp tục chạy tại `khanhmelodymussic.com`; dùng URL phát triển công khai R2 của bucket cho HLS, không gắn `www` vào Pages hoặc bucket.

### 2.3 Phát nhạc HLS từ bucket công khai riêng

Giữ bucket `khanhmelody` hiện có nguyên trạng. Không đặt file gốc vào bucket công khai mới.

Trong `backend/.env`, thêm tên bucket chính xác và hostname HTTPS đã gắn với bucket:

```env
R2_STREAM_BUCKET_NAME=khanhmelody-v2
R2_STREAM_PUBLIC_URL=https://pub-9146b2d328a8e64b24b1057dc9e8aad33.r2.dev
HLS_TRANSCODE_TIMEOUT=1800
```

R2 API token backend phải có quyền đọc/ghi cả bucket riêng tư hiện tại và bucket HLS mới. Bật public access chỉ cho bucket HLS. Trong CORS của bucket HLS, cho phép GET/HEAD từ origin website `https://khanhmelodymussic.com`; expose `Accept-Ranges`, `Content-Length`, `Content-Range`, `ETag`.

Đặt `R2_STREAM_BUCKET_NAME=khanhmelody-v2` và URL R2 công khai ở trên trong backend environment. Bật public access cho riêng bucket HLS và cho phép GET/HEAD từ website trong CORS; không bật public access cho bucket file gốc. Frontend mặc định dùng URL này; chỉ cần đặt `VITE_STREAM_PUBLIC_URL` trong Cloudflare Pages build environment nếu URL thay đổi. Từ thư mục `backend`, sau khi xác minh thông tin truy cập R2 và database, cập nhật dependencies và chuyển đổi bài nhạc hiện có:

```powershell
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe publish_hls_catalog.py
```

Sau đó build member app bằng lệnh root hiện có `npm run build:admin` và triển khai bản Preview trước. Chỉ khi kiểm tra được catalog, nghe HLS, tải file gốc vẫn qua backend, và xóa bài cập nhật được catalog thì mới promote frontend. Những bước này không tự chạy khi build local.

### 2.3 Cấu hình SSL/TLS

Vào SSL/TLS → Overview:
- Chọn **Full** hoặc **Full (strict)** mode
- Đảm bảo Always Use HTTPS bật

## 🎨 Bước 3: Triển khai Frontend Production

### 3.1 Build Frontend

```bash
cd D:\khanhmelody\frontend\admin
npm run build
```

Files sẽ được tạo trong thư mục `dist/`

### 3.2 Deploy Frontend

**Cách A: Deploy lên Cloudflare Pages**

1. Vào Cloudflare Dashboard → Pages → Create a project
2. Chọn "Upload assets"
3. Upload toàn bộ thư mục `dist/`
4. Domain sẽ được cấp: `khanhmelodymussic.pages.dev`
5. Custom domain: `khanhmelodymussic.com`

**Cách B: Deploy lên VPS/Server**

```bash
# Upload dist/ folder lên server
scp -r dist/* user@your-server:/var/www/khanhmelodymussic.com/

# Cấu hình Nginx
server {
    listen 80;
    server_name khanhmelodymussic.com www.khanhmelodymussic.com;

    root /var/www/khanhmelodymussic.com;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8882;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Cách C: Sử dụng Cloudflare Workers**

1. Vào Cloudflare Dashboard → Workers → Create Application
2. Upload files từ `dist/`
3. Cấu hình routing cho domain

## 🔒 Bước 4: Cấu hình Security

### 4.1 Firewall Rules

Vào Cloudflare Dashboard → Security → WAF → Create rule:
- Block SQL Injection patterns
- Block XSS attacks
- Rate limiting cho API endpoints

### 4.2 Bot Protection

Vào Security → Bot Fight Mode:
- Bật Bot Fight Mode để block malicious bots

### 4.3 DDoS Protection

Vào Security → Settings:
- Enable Security Level: Medium/High
- Enable Under Attack Mode khi cần

## 📊 Bước 5: Monitoring

### 5.1 Cloudflare Analytics

Vào Analytics → Overview để theo dõi:
- Traffic
- Requests
- Bandwidth
- Threats

### 5.2 Backend Monitoring

Thêm logging vào backend:
```python
import logging
logging.basicConfig(filename='app.log', level=logging.INFO)
```

## 🚀 Bước 6: Kiểm tra Production

### 6.1 Test Backend API

```bash
# Test health check
curl https://api.khanhmelodymussic.com/api/login

# Test với credentials
curl -X POST https://api.khanhmelodymussic.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<configured-admin-password>"}'
```

### 6.2 Test Frontend

Mở browser: `https://khanhmelodymussic.com`
- Login với admin/<configured-admin-password>
- Test các chức năng: Songs, Users, Revenue, Wallets

### 6.3 Test R2 Upload

Upload một file và kiểm tra URL:
- URL nên là: `https://cdn.khanhmelodymussic.com/...`

## 🔄 Bước 7: Maintenance

### 7.1 Backup Database

```bash
# Backup PostgreSQL
pg_dump -U postgres khanhmelody > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres khanhmelody < backup_20241025.sql
```

### 7.2 Update Application

```bash
# Pull code
git pull

# Update dependencies
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Restart backend
systemctl restart khanhmelody-backend

# Rebuild frontend
cd ../frontend/admin
npm run build

# Deploy frontend dist/
```

## 📝 Checklist Production

Trước khi đi live, kiểm tra:

Backend:
- [ ] JWT_SECRET_KEY đã thay đổi
- [ ] R2 credentials đã cập nhật
- [ ] Database connection hoạt động
- [ ] Gunicorn server đang chạy
- [ ] Port 8882 đã mở (firewall)

Frontend:
- [ ] npm run build thành công
- [ ] API_BASE trỏ đến https://api.khanhmelodymussic.com/api
- [ ] Files đã deploy lên server/Cloudflare Pages

Cloudflare:
- [ ] DNS records đã cấu hình đúng
- [ ] SSL/TLS đang ở mode Full
- [ ] R2 custom domain đã thêm
- [ ] Firewall rules đã bật
- [ ] Page rules đã cấu hình (nếu cần)

Security:
- [ ] HTTPS đã bật
- [ ] CORS đã cấu hình đúng
- [ ] Rate limiting đã bật
- [ ] Bot protection đã bật

## 🆘 Troubleshooting

### Lỗi 1014 CNAME Cross-User Banned

**Nguyên nhân:** Domain trỏ đến CNAME của account khác

**Giải pháp:**
1. Xóa CNAME record không đúng
2. Sử dụng Custom Domain của R2
3. Đảm bảo tất cả DNS records thuộc cùng Cloudflare account

### Backend không kết nối được

**Kiểm tra:**
1. PostgreSQL đang chạy: `systemctl status postgresql`
2. Port 8882 đang mở: `netstat -tulpn | grep 8882`
3. Gunicorn đang chạy: `ps aux | grep gunicorn`

### Frontend không load API

**Kiểm tra:**
1. API_BASE trong App.jsx đúng
2. CORS đã bật trong backend
3. Firewall không block requests

## 📞 Support

Nếu gặp vấn đề:
- Email: admin@khanhmelody.com
- Website: https://khanhmelodymussic.com

---

**Chúc mừng! KhanhMelody của bạn đã sẵn sàng đi live! 🎉**
