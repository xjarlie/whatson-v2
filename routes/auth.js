const express = require('express');
const router = express.Router();
const db = require('../conn');
const crypto = require('crypto');

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
    await db.set('auth/emails/' + hashData(email, ' '), true);

    const safeData = { username, email };
    res.status(201).cookie('AUTH_TOKEN', token.token).cookie('USERNAME', username).json({ result: safeData });
});

router.get('/login', async (req, res) => {
    const { username, password } = req.body;

    const userData = await db.get('auth/users/' + username);
    if (!userData) {
        res.status(404).json({ error: 'Username incorrect or account does not exist' });
        return false;
    }
});

function hashData(string, salt) {
    let salto = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(string, salto, 1000, 64, 'sha512').toString('hex');
    return { hash, salt: salto };
}

function generateAuthToken(lasts=5184000000 /* 60 days */) {
    const tokenData = crypto.randomBytes(64).toString('hex');
    const expires = Date.now() + lasts;
    return { token: tokenData, expires };
}

module.exports = router;