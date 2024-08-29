// Import database connector
import db from '../conn';

// Import type declaration
import { Token } from './schema';

// Takes an authentication token and a username
// Returns an asychronous promise stating whether the token is correct
async function checkToken(givenToken: string, username: string): Promise<boolean> {
    // Fail if both token and username are not provided
    if (!(givenToken && username)) {
        return false;
    }
    
    // Get the stored auth token of the provided username
    let dbToken: Token = await db.get('auth/users/' + username + '/token');

    // Fail if there is no stored token
    if (!dbToken) {
        return false;
    }

    // Fail if the stored token has expired, or if the tokens do not match
    if (dbToken.expires <= Date.now() || dbToken.token != givenToken) {
        return false;
    }

    // If all tests have been passed, succeed.
    return true;
    
}

export { checkToken };
