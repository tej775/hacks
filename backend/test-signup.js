const http = require('http');

console.log('🧪 Testing Signup Functionality');
console.log('===============================\n');

// Test data
const testVendor = {
    name: 'John Vendor',
    email: 'john.vendor@test.com',
    phone: '1234567890',
    password: 'test123',
    role: 'vendor',
    businessName: 'John\'s Business',
    businessType: 'Retail'
};

const testSupplier = {
    name: 'Jane Supplier',
    email: 'jane.supplier@test.com',
    phone: '0987654321',
    password: 'test123',
    role: 'supplier',
    companyName: 'Jane\'s Company',
    industryType: 'Manufacturing'
};

function makeRequest(data, path = '/api/auth/signup') {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Origin': 'http://127.0.0.1:5500'
            }
        };
        
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
        
        req.write(postData);
        req.end();
    });
}

function makeGetRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'GET',
            headers: {
                'Origin': 'http://127.0.0.1:5500'
            }
        };
        
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
        
        req.end();
    });
}

async function runTests() {
    try {
        // Test 1: Health Check
        console.log('1️⃣ Testing server health...');
        const health = await makeGetRequest('/api/health');
        if (health.status === 200) {
            console.log('✅ Server is running');
            console.log('📊 Database status:', health.data.database);
        } else {
            console.log('❌ Server health check failed');
            return;
        }
        
        // Test 2: Vendor Signup
        console.log('\n2️⃣ Testing vendor signup...');
        const vendorResult = await makeRequest(testVendor);
        if (vendorResult.status === 201) {
            console.log('✅ Vendor signup successful!');
            console.log('📄 Vendor ID:', vendorResult.data.data.user._id);
        } else {
            console.log('❌ Vendor signup failed:', vendorResult.data.message);
        }
        
        // Test 3: Supplier Signup
        console.log('\n3️⃣ Testing supplier signup...');
        const supplierResult = await makeRequest(testSupplier);
        if (supplierResult.status === 201) {
            console.log('✅ Supplier signup successful!');
            console.log('📄 Supplier ID:', supplierResult.data.data.user._id);
        } else {
            console.log('❌ Supplier signup failed:', supplierResult.data.message);
        }
        
        // Test 4: List Users
        console.log('\n4️⃣ Testing users list...');
        const usersResult = await makeGetRequest('/api/auth/users');
        if (usersResult.status === 200) {
            console.log('✅ Users list retrieved successfully!');
            console.log('📊 Total users:', usersResult.data.data.counts.total);
            console.log('👨‍💼 Vendors:', usersResult.data.data.counts.vendors);
            console.log('🏭 Suppliers:', usersResult.data.data.counts.suppliers);
        } else {
            console.log('❌ Users list failed');
        }
        
        console.log('\n🎉 All tests completed!');
        console.log('💡 Check MongoDB Compass for the "bridge" database');
        console.log('📊 You should see "vendors" and "suppliers" collections with data');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.message.includes('ECONNREFUSED')) {
            console.log('💡 Make sure your server is running: node working-server.js');
        }
    }
}

runTests();
