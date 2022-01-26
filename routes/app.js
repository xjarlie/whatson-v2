const express = require('express');
const db = require('../conn');
const router = express.Router();
const { checkToken } = require("./checkToken");
const _ = require('lodash');

router.get('/', async (req, res) => {

    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        let data = await db.orderedList('posts', 'timestamp', 'desc');
        const friendsList = await db.get(`auth/users/${req.cookies.USERNAME}/friends`);

        let filtered = {};
        if (friendsList) {
            filtered = _.filter(data, function (o) {
                if (friendsList[o.author]) {
                    return o;
                }
            });
        }

        res.render('index', { username: req.cookies.USERNAME, posts: filtered });
    } else {
        res.redirect('/app/login');
    }
});

router.get('/friends', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {
        res.render('friends', { username: req.cookies.USERNAME });
    } else {
        res.redirect('/app/login');
    }
});

router.get('/watchlist', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {
        res.render('watchlist', { username: req.cookies.USERNAME });
    } else {
        res.redirect('/app/login');
    }
});

router.get('/login', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {
        res.redirect('/app');
    } else {
        res.render('login');
    }
});

router.get('/signup', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {
        res.redirect('/app');
    } else {
        res.render('signup');
    }
});

router.get('/posts/create', async (req, res) => {
    const friends = ['Xjarlie', 'Adele', 'Loui54', 'TJA'];

    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {
        res.render('create', { username: req.cookies.USERNAME, friends: friends });
    } else {
        res.redirect('/app/login');
    }
});

router.get('/posts/:id', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {
        const { id } = req.params;
        const data = await db.get('posts/' + id);

        if (!data) {
            // TODO: Make a 404 ejs file
            res.redirect('/app');
        } else {
            res.render('post', { username: req.cookies.USERNAME, post: data });
        }
    } else {
        res.redirect('/app/login');
    }

});

module.exports = router;