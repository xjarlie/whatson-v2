const express = require('express');
const router = express.Router();
const db = require('../conn');
const crypto = require('crypto');

const cookieOptions = { secure: true, httpOnly: true, maxAge: 5184000000 };

router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    const hashed = hashData(password);

    const usernameCheck = await db.get('auth/users/' + username);
    const emailCheck = await db.get('auth/emails/' + hashData(email, ' '));
    
    if (usernameCheck) {
        res.status(422).json({ error: 'Username already in use' });
        return false;
    }

    if (emailCheck) {
        res.status(422).json({ error: 'Email already in use' });
        return false;
    }

    const token = generateAuthToken();

    const data = { username, email, password: hashed.hash, salt: hashed.salt, token };

    await db.set('auth/users/' + username, data);
    await db.set('auth/emails/' + hashData(email, ' ').hash, true);

    const safeData = { username, email };
    res.status(201).cookie('AUTH_TOKEN', token.token, cookieOptions).cookie('USERNAME', username, cookieOptions).json({ result: safeData });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const userData = await db.get('auth/users/' + username);
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

router.get('/test', async (req, res) => {
    const pwd = 'wasd';
    const hash = hashData('wasd', 'salt').hash;
    const userhash = hashData('xjarlie', 'salt').hash;
    res.send(`${hash}, ${userhash}`);
});

function hashData(string, salt) {
    let salto = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(string, salto, 1000, 64, 'sha512').toString('hex');
    return { hash, salt: salto };
}

function generateAuthToken(lasts=2592000000 /* 30 days */) {
    const tokenData = crypto.randomBytes(64).toString('hex');
    const expires = Date.now() + lasts;
    return { token: tokenData, expires };
}

module.exports = router;