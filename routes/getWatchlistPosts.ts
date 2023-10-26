// Import database connector
import db from "../conn";

// Import type declaration
import { Post } from "./schema";

// Takes a list of posts, and a username
// Returns a promise containing the same list of posts, but with flags stating whether each one is on the user's watchlist
async function getWatchlistPosts(posts: Post[], username: string): Promise<Post[]> {

    // Fetch the contents of the user's watchlist
    const watchlist: any[] = await db.orderedList(`auth/users/${username}/watchlist`, 'timestamp', 'desc');

    // Initialise an empty array of posts
    let newPosts: Post[] = [];

    // Loop through each provided post
    for (const i in posts) {
        const post = posts[i];
        
        // Tests whether the post id matches any on the user's watchlist
        // And push it to the newPosts array - if it is on the watchlist, add a flag
        if (watchlist.some(o => o.id == post.id)) {
            newPosts.push({ ...post, onWatchlist: true });
        } else {
            newPosts.push(post);
        }

    }

    // Return the new list containing watchlist flags
    return newPosts;
}

export { getWatchlistPosts };