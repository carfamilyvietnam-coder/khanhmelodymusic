# KhanhMelody - Complete Setup Guide

## 🎯 Overview

This guide will help you set up the entire KhanhMelody system (Backend + Frontend) from scratch in a few simple steps.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Windows 10/11** operating system
- [ ] **Python 3.9 or higher** installed
  - Download: https://www.python.org/downloads/
  - IMPORTANT: Check "Add Python to PATH" during installation
- [ ] **PostgreSQL** installed
  - Download: https://www.postgresql.org/download/windows/
  - Set password to: `postgres`
  - Ensure PostgreSQL service is running
- [ ] **Node.js 18+** installed (for frontend)
  - Download: https://nodejs.org/
- [ ] **Git** installed (optional, for version control)

## 🚀 Complete Setup Process

### Step 1: Setup Backend (5 minutes)

1. **Navigate to backend directory**
   ```
   cd D:\khanhmelody\backend
   ```

2. **Run setup script**
   - **PowerShell (Recommended):** Right-click `setup.ps1` → "Run with PowerShell"
   - **Or Batch:** Double-click `setup.bat`

3. **Wait for setup to complete**
   - Script will automatically:
     - Create virtual environment
     - Install dependencies
     - Setup PostgreSQL database
     - Initialize with sample data

4. **Verify setup**
   - Run `test_backend.ps1` or `test_backend.bat`
   - All tests should pass ✓

### Step 2: Start Backend Server

1. **Start the backend**
   - **PowerShell:** Run `start_backend.ps1`
   - **Or Batch:** Double-click `start_backend.bat`

2. **Verify server is running**
   - Open browser: http://localhost:8882/api/login
   - Should see JSON response (405 Method Not Allowed is OK - means server is running)

3. **Keep this terminal open**
   - Backend server must remain running

### Step 3: Setup Frontend (3 minutes)

1. **Navigate to frontend directory** (in new terminal)
   ```
   cd D:\khanhmelody\frontend\admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Update frontend to use real backend**
   - Open `src\App.jsx`
   - Find line: `const Mock data mode is disabled; use the authenticated backend API.`
   - Change to: `const USE_MOCK_DATA = false`
   - Save file

4. **Start frontend development server**
   ```bash
   npm run dev
   ```

5. **Open frontend in browser**
   - URL will be shown (usually http://localhost:5173)
   - Login with: `admin` / `<configured-admin-password>`

### Step 4: Verify Complete System

1. **Test Backend Connection**
   - Login to frontend admin panel
   - Navigate to Dashboard
   - Should see real data from backend

2. **Test Song Management**
   - Go to Songs page
   - Should see sample songs from database
   - Try adding a new song
   - Try editing/deleting a song

3. **Test User Management**
   - Go to Users page
   - Should see sample users
   - Try adding/editing/deleting users

4. **Test Revenue**
   - Go to Revenue page
   - Should see revenue statistics

5. **Test Wallets**
   - Go to Wallets page
   - Should see wallet balances

## 🎉 System is Ready!

Your KhanhMelody system is now fully operational:

- **Backend API:** Running at http://localhost:8882
- **Frontend Admin:** Running at http://localhost:5173
- **Database:** PostgreSQL with sample data
- **Authentication:** Working with JWT tokens

## 📝 Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | <configured-admin-password> |
| User | user1 | user123 |
| User | user2 | user123 |
| User | user3 | user123 |

## 🔄 Daily Usage

### Starting the System

1. **Start Backend**
   - Open terminal in `D:\khanhmelody\backend`
   - Run `start_backend.ps1` or `start_backend.bat`
   - Keep this terminal open

2. **Start Frontend** (in new terminal)
   - Open terminal in `D:\khanhmelody\frontend\admin`
   - Run `npm run dev`
   - Open browser at the URL shown

### Stopping the System

1. **Stop Backend**
   - In backend terminal, press `Ctrl+C`
   - Or run `stop_backend.ps1`

2. **Stop Frontend**
   - In frontend terminal, press `Ctrl+C`

## 🔧 Advanced Configuration

### Configure Cloudflare R2 (Optional)

If you want to use Cloudflare R2 for file storage:

1. **Get R2 credentials**
   - Log in to Cloudflare Dashboard
   - Navigate to R2
   - Create bucket: `khanhmelody`
   - Get Account ID, Access Key, Secret Key

2. **Update backend .env**
   - Open `D:\khanhmelody\backend\.env`
   - Update R2 configuration:
     ```
     R2_ACCOUNT_ID=your_account_id
     R2_ACCESS_KEY_ID=your_access_key
     R2_SECRET_ACCESS_KEY=your_secret_key
     ```

3. **Restart backend**
   - Stop and start backend server again

### Configure Domain (Optional)

To access from other devices on your network:

1. **Find your local IP**
   - Run: `ipconfig`
   - Look for IPv4 Address (e.g., 192.168.0.125)

2. **Update frontend API URL**
   - Open `D:\khanhmelody\frontend\admin\src\App.jsx`
   - Change API_BASE to your IP:
     ```javascript
     const API_BASE = 'http://192.168.0.125:8882/api'
     ```

3. **Setup port forwarding** (for external access)
   - Follow instructions in `SETUP_GUIDE.md`

## 🐛 Troubleshooting

### Backend won't start

**Problem:** Port 8882 already in use
```
Solution: Run stop_backend.ps1
```

**Problem:** PostgreSQL connection failed
```
Solution:
1. Ensure PostgreSQL service is running
2. Check password is 'postgres'
3. Verify database 'khanhmelody' exists
```

**Problem:** Module not found errors
```
Solution:
1. Ensure virtual environment is activated
2. Run: pip install -r requirements.txt
```

### Frontend won't connect to backend

**Problem:** Connection refused
```
Solution:
1. Ensure backend server is running
2. Check USE_MOCK_DATA = false in App.jsx
3. Verify API_BASE URL is correct
```

**Problem:** CORS errors
```
Solution:
1. Backend should have CORS enabled (it is by default)
2. Check backend logs for errors
```

### Database issues

**Problem:** Database not found
```
Solution:
1. Run: python init_db.py
2. This will recreate the database
```

**Problem:** Login fails
```
Solution:
1. Verify credentials are correct
2. Check database has admin user
3. Re-run init_db.py to reset
```

## 📊 System Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
│   Port: 5173    │
└────────┬────────┘
         │ HTTP/REST API
         ↓
┌─────────────────┐
│   Backend       │
│   (Flask)       │
│   Port: 8882    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   PostgreSQL    │
│   Database      │
│   Port: 5432    │
└─────────────────┘

         ↕
┌─────────────────┐
│   Cloudflare R2 │
│   File Storage  │
└─────────────────┘
```

## 📚 Additional Documentation

- `backend/README.md` - Complete API documentation
- `backend/QUICKSTART.md` - Backend quick start
- `frontend/admin/SETUP_GUIDE.md` - Frontend setup guide
- `frontend/admin/DEPLOYMENT.md` - Deployment configuration

## ✅ Final Verification Checklist

After completing setup, verify:

Backend:
- [ ] Backend starts without errors
- [ ] All backend tests pass
- [ ] Can login via API
- [ ] Can fetch songs/users/revenue
- [ ] Database has sample data

Frontend:
- [ ] Frontend starts without errors
- [ ] Can login to admin panel
- [ ] Dashboard shows real data
- [ ] Can manage songs
- [ ] Can manage users
- [ ] Can view revenue
- [ ] Can view wallets

Integration:
- [ ] Frontend connects to backend
- [ ] Changes in backend reflect in frontend
- [ ] Authentication works end-to-end

## 🎓 Next Steps

Once system is running:

1. **Customize sample data**
   - Add your own songs
   - Create real users
   - Set up proper pricing

2. **Configure R2 storage**
   - Upload actual audio files
   - Update song URLs

3. **Setup domain**
   - Configure DNS
   - Setup SSL certificate
   - Make accessible externally

4. **Deploy to production**
   - Use Gunicorn for backend
   - Build frontend for production
   - Setup proper monitoring

## 🆘 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review error messages in terminal
3. Check logs in backend terminal
4. Verify all prerequisites are installed
5. Ensure PostgreSQL is running

## 📞 Support

For additional support:
- Email: admin@khanhmelody.com
- Website: https://khanhmelodymussic.com

---

**Congratulations! Your KhanhMelody system is now fully operational! 🎉**
