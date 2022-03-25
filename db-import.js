const Database = require('x-jsondb');
const path = require('path');
const _ = require('lodash');

const db = new Database(path.join(__dirname, 'db/old-db.json'));

const newdb = require('./conn');

async function main() {
    let posts = await db.get('Posts');

    // sets id property to key of object:
    for (const i in posts) {
        posts[i] = { ...posts[i], id: i };
    }

    // converts object of objects to array of objects:
    posts = Object.keys(posts).map(key => {
        return posts[key];
    });

    // filters only posts with timestamps:
    // posts = [...posts].filter(i => i.timestamp);

    // convert category numbers into strings, removes likes, changes 'tagged' to 'people', convert 'authorname' to 'author':
    posts = posts.map((obj) => {
        let category = 'Other';
        if (obj.category == 1) {
            category = 'TV Show';
        } else if (obj.category == 2) {
            category = 'Film';
        }
        // gets timestamp from firebase id
        let idTimestamp;
        if (obj.timestamp) {
            idTimestamp = obj.timestamp;
        } else {
            idTimestamp = decodeFirebaseKey(obj.id);
        }
        // converts old to new names and removes old properties
        delete obj.Likes;
        obj.author = obj.authorname.toLowerCase();
        delete obj.authorname;
        if (obj.tagged) {
            obj.people = [obj.tagged.toLowerCase()];
        }
        delete obj.tagged;
        return { ...obj, category: category, timestamp: idTimestamp, review: obj.description };

    });
    console.log(posts);

    for (const i in posts) {
        const id = posts[i].id;
        await newdb.set(`posts/${id}`, posts[i]);
    }

}

const PUSH_CHARS = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
function decodeFirebaseKey(id) {
    id = id.substring(0, 8);
    var timestamp = 0;
    for (var i = 0; i < id.length; i++) {
        var c = id.charAt(i);
        timestamp = timestamp * 64 + PUSH_CHARS.indexOf(c);
    }
    return timestamp;
}
main();