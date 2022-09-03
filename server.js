require('dotenv').config();
const path = require('path');
const fs = require('fs');
const https = require('https');
const express = require('express');
const helmet = require('helmet');
const passport = require('passport');
const cookieSession = require('cookie-session');
const GoogleAuthStrategy = require('passport-google-oauth20').Strategy;

const PORT = process.env.PORT || 3000;
const COOKIE_KEY_1 = process.env.COOKIE_KEY_1;
const COOKIE_KEY_2 = process.env.COOKIE_KEY_2;

const googleAuthConfig = {
   callbackURL: '/auth/google/callback',
   clientID: process.env.GOOGLE_CLIENT_ID,
   clientSecret: process.env.GOOGLE_CLIENT_SECRET
}

function verifyGoogleAuthCallback(accessToken, refreshToken, profile, done) {
   //console.log('Google profile', profile);
   //TODO: Create or load the user
   done(null, profile);
}

passport.use(new GoogleAuthStrategy(googleAuthConfig, verifyGoogleAuthCallback));

// Save session properties to the cookie
passport.serializeUser((authObj, done) => {
   const userObj = { provider: authObj.provider, id: authObj.id };
   done(null, userObj);
});

//load session properties from the cookie
passport.deserializeUser((authObj, done) => {
   //TODO: user.findById(id).then(user => { done(null, user)}); //Load user object from DB into session cookie.
   const userObj = { provider: authObj.provider, id: authObj.id };
   done(null, userObj);
})

const app = express().use(helmet());

app.use(cookieSession({
   name: 'session',
   maxAge: 24 * 60 * 60 * 1000, //24hr in milliseconds
   keys: [COOKIE_KEY_1, COOKIE_KEY_2]
}));

app.use(passport.initialize());
app.use(passport.session());

//authentication middleware
function isAuthenticated(req, res, next) {
   const isLoggedIn = req.isAuthenticated() && req.user;
   if(!isLoggedIn) {
      return res.status(401).json({ error: 'You must log in!'});
   }
   next();
}

//authorization middleware
function hasAccess(req, res, next) {
   next();
}

app.get('/auth/google',
   passport.authenticate('google', {
      scope: ['email'],
   })
);

app.get('/auth/google/callback',
   passport.authenticate('google', {
      failureRedirect: '/failure',
      successRedirect: '/',
      session: true, //default
   })
);

app.get('/failure', (req, res) => { res.send('Failed to log in.')});

app.get('/auth/logout', (req, res) => {
   req.logout(); //Remove req.user and clear any logged in session
   res.redirect('/');
});

app.get('/secret', isAuthenticated, hasAccess, (req, res) => {
   return res.send(`YOUR ${req.user.provider.toUpperCase()} ID: ${req.user.id}`);
});

app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

//self-signed cert: openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 1000
https
   .createServer({
      key: fs.readFileSync('key.pem'), cert: fs.readFileSync('cert.pem')
   }, app)
   .listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
   })
