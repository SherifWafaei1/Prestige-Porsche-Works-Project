const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('MONGODB_URI from .env:', process.env.MONGODB_URI); // TEMP DIAGNOSTIC LINE

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the main HTML file for the root route first
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../FrontEnd', 'FrontEnd.html'));
});

// Serve static files from the FrontEnd directory
app.use(express.static(path.join(__dirname, '../FrontEnd')));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    family: 4 // Use IPv4, skip trying IPv6
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const porscheModelRoutes = require('./routes/porscheModels');
const customizationRoutes = require('./routes/customizations');
const orderRoutes = require('./routes/orders');
const appointmentRoutes = require('./routes/appointments');
const discountRoutes = require('./routes/discounts');
const contactMessageRoutes = require('./routes/contactMessages');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/models', porscheModelRoutes);
app.use('/api/customizations', customizationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/contact', contactMessageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
}); 