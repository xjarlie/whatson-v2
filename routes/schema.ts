// Define commonly used data structures with datatypes

interface Token {
    token: string,
    expires: number
}

interface User {
    username: string,
    displayName: string,
    email: string,
    password?: string,
    salt?: string,
    token?: Token,
    darkMode?: boolean,
    experiments?: any,
    imgUrl?: string
}

interface Post {
    id: string,
    title: string,
    rating: string,
    category: string,
    genre?: string,
    source?: string,
    review?: string,
    tag?: string,
    people: any[],
    author: string,
    timestamp: number,
    onWatchlist?: boolean
}

export { Token, User, Post };
