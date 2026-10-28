# KhanhMelody Admin setup

## Local development

1. Start the Flask backend on `http://localhost:8882`.
2. From `frontend/admin`, install dependencies and start Vite:

   ```powershell
   npm ci
   npm run dev
   ```

3. Open `http://localhost:5174`. The Vite `/api` proxy forwards requests to the local backend.

## Production

The Admin console is deployed separately from the Member site at `https://khanhmelody-admin.pages.dev`. Its Cloudflare Pages project must build from `frontend/admin` and publish that directory's `dist` output. The production API is `https://api.khanhmelodymussic.com/api`.

The Admin login accepts the existing Admin account only. Public registration creates Member accounts and cannot grant administrator access.

## Secrets and media storage

Keep database, JWT, and Cloudflare R2 credentials in the backend's protected environment only. Do not place credentials in frontend `VITE_*` variables, because Vite embeds those values into public JavaScript. File uploads are sent to the authenticated backend, which handles private R2 access.

Expose the API through Cloudflare Tunnel. Do not point public DNS to a private LAN address or forward the backend port directly from the router.
