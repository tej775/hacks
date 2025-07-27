@echo off
echo Creating .env file...
(
echo # VendorBridge Environment Configuration
echo MONGODB_URI=mongodb://localhost:27017/bridge
echo JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
echo PORT=5000
echo NODE_ENV=development
echo FRONTEND_URL=http://127.0.0.1:5500
) > .env
echo .env file created successfully!
pause
