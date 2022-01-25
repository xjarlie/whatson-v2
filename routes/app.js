const express = require('express');
const router = express.Router();
const { checkToken } = require("./checkToken");

router.get('/', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {
        res.render('index', { username: req.cookies.USERNAME });
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

router.get('/create', async (req, res) => {
    const friends = ['Xjarlie', 'Adele', 'Loui54', 'TJA'];

    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {
        res.render('create', { username: req.cookies.USERNAME, friends: friends });
    } else {
        res.redirect('/app/login');
    }
})

module.exports = router;