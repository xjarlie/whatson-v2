const express = require('express');
const router = express.Router();
const db = require('../conn');
const crypto = require('crypto');

router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    console.log(username, email, password);

    const hash = hashData(password);
    const data = { username, email, password: hash };
    const usernameCheck = await db.get('auth/users/' + username);
    const emailCheck = await db.get('auth/emails/' + hashData(email, ' '));
    
    if (usernameCheck) {
        res.status(422).json({ error: 'Error: Username already in use' });
        return false;
    }

    if (emailCheck) {
        res.status(422).json({ error: 'Error: Email already in use' });
        return false;
    }

    await db.set('auth/users/' + username, data);
    await db.set('auth/emails/' + hashData(email, ' '), true);

    // TODO: Auth tokens idk how

    res.status(201).json({ result: data });
});

router.get('/login', (req, res) => {

});

function hashData(string, salt) {
    let salto = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(string, salto, 1000, 64, 'sha512').toString('hex');
    return hash;
}

module.exports = router;