const Database = require('better-sqlite3');

const DBSOURCE = "/db/db.sqlite"

const db = new Database(DBSOURCE, {verbose: console.log, fileMustExist: true});

//TODO Add logic to find the DB if not in the original path

module.exports = db
