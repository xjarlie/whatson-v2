import express from 'express';
const router = express.Router();

import db from '../conn';
import webPush from 'web-push';
import { publicKey, privateKey } from '../vapid-keys.json';
import { checkToken } from './checkToken';
import sendNotification from './sendNotification';

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

        const username: string = req.cookies.USERNAME;

        const result = await db.set(`auth/users/${username}/push/subscription`, subscription);

        console.log(req.body.subscription);

        res.status(201).json({ result, message: 'User subscribed' });
        
    } else {
        res.status(401).json({ error: 'Credentials invalid' });
    }
});

router.get('/sendNotification', async (req, res) => {

    const subscription = await db.get(`auth/users/xjarlie/push/subscription`);

    const notif = await sendNotification('xjarlie', 'New Recommendation', 'Your friend, loui54, recommended Its a Sin', '/app/posts/8c145d5c9aec4d6069');

    res.send('hello world');
});

router.post('/notiftest', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        const { target } = req.body;
        const sub = await db.get(`auth/users/${target}/push/subscription`);

        let notif;
        try {
            notif = await sendNotification(target, 'Test Notification', 'THIS IS A TEST', '/app/users/xjarlie');
            res.status(200).json({ message: 'Sent', notif })
        } catch (e) {
            console.log(e);
            res.status(400).json({ error: 'ERROR HAPPENED' });
        }
    } else {
        res.status(401).json({ error: 'Credentials invalid' });
    }
})

export default router;