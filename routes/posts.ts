import express from 'express';
const router = express.Router();
import db from '../conn';
import crypto from 'crypto';
import { checkToken } from "./checkToken";
import { getUserPosts } from './getUserPosts';
import sendNotification from './sendNotification';
import { Post } from './schema';

router.post('/create', async (req, res) => {
    let data: Post = req.body;
    const username: string = req.cookies.USERNAME;
    const authToken: string = req.cookies.AUTH_TOKEN;

    if (!await checkToken(authToken, username)) {
        res.status(401).json({ error: 'Authentication invalid, please log in again' });
        return false;
    }

    data.author = username;
    data.timestamp = Date.now();

    let key: string = '';
    let exists = true;
    while (exists) {
        key = crypto.randomBytes(8).toString('hex');
        const check: Post = await db.get('posts/' + key);
        if (!check) break;
    }

    data.id = key;

    // OLD way of storing posts
    // await db.set(`auth/users/${username}/posts/${key}`, key);

    const result = await db.set('posts/' + key, data);

    // Send notifications to friends
    if (result) {
        console.log('here');
        const friends = await db.get(`auth/users/${username}/friends`);
        if (friends) {
            const title = 'New Recommendation';
            const message = `Your friend ${username} just recommended '${data.title}'. Check it out!`;
            const url = '/app/posts/' + key;

            for (const i in friends) {
                await sendNotification(friends[i].username, title, message, url);
            }
        }
    }

    res.status(201).json({ message: 'Post posted', result: result });
});

router.post('/update', async (req, res) => {
    const post: Post = req.body;

    if (!await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {
        res.status(401).json({ error: 'Authentication invalid, please log in again' });
        return false;
    }

    const userPosts: Post[] = await getUserPosts([req.cookies.USERNAME]);
    const exists = userPosts.filter((o) => {
        if (o.id === post.id) {
            return o;
        }
    });
    if (!exists) {
        res.status(401).json({ error: 'Credentials invalid' });
        return false;
    }


    const prevData: Post = await db.get(`posts/${post.id}`);
    console.log('PREVIOUS:', prevData);

    const newData = Object.assign(prevData, post);

    console.log('NEW:', newData);

    const result = await db.set(`posts/${post.id}`, newData);
    res.status(201).json({ message: 'Post updated', result });

});

router.post('/delete', async (req, res) => {

    const { postID } = req.body;

    if (!await checkToken(req.cookies.AUTH_TOKEN, req.cookies.USERNAME)) {
        res.status(401).json({ error: 'Authentication invalid, please log in again' });
        return false;
    }

    const userPosts = await getUserPosts([req.cookies.USERNAME]);
    const exists = userPosts.filter((o) => {
        if (o.id === postID) {
            return o;
        }
    });
    if (!exists) {
        res.status(401).json({ error: 'Credentials invalid' });
        return false;
    }

    const result = await db.remove(`posts/${postID}`);
    const resultUser = await db.remove(`auth/users/${req.cookies.USERNAME}/posts/${postID}`);

    res.status(201).json({ message: 'Post deleted', result });
    return true;
});

export default router;