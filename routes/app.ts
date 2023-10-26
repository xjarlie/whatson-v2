// Import server module
import express from 'express';
const router = express.Router();

// Import external object management library
import _ from 'lodash';

// Import database connector
import db from '../conn';

// Import various other modules written by me
import { checkToken } from "./checkToken";
import { getUserInfo } from "./getUserInfo";
import { getUserPosts } from './getUserPosts';
import { getWatchlistPosts } from './getWatchlistPosts';

// Import type definitions
import { Post, User } from './schema';

// Homepage route
router.get('/', async (req, res) => {

    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) { // Call function that verifies the user's authentication token

        // let data: Post[] = await db.orderedList('posts', 'timestamp', 'desc');

        // Fetch user's friends from database
        const friendsList = await db.get(`auth/users/${req.cookies.USERNAME}/friends`) || {};

        // Add user to list, so that the user's own posts are also fetched
        friendsList[req.cookies.USERNAME] = { username: req.cookies.USERNAME };
        


        // Extract only usernames from the list
        const friendsUsernames = Object.keys(friendsList).map(key => {
            return friendsList[key].username;
        });

        // Call function that fetches all posts made by a list of users
        const userPosts = await getUserPosts(friendsUsernames);

        // Call function that adds a flag to each post if it is already on the user's watchlist 
        const newPosts = await getWatchlistPosts(userPosts, req.cookies.USERNAME);

        // Render the homepage, sending the relevant user info and list of posts to the EJS file
        res.render('index', { user: await getUserInfo(req.cookies.USERNAME), posts: newPosts });
    } else {
        // If the user is not logged in (/their authentication token is expired), they are sent to the landing page
        res.render('landing');
    }
});

// Friends page route
router.get('/friends', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        // Uses database connector's builtin methods to fetch the friends and friend requests for a certain user, and sort them in descending order of date added
        const friends = await db.orderedList(`auth/users/${req.cookies.USERNAME}/friends`, 'timestamp', 'desc');
        const requests = await db.orderedList(`auth/users/${req.cookies.USERNAME}/requests`, 'timestamp', 'desc');
        const outgoing = await db.orderedList(`auth/users/${req.cookies.USERNAME}/outgoingRequests`, 'timestamp', 'desc');

        // Render the friends page, including user info and the three lists
        res.render('friends', { user: await getUserInfo(req.cookies.USERNAME), friends, requests, outgoing });
    } else {
        // If the user is not logged in (/their authentication token is expired), they are sent to log in
        res.redirect('/app/login');
    }
});

// Add friend page route
router.get('/friends/add', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        // Uses database connector's builtin methods to fetch friends and incoming requests for a certain user and sort them in descending order of date added
        const friends = await db.orderedList(`auth/users/${req.cookies.USERNAME}/friends`, 'timestamp', 'desc');
        const requests = await db.orderedList(`auth/users/${req.cookies.USERNAME}/requests`, 'timestamp', 'desc');

        // Render the add friend page, with user info, friends and requests
        res.render('addfriend', { user: await getUserInfo(req.cookies.USERNAME), friends, requests });
    } else {
        res.redirect('/app/login');
    }
});

// Watchlist route
router.get('/watchlist', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        // Fetch the IDs of the posts in the user's watchlist
        const watchlist = await db.get(`auth/users/${req.cookies.USERNAME}/watchlist`);

        // Sort the watchlist by timestamp
        const sorted = _.orderBy(watchlist, ['timestamp'], ['desc']);

        // Loop through the array of IDs and store the details of each post in 'posts'
        let posts: Post[] = [];
        for (const i in sorted) {
            posts[i] = await db.get(`posts/${sorted[i].id}`);
        }

        // Render watchlist page, with user info and the list of watchlist posts
        res.render('watchlist', { user: await getUserInfo(req.cookies.USERNAME), posts });
    } else {
        res.redirect('/app/login');
    }
});

// Log in route
router.get('/login', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {
        // If the user is already logged in and navigated to login page accidentally, redirect them:
        res.redirect('/app');
    } else {
        // If the user is not logged in, render the login page:
        res.render('login');
    }
});

// Sign up route
router.get('/signup', async (req, res) => {
    // If the user is already logged in and navigated to signup page accidentally, redirect them:
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {
        res.redirect('/app');
    } else {
        // If the user is not logged in, render the login page:
        res.render('signup');
    }
});

// Create post route
router.get('/posts/create', async (req, res) => {
    // Extract the query parameters
    const query = req.query;

    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) { // Check that user is logged in

        // Fetch a list of the user's friends ordered by date added
        const friendsList = await db.orderedList(`auth/users/${req.cookies.USERNAME}/friends`, 'timestamp', 'desc');

        // Determines whether the post's title should be prefilled
        let prefill: any = {};
        if (query.id) { 
            prefill.title = await db.get(`posts/${query.id}/title`);
        }

        // Render create post page, with user info, friends (for recommending) and any prefill information
        res.render('create', { user: await getUserInfo(req.cookies.USERNAME), friends: friendsList, prefill });
    } else {
        res.redirect('/app/login');
    }
});

// View post route
router.get('/posts/:id', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        // Extract id of post to be fetched
        const { id } = req.params;

        // Get post data with id
        const data: Post = await db.get('posts/' + id);

        if (!data) {
            // If the post does not exist, show error page
            res.render('404');
            return true;
        } else {

            let ownPost = false;
            let onWatchlist = false;

            // Test whether post is the user's own
            if (data.author == req.cookies.USERNAME) {
                ownPost = true;
            }

            // Test whether the post is already on the user's watchlist
            onWatchlist = await db.get(`auth/users/${req.cookies.USERNAME}/watchlist/${id}`);
            
            // Render view post page with the relevant information
            res.render('post', { user: await getUserInfo(req.cookies.USERNAME), post: data, ownPost, onWatchlist });
        }
    } else {
        res.redirect('/app/login');
    }
});

// Edit post route
router.get('/posts/:id/edit', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        // Extract id of post to be fetched
        const { id } = req.params;

        // Get post data with id
        const data: Post = await db.get('posts/' + id);

        if (!data) {
            // If the post does not exist, show error page and return function
            res.render('404', { user: await getUserInfo(req.cookies.USERNAME )});
            return true;
        }

        // Fetch ordered list of user's friends
        const friendsList = await db.orderedList(`auth/users/${req.cookies.USERNAME}/friends`, 'timestamp', 'desc');
    
        if (data.author == req.cookies.USERNAME) {
            // If the post was written by the user, render edit page
            res.render('edit', { user: await getUserInfo(req.cookies.USERNAME), prefill: data, friends: friendsList });
        } else {
            // If the post was written by another user, redirect to the view post page 
            // This ensures that users cannot edit other users' posts through bad links
            res.redirect('/app/posts/' + id);
        }

    } else {
        res.redirect('/app/login');
    }
});

// View user profile route
router.get('/users/:username', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        // Get username of user
        const username: string = req.cookies.USERNAME;

        // Get username of profile to view
        const { username: pageUsername } = req.params;

        // If page requested is the profile of the active user, show profile page instead
        if (username === pageUsername) {

            // Call function that fetches all posts made by a list of users (in this case a list of one)      
            const posts = await getUserPosts([username]);

            // Render own profile page
            res.render('profile', { user: await getUserInfo(username), posts: posts });
            return true;
        }

        // Check friend status
        const isFriend = await db.get(`auth/users/${username}/friends/${pageUsername}`)? true : false;

        // Get clean userdata - without hashed passwords, emails or authentication tokens
        // to display to anyone
        const pageUser: User = await db.get(`auth/users/${pageUsername}`);
        if (!pageUser) {
            // If user does not exist, show error page
            res.render('404', { user: await getUserInfo(username) });
            return true;
        }
        const cleanPageUser = { username: pageUser.username, displayName: pageUser.displayName, imgUrl: pageUser.imgUrl };

        let data: any = { isFriend, pageUser: cleanPageUser, user: await getUserInfo(username) };

        // If the user is friends with the profile to be viewed, fetch the profile's posts
        // This ensures that only friends can see users' posts
        if (isFriend) {
            const posts = await getUserPosts([pageUsername]);
            data.posts = await getWatchlistPosts(posts, req.cookies.USERNAME);;
        }

        // Render the profile page with the necessary information
        res.render('user', data);

    } else {
        res.redirect('/app/login');
    }
});

// Settings route
router.get('/settings', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {
        
        // Allow developer admin access to test controls
        // e.g. notification tester
        let isAdmin = false;
        if (req.cookies.USERNAME === 'xjarlie') {
           isAdmin = true; 
        }
        // Render settings page with relevant information
        res.render('settings', { user: await getUserInfo(req.cookies.USERNAME), isAdmin });

    } else {
        res.redirect('/app/login');
    }
});

// Log out route
router.get('/logout', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {

        // Clears the authentication cookies in the user's browser to ensure they are completely logged out
        res.clearCookie('AUTH_TOKEN').clearCookie('USERNAME').redirect('/app/login');

    } else {
        res.redirect('/app/login');
    }
});

// Catch-all route for erroneous URLs
router.get('*', async (req, res) => {
    if (await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {
        // If the user is logged in, show error page
        res.render('404', { user: await getUserInfo(req.cookies.USERNAME)});
        return true;
    } else {
        // If not, take them to the app's landing page
        res.redirect('/app');
        return true;
    }
})

// Make routes available to other files
export default router;