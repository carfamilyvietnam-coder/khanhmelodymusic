# KhanhMelody Deployment Configuration

## Server Configuration
- **Local Server IP:** 192.168.0.125
- **Port:** 8882 (with port forwarding configured)
- **API Endpoint:** http://192.168.0.125:8882/api

## Domain Configuration
- **Domain:** khanhmelodymussic.com
- **DNS Configuration:** Point domain to server IP (192.168.0.125)

## Cloudflare R2 Storage
- **Bucket Name:** khanhmelody
- **Purpose:** Store audio files, images, and other media assets
- **Public URL:** https://khanhmelody.r2.dev

## Environment Variables
Configure the following in `.env` file:

```bash
# API Configuration
VITE_API_BASE_URL=http://192.168.0.125:8882/api

# Domain Configuration
VITE_DOMAIN=khanhmelodymussic.com

# Cloudflare R2 Configuration
VITE_R2_BUCKET_NAME=khanhmelody
VITE_R2_ACCOUNT_ID=your_account_id_here
VITE_R2_ACCESS_KEY_ID=your_access_key_here
VITE_R2_SECRET_ACCESS_KEY=your_secret_key_here
VITE_R2_PUBLIC_URL=https://khanhmelody.r2.dev
```

## Port Forwarding Setup
Ensure port 8882 is forwarded on your router:
1. Access router admin panel (usually 192.168.0.1 or 192.168.1.1)
2. Navigate to Port Forwarding / Virtual Server
3. Add rule:
   - External Port: 8882
   - Internal Port: 8882
   - Internal IP: 192.168.0.125
   - Protocol: TCP

## Cloudflare R2 Setup Instructions
1. Log in to Cloudflare Dashboard
2. Navigate to R2 > Create Bucket
3. Name the bucket: `khanhmelody`
4. Create API Token:
   - Go to R2 > Manage R2 API Tokens
   - Create token with permissions: Object Read, Object Write
   - Copy Access Key ID and Secret Access Key
5. Update `.env` with your credentials

## Backend API Requirements
The backend should implement:
- `/api/login` - User authentication
- `/api/admin/songs` - Song CRUD operations
- `/api/admin/users` - User management
- `/api/admin/revenue` - Revenue data
- `/api/admin/wallets` - Wallet management
- `/api/upload/r2` - R2 file upload endpoint (generates presigned URLs)

## Development vs Production
- Set `USE_MOCK_DATA = true` in `App.jsx` for development without backend
- Set `USE_MOCK_DATA = false` when backend is available
