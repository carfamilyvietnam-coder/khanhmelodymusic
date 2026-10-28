# KhanhMelody Admin deployment

## Cloudflare Pages

- **Pages project:** `khanhmelody-admin`
- **Production URL:** `https://khanhmelody-admin.pages.dev`
- **Root directory:** repository root
- **Build command:** `npm run build:admin`
- **Build output directory:** `frontend/admin/dist`
- **Production API:** `https://api.khanhmelodymussic.com/api`

The repository root is intentional: it contains the `build:admin` script, which installs and builds only `frontend/admin`. Do not use the root `npm run build` command for this Pages project; that command builds the Member site into `frontend/member/dist`.

## Environment and secrets

The Admin frontend only needs `VITE_API_BASE_URL` when overriding its production default. For local development, the Vite proxy forwards `/api` to the backend at `http://localhost:8882`.

Configure database, JWT, and Cloudflare R2 credentials only in the backend environment. Never add R2 access keys or other secrets to a `VITE_*` variable: Vite embeds client-side variables in public JavaScript bundles.

The backend API is exposed through Cloudflare Tunnel. Do not configure a public DNS record to a private LAN address or expose the backend by router port forwarding.

## Local production build

From the repository root:

```powershell
npm run build:admin
```

The Admin Pages project must use `wrangler-admin.toml` when deploying with Wrangler. Its output path is `./frontend/admin/dist`.
