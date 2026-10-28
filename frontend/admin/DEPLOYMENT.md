# KhanhMelody Admin deployment

## Cloudflare Pages

- **Pages project:** `khanhmelody-admin`
- **Production URL:** `https://khanhmelody-admin.pages.dev`
- **Build directory:** `frontend/admin`
- **Build command:** `npm ci && npm run build`
- **Build output directory:** `dist`
- **Production API:** `https://api.khanhmelodymussic.com/api`

The Admin Pages project must build `frontend/admin`; it must not reuse the Member project's `frontend/member` output.

## Environment and secrets

The Admin frontend only needs `VITE_API_BASE_URL` when overriding its production default. For local development, the Vite proxy forwards `/api` to the backend at `http://localhost:8882`.

Configure database, JWT, and Cloudflare R2 credentials only in the backend environment. Never add R2 access keys or other secrets to a `VITE_*` variable: Vite embeds client-side variables in public JavaScript bundles.

The backend API is exposed through Cloudflare Tunnel. Do not configure a public DNS record to a private LAN address or expose the backend by router port forwarding.

## Local production build

From `frontend/admin`:

```powershell
npm ci
npm run build
```

Deploy the generated `dist` directory to the `khanhmelody-admin` Pages project using the authorized Cloudflare deployment workflow.
