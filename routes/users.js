const express = require('express');
const router = express.Router();
const db = require('../conn');
const { checkToken } = require("./checkToken");

router.get('/search/:username', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        const { username } = req.params;
        
        const user = await db.get('auth/users/' + username);

        if (user) {
            const cleanedUser = { username: user.username, displayName: user.displayName };
            res.status(200).json({ result: cleanedUser });
            return true;
        } else {
            res.status(404).json({ error: 'User not found' });
            return true;
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

router.post('/requests/send', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        const { request } = req.body;
        const username = req.cookies.USERNAME;

        // Check if already friends
        {
            const result = await db.get(`auth/users/${username}/friends/${request}`);
            if (result) {
                res.status(400).json({ error: 'User already in friends list' });
                return true;
            }
        }

        // Check if user is self
        {
            if (request === username) {
                res.status(400).json({ error: `You can't send a friend request to yourself, silly`});
                return true;
            }
        }

        const result = await db.set(`auth/users/${request}/requests/${username}`, { username, timestamp: Date.now() });

        res.status(201).json({ result, message: 'Friend request sent: ' + request });
        return true;
    } else {
        res.status(401).json({ error: 'Credentials invalid' });
        return true;
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
            const result2 = await db.set(`auth/users/${request}/friends/${username}`, { username: username, timestamp: Date.now() })

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

router.post('/darkmode', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        const username = req.cookies.USERNAME;
        const { darkMode } = req.body;

        console.log(username, darkMode);

        const result = await db.set(`auth/users/${username}/darkMode`, darkMode);
    

        res.status(200).json({ result, message: 'Dark mode preferences updated' });
    } else {
        res.status(401).json({ error: 'Credentials invalid' });
    }
})

module.exports = router;