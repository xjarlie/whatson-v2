const db = require('../conn');

/**
 * 
 * @param {string} username 
 * @returns {Promise<{ displayName: string, username: string, darkMode: boolean, email: string, experiments: object }>} **non-cleaned** user details
 */

async function getUserInfo(username) {
    const user = await db.get(`auth/users/${username}`);
    return { displayName: user.displayName, username: user.username, darkMode: user.darkMode || false, email: user.email, experiments: user.experiments || {} };
}
exports.getUserInfo = getUserInfo;
