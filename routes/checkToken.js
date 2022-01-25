const db = require('../conn');


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
