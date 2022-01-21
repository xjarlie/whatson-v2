const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/friends', (req, res) => {
    res.render('friends');
});

router.get('/watchlist', (req, res) => {
    res.render('watchlist');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/signup', (req, res) => {
    res.render('signup');
});

module.exports = router;