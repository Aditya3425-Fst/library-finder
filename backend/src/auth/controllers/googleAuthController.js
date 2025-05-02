const passport = require('passport');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email', 'openid'],
  accessType: 'offline',
  prompt: 'consent'
});

exports.googleAuthCallback = (req, res, next) => {
  console.log('Google callback received');
  console.log('Query params:', req.query);
  
  passport.authenticate('google', { session: false }, async (err, user, info) => {
    try {
      console.log('Passport authenticate callback');
      console.log('Error:', err);
      console.log('User:', user);
      console.log('Info:', info);

      if (err) {
        console.error('Google auth error:', err);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed&details=${encodeURIComponent(err.message)}`);
      }

      if (!user) {
        console.error('No user returned from Google');
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
      }

      console.log('Google profile:', user);
      
      // First try to find by googleId
      let existingUser = await User.findOne({ googleId: user.id });
      console.log('Found user by googleId:', existingUser);
      
      // If not found, try by email
      if (!existingUser) {
        existingUser = await User.findOne({ email: user.emails[0].value });
        console.log('Found user by email:', existingUser);
        
        // If found by email but no googleId, update with googleId
        if (existingUser && !existingUser.googleId) {
          existingUser.googleId = user.id;
          existingUser.profilePicture = user.photos[0].value;
          await existingUser.save();
          console.log('Updated existing user with Google info');
        }
      }
      
      // If still no user, create new one
      if (!existingUser) {
        try {
          existingUser = await User.create({
            username: user.displayName,
            email: user.emails[0].value,
            googleId: user.id,
            profilePicture: user.photos[0].value
          });
          console.log('Created new user:', existingUser);
        } catch (createError) {
          console.error('Error creating user:', createError);
          // If creation fails due to duplicate email, try to update existing user
          if (createError.code === 11000) {
            existingUser = await User.findOneAndUpdate(
              { email: user.emails[0].value },
              { 
                googleId: user.id,
                profilePicture: user.photos[0].value
              },
              { new: true }
            );
            console.log('Updated existing user after creation failed:', existingUser);
          } else {
            throw createError;
          }
        }
      }

      // Generate JWT token
      const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
      });
      console.log('Generated token');

      // Redirect to frontend /explore with token
      res.redirect(`${process.env.FRONTEND_URL}/explore?token=${token}`);
    } catch (error) {
      console.error('Error in Google callback:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed&details=${encodeURIComponent(error.message)}`);
    }
  })(req, res, next);
}; 