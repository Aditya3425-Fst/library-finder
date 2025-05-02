require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Verify environment variables are loaded
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('Missing required environment variables for Google OAuth');
    console.error('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
    console.error('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);
    throw new Error('Missing required environment variables for Google OAuth');
}

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID.trim(),
    clientSecret: process.env.GOOGLE_CLIENT_SECRET.trim(),
    callbackURL: "http://localhost:3001/auth/google/callback",
    scope: ['profile', 'email', 'openid'],
    accessType: 'offline',
    prompt: 'consent'
},
    function (accessToken, refreshToken, profile, done) {
        console.log('Google profile:', profile);
        return done(null, profile);
    }
));

module.exports = passport; 