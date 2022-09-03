require('dotenv').config();
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const https = require('https');
const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const PORT = process.env.PORT || 3000;

const google_auth_config = {
   callbackURL: '/auth/google/callback',
   clientID: process.env.GOOGLE_CLIENT_ID,
   clientSecret: process.env.GOOGLE_CLIENT_SECRET
}

function verifyAuthCallback(accessToken, refreshToken, profile, done) {
   console.log('Google profile', profile);
   //User.findOrCreate({ googleID: profile.id }, (err, user) => { return done(err, user) })
   done(null, profile);
}

passport.use(new GoogleStrategy(google_auth_config, verifyAuthCallback));

const app = express().use(helmet());

app.use(passport.initialize());

//authentication middleware
function checkLoggedIn(req, res, next) {
   const isLoggedIn = true; //TODO
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
      session: false,
   }),
   (req, res) => {
      console.log('Google called us back!');
   }
);

app.get('/failure', (req, res) => { res.send('Failed to log in.')});

app.get('/auth/logout', (req, res) => {
   //req.logout(); //Remove req.user and clear any logged in session
   //res.redirect('/');
});

app.get('/secret', checkLoggedIn, hasAccess, (req, res) => {
   return res.send('Your personal secret value is 42');
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
