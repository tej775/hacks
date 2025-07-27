const http = require('http');

console.log('🔍 Checking server status...\n');

// Check if server is running on port 5000
const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET',
    timeout: 5000
};

const req = http.request(options, (res) => {
    console.log('✅ Server is running!');
    console.log(`📊 Status Code: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            console.log('📋 Server Response:', response);
            console.log('\n🎉 Your server is working correctly!');
            console.log('🔗 You can now access:');
            console.log('   • Admin Dashboard: http://localhost:5000/admin.html');
            console.log('   • Test Dashboard: http://localhost:5000/test-admin.html');
            console.log('   • API Endpoint: http://localhost:5000/api/auth/users');
        } catch (error) {
            console.log('⚠️  Server responded but with invalid JSON:', data);
        }
    });
});

req.on('error', (error) => {
    console.log('❌ Server is not running or not accessible');
    console.log(`💡 Error: ${error.message}`);
    console.log('\n🔧 To fix this:');
    console.log('   1. Make sure you have created the .env file (run setup-env.bat)');
    console.log('   2. Install dependencies: npm install');
    console.log('   3. Start the server: npm start');
    console.log('   4. Or use the start-server.bat script');
});

req.on('timeout', () => {
    console.log('⏰ Server connection timed out');
    console.log('💡 The server might be starting up or there might be an issue');
    req.destroy();
});

req.end();
