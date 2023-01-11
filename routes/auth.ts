import express from 'express';
const router = express.Router();
import db from '../conn';
import crypto from 'crypto';
import _ from 'lodash';
import { Token, User } from './schema';

const cookieOptions = { secure: true, httpOnly: true, maxAge: 5184000000 };

router.post('/signup', async (req, res) => {
    const { username, email, password, displayName } = req.body;

    const hashed = hashData(password);

    const usernameCheck: User = await db.get('auth/users/' + username);

    // Email check
    const users: User[] = await db.orderedList('auth/users', 'username', 'asc');
    const emailExists = _.filter(users, (o) => {
        return o.email === email;
    });

    if (usernameCheck) {
        res.status(422).json({ error: 'Username already in use' });
        return false;
    }

    if (emailExists.length > 0) {
        res.status(422).json({ error: 'Email already in use' });
        return false;
    }

    const token = generateAuthToken();

    const data: User = { username, displayName, email, password: hashed.hash, salt: hashed.salt, token };

    await db.set('auth/users/' + username, data);
    await db.set('auth/emails/' + hashData(email, ' ').hash, true);

    const safeData = { username, email };
    res.status(201).cookie('AUTH_TOKEN', token.token, cookieOptions).cookie('USERNAME', username, cookieOptions).json({ result: safeData });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const userData: User = await db.get('auth/users/' + username);
    if (!userData) {
        res.status(404).json({ error: 'Account with that username does not exist' });
        return false;
    }

    // Check password
    const givenData = hashData(password, userData.salt);
    if (givenData.hash == userData.password) {
        console.log(givenData.hash, userData.password);
        const token = generateAuthToken();
        await db.set('auth/users/' + username + '/token', token);
        res.status(200).cookie('AUTH_TOKEN', token.token, cookieOptions).cookie('USERNAME', username, cookieOptions).json({ result: 'Logged in' });
    } else {
        res.status(401).json({ error: 'Username or password incorrect' });
    }
});

router.post('/')

function hashData(string: string, salt?: string): { hash: string, salt: string } {
    let salto = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(string, salto, 1000, 64, 'sha512').toString('hex');
    return { hash, salt: salto };
}

function generateAuthToken(lasts = 2592000000 /* 30 days */): Token {
    const tokenData = crypto.randomBytes(64).toString('hex');
    const expires = Date.now() + lasts;
    return { token: tokenData, expires };
}

export default router;