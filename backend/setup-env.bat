@echo off
echo Creating .env file for VendorBridge...

echo # Database Configuration > .env
echo MONGODB_URI=mongodb://localhost:27017/vendorbridge >> .env
echo. >> .env
echo # JWT Configuration >> .env
echo JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production >> .env
echo. >> .env
echo # Server Configuration >> .env
echo PORT=5000 >> .env

echo NODE_ENV=development >> .env
echo. >> .env
echo # Frontend Configuration >> .env
echo FRONTEND_URL=http://localhost:3000 >> .env

echo ✅ .env file created successfully!
echo.
echo Next steps:
echo 1. Make sure MongoDB is running
echo 2. Run: npm start
echo 3. Test the debug script: node debug-setup.js
echo.
pause
