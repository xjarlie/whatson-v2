const Database = require('x-jsondb');
const path = require('path');
const _ = require('lodash');

const db = new Database(path.join(__dirname, 'db/old-db.json'));

async function main() {
    let posts = await db.get('Posts');
    
    // sets id property to key of object
    for (const i in posts) {
        posts[i] = {...posts[i], id: i};
    }

    // converts object of objects to array of objects
    posts = Object.keys(posts).map(key => {
        return posts[key];
    });

    // filters only posts with timestamps
    posts = [...posts].filter(i => i.timestamp);

    // convert category numbers into strings, removes likes, changes 'tagged' to 'people', convert 'authorname' to 'author'
    posts = posts.map((obj) => {
        let category = 'Other';
        if (obj.category == 1) {
            category = 'TV Show';
        } else if (obj.category == 2) {
            category = 'Film';
        }

        return {...obj, category: category, Likes: undefined, people: [obj.tagged], author: obj.authorname };

    });
    console.log(posts);
}
main();