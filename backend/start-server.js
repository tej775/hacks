const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 VendorBridge Server Startup Script');
console.log('=====================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env file not found! Creating one for you...');
    
    const envContent = `# VendorBridge Environment Configuration
MONGODB_URI=mongodb://localhost:27017/bridge
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://127.0.0.1:5500`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file with default configuration');
    console.log('📝 You can modify it if needed\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing dependencies...');
    const npmInstall = spawn('npm', ['install'], { stdio: 'inherit' });
    
    npmInstall.on('close', (code) => {
        if (code === 0) {
            console.log('✅ Dependencies installed successfully\n');
            startServer();
        } else {
            console.log('❌ Failed to install dependencies');
        }
    });
} else {
    startServer();
}

function startServer() {
    console.log('🔄 Starting VendorBridge server...\n');
    
    const server = spawn('node', ['server.js'], { 
        stdio: 'inherit',
        env: { ...process.env, FORCE_COLOR: true }
    });
    
    server.on('error', (error) => {
        console.error('❌ Failed to start server:', error.message);
    });
    
    server.on('close', (code) => {
        console.log(`\n📊 Server process exited with code ${code}`);
    });
    
    // Handle Ctrl+C gracefully
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down server...');
        server.kill('SIGINT');
        process.exit(0);
    });
}
