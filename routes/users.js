const express = require('express');
const router = express.Router();
const db = require('../conn');
const crypto = require('crypto');
const { checkToken } = require("./checkToken");

router.get('/search/:username', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        const { username } = req.params;
        
        const user = await db.get('auth/users/' + username);

        if (user) {
            const cleanedUser = { username: user.username, displayName: user.displayName };
            res.status(200).json({ result: cleanedUser });
        } else {
            res.status(404).json({ error: 'User not found' });
        }


    } else {
        res.status(401).json({ error: 'Credentials invalid' });
    }
});

router.post('/:username/watchlist/add', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {
        const { username } = req.params;
        if (username == req.cookies.USERNAME) {

            const { postID } = req.body;

            const result = await db.set(`auth/users/${username}/watchlist/${postID}`, { id: postID, timestamp: Date.now() });

            res.status(201).json({ result, message: 'Added to watchlist: ' + postID });

        } else {
            res.status(401).json({ error: 'Credentials incorrect' });
        }
    } else {
        res.status(401).json({ error: 'Credentials invalid' });
    }
});

router.post('/:username/watchlist/remove', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {
        const { username } = req.params;
        if (username == req.cookies.USERNAME) {

            const { postID } = req.body;

            const result = await db.remove(`auth/users/${username}/watchlist/${postID}`);

            res.status(201).json({ result, message: 'Removed from watchlist: ' + postID });

        } else {
            res.status(401).json({ error: 'Credentials incorrect' });
        }
    } else {
        res.status(401).json({ error: 'Credentials invalid' });
    }
});

router.post('/:username/requests/add', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        const { username } = req.params;
        if (username == req.cookies.USERNAME) {

            const { request } = req.body;

            // Remove request
            const removed = await db.remove(`auth/users/${username}/requests/${request}`);

            // Add friend
            const result = await db.set(`auth/users/${username}/friends/${request}`, { username: request, timestamp: Date.now() });

            res.status(201).json({ result, message: 'Accepted request: ' + request });
        } else {
            res.status(401).json({ error: 'Credentials incorrect' });
        }
    } else {
        res.status(401).json({ error: 'Credentials invalid' });
    }
});

router.post('/:username/requests/remove', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {
        const { username } = req.params;
        if (username == req.cookies.USERNAME) {

            const { request } = req.body;

            const result = await db.remove(`auth/users/${username}/requests/${request}`);

            res.status(201).json({ result, message: 'Removed request: ' + request });

        } else {
            res.status(401).json({ error: 'Credentials incorrect' });
        }
    } else {
        res.status(401).json({ error: 'Credentials invalid' });
    }
});

module.exports = router;