# KhanhMelody Pages deployment

The Cloudflare Pages project `khanhmelody-admin` currently serves both the public site and the Admin console. The public catalog opens by default; Admin sign-in is at `#/admin`.

- **Pages project:** `khanhmelody-admin`
- **Production URL:** `https://khanhmelodymussic.com`
- **Admin URL:** `https://khanhmelodymussic.com/#/admin`
- **Pages preview domain:** `https://khanhmelody-admin.pages.dev`
- **Build command:** `npm run build:admin`
- **Build output directory:** `frontend/admin/dist`

The root `build:admin` command builds the clean app in `frontend/public-app` into the existing output directory. The old Admin source remains in `frontend/admin/src` as a rollback copy.

The API is served by the backend through Cloudflare Tunnel at `https://api.khanhmelodymussic.com/api`; do not open port 8882 to the Internet or configure router port forwarding.

Keep database, JWT, and Cloudflare R2 credentials only in the backend environment. Never put secrets in frontend `VITE_*` variables, because Vite embeds those variables in public JavaScript.
