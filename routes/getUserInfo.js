const db = require('../conn');


async function getUserInfo(username) {
    const user = await db.get(`auth/users/${username}`);
    return { displayName: user.displayName, username: user.username };
}
exports.getUserInfo = getUserInfo;
