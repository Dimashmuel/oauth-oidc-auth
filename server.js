require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

// הגדרת EJS למנוע תבניות
app.set('view engine', 'ejs');

// הגדרת session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// הגדרת Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// דף הבית עם אפשרות להתחבר או להירשם
app.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

// התחברות דרך Google
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback אחרי התחברות
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/dashboard');
    });

// דף ההצלחה אחרי התחברות
app.get('/dashboard', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('dashboard', { user: req.user });
});

// התנתקות
app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

// הפעלת השרת
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
