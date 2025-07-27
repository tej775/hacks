const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('🔍 MongoDB Connection Debug Test');
console.log('=================================\n');

async function testMongoConnection() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bridge';
        console.log('📍 Connecting to:', mongoURI);
        
        // Connect to MongoDB
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ MongoDB Connected Successfully!');
        console.log('📊 Database Name:', mongoose.connection.db.databaseName);
        console.log('🏠 Host:', mongoose.connection.host);
        console.log('🔌 Port:', mongoose.connection.port);
        
        // Test creating a simple document
        console.log('\n🧪 Testing Document Creation...');
        
        const testSchema = new mongoose.Schema({
            name: String,
            email: String,
            role: String,
            createdAt: { type: Date, default: Date.now }
        });
        
        const TestModel = mongoose.model('Test', testSchema);
        
        // Create a test document
        const testDoc = new TestModel({
            name: 'Test User',
            email: 'test@example.com',
            role: 'test'
        });
        
        await testDoc.save();
        console.log('✅ Test document created successfully!');
        console.log('📄 Document ID:', testDoc._id);
        
        // Verify it was saved
        const savedDoc = await TestModel.findById(testDoc._id);
        if (savedDoc) {
            console.log('✅ Document verified in database!');
            console.log('📊 Saved data:', savedDoc);
        }
        
        // Clean up test document
        await TestModel.deleteOne({ _id: testDoc._id });
        console.log('🧹 Test document cleaned up');
        
        // List all collections
        console.log('\n📋 Existing Collections:');
        const collections = await mongoose.connection.db.listCollections().toArray();
        collections.forEach(col => {
            console.log(`   • ${col.name}`);
        });
        
        console.log('\n🎉 MongoDB is working correctly!');
        console.log('💡 The issue might be in your server or API routes.');
        
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:');
        console.error('Error:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 MongoDB Connection Troubleshooting:');
            console.log('1. Make sure MongoDB is installed and running');
            console.log('2. Start MongoDB service:');
            console.log('   - Windows: net start MongoDB');
            console.log('   - Mac/Linux: sudo systemctl start mongod');
            console.log('3. Or start manually: mongod --dbpath /path/to/data');
        }
        
        if (error.message.includes('authentication')) {
            console.log('\n💡 Authentication Issues:');
            console.log('1. Check your MongoDB username/password');
            console.log('2. Verify database permissions');
        }
        
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Connection closed');
        process.exit(0);
    }
}

testMongoConnection();
