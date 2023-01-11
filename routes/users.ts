import express from 'express';
import sendNotification from './sendNotification';
const router = express.Router();
import db from '../conn';
import { checkToken } from "./checkToken";

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
        console.log(request);
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
        const outgoingResult = await db.set(`auth/users/${username}/outgoingRequests/${request}`, { username: request, timestamp: Date.now() });

        // Send notification
        try {
            await sendNotification(request, 'Friend request', `${username} just sent you a friend request.`, '/app/friends');
        } catch {
            console.log('notiferror');
        }
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
            const outgoingRemoved = await db.remove(`auth/users/${request}/outgoingRequests/${username}`);

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
            const outgoingResult = await db.remove(`auth/users/${request}/outgoingRequests/${username}`);

            res.status(201).json({ result, message: 'Removed request: ' + request });

        } else {
            res.status(401).json({ error: 'Credentials incorrect' });
        }
    } else {
        res.status(401).json({ error: 'Credentials invalid' });
    }
});

router.post('/:username/requests/cancel', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        const { username } = req.params;
        if (username === req.cookies.USERNAME) {

            const { request } = req.body;

            const outgoingResult = await db.remove(`auth/users/${username}/outgoingRequests/${request}`);
            const result = await db.remove(`auth/users/${request}/requests/${username}`);

            res.status(201).json({ result, message: 'Cancelled request: ' + request });
        } else {
            res.status(401).json({ error: 'Credentials incorrect' });
        }

    } else {
        res.status(401).json({ error: 'Credentials invalid' });
    }
});

router.post('/:username/friends/remove', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        const { username } = req.params;
        const { friend } = req.body;

        if (username !== req.cookies.USERNAME) {
            res.status(401).json({ error: 'Credentials incorrect' });
            return false;
        }

        const userResult = await db.remove(`auth/users/${username}/friends/${friend}`);
        const friendResult = await db.remove(`auth/users/${friend}/friends/${username}`); 

        res.status(201).json({ message: 'Removed friend: ' + friend });

    } else {
        res.status(401).json({ error: 'Credentials invalid' });
    }

});

router.post('/darkmode', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        const username = req.cookies.USERNAME;
        const { darkMode } = req.body;

        const result = await db.set(`auth/users/${username}/darkMode`, darkMode);
    

        res.status(200).json({ result, message: 'Dark mode preferences updated' });
    } else {
        res.status(401).json({ error: 'Credentials invalid' });
    }
});

router.post('/experiments/:experiment', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {
        
        const username = req.cookies.USERNAME;
        const { enabled } = req.body;
        const { experiment } = req.params;

        const experiments = ['layout', 'amoled'];
        if (!experiments.includes(experiment)) {
            res.status(404).json({ error: 'Experiment not found' });
            return true;
        }

        const result = await db.set(`auth/users/${username}/experiments/${experiment}`, enabled);

        res.status(200).json({ result, message: 'Dark mode preferences updated' });

    } else {
        res.status(401).json({ error: 'Credentials invalid' })
    }
});

export default router;