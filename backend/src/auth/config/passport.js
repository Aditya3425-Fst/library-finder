const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Verify environment variables are set
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('Missing Google OAuth credentials. Please check your .env file.');
    process.exit(1);
}

console.log('Initializing Google Strategy with:');
console.log('Client ID:', process.env.GOOGLE_CLIENT_ID);
console.log('Callback URL:', `${process.env.BACKEND_URL}/auth/google/callback`);

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`
},
async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('Google Strategy callback');
        console.log('Profile:', JSON.stringify(profile, null, 2));
        
        if (!profile || !profile.id) {
            console.error('Invalid profile received from Google');
            return done(new Error('Invalid profile received from Google'));
        }

        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@google.com`;
        const username = profile.displayName || `user_${profile.id}`;
        const profilePicture = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

        // Check if user exists by googleId
        let user = await User.findOne({ googleId: profile.id });
        console.log('Found user by googleId:', user);
        
        if (!user) {
            // If not found by googleId, try email
            user = await User.findOne({ email: email });
            console.log('Found user by email:', user);
            
            if (user) {
                // Update existing user with Google info
                user.googleId = profile.id;
                if (profilePicture) user.profilePicture = profilePicture;
                await user.save();
                console.log('Updated existing user with Google info');
            } else {
                // Create new user
                user = await User.create({
                    username: username,
                    email: email,
                    googleId: profile.id,
                    profilePicture: profilePicture
                });
                console.log('Created new user:', user);
            }
        }
        
        return done(null, user);
    } catch (error) {
        console.error('Error in Google Strategy:', error);
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    console.log('Serializing user:', user.id);
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        console.log('Deserializing user:', id);
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        console.error('Error deserializing user:', error);
        done(error, null);
    }
});

module.exports = passport; 