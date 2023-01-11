import { Post } from "./schema";
import db from "../conn";

async function getWatchlistPosts(posts: Post[], username: string): Promise<Post[]> {

    const watchlist: any[] = await db.orderedList(`auth/users/${username}/watchlist`, 'timestamp', 'desc');

    let newPosts: Post[] = [];
    for (const i in posts) {
        const post = posts[i];

        if (watchlist.some(o => o.id == post.id)) {
            newPosts.push({ ...post, onWatchlist: true });
        } else {
            newPosts.push(post);
        }

    }
    console.log(newPosts);
    return newPosts;
}

export { getWatchlistPosts };