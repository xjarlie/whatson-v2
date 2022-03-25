const db = require('../conn');

async function getUserPosts([...users]) {
    const allPosts = await db.orderedList('posts', 'timestamp', 'desc');
    const posts = allPosts.filter((o) => {
        if (users.includes(o.author)) {
            return o;
        }
    });
    return posts;
}

module.exports = { getUserPosts };