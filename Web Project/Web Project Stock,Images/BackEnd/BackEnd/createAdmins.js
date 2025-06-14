const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const adminUsers = [
    {
        firstName: 'Mahmoud',
        lastName: 'Admin',
        email: 'Mahmoud',
        password: 'Mahmoud123',
        phoneNumber: '1234567890',
        address: 'Admin Address',
        role: 'admin'
    },
    {
        firstName: 'Omar',
        lastName: 'Admin',
        email: 'Omar',
        password: 'Omar123',
        phoneNumber: '1234567890',
        address: 'Admin Address',
        role: 'admin'
    },
    {
        firstName: 'Karim',
        lastName: 'Admin',
        email: 'Karim',
        password: 'Karim123',
        phoneNumber: '1234567890',
        address: 'Admin Address',
        role: 'admin'
    },
    {
        firstName: 'Sheriff',
        lastName: 'Admin',
        email: 'Sheriff',
        password: 'Sheriff123',
        phoneNumber: '1234567890',
        address: 'Admin Address',
        role: 'admin'
    },
    {
        firstName: 'Seif',
        lastName: 'Admin',
        email: 'Seif',
        password: 'Seif123',
        phoneNumber: '1234567890',
        address: 'Admin Address',
        role: 'admin'
    }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    family: 4
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));

// Function to create admin users
async function createAdminUsers() {
    try {
        // Clear existing admin users
        await User.deleteMany({ role: 'admin' });
        console.log('Cleared existing admin users');

        // Create new admin users
        for (const admin of adminUsers) {
            const user = new User(admin);
            await user.save();
            console.log(`Created admin user: ${admin.firstName}`);
        }

        console.log('All admin users created successfully');
    } catch (error) {
        console.error('Error creating admin users:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Run the function
createAdminUsers(); 