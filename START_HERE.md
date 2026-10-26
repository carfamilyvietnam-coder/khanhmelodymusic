# 🎯 KhanhMelody - Start Here

## 📌 Quick Start - 3 Simple Steps

### Step 1: Setup Backend (5 minutes)

1. **Install Prerequisites** (if not already installed):
   - Python 3.8+ from https://www.python.org/ (Check "Add Python to PATH")
   - PostgreSQL from https://www.postgresql.org/download/windows/ (Set password: `postgres`)

2. **Run Setup Script**:
   - Navigate to: `D:\khanhmelody\backend`
   - Double-click: `setup.bat` (Windows)
   - Wait for setup to complete

3. **Start Backend**:
   - Double-click: `start_backend.bat`
   - Keep this window open (backend must stay running)

### Step 2: Setup Frontend (3 minutes)

1. **Install Dependencies**:
   - Open new terminal
   - Navigate to: `D:\khanhmelody\frontend\admin`
   - Run: `npm install`

2. **Start Frontend**:
   - Run: `npm run dev`
   - Open browser at the URL shown (usually http://localhost:5173)

### Step 3: Login and Use

1. **Login to Admin Panel**:
   - Username: `admin`
   - Password: `admin123`

2. **Explore Features**:
   - Dashboard - Overview statistics
   - Songs - Manage music library
   - Users - Manage user accounts
   - Revenue - View revenue statistics
   - Wallets - Manage user wallets
   - Nghe Nhạc - Music player

## ✅ System Status

**Backend:** Ready to use
- API: http://localhost:8882
- Database: PostgreSQL with sample data
- Authentication: JWT-based

**Frontend:** Ready to use
- Admin Panel: http://localhost:5173
- Connected to real backend
- All features functional

## 🔑 Default Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin (full access) |
| user1 | user123 | User (limited access) |
| user2 | user123 | User (limited access) |
| user3 | user123 | User (limited access) |

## 📚 Documentation

- **backend/MASTER_SETUP.md** - Complete setup guide with troubleshooting
- **backend/QUICKSTART.md** - Backend quick reference
- **backend/README.md** - Full API documentation
- **frontend/admin/SETUP_GUIDE.md** - Frontend configuration guide

## 🛠️ Management Scripts

**Backend Scripts** (in `D:\khanhmelody\backend\`):
- `setup.bat` / `setup.ps1` - Initial setup
- `start_backend.bat` / `start_backend.ps1` - Start server
- `stop_backend.ps1` - Stop server
- `test_backend.bat` / `test_backend.ps1` - Test backend

## 🔄 Daily Usage

**To start the system:**
1. Terminal 1: Run `D:\khanhmelody\backend\start_backend.bat`
2. Terminal 2: Run `npm run dev` in `D:\khanhmelody\frontend\admin`
3. Open browser at frontend URL

**To stop the system:**
1. Press Ctrl+C in both terminals
2. Or run `stop_backend.ps1` to stop backend

## 🎉 You're Ready!

The KhanhMelody system is now fully operational. Start using it to manage your music platform!

## 🐛 Need Help?

If you encounter issues:
1. Check `backend/MASTER_SETUP.md` for troubleshooting
2. Verify all prerequisites are installed
3. Ensure PostgreSQL is running
4. Check backend terminal for error messages

---

**For detailed information, see the documentation files in each directory.**
