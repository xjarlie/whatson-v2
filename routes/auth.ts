// Import server module
import express, { CookieOptions } from 'express';
const router = express.Router();

// Import database connector
import db from '../conn';

// Import external cryptography library
import crypto from 'crypto';

// Import external object management library
import _ from 'lodash';

// Import type definitions
import { Token, User } from './schema';

// Define cookie options (timeout, etc) for all routes
const cookieOptions: CookieOptions = { secure: true, httpOnly: true, maxAge: 5184000000 };

// Server-side sign up route
router.post('/signup', async (req, res) => {

    // Get parameters from request
    const { username, email, password, displayName } = req.body;
    
    // Call function to cryptographically hash password
    const hashed = hashData(password);

    // Check that username has not already been used
    const usernameCheck: User = await db.get('auth/users/' + username);
    if (usernameCheck) {
        res.status(422).json({ error: 'Username already in use' });
        return false;
    }

    // Check that email address has not already been used
    const users: User[] = await db.orderedList('auth/users', 'username', 'asc');
    const emailExists: User[] = _.filter(users, (o) => {
        return o.email === email;
    });
    if (emailExists.length > 0) {
        res.status(422).json({ error: 'Email already in use' });
        return false;
    }

    // Call function to generate a random authentication token
    const token = generateAuthToken();

    const data: User = { username, displayName, email, password: hashed.hash, salt: hashed.salt, token };

    // Store the created user info in the database
    await db.set('auth/users/' + username, data);
    await db.set('auth/emails/' + hashData(email, ' ').hash, true);

    // Return the sanitised user data, along with cookies to be stored by the browser for authentication
    const safeData = { username, email };
    res.status(201).cookie('AUTH_TOKEN', token.token, cookieOptions).cookie('USERNAME', username, cookieOptions).json({ result: safeData });
});

// Server-side login route
router.post('/login', async (req, res) => {

    // Get parameters from request
    const { username, password } = req.body;

    // Check that the account actually exists, if not return an error
    const userData: User = await db.get('auth/users/' + username);
    if (!userData) {
        res.status(404).json({ error: 'Account with that username does not exist' });
        return false;
    }

    // Hash received password using the user's salt
    const givenData = hashData(password, userData.salt);

    // Compare received hash to stored hash
    if (givenData.hash == userData.password) {

        // Generate a new random authentication token
        const token = generateAuthToken();

        // Store new token in the database for verification
        await db.set('auth/users/' + username + '/token', token);

        // Return success message along with the token and username for authentication
        res.status(200).cookie('AUTH_TOKEN', token.token, cookieOptions).cookie('USERNAME', username, cookieOptions).json({ result: 'Logged in' });
    } else {
        res.status(401).json({ error: 'Username or password incorrect' });
    }
});

// Takes data to be hashed and an optional salt
// Returns an object with two properties: the final hash and the salt used
function hashData(string: string, salt?: string): { hash: string, salt: string } {
    // If no salt was provided, generate a new one using cryptography library
    let salto = salt || crypto.randomBytes(16).toString('hex');

    // Hash data using password-based key derivation and the SHA-512 algorithm
    const hash = crypto.pbkdf2Sync(string, salto, 1000, 64, 'sha512').toString('hex');

    return { hash, salt: salto };
}

// Takes an optional expiry length in milliseconds - default 30 days
// Returns an authentication token and the timestamp it expires
function generateAuthToken(lasts = 2592000000 /* 30 days */): Token {
    // Randomly generate a 16-byte token
    const tokenData = crypto.randomBytes(64).toString('hex');

    // Calculate expiry time
    const expires = Date.now() + lasts;

    return { token: tokenData, expires };
}

export default router;