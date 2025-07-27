const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('🔍 Testing MongoDB Connection...');
console.log('📍 MongoDB URI:', process.env.MONGODB_URI);

// Test connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Successfully connected to MongoDB!');
    console.log('📊 Database name:', mongoose.connection.db.databaseName);
    
    // Create a test collection to make the database appear in Compass
    const testCollection = mongoose.connection.db.collection('test');
    return testCollection.insertOne({ 
        message: 'Test connection successful', 
        timestamp: new Date() 
    });
})
.then(() => {
    console.log('✅ Test document inserted! Database should now appear in MongoDB Compass');
    console.log('🎯 Look for database: "bridge" in MongoDB Compass');
    process.exit(0);
})
.catch((error) => {
    console.error('❌ MongoDB connection failed:');
    console.error('Error details:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
        console.log('\n💡 Troubleshooting tips:');
        console.log('1. Make sure MongoDB is running on your system');
        console.log('2. Check if MongoDB service is started');
        console.log('3. Verify MongoDB is listening on port 27017');
    }
    
    process.exit(1);
});
