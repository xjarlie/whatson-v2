const express = require('express');
const router = express.Router();
const db = require('../conn');
const crypto = require('crypto');
const { checkToken } = require("./checkToken");

router.post('/create', async (req, res) => {
    let data = req.body;
    const username = req.cookies.USERNAME;
    const authToken = req.cookies.AUTH_TOKEN;

    if (!await checkToken(authToken, username)) {
        res.status(401).json({ error: 'Authentication invalid, please log in again'});
        return false;
    }

    data.author = username;
    data.timestamp = Date.now();

    let key;
    let exists = true;
    while (exists) {
        key = crypto.randomBytes(8).toString('hex');
        const check = await db.get('posts/' + key);
        if (!check) break; 
    }

    data.id = key;
    
    await db.set(`auth/users/${username}/posts/${key}`, key);
    const result = await db.set('posts/' + key, data);
    res.status(201).json({ message: 'Post posted', result: result });
});

module.exports = router;