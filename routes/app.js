const express = require('express');
const db = require('../conn');
const router = express.Router();
const { checkToken } = require("./checkToken");
const _ = require('lodash');
const { getUserInfo } = require("./getUserInfo");

router.get('/', async (req, res) => {

    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        let data = await db.orderedList('posts', 'timestamp', 'desc');
        const friendsList = await db.get(`auth/users/${req.cookies.USERNAME}/friends`) || {};
        friendsList[req.cookies.USERNAME] = { username: req.cookies.USERNAME };
        let filtered = [];
        if (friendsList) {
            filtered = _.filter(data, function (o) {
                if (friendsList[o.author]) {
                    return o;
                }
            });
        }

        res.render('index', { user: await getUserInfo(req.cookies.USERNAME), posts: filtered });
    } else {
        res.redirect('/app/login');
    }
});

router.get('/friends', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        const friends = await db.orderedList(`auth/users/${req.cookies.USERNAME}/friends`, 'timestamp', 'desc');
        const requests = await db.orderedList(`auth/users/${req.cookies.USERNAME}/requests`, 'timestamp', 'desc');

        res.render('friends', { user: await getUserInfo(req.cookies.USERNAME), friends, requests });
    } else {
        res.redirect('/app/login');
    }
});

router.get('/friends/add', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        const friends = await db.orderedList(`auth/users/${req.cookies.USERNAME}/friends`, 'timestamp', 'desc');
        const requests = await db.orderedList(`auth/users/${req.cookies.USERNAME}/requests`, 'timestamp', 'desc');

        res.render('addfriend', { user: await getUserInfo(req.cookies.USERNAME), friends, requests });
    } else {
        res.redirect('/app/login');
    }
});

router.get('/watchlist', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        const watchlist = await db.get(`auth/users/${req.cookies.USERNAME}/watchlist`);

        const sorted = _.orderBy(watchlist, ['timestamp'], ['desc']);

        let posts = [];
        for (const i in sorted) {
            posts[i] = await db.get(`posts/${sorted[i].id}`);
        }

        res.render('watchlist', { user: await getUserInfo(req.cookies.USERNAME), posts });
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
    const query = req.query;

    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        const friendsList = await db.get(`auth/users/${req.cookies.USERNAME}/friends`);

        let prefill = {};
        if (query.id) {
            prefill.title = await db.get(`posts/${query.id}/title`);
        }

        res.render('create', { user: await getUserInfo(req.cookies.USERNAME), friends: friendsList, prefill });
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

            let ownPost = false;
            let onWatchlist = false;
            if (data.author == req.cookies.USERNAME) {
                ownPost = true;
            }

            onWatchlist = await db.get(`auth/users/${req.cookies.USERNAME}/watchlist/${id}`);
            

            res.render('post', { user: await getUserInfo(req.cookies.USERNAME), post: data, ownPost, onWatchlist });
        }
    } else {
        res.redirect('/app/login');
    }

});

router.get('/users/:username', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        const username = req.cookies.USERNAME;
        const { username: pageUsername } = req.params;


        if (username === pageUsername) {
            res.render('profile', { user: await getUserInfo(username) });
            return true;
        }

        // Check friend status
        const isFriend = await db.get(`auth/users/${username}/friends/${pageUsername}`)? true : false;

        // get userdata
        const pageUser = await db.get(`auth/users/${pageUsername}`);
        if (!pageUser) {
            res.render('404', { user: await getUserInfo(username) });
            return true;
        }
        const cleanPageUser = { username: pageUser.username, displayName: pageUser.displayName, imgUrl: pageUser.imgUrl };

        let data = { isFriend, pageUser: cleanPageUser, user: await getUserInfo(username) };

        if (isFriend) {

            // retrieve full posts
            const posts = await db.orderedList(`auth/users/${pageUsername}/posts`, 'timestamp', 'desc');
            let detailedPosts = [];
            for (const i in posts) {
                const post = await db.get(`posts/${posts[i]}`);
                detailedPosts[i] = post;
            }
            data.posts = detailedPosts;

        }

        res.render('user', data);

    } else {
        res.redirect('/app/login');
    }
});

router.get('/settings', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {
        
        res.render('settings', { user: await getUserInfo(req.cookies.USERNAME) });

    } else {
        res.redirect('/app/login');
    }
})

module.exports = router;