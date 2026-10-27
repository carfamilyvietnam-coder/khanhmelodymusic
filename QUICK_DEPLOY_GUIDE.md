# KhanhMelody - Hướng dẫn Deploy Nhanh (15 phút)

## ⚠️ Quan trọng

Tôi không thể trực tiếp deploy lên Cloudflare hoặc server của bạn vì cần quyền truy cập tài khoản. Bạn sẽ thực hiện các bước sau trên tài khoản Cloudflare của mình.

## 📋 Bước 1: Cấu hình Cloudflare DNS (5 phút)

### 1.1 Đăng nhập Cloudflare
1. Truy cập: https://dash.cloudflare.com
2. Login với tài khoản của bạn
3. Chọn domain: `khanhmelodymussic.com`

### 1.2 Thêm DNS Records
Vào **DNS** → **Records** → **Add Record**

**Record 1 - Domain chính:**
- Type: **A**
- Name: **@**
- IPv4 address: **[IP Public của máy bạn]**
- Proxy status: **Proxied** (☁️ - đám mây màu vàng)
- TTL: Auto
- Click: **Save**

**Record 2 - API subdomain:**
- Type: **A**
- Name: **api**
- IPv4 address: **[IP Public của máy bạn]**
- Proxy status: **Proxied** (☁️)
- TTL: Auto
- Click: **Save**

**Record 3 - WWW:**
- Type: **CNAME**
- Name: **www**
- Target: **khanhmelodymussic.com**
- Proxy status: **Proxied** (☁️)
- TTL: Auto
- Click: **Save**

### 1.3 Tìm IP Public của bạn
Mở browser và truy cập: https://whatismyipaddress.com
Copy IP address hiển thị (ví dụ: 171.234.56.78)

---

## 📋 Bước 2: Cấu hình R2 Custom Domain (3 phút)

### 2.1 Tạo Custom Domain
1. Cloudflare Dashboard → **R2**
2. Chọn bucket: **khanhmelody**
3. Vào **Settings** → **Custom Domains**
4. Click: **Add Custom Domain**
5. Nhập: `cdn.khanhmelodymussic.com`
6. Click: **Add Custom Domain**

### 2.2 Xác nhận DNS
Cloudflare sẽ tự động tạo DNS record cho `cdn.khanhmelodymussic.com`. Không cần làm gì thêm.

---

## 📋 Bước 3: Deploy Frontend lên Cloudflare Pages (5 phút)

### 3.1 Tạo Project Pages
1. Cloudflare Dashboard → **Workers & Pages**
2. Click: **Create application**
3. Chọn tab: **Pages**
4. Click: **Upload assets**
5. Project name: `khanhmelody-admin`
6. Click: **Create project**

### 3.2 Upload Files
1. Click: **Upload assets**
2. Mở thư mục: `D:\khanhmelody\frontend\admin\dist\`
3. Kéo thả toàn bộ files trong thư mục `dist/` vào vùng upload
4. Click: **Upload**

### 3.3 Deploy
1. Cloudflare sẽ tự động deploy
2. Đợi khoảng 30-60 giây
3. URL sẽ là: `https://khanhmelody-admin.pages.dev`

### 3.4 Custom Domain
1. Vào **Custom domains** trong project Pages
2. Click: **Set up a custom domain**
3. Nhập: `khanhmelodymussic.com`
4. Click: **Continue**
5. Nhập: `www.khanhmelodymussic.com`
6. Click: **Activate domain**

---

## 📋 Bước 4: Cấu hình Backend Production (2 phút)

### 4.1 Lấy R2 Credentials
1. Cloudflare Dashboard → **R2** → **Manage R2 API Tokens**
2. Click: **Create API Token**
3. Permissions: **Admin Read & Write**
4. Click: **Create API Token**
5. Copy:
   - **Account ID** (từ R2 dashboard)
   - **Access Key ID**
   - **Secret Access Key**

### 4.2 Cập nhật .env
Mở file: `D:\khanhmelody\backend\.env`

Thay thế:
```bash
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_key_here
```

Bằng:
```bash
R2_ACCOUNT_ID=[Account ID vừa copy]
R2_ACCESS_KEY_ID=[Access Key vừa copy]
R2_SECRET_ACCESS_KEY=[Secret Key vừa copy]
```

### 4.3 Thay đổi JWT Secret
Thay đổi `JWT_SECRET_KEY` thành chuỗi ngẫu nhiên mạnh:
```bash
JWT_SECRET_KEY=<generate-a-random-secret-at-least-32-characters>
```

---

## 📋 Bước 5: Restart Backend Production (1 phút)

### 5.1 Dừng backend hiện tại
Mở terminal đang chạy backend và nhấn: **Ctrl+C**

### 5.2 Khởi động production
Mở terminal mới:
```bash
cd D:\khanhmelody\backend
start_production.bat
```

Backend sẽ chạy trên: `http://0.0.0.0:8882`

---

## 📋 Bước 6: Kiểm tra Website (5 phút)

### 6.1 Test Frontend
1. Mở browser: `https://khanhmelodymussic.com`
2. Login: Username: `admin` | Password: `<configured-admin-password>`
3. Kiểm tra các trang: Dashboard, Songs, Users, Revenue, Wallets

### 6.2 Test Backend API
Mở terminal:
```bash
curl https://api.khanhmelodymussic.com/api/login
```

Nên trả về: `{"error":"Method Not Allowed"}` (điều này bình thường - server đang chạy)

### 6.3 Test Login API
```bash
curl -X POST https://api.khanhmelodymussic.com/api/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"<configured-admin-password>\"}"
```

Nên trả về JSON với access_token.

---

## 🔧 Troubleshooting

### Website không truy cập được
1. Kiểm tra DNS records đã đúng chưa
2. Chờ 5-15 phút để DNS propagation
3. Kiểm tra IP Public có đúng không

### Frontend load nhưng không kết nối API
1. Kiểm tra API_BASE trong App.jsx: `https://api.khanhmelodymussic.com/api`
2. Kiểm tra backend đang chạy: `http://localhost:8882`
3. Kiểm tra firewall port 8882 đã mở chưa

### R2 upload không hoạt động
1. Kiểm tra R2 credentials trong .env đúng chưa
2. Kiểm tra custom domain `cdn.khanhmelodymussic.com` đã active chưa
3. Kiểm tra bucket permissions

### Lỗi SSL/TLS
1. Vào SSL/TLS → Overview
2. Chọn mode: **Full** hoặc **Full (strict)**
3. Chờ 1-2 phút để SSL certificate được cấp

---

## ✅ Checklist hoàn tất

Sau khi hoàn thành tất cả các bước, kiểm tra:

- [ ] DNS records đã thêm và active
- [ ] R2 custom domain đã active
- [ ] Frontend đã deploy lên Cloudflare Pages
- [ ] Custom domain khanhmelodymussic.com đã active
- [ ] R2 credentials đã cập nhật trong .env
- [ ] JWT_SECRET_KEY đã thay đổi
- [ ] Backend đang chạy trên port 8882
- [ ] Website truy cập được tại https://khanhmelodymussic.com
- [ ] Login admin/<configured-admin-password> thành công
- [ ] Các chức năng hoạt động bình thường

---

## 🎉 Hoàn tất!

Website KhanhMelody của bạn đã được công khai tại: **https://khanhmelodymussic.com**

**Lưu ý quan trọng:**
- Backend server cần luôn chạy để website hoạt động
- Định kỳ backup database bằng script `backup_database.bat`
- Theo dõi Cloudflare Analytics để xem traffic
- Cập nhật security khi cần

**Hỗ trợ:**
- Email: admin@khanhmelody.com
- Xem `DEPLOYMENT_GUIDE.md` để biết chi tiết hơn
