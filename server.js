require('dotenv').config();
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const https = require('https');
const express = require('express');

const PORT = process.env.PORT || 3000;

const app = express().use(helmet());

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

app.get('/auth/google', (req, res) => {});

app.get('/auth/google/callback', (req, res) => {});

app.get('/auth/logout', (req, res) => {});

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
