# KhanhMelody Backend - Quick Start Guide

## 🚀 One-Click Setup (Windows)

### Prerequisites
- **Python 3.8+** - Download from https://www.python.org/ (Check "Add Python to PATH" during installation)
- **PostgreSQL** - Download from https://www.postgresql.org/download/windows/
  - Set password to: `postgres`
  - Ensure PostgreSQL service is running

### Setup Steps

**Option 1: Using PowerShell Scripts (Recommended)**

1. **Run Setup Script**
   - Right-click on `setup.ps1`
   - Select "Run with PowerShell"
   - If prompted about execution policy, run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
   - Follow the on-screen instructions

2. **Start Backend Server**
   - Run `start_backend.ps1`
   - Server will start at: `http://0.0.0.0:8882`

3. **Test Backend**
   - Open new terminal
   - Run `test_backend.ps1`
   - Verify all tests pass

**Option 2: Using Batch Scripts**

1. **Run Setup Script**
   - Double-click `setup.bat`
   - Follow the on-screen instructions

2. **Start Backend Server**
   - Double-click `start_backend.bat`
   - Server will start at: `http://0.0.0.0:8882`

3. **Test Backend**
   - Open new terminal
   - Double-click `test_backend.bat`
   - Verify all tests pass

## 🔑 Default Credentials

After setup, you can login with:

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| user1 | user123 | User |
| user2 | user123 | User |
| user3 | user123 | User |

## 📡 API Endpoints

Base URL: `http://localhost:8882` or `http://192.168.0.125:8882`

### Authentication
- `POST /api/login` - Login
- `POST /api/register` - Register
- `GET /api/me` - Get current user

### Songs (Admin)
- `GET /api/admin/songs` - Get all songs
- `POST /api/admin/songs` - Create song
- `PUT /api/admin/songs/:id` - Update song
- `DELETE /api/admin/songs/:id` - Delete song

### Users (Admin)
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Revenue (Admin)
- `GET /api/admin/revenue` - Get revenue statistics

### Wallets (Admin)
- `GET /api/admin/wallets` - Get all wallets
- `POST /api/admin/wallets/:id/topup` - Top up wallet
- `POST /api/admin/wallets/:id/deduct` - Deduct from wallet

### Upload
- `POST /api/upload/r2` - Upload file to R2
- `POST /api/upload/presigned-url` - Get presigned URL

## 🛠️ Management Scripts

- `setup.ps1` / `setup.bat` - Initial setup
- `start_backend.ps1` / `start_backend.bat` - Start server
- `stop_backend.ps1` - Stop server
- `test_backend.ps1` / `test_backend.bat` - Test backend

## 🔧 Troubleshooting

### PostgreSQL Connection Error
```
✗ Failed to connect to PostgreSQL
```
**Solution:**
- Ensure PostgreSQL service is running
- Check password is set to `postgres`
- Verify PostgreSQL is installed correctly

### Port Already in Use
```
Address already in use
```
**Solution:**
- Run `stop_backend.ps1` to stop existing server
- Or manually kill Python process using port 8882

### Virtual Environment Issues
```
ERROR: Virtual environment not found
```
**Solution:**
- Run `setup.ps1` / `setup.bat` again
- Delete `venv` folder and run setup again

### Module Import Errors
```
ModuleNotFoundError: No module named '...'
```
**Solution:**
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again

## 📝 Next Steps

1. **Update Frontend Configuration**
   - Go to `D:\khanhmelody\frontend\admin\src\App.jsx`
   - Set `USE_MOCK_DATA = false`
   - The frontend will now connect to the real backend

2. **Configure Cloudflare R2** (Optional)
   - Update `.env` with your R2 credentials
   - Follow the R2 setup guide in `SETUP_GUIDE.md`

3. **Configure Domain** (Optional)
   - Point `khanhmelodymussic.com` to your server IP
   - Setup port forwarding for port 8882

## 📚 Full Documentation

For detailed documentation, see:
- `README.md` - Complete API documentation
- `SETUP_GUIDE.md` - Detailed setup instructions
- `DEPLOYMENT.md` - Deployment configuration

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend server starts without errors
- [ ] All test cases pass
- [ ] Can login with admin credentials
- [ ] Can fetch songs, users, revenue data
- [ ] Frontend connects to backend successfully
- [ ] Can create/update/delete songs (as admin)
- [ ] Can create/update/delete users (as admin)

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review error messages in the terminal
3. Ensure all prerequisites are installed correctly
4. Verify PostgreSQL is running and accessible
