// Debug Setup Script - Run this to check your database connection and create test users
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Database connection string - UPDATE THIS IF NEEDED
const MONGODB_URI = 'mongodb://localhost:27017/vendorbridge';

// User Schema (same as your User model)
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email address'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [
            /^[\+]?[1-9][\d]{0,15}$/,
            'Please enter a valid phone number'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: {
            values: ['vendor', 'supplier'],
            message: 'Role must be either vendor or supplier'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model('User', userSchema);

async function debugDatabase() {
    try {
        console.log('🔍 Starting database debug...');
        console.log('📡 Connecting to MongoDB...');
        
        // Connect to database
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ Connected to MongoDB successfully!');
        
        // Check if users collection exists and count documents
        const userCount = await User.countDocuments();
        console.log(`📊 Current users in database: ${userCount}`);
        
        if (userCount === 0) {
            console.log('⚠️  No users found. Creating test users...');
            await createTestUsers();
        } else {
            console.log('👥 Existing users:');
            const users = await User.find({}).select('-password');
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
            });
        }
        
        // Test the API endpoint
        console.log('\n🧪 Testing API endpoint...');
        await testApiEndpoint();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 SOLUTION: MongoDB is not running. Please:');
            console.log('   1. Install MongoDB if not installed');
            console.log('   2. Start MongoDB service');
            console.log('   3. Or use MongoDB Atlas (cloud database)');
        }
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from database');
    }
}

async function createTestUsers() {
    const testUsers = [
        {
            name: 'John Vendor',
            email: 'john@vendor.com',
            phone: '+1234567890',
            password: 'password123',
            role: 'vendor'
        },
        {
            name: 'Sarah Supplier',
            email: 'sarah@supplier.com',
            phone: '+1987654321',
            password: 'password123',
            role: 'supplier'
        },
        {
            name: 'Mike Merchant',
            email: 'mike@merchant.com',
            phone: '+1122334455',
            password: 'password123',
            role: 'vendor'
        }
    ];
    
    try {
        for (const userData of testUsers) {
            const user = new User(userData);
            await user.save();
            console.log(`✅ Created test user: ${userData.name}`);
        }
        console.log('🎉 Test users created successfully!');
    } catch (error) {
        console.error('❌ Error creating test users:', error.message);
    }
}

async function testApiEndpoint() {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        console.log(`✅ API endpoint test: Found ${users.length} users`);
        
        if (users.length > 0) {
            console.log('📋 Sample user data:');
            console.log(JSON.stringify(users[0], null, 2));
        }
    } catch (error) {
        console.error('❌ API endpoint test failed:', error.message);
    }
}

// Run the debug script
debugDatabase();
