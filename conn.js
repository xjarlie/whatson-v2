const Database = require('@xjarlie/jsondb');
const path = require('path');

const db = new Database(path.join(__dirname, 'db/db.json'));

module.exports = db;