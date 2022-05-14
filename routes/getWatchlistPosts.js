const db = require("../conn");
const _ = require('lodash');

/**
 * 
 * @param {object[]} posts 
 * @param {string} username 
 * @returns {Promise<object[]>} Array of all posts entered, with attribute 'onWatchlist: true' added to posts on user's watchlist
 */

async function getWatchlistPosts(posts, username) {

    const watchlist = await db.orderedList(`auth/users/${username}/watchlist`, 'timestamp', 'desc');

    let newPosts = [];
    for (const i in posts) {
        const post = posts[i];

        if (watchlist.some(o => o.id == post.id)) {
            newPosts.push({ ...post, onWatchlist: true });
        } else {
            newPosts.push(post);
        }

    }
    console.log(newPosts);
    return newPosts;
}

module.exports = { getWatchlistPosts };