# Khắc phục Lỗi 404 cho KhanhMelody

## 🔍 Nguyên nhân lỗi 404

Website trả về 404 vì Cloudflare Pages không biết cách xử lý React Router (client-side routing). Khi người dùng truy cập trực tiếp vào các route như `/songs`, `/users`, Cloudflare Pages tìm file thực sự trên server thay vì redirect về `index.html`.

## ✅ Đã khắc phục

Đã thực hiện các thay đổi sau:

### 1. Cập nhật vite.config.js
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
```

### 2. Thêm file _redirects
Đã tạo file `D:\khanhmelody\frontend\admin\public\_redirects` với nội dung:
```
/* /index.html 200
```

File này sẽ được copy vào `dist/` khi build và giúp Cloudflare Pages redirect tất cả routes về index.html.

### 3. Rebuild Frontend
Frontend đã được rebuild với cấu hình mới. File `_redirects` hiện có trong thư mục `dist/`.

## 🚀 Cần Redeploy lên Cloudflare Pages

Bạn cần upload lại files mới lên Cloudflare Pages:

### Bước 1: Xóa deployment cũ (tùy chọn)
1. Cloudflare Dashboard → Workers & Pages
2. Chọn project: `khanhmelody-admin`
3. Vào Settings → General → Destroy project (nếu muốn làm mới)

### Bước 2: Upload lại files
1. Cloudflare Dashboard → Workers & Pages → Create application
2. Chọn: **Upload assets**
3. Project name: `khanhmelody-admin` (hoặc tên mới nếu đã xóa)
4. Click: **Create project**

### Bước 3: Upload thư mục dist
1. Mở thư mục: `D:\khanhmelody\frontend\admin\dist\`
2. Kéo thả TẤT CẢ files vào vùng upload:
   - `index.html`
   - `_redirects` (quan trọng!)
   - Thư mục `assets/`
3. Click: **Upload**

### Bước 4: Cấu hình Custom Domain
1. Vào **Custom domains**
2. Click: **Set up a custom domain**
3. Nhập: `khanhmelodymussic.com`
4. Click: **Continue**
5. Nhập: `www.khanhmelodymussic.com`
6. Click: **Activate domain**

### Bước 5: Kiểm tra
Sau khi deploy hoàn tất (khoảng 1-2 phút):
1. Mở: `https://khanhmelodymussic.com`
2. Test các route:
   - `https://khanhmelodymussic.com/songs`
   - `https://khanhmelodymussic.com/users`
   - `https://khanhmelodymussic.com/revenue`
3. Tất cả nên load bình thường, không còn 404

## 🔧 Nếu vẫn còn lỗi 404

### Kiểm tra 1: _redirects file
Đảm bảo file `_redirects` đã được upload:
1. Vào Cloudflare Pages project
2. Vào file browser (nếu có)
3. Kiểm tra file `_redirects` có trong root directory không

### Kiểm tra 2: Cloudflare Pages Functions
Nếu _redirects không hoạt động, tạo file `_functions/_middleware.js`:

```javascript
export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  // Redirect all non-file requests to index.html
  if (!url.pathname.includes('.')) {
    url.pathname = '/index.html';
    return Response.redirect(url, 200);
  }
  
  return await context.next();
}
```

### Kiểm tra 3: Single Page Application Settings
1. Vào Cloudflare Pages project
2. Settings → Functions → Single Page Application
3. Bật: **Enable Single Page Application**
4. Save

## ✅ Kiểm tra sau khi fix

- [ ] Homepage load: `https://khanhmelodymussic.com`
- [ ] Route /songs load: `https://khanhmelodymussic.com/songs`
- [ ] Route /users load: `https://khanhmelodymussic.com/users`
- [ ] Route /revenue load: `https://khanhmelodymussic.com/revenue`
- [ ] Route /wallets load: `https://khanhmelodymussic.com/wallets`
- [ ] Login admin/admin123 hoạt động
- [ ] API kết nối thành công

## 📝 Tóm tắt

**Nguyên nhân:** Cloudflare Pages không xử lý React Router mặc định

**Giải pháp:** Thêm file `_redirects` để redirect tất cả routes về index.html

**Thao tác:** Upload lại thư mục `dist/` (bao gồm file `_redirects`) lên Cloudflare Pages

**Thời gian:** 5 phút
