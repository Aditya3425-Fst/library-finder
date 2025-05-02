const express = require('express');
const router = express.Router();
const { signup, signin } = require('../controllers/authController');
const { googleAuth, googleAuthCallback } = require('../controllers/googleAuthController');

// Regular auth routes
router.post('/signup', signup);
router.post('/signin', signin);

// Google OAuth routes
router.get('/google', (req, res, next) => {
    console.log('Google auth route hit');
    googleAuth(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
    console.log('Google callback route hit');
    googleAuthCallback(req, res, next);
});

module.exports = router;