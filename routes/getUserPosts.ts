import db from '../conn';
import { Post } from './schema';

async function getUserPosts([...users]: string[]): Promise<Post[]> {
    const allPosts: Post[] = await db.orderedList('posts', 'timestamp', 'desc');
    const posts: Post[] = allPosts.filter((o) => {
        if (users.includes(o.author)) {
            return o;
        }
    });
    return posts;
}

export { getUserPosts };