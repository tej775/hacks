@echo off
echo 🚀 Starting VendorBridge Server...
echo.

echo 📋 Checking if .env file exists...
if not exist .env (
    echo ❌ .env file not found!
    echo 💡 Please run setup-env.bat first to create the .env file
    pause
    exit /b 1
)
echo ✅ .env file found

echo.
echo 📦 Installing dependencies...
call npm install

echo.
echo 🔧 Starting the server...
echo 📍 Server will be available at: http://localhost:5000
echo 📍 Admin dashboard: http://localhost:5000/admin.html
echo 📍 Test dashboard: http://localhost:5000/test-admin.html
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start
