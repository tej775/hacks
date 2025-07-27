const http = require('http');

console.log('🧪 Testing All Server Endpoints...\n');

// Test data
const testVendor = {
    name: 'Test Vendor',
    email: 'vendor@test.com',
    phone: '1234567890',
    password: 'test123',
    role: 'vendor',
    businessName: 'Test Business'
};

const testSupplier = {
    name: 'Test Supplier',
    email: 'supplier@test.com',
    phone: '0987654321',
    password: 'test123',
    role: 'supplier',
    companyName: 'Test Company'
};

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: responseData });
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Test functions
async function testHealthEndpoint() {
    console.log('1️⃣ Testing Health Endpoint...');
    try {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/health',
            method: 'GET'
        };
        
        const result = await makeRequest(options);
        if (result.status === 200) {
            console.log('✅ Health endpoint working');
            console.log('📊 Response:', result.data);
        } else {
            console.log('❌ Health endpoint failed:', result.status);
        }
    } catch (error) {
        console.log('❌ Health endpoint error:', error.message);
        return false;
    }
    return true;
}

async function testVendorSignup() {
    console.log('\n2️⃣ Testing Vendor Signup...');
    try {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/signup',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://127.0.0.1:5500'
            }
        };
        
        const result = await makeRequest(options, testVendor);
        if (result.status === 201) {
            console.log('✅ Vendor signup working');
            console.log('📊 Response:', result.data);
        } else {
            console.log('❌ Vendor signup failed:', result.status);
            console.log('📊 Response:', result.data);
        }
    } catch (error) {
        console.log('❌ Vendor signup error:', error.message);
    }
}

async function testSupplierSignup() {
    console.log('\n3️⃣ Testing Supplier Signup...');
    try {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/signup',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://127.0.0.1:5500'
            }
        };
        
        const result = await makeRequest(options, testSupplier);
        if (result.status === 201) {
            console.log('✅ Supplier signup working');
            console.log('📊 Response:', result.data);
        } else {
            console.log('❌ Supplier signup failed:', result.status);
            console.log('📊 Response:', result.data);
        }
    } catch (error) {
        console.log('❌ Supplier signup error:', error.message);
    }
}

async function testUsersEndpoint() {
    console.log('\n4️⃣ Testing Users List Endpoint...');
    try {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/users',
            method: 'GET',
            headers: {
                'Origin': 'http://127.0.0.1:5500'
            }
        };
        
        const result = await makeRequest(options);
        if (result.status === 200) {
            console.log('✅ Users endpoint working');
            console.log('📊 Users found:', result.data.data?.users?.length || 0);
        } else {
            console.log('❌ Users endpoint failed:', result.status);
        }
    } catch (error) {
        console.log('❌ Users endpoint error:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    console.log('🔍 Starting comprehensive server tests...\n');
    
    const healthOk = await testHealthEndpoint();
    if (!healthOk) {
        console.log('\n❌ Server is not responding. Make sure it\'s running with: node server.js');
        return;
    }
    
    await testVendorSignup();
    await testSupplierSignup();
    await testUsersEndpoint();
    
    console.log('\n🎉 All tests completed!');
    console.log('💡 Check MongoDB Compass for the "bridge" database with vendors and suppliers collections');
}

runAllTests();
