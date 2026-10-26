# Đồng bộ dữ liệu lên Cloudflare R2

## ✅ Đã hoàn thành

### 1. Sửa lỗi trang trắng
- **Nguyên nhân:** Frontend cố kết nối đến API backend chưa deploy → không có dữ liệu → trang trắng
- **Giải pháp:** Tạm thời bật `USE_MOCK_DATA = true` để hiển thị dữ liệu mẫu
- **Đã rebuild:** Frontend đã rebuild với mock data
- **Đã cập nhật:** File zip `deployment-package/khanhmelody-frontend.zip` đã cập nhật

### 2. Tạo script đồng bộ R2
- Đã tạo file: `backend/sync_to_r2.py`
- Script có khả năng:
  - Sync frontend dist/ folder lên R2
  - Export database và upload lên R2
  - Sync uploaded files lên R2

## 🔴 Cần cập nhật R2 Credentials

File `.env` hiện có credentials placeholder:
```
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_key_here
```

### Bước 1: Lấy R2 Credentials
1. Cloudflare Dashboard → R2 → Manage R2 API Tokens
2. Click: **Create API Token**
3. Permissions: **Admin Read & Write**
4. Click: **Create API Token**
5. Copy:
   - **Account ID** (từ R2 dashboard)
   - **Access Key ID**
   - **Secret Access Key**

### Bước 2: Cập nhật .env
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

### Bước 3: Chạy script sync
Mở terminal:
```bash
cd D:\khanhmelody\backend
venv\Scripts\python sync_to_r2.py
```

Script sẽ:
1. Upload frontend dist/ lên R2 bucket (prefix: `frontend/`)
2. Export database PostgreSQL và upload lên R2 (prefix: `database/backups/`)
3. Upload files trong uploads/ lên R2 (prefix: `uploads/`)

## 📋 Redeploy Frontend với bản mới

Sau khi sync xong, bạn cần redeploy frontend lên Cloudflare Pages:

1. Upload file `D:\khanhmelody\deployment-package\khanhmelody-frontend.zip` lên Cloudflare Pages
2. Website sẽ hiển thị với mock data (trang không còn trắng)
3. Sau khi backend được deploy production, đổi `USE_MOCK_DATA = false` và rebuild lại

## 📝 Tóm tắt

**Lỗi trang trắng:** Đã fix bằng mock data
**Script sync:** Đã tạo sẵn
**Cần làm:** Cập nhật R2 credentials trong .env → chạy sync script → redeploy frontend

**Thời gian dự kiến:** 10 phút
