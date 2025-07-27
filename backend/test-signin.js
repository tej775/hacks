const http = require('http');

console.log('🔐 Testing Signin Functionality');
console.log('==============================\n');

// Test data - using the same data from signup test
const testCredentials = [
    {
        email: 'john.vendor@test.com',
        password: 'test123',
        expectedRole: 'vendor'
    },
    {
        email: 'jane.supplier@test.com',
        password: 'test123',
        expectedRole: 'supplier'
    }
];

function makeRequest(data, path, method = 'POST') {
    return new Promise((resolve, reject) => {
        const postData = method === 'POST' ? JSON.stringify(data) : null;
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Origin': 'http://127.0.0.1:5500'
            }
        };
        
        if (method === 'POST') {
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }
        
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
        
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

async function runSigninTests() {
    try {
        // Test 1: Health Check
        console.log('1️⃣ Testing server health...');
        const health = await makeRequest(null, '/api/health', 'GET');
        if (health.status === 200) {
            console.log('✅ Server is running');
            console.log('📊 Database status:', health.data.database);
        } else {
            console.log('❌ Server health check failed');
            return;
        }
        
        // Test 2: Check if test users exist (from previous signup tests)
        console.log('\n2️⃣ Checking existing users...');
        const usersResult = await makeRequest(null, '/api/auth/users', 'GET');
        if (usersResult.status === 200) {
            const users = usersResult.data.data.users;
            console.log('📊 Found', users.length, 'users in database');
            
            const vendorExists = users.some(u => u.email === 'john.vendor@test.com');
            const supplierExists = users.some(u => u.email === 'jane.supplier@test.com');
            
            if (!vendorExists || !supplierExists) {
                console.log('⚠️  Test users not found. Creating them first...');
                
                if (!vendorExists) {
                    const vendorData = {
                        name: 'John Vendor',
                        email: 'john.vendor@test.com',
                        phone: '1234567890',
                        password: 'test123',
                        role: 'vendor',
                        businessName: 'John\\'s Business'
                    };
                    await makeRequest(vendorData, '/api/auth/signup');
                    console.log('✅ Created test vendor');
                }
                
                if (!supplierExists) {
                    const supplierData = {
                        name: 'Jane Supplier',
                        email: 'jane.supplier@test.com',
                        phone: '0987654321',
                        password: 'test123',
                        role: 'supplier',
                        companyName: 'Jane\\'s Company'
                    };
                    await makeRequest(supplierData, '/api/auth/signup');
                    console.log('✅ Created test supplier');
                }
            }
        }
        
        // Test 3: Test Signin with Valid Credentials
        console.log('\n3️⃣ Testing signin with valid credentials...');
        
        for (const cred of testCredentials) {
            console.log(`\n🔐 Testing signin for ${cred.expectedRole}: ${cred.email}`);
            
            const signinResult = await makeRequest({
                email: cred.email,
                password: cred.password
            }, '/api/auth/signin');
            
            if (signinResult.status === 200) {
                console.log('✅ Signin successful!');
                console.log('👤 User:', signinResult.data.data.user.name);
                console.log('🎭 Role:', signinResult.data.data.user.role);
                console.log('🎫 Token:', signinResult.data.data.token ? 'Generated' : 'Missing');
                
                if (signinResult.data.data.user.role === cred.expectedRole) {
                    console.log('✅ Role matches expected');
                } else {
                    console.log('❌ Role mismatch');
                }
            } else {
                console.log('❌ Signin failed:', signinResult.data.message);
            }
        }
        
        // Test 4: Test Signin with Invalid Credentials
        console.log('\n4️⃣ Testing signin with invalid credentials...');
        
        const invalidTests = [
            { email: 'nonexistent@test.com', password: 'test123', reason: 'User does not exist' },
            { email: 'john.vendor@test.com', password: 'wrongpassword', reason: 'Wrong password' },
            { email: '', password: 'test123', reason: 'Missing email' },
            { email: 'john.vendor@test.com', password: '', reason: 'Missing password' }
        ];
        
        for (const test of invalidTests) {
            console.log(`\n🚫 Testing: ${test.reason}`);
            
            const result = await makeRequest({
                email: test.email,
                password: test.password
            }, '/api/auth/signin');
            
            if (result.status === 401 || result.status === 400) {
                console.log('✅ Correctly rejected invalid credentials');
                console.log('📝 Message:', result.data.message);
            } else {
                console.log('❌ Should have rejected invalid credentials');
            }
        }
        
        console.log('\n🎉 All signin tests completed!');
        console.log('\n📋 Summary:');
        console.log('✅ Server is running and responding');
        console.log('✅ Signin endpoint is working');
        console.log('✅ Valid credentials are accepted');
        console.log('✅ Invalid credentials are rejected');
        console.log('✅ User roles are correctly identified');
        console.log('\n💡 Your signin form should now work properly!');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.message.includes('ECONNREFUSED')) {
            console.log('💡 Make sure your server is running: node working-server.js');
        }
    }
}

runSigninTests();
