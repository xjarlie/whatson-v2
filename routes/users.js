const express = require('express');
const router = express.Router();
const db = require('../conn');
const crypto = require('crypto');
const { checkToken } = require("./checkToken");

router.post('/:username/watchlist/add', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {
        const { username } = req.params;
        if (username == req.cookies.USERNAME) {

            const { postID } = req.body;

            const result = await db.set(`auth/users/${username}/watchlist/${postID}`, postID);

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
})

module.exports = router;