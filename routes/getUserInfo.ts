// Import database connector
import db from '../conn';

// Import type declarations
import { User } from './schema';

// Takes a username
// Returns an asynchronous promise containing sanitised information about the user, to be used in rendering the client
async function getUserInfo(username: string): Promise<User> {

    // Fetches the user data from the database
    const user = await db.get(`auth/users/${username}`);

    // Selects only the client-safe information from the user to return (no authentication)
    return { displayName: user.displayName, username: user.username, darkMode: user.darkMode || false, email: user.email, experiments: user.experiments || {} };
}

export { getUserInfo };