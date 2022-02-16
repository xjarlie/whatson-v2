const db = require('../conn');

async function getUserInfo(username) {
    const user = await db.get(`auth/users/${username}`);
    return { displayName: user.displayName, username: user.username, darkMode: user.darkMode || false, email: user.email };
}
exports.getUserInfo = getUserInfo;
