const express = require('express');
const router = express.Router();

const db = require('../conn');
const webPush = require('web-push');
const { publicKey, privateKey } = require('../vapid-keys.json');
const { checkToken } = require('./checkToken');
const sendNotification = require('./sendNotification');
webPush.setVapidDetails(
    'mailto:me@xjarlie.com',
    publicKey,
    privateKey
);

router.get('/vapidPublicKey', (req, res) => {
    res.send(publicKey);
});

router.post('/register', async (req, res) => {

    const { subscription } = req.body;

    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        const username = req.cookies.USERNAME;

        const result = await db.set(`auth/users/${username}/push/subscription`, subscription);

        console.log(req.body.subscription);

        res.status(201).json({ result, message: 'User subscribed' });
        
    } else {
        res.status(401).json({ error: 'Credentials invalid' });
    }
});

router.get('/sendNotification', async (req, res) => {

    const subscription = await db.get(`auth/users/xjarlie/push/subscription`);

    const notif = await sendNotification('xjarlie', 'New Recommendation', 'Your friend, loui54, recommended Its a Sin', '/app/posts/8c145d5c9aec4d60');

    res.send('hello world');
});

module.exports = router;