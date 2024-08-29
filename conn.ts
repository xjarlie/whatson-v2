// Import my custom database module
import Database from './Database';

// Import external module to handle OS-specific filepaths
import path from 'path';

// Create a new database connector instance using the path of the database file
const db = new Database(path.join(__dirname, 'db/db.json'));

export default db;