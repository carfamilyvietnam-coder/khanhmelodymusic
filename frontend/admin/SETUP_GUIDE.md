# KhanhMelody Admin access

The public music catalog and Admin sign-in are part of the same website. The public catalog is the default route; open `https://khanhmelodymussic.com/#/admin` to sign in as Admin.

For local development, start the Flask backend on `http://127.0.0.1:8882`, then run `npm ci` and `npm run dev` from `frontend/public-app`.

The Cloudflare Pages build uses the root command `npm run build:admin` and output directory `frontend/admin/dist`. API requests use `https://api.khanhmelodymussic.com/api` through Cloudflare Tunnel. Do not open port 8882 to the Internet or configure router port forwarding.

Admin login accepts the existing Admin account only. Uploads are sent to the authenticated backend, which holds private R2 credentials. Keep all database, JWT, and R2 secrets in the backend environment, never in frontend `VITE_*` variables.
