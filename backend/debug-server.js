const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('🔍 Server Debug Mode');
console.log('===================\n');

// Import models
const Vendor = require('./models/Vendor');
const Supplier = require('./models/Supplier');

const app = express();

// Enhanced CORS for debugging
app.use(cors({
    origin: function (origin, callback) {
        console.log('🌐 CORS Request from origin:', origin || 'no origin');
        callback(null, true); // Allow all origins for debugging
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`\n📥 ${req.method} ${req.path}`);
    console.log('📊 Headers:', req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('📦 Body:', req.body);
    }
    next();
});

// Test endpoint
app.get('/api/health', (req, res) => {
    console.log('✅ Health check requested');
    res.json({ 
        status: 'OK', 
        message: 'Debug server is running',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Debug signup endpoint
app.post('/api/auth/signup', async (req, res) => {
    console.log('\n🔍 SIGNUP REQUEST RECEIVED');
    console.log('================================');
    
    try {
        const { name, email, phone, password, role, ...otherData } = req.body;
        
        console.log('📊 Request Data:');
        console.log('   Name:', name);
        console.log('   Email:', email);
        console.log('   Phone:', phone);
        console.log('   Role:', role);
        console.log('   Other Data:', otherData);
        
        // Validate required fields
        if (!name || !email || !phone || !password || !role) {
            console.log('❌ Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                received: { name: !!name, email: !!email, phone: !!phone, password: !!password, role: !!role }
            });
        }
        
        // Determine model
        const UserModel = role === 'vendor' ? Vendor : Supplier;
        console.log('📋 Using model:', UserModel.modelName);
        
        // Check if user exists
        console.log('🔍 Checking if user exists...');
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            console.log('❌ User already exists');
            return res.status(409).json({
                success: false,
                message: `${role} with this email already exists`
            });
        }
        
        // Create user data
        const userData = {
            name,
            email,
            phone,
            password,
            ...otherData
        };
        
        console.log('📝 Creating user with data:', userData);
        
        // Create new user
        const user = new UserModel(userData);
        console.log('👤 User object created:', user.toJSON());
        
        // Save to database
        console.log('💾 Saving to database...');
        const savedUser = await user.save();
        console.log('✅ User saved successfully!');
        console.log('📄 Saved user ID:', savedUser._id);
        console.log('📊 Saved user data:', savedUser.toJSON());
        
        // Verify it was saved
        console.log('🔍 Verifying user was saved...');
        const verifyUser = await UserModel.findById(savedUser._id);
        if (verifyUser) {
            console.log('✅ User verified in database!');
        } else {
            console.log('❌ User not found after save!');
        }
        
        // Generate token (simplified for debug)
        const token = 'debug_token_' + Date.now();
        
        console.log('🎉 Signup successful!');
        res.status(201).json({
            success: true,
            message: `${role} registered successfully`,
            data: {
                user: savedUser.toJSON(),
                token
            }
        });
        
    } catch (error) {
        console.error('❌ Signup error:', error);
        console.error('Error details:', error.message);
        console.error('Stack trace:', error.stack);
        
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// List users endpoint for debugging
app.get('/api/auth/users', async (req, res) => {
    console.log('\n🔍 USERS LIST REQUEST');
    console.log('=====================');
    
    try {
        const vendors = await Vendor.find({}).select('-password');
        const suppliers = await Supplier.find({}).select('-password');
        
        console.log('📊 Found vendors:', vendors.length);
        console.log('📊 Found suppliers:', suppliers.length);
        
        vendors.forEach((vendor, index) => {
            console.log(`   Vendor ${index + 1}:`, vendor.toJSON());
        });
        
        suppliers.forEach((supplier, index) => {
            console.log(`   Supplier ${index + 1}:`, supplier.toJSON());
        });
        
        const allUsers = [
            ...vendors.map(v => ({ ...v.toJSON(), role: 'vendor' })),
            ...suppliers.map(s => ({ ...s.toJSON(), role: 'supplier' }))
        ];
        
        res.json({
            success: true,
            data: {
                users: allUsers,
                counts: {
                    vendors: vendors.length,
                    suppliers: suppliers.length,
                    total: allUsers.length
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Users list error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
});

// Database connection
async function connectDB() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bridge';
        console.log('🔄 Connecting to MongoDB...');
        console.log('📍 URI:', mongoURI);
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ MongoDB Connected!');
        console.log('📊 Database:', mongoose.connection.db.databaseName);
        
        // List existing collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📋 Existing collections:');
        collections.forEach(col => console.log(`   • ${col.name}`));
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
}

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log('\n' + '='.repeat(50));
        console.log('🚀 DEBUG SERVER STARTED');
        console.log('='.repeat(50));
        console.log(`📍 URL: http://localhost:${PORT}`);
        console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
        console.log(`📝 Signup: POST http://localhost:${PORT}/api/auth/signup`);
        console.log(`👥 Users: GET http://localhost:${PORT}/api/auth/users`);
        console.log('🔍 All requests will be logged in detail');
        console.log('='.repeat(50) + '\n');
    });
});
