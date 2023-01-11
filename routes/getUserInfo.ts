import db from '../conn';
import { User } from './schema';

async function getUserInfo(username: string): Promise<User> {
    const user = await db.get(`auth/users/${username}`);
    return { displayName: user.displayName, username: user.username, darkMode: user.darkMode || false, email: user.email, experiments: user.experiments || {} };
}

export {getUserInfo};