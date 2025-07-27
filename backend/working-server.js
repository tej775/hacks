const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// Simple environment setup
const MONGODB_URI = 'mongodb://localhost:27017/bridge';
const PORT = 5000;

console.log('🚀 Starting VendorBridge Server...\n');

const app = express();

// CORS - Allow all origins for debugging
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple Vendor Schema
const vendorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    businessName: String,
    businessType: String,
    createdAt: { type: Date, default: Date.now }
});

// Simple Supplier Schema
const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    companyName: String,
    industryType: String,
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
vendorSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

supplierSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Create models
const Vendor = mongoose.model('Vendor', vendorSchema);
const Supplier = mongoose.model('Supplier', supplierSchema);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
    console.log('\n📝 Signup request received:', req.body);
    
    try {
        const { name, email, phone, password, role, businessName, businessType, companyName, industryType } = req.body;
        
        // Validate required fields
        if (!name || !email || !phone || !password || !role) {
            console.log('❌ Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        // Choose model based on role
        let UserModel, userData;
        
        if (role === 'vendor') {
            UserModel = Vendor;
            userData = { name, email, phone, password, businessName, businessType };
        } else if (role === 'supplier') {
            UserModel = Supplier;
            userData = { name, email, phone, password, companyName, industryType };
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be vendor or supplier'
            });
        }
        
        console.log('📊 Using model:', UserModel.modelName);
        console.log('📦 User data:', userData);
        
        // Check if user exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            console.log('❌ User already exists');
            return res.status(409).json({
                success: false,
                message: `${role} with this email already exists`
            });
        }
        
        // Create and save user
        console.log('💾 Creating new user...');
        const user = new UserModel(userData);
        const savedUser = await user.save();
        
        console.log('✅ User saved successfully!');
        console.log('📄 User ID:', savedUser._id);
        
        // Remove password from response
        const userResponse = savedUser.toObject();
        delete userResponse.password;
        
        res.status(201).json({
            success: true,
            message: `${role} registered successfully`,
            data: {
                user: { ...userResponse, role },
                token: 'demo_token_' + Date.now()
            }
        });
        
    } catch (error) {
        console.error('❌ Signup error:', error);
        
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Signin endpoint
app.post('/api/auth/signin', async (req, res) => {
    console.log('\n🔐 Signin request received:', req.body);
    
    try {
        const { email, password } = req.body;
        
        // Validate required fields
        if (!email || !password) {
            console.log('❌ Missing email or password');
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        
        console.log('📧 Looking for user with email:', email);
        
        // Try to find user in both collections
        let user = await Vendor.findOne({ email });
        let userType = 'vendor';
        
        if (!user) {
            user = await Supplier.findOne({ email });
            userType = 'supplier';
        }
        
        if (!user) {
            console.log('❌ User not found');
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        console.log('✅ User found:', user.email, 'Type:', userType);
        
        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('❌ Invalid password');
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        console.log('✅ Password valid, signin successful!');
        
        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;
        
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: { ...userResponse, role: userType },
                token: 'demo_token_' + Date.now()
            }
        });
        
    } catch (error) {
        console.error('❌ Signin error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get all users
app.get('/api/auth/users', async (req, res) => {
    try {
        const vendors = await Vendor.find({}).select('-password');
        const suppliers = await Supplier.find({}).select('-password');
        
        const allUsers = [
            ...vendors.map(v => ({ ...v.toObject(), role: 'vendor' })),
            ...suppliers.map(s => ({ ...s.toObject(), role: 'supplier' }))
        ];
        
        console.log(`📊 Found ${vendors.length} vendors, ${suppliers.length} suppliers`);
        
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
        console.error('❌ Users fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
});

// Connect to MongoDB and start server
async function startServer() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        console.log('📍 URI:', MONGODB_URI);
        
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ MongoDB Connected Successfully!');
        console.log('📊 Database:', mongoose.connection.db.databaseName);
        
        // Start server
        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(50));
            console.log('🎉 VendorBridge Server Started!');
            console.log('='.repeat(50));
            console.log(`📍 Server: http://localhost:${PORT}`);
            console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
            console.log(`📝 Signup: POST http://localhost:${PORT}/api/auth/signup`);
            console.log(`👥 Users: GET http://localhost:${PORT}/api/auth/users`);
            console.log('🌐 CORS: Enabled for all origins');
            console.log('='.repeat(50));
            console.log('\n✅ Ready to accept signup requests!');
            console.log('💡 Data will be saved to "bridge" database in MongoDB Compass\n');
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 MongoDB Connection Failed:');
            console.log('1. Make sure MongoDB is running');
            console.log('2. Start MongoDB service:');
            console.log('   Windows: net start MongoDB');
            console.log('   Mac: brew services start mongodb-community');
            console.log('   Linux: sudo systemctl start mongod');
            console.log('3. Or start manually: mongod');
        }
        
        process.exit(1);
    }
}

startServer();
