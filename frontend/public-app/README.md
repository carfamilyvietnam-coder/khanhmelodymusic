# KhanhMelody public site and Admin

This clean Vite app serves both the public music catalog and the Admin console. The public page is the default route; Admin sign-in is available at `#/admin`.

The app uses the existing Flask API at `https://api.khanhmelodymussic.com/api`. Set `VITE_API_BASE_URL` only when overriding that API. The VIB VietQR image is rendered for 50,000 VND downloads. A customer submission is not bank-verified; the Admin guest-download tab shows claims and can permanently block a phone number.

## Local development

```powershell
npm ci
npm run dev
```

## Cloudflare Pages

The `khanhmelody-admin` Pages project currently serves the custom domain. Its root build runs `npm run build:admin`, which builds this app into `frontend/admin/dist` while leaving the old Admin source intact as a rollback copy. Keep the Pages output directory set to `frontend/admin/dist`.
