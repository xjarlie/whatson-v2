// Import database connector
import db from '../conn';

// Import type declaration
import { Post } from './schema';

// Takes a list of usernames
// Returns an asynchronous promise containing all the posts created by those users
async function getUserPosts([...users]: string[]): Promise<Post[]> {

    // Fetch sorted array from database containing every post written by any user
    const allPosts: Post[] = await db.orderedList('posts', 'timestamp', 'desc');

    // Loops through each post
    const posts: Post[] = allPosts.filter((o) => {
        // Tests the provided username list - if it contains the author of the post,
        // the post is kept in the list
        if (users.includes(o.author)) {
            return o;
        }
    });

    // Returns the list of posts sorted by date created written by the provided users
    return posts;
}

export { getUserPosts };