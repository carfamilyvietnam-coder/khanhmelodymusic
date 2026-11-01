# KhanhMelody public site and Admin

This clean Vite app serves both the public music catalog and the Admin console. The public page is the default route; Admin sign-in is available at `#/admin`.

The public song list and HLS audio streams are fetched from the Cloudflare R2 custom domain configured by `VITE_STREAM_PUBLIC_URL`; playback does not require the Flask API. The Flask API at `https://api.khanhmelodymussic.com/api` remains responsible for Admin, paid downloads, and best-effort play counts. Set `VITE_API_BASE_URL` to override it. The VIB VietQR image is rendered for 50,000 VND downloads. A customer submission is not bank-verified; the Admin guest-download tab shows claims and can permanently block a phone number.

## Local development

```powershell
npm ci
npm run dev
```

## Cloudflare Pages

The `khanhmelody-admin` Pages project currently serves the custom domain. Its root build runs `npm run build:admin`, which builds this app into `frontend/admin/dist` while leaving the old Admin source intact as a rollback copy. Keep the Pages output directory set to `frontend/admin/dist`.

The default `VITE_STREAM_PUBLIC_URL` is `https://www.khanhmelodymussic.com`; override it in the Pages build environment only if the R2 hostname changes. This hostname is dedicated to the public `khanhmelody-v2` R2 bucket; serve the website from `https://khanhmelodymussic.com`, not from `www`. Configure the bucket CORS to allow GET/HEAD from the website origin.
