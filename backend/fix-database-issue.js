const fs = require('fs');
const path = require('path');

console.log('🔧 VendorBridge Database Fix Script');
console.log('===================================\n');

// Step 1: Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
const envContent = `# VendorBridge Environment Configuration
MONGODB_URI=mongodb://localhost:27017/bridge
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://127.0.0.1:5500`;

if (!fs.existsSync(envPath)) {
    try {
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Created .env file with correct configuration');
    } catch (error) {
        console.log('⚠️  Could not create .env file automatically');
        console.log('📝 Please create .env file manually with this content:');
        console.log('─'.repeat(50));
        console.log(envContent);
        console.log('─'.repeat(50));
    }
} else {
    console.log('✅ .env file already exists');
}

// Step 2: Check if MongoDB is running
console.log('\n🔍 Checking MongoDB connection...');

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function checkAndFixDatabase() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bridge';
        console.log('📍 Connecting to:', mongoURI);
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000 // 5 second timeout
        });
        
        console.log('✅ MongoDB connection successful!');
        console.log('📊 Database:', mongoose.connection.db.databaseName);
        
        // Test creating collections
        console.log('\n🧪 Testing collection creation...');
        
        // Import models to ensure collections are created
        const Vendor = require('./models/Vendor');
        const Supplier = require('./models/Supplier');
        
        // Create test documents to ensure collections exist
        console.log('📝 Creating test vendor...');
        const testVendor = new Vendor({
            name: 'Test Vendor',
            email: 'test.vendor@example.com',
            phone: '1234567890',
            password: 'test123',
            businessName: 'Test Business'
        });
        
        await testVendor.save();
        console.log('✅ Test vendor created with ID:', testVendor._id);
        
        console.log('📝 Creating test supplier...');
        const testSupplier = new Supplier({
            name: 'Test Supplier',
            email: 'test.supplier@example.com',
            phone: '0987654321',
            password: 'test123',
            companyName: 'Test Company'
        });
        
        await testSupplier.save();
        console.log('✅ Test supplier created with ID:', testSupplier._id);
        
        // Verify collections exist
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📋 Collections in database:');
        collections.forEach(col => {
            console.log(`   • ${col.name}`);
        });
        
        // Clean up test documents
        await Vendor.deleteOne({ email: 'test.vendor@example.com' });
        await Supplier.deleteOne({ email: 'test.supplier@example.com' });
        console.log('🧹 Test documents cleaned up');
        
        console.log('\n🎉 Database is working correctly!');
        console.log('💡 Your signup forms should now save data to MongoDB Compass');
        console.log('📊 Look for the "bridge" database with "vendors" and "suppliers" collections');
        
    } catch (error) {
        console.error('\n❌ Database connection failed:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 MongoDB is not running. Please:');
            console.log('1. Start MongoDB service:');
            console.log('   Windows: net start MongoDB');
            console.log('   Mac: brew services start mongodb/brew/mongodb-community');
            console.log('   Linux: sudo systemctl start mongod');
            console.log('2. Or start manually: mongod');
            console.log('3. Make sure MongoDB is installed');
        }
        
        if (error.message.includes('serverSelectionTimeoutMS')) {
            console.log('\n💡 MongoDB connection timeout. Check:');
            console.log('1. MongoDB is running on port 27017');
            console.log('2. No firewall blocking the connection');
            console.log('3. MongoDB service is properly started');
        }
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Connection closed');
        process.exit(0);
    }
}

checkAndFixDatabase();
