// Load environment variables from .env file
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

// Set up EJS as the template engine
app.set('view engine', 'ejs');

// Session management to store user authentication state
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Initialize Passport.js for authentication
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport.js with Google OAuth 2.0 strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

// Serialize user information into the session
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user information from the session
passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// Home page route, showing login option if user is not authenticated
app.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

// Google authentication route
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback route after Google authentication
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/dashboard');
    });

// Protected dashboard route, accessible only to authenticated users
app.get('/dashboard', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('dashboard', { user: req.user });
});

// Logout route to destroy session and redirect to home page
app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
