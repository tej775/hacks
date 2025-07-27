const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function migrateDatabase() {
    try {
        console.log('🔄 Starting database migration from "vendorbridge" to "bridge"...');
        
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ Connected to MongoDB');
        
        // Get references to both databases
        const sourceDb = mongoose.connection.db.db('vendorbridge');
        const targetDb = mongoose.connection.db.db('bridge');
        
        // Get all collections from source database
        const collections = await sourceDb.listCollections().toArray();
        console.log(`📊 Found ${collections.length} collections to migrate`);
        
        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            console.log(`🔄 Migrating collection: ${collectionName}`);
            
            // Get all documents from source collection
            const sourceCollection = sourceDb.collection(collectionName);
            const documents = await sourceCollection.find({}).toArray();
            
            if (documents.length > 0) {
                // Insert documents into target collection
                const targetCollection = targetDb.collection(collectionName);
                await targetCollection.insertMany(documents);
                console.log(`✅ Migrated ${documents.length} documents from ${collectionName}`);
            } else {
                console.log(`ℹ️  No documents found in ${collectionName}`);
            }
        }
        
        console.log('🎉 Migration completed successfully!');
        console.log('💡 You can now:');
        console.log('   1. Update your .env file to use MONGODB_URI=mongodb://localhost:27017/bridge');
        console.log('   2. Delete the old "vendorbridge" database from MongoDB Compass');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

// Run migration
migrateDatabase();
