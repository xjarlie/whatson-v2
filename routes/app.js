const express = require('express');
const router = express.Router();
const db = require('../conn');

router.get('/', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {
        res.render('index');
    } else {
        res.redirect('/app/login');
    }
});

router.get('/friends', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {
        res.render('friends');
    } else {
        res.redirect('/app/login');
    }
});

router.get('/watchlist', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {
        res.render('watchlist');
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

async function checkToken(givenToken, username) {
    if (!(givenToken && username)) {
        return false;
    }
    let dbToken = await db.get('auth/users/' + username + '/token');
    if (dbToken.expires <= Date.now() || dbToken.token != givenToken) {
        return false;
    } else {
        return true;
    }
}

module.exports = router;