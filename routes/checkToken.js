const db = require('../conn');

/**
 * Authenticates auth token against the token stored in db
 * @param {string} givenToken 
 * @param {string} username 
 * @returns {Promise<boolean>}
 */

async function checkToken(givenToken, username) {
    if (!(givenToken && username)) {
        return false;
    }
    let dbToken = await db.get('auth/users/' + username + '/token');
    if (!dbToken) {
        return false;
    }
    if (dbToken.expires <= Date.now() || dbToken.token != givenToken) {
        return false;
    } else {
        return true;
    }
}

exports.checkToken = checkToken;
