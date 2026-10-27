# Redeploy Frontend lên Cloudflare Pages

## ⚠️ Giới hạn

Tôi không thể trực tiếp upload lên Cloudflare Pages vì cần quyền truy cập tài khoản. Bạn sẽ thực hiện các bước sau.

## ✅ Thư mục dist/ đã sẵn sàng

Thư mục `D:\khanhmelody\frontend\admin\dist\` đã có đầy đủ files:
- ✅ `index.html` (414 bytes)
- ✅ `_redirects` (108 bytes) - quan trọng cho SPA routing
- ✅ `assets/` - chứa CSS và JS files

## 📋 Hướng dẫn Redeploy (5 phút)

### Bước 1: Đăng nhập Cloudflare
1. Truy cập: https://dash.cloudflare.com
2. Login với tài khoản của bạn
3. Vào: **Workers & Pages**

### Bước 2: Xóa project cũ (tùy chọn)
Nếu muốn làm mới hoàn toàn:
1. Chọn project: `khanhmelody-admin`
2. Vào **Settings** → **General**
3. Cuộn xuống → **Destroy project**
4. Nhập tên project để xác nhận
5. Click: **Destroy project**

### Bước 3: Tạo project mới
1. Click: **Create application**
2. Chọn tab: **Pages**
3. Click: **Upload assets**
4. Project name: `khanhmelody-admin`
5. Click: **Create project**

### Bước 4: Upload files
1. Click: **Upload assets**
2. Mở File Explorer: `D:\khanhmelody\frontend\admin\dist\`
3. Chọn TẤT CẢ files:
   - `index.html`
   - `_redirects` (RẤT QUAN TRỌNG!)
   - Thư mục `assets/`
4. Kéo thả vào vùng upload trên Cloudflare
5. Đợi upload hoàn tất
6. Click: **Deploy site**

### Bước 5: Đợi deploy
Cloudflare sẽ tự động deploy. Đợi khoảng 30-60 giây.

### Bước 6: Cấu hình Custom Domain
1. Vào project vừa tạo
2. Click tab: **Custom domains**
3. Click: **Set up a custom domain**
4. Nhập: `khanhmelodymussic.com`
5. Click: **Continue**
6. Nhập: `www.khanhmelodymussic.com`
7. Click: **Activate domain**
8. Đợi DNS propagation (1-5 phút)

### Bước 7: Kiểm tra
1. Mở browser: `https://khanhmelodymussic.com`
2. Test các route:
   - Homepage: `https://khanhmelodymussic.com`
   - Songs: `https://khanhmelodymussic.com/songs`
   - Users: `https://khanhmelodymussic.com/users`
   - Revenue: `https://khanhmelodymussic.com/revenue`
   - Wallets: `https://khanhmelodymussic.com/wallets`
3. Login: admin / <configured-admin-password>
4. Kiểm tra các chức năng

## 🔍 Nếu vẫn còn lỗi 404

### Kiểm tra 1: File _redirects
1. Vào Cloudflare Pages project
2. Vào file browser (nếu có)
3. Kiểm tra file `_redirects` có trong root directory không
4. Nội dung nên là: `/* /index.html 200`

### Kiểm tra 2: Enable SPA Mode
1. Vào project → **Settings** → **Functions**
2. Bật: **Single Page Application**
3. Click: **Save**
4. Redeploy lại

### Kiểm tra 3: Sử dụng _middleware.js
Nếu _redirects không hoạt động:
1. Tạo file: `D:\khanhmelody\frontend\admin\public\_functions\_middleware.js`
2. Nội dung:
```javascript
export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  if (!url.pathname.includes('.')) {
    url.pathname = '/index.html';
    return Response.redirect(url, 200);
  }
  
  return await context.next();
}
```
3. Rebuild: `npm run build`
4. Upload lại dist/

## ✅ Checklist sau khi deploy

- [ ] Website load tại https://khanhmelodymussic.com
- [ ] Không còn lỗi 404
- [ ] Các route /songs, /users, /revenue, /wallets load bình thường
- [ ] Login admin/<configured-admin-password> thành công
- [ ] Dashboard hiển thị dữ liệu
- [ ] Các chức năng hoạt động

## 📞 Nếu gặp vấn đề

- Kiểm tra file `_redirects` đã upload chưa
- Kiểm tra DNS records đã đúng chưa
- Chờ thêm 5-10 phút cho DNS propagation
- Xem `FIX_404_ERROR.md` để biết thêm chi tiết

---

**Thời gian dự kiến: 5-10 phút**
