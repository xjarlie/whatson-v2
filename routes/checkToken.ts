import db from '../conn';
import { Token } from './schema';

async function checkToken(givenToken: string, username: string): Promise<boolean> {
    if (!(givenToken && username)) {
        return false;
    }
    let dbToken: Token = await db.get('auth/users/' + username + '/token');
    if (!dbToken) {
        return false;
    }
    if (dbToken.expires <= Date.now() || dbToken.token != givenToken) {
        return false;
    } else {
        return true;
    }
}

export { checkToken };
