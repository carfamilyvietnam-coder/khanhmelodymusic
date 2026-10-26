# KhanhMelody - Production Deployment Checklist

## ✅ Đã hoàn thành

### Backend Configuration
- [x] Cập nhật `R2_PUBLIC_URL` trong `.env` → `https://cdn.khanhmelodymussic.com`
- [x] Backend server đang chạy trên port 8882
- [x] Đã cài đặt tất cả dependencies
- [x] Đã fix SQLAlchemy relationship error
- [x] Tạo file `start_production.bat` cho production

### Frontend Configuration
- [x] Cập nhật `API_BASE` trong `App.jsx` → `https://api.khanhmelodymussic.com/api`
- [x] Build frontend thành công (thư mục `dist/`)
- [x] Frontend đã sẵn sàng deploy

### Production Files
- [x] `DEPLOYMENT_GUIDE.md` - Hướng dẫn triển khai chi tiết
- [x] `nginx.conf` - Cấu hình Nginx cho production
- [x] `backup_database.bat` - Script backup database
- [x] `start_production.bat` - Script khởi động backend production

## 🔴 Cần thực hiện trên Cloudflare

### 1. Cấu hình DNS Records
Đăng nhập Cloudflare Dashboard → khanhmelodymussic.com → DNS → Records

Thêm các records:
- **Type:** A | **Name:** @ | **Content:** [IP Server của bạn] | **Proxy:** Proxied (☁️)
- **Type:** CNAME | **Name:** api | **Content:** [IP Server của bạn] | **Proxy:** Proxied (☁️)
- **Type:** CNAME | **Name:** www | **Content:** khanhmelodymussic.com | **Proxy:** Proxied (☁️)

### 2. Cấu hình R2 Custom Domain
1. Cloudflare Dashboard → R2 → Buckets → khanhmelody
2. Settings → Custom Domains → Add Custom Domain
3. Nhập: `cdn.khanhmelodymussic.com`
4. Click "Add Custom Domain"

### 3. Cấu hình SSL/TLS
1. SSL/TLS → Overview
2. Chọn mode: **Full** hoặc **Full (strict)**
3. Bật "Always Use HTTPS"

### 4. Cấu hình Security
1. Security → WAF → Create rule
2. Block SQL Injection, XSS attacks
3. Enable Bot Fight Mode
4. Set Security Level: Medium/High

## 🔴 Cần thực hiện trên Server

### 1. Deploy Frontend
**Cách A: Cloudflare Pages (Khuyên dùng)**
1. Cloudflare Dashboard → Pages → Create a project
2. Chọn "Upload assets"
3. Upload thư mục `D:\khanhmelody\frontend\admin\dist\`
4. Custom domain: `khanhmelodymussic.com`

**Cách B: VPS với Nginx**
1. Upload `dist/` folder lên server: `/var/www/khanhmelodymussic.com/`
2. Copy `nginx.conf` vào `/etc/nginx/sites-available/khanhmelodymussic.com`
3. Enable site: `ln -s /etc/nginx/sites-available/khanhmelodymussic.com /etc/nginx/sites-enabled/`
4. Test config: `nginx -t`
5. Restart Nginx: `systemctl restart nginx`

### 2. Cấu hình Backend Production
1. Cập nhật R2 credentials trong `.env`:
   - `R2_ACCOUNT_ID` = [Account ID từ Cloudflare]
   - `R2_ACCESS_KEY_ID` = [Access Key từ R2 API Token]
   - `R2_SECRET_ACCESS_KEY` = [Secret Key từ R2 API Token]
2. Thay đổi `JWT_SECRET_KEY` thành chuỗi ngẫu nhiên mạnh
3. Chạy: `start_production.bat` (Windows) hoặc `gunicorn -w 4 -b 0.0.0.0:8882 run:app` (Linux)

### 3. Cấu hình SSL (nếu dùng VPS)
```bash
# Cài đặt Certbot
sudo apt install certbot python3-certbot-nginx

# Tạo SSL certificate
sudo certbot --nginx -d khanhmelodymussic.com -d www.khanhmelodymussic.com
```

### 4. Mở Port Firewall
```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8882/tcp
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=8882/tcp
sudo firewall-cmd --reload
```

## 🔴 Kiểm tra Production

### Test Backend API
```bash
curl https://api.khanhmelodymussic.com/api/login
```

### Test Frontend
Mở browser: `https://khanhmelodymussic.com`
- Login: admin / admin123
- Test các chức năng

### Test R2 Upload
Upload file và kiểm tra URL: `https://cdn.khanhmelodymussic.com/...`

## 📝 Notes

- Backend server hiện đang chạy trên local: `http://0.0.0.0:8882`
- Frontend đã build sẵn trong `D:\khanhmelody\frontend\admin\dist\`
- Tất cả cấu hình đã sẵn sàng cho production
- Xem `DEPLOYMENT_GUIDE.md` để biết chi tiết từng bước

## 🚀 Quick Start Production

1. **Cấu hình Cloudflare DNS** (5 phút)
2. **Cấu hình R2 Custom Domain** (3 phút)
3. **Deploy Frontend lên Cloudflare Pages** (5 phút)
4. **Cập nhật R2 credentials trong .env** (2 phút)
5. **Restart backend với production config** (1 phút)
6. **Test website** (5 phút)

**Tổng thời gian: ~20 phút**

---

**Trạng thái hiện tại:**
- ✅ Backend: Đang chạy (local)
- ✅ Frontend: Đã build
- ✅ Cấu hình: Đã cập nhật
- ⏳ Cloudflare: Cần cấu hình
- ⏳ Server: Cần deploy

**Xem `DEPLOYMENT_GUIDE.md` để biết hướng dẫn chi tiết.**
