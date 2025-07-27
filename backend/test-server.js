// Quick test to check if server is working
const http = require('http');

console.log('🔍 Testing server connection...');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`✅ Server responded with status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📊 Response:', data);
    console.log('🎉 Server is working correctly!');
  });
});

req.on('error', (error) => {
  console.error('❌ Server connection failed:', error.message);
  console.log('💡 Make sure your server is running with: node server.js');
});

req.setTimeout(5000, () => {
  console.error('⏰ Request timed out - server might not be running');
  req.destroy();
});

req.end();
