## security-sandbox

Implementation of the following security and authentication packages:
- https
- helmet
- passport
- cookie-session
- Google OAuth2.0

#### You will also need to generate cert.pem and key.pem files (use openssl)  
> `openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 1000`

#### You will also need to create a .env file in the root folder and set these properties
> PORT={desired port to serve https}  
> GOOGLE_CLIENT_ID={Your Google OAuth 2.0 Client ID and Secret}  
> GOOGLE_CLIENT_SECRET={Your Google OAuth 2.0 Client Secret}  
> COOKIE_KEY_1={random 256-bit key for signing session cookies}  
> COOKIE_KEY_2={second random 256-bit key for signing session cookies}

Do not include these files in your repository.
