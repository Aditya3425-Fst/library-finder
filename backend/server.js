// Load environment variables first
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const cron = require('node-cron');
const authRoutes = require('./src/auth/routes/authRoutes');
const { updateAllLibraryScores } = require('./src/jobs/updateScoresJob');

// Initialize passport
require('./src/auth/config/passport');

// Create Express app
const app = express();

// CORS configuration - Allow all origins for development purposes
app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true
}));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/test', (req, res) => {
    console.log('Test route hit');
    res.json({ message: 'Server is working' });
});

// Routes
app.use('/api/libraries', require('./src/routes/libraryRoutes'));
app.use('/api/search', require('./src/routes/searchRoutes'));
app.use('/api/recommend', require('./src/routes/recommendRoutes'));
app.use('/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Something went wrong!' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/library_finder')
    .then(() => {
        console.log('Connected to MongoDB');
        
        // --- Schedule Jobs After DB Connection --- 
        // Schedule updateAllLibraryScores to run daily at 3:00 AM
        // Syntax: second minute hour day(month) month day(week)
        // See https://crontab.guru/ for help
        cron.schedule('0 3 * * *', () => {
            console.log('Running scheduled task: updateAllLibraryScores');
            updateAllLibraryScores(); 
        }, {
            scheduled: true,
            timezone: "Etc/UTC" // Specify timezone (e.g., "America/New_York", "Etc/UTC")
        });
        console.log('Scheduled updateAllLibraryScores job for 3:00 AM UTC daily.');
        // --- End Schedule Jobs --- 

    })
    .catch((err) => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});