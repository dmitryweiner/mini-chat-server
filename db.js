const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fs = require('fs');

let db;
const DB_FILENAME = 'db.json';
const TEST_DB_FILENAME = 'test-db.json';

function initDb(testMode = false) {
  const dbFilename = testMode ? TEST_DB_FILENAME : DB_FILENAME;
  const isExists = fs.existsSync(dbFilename);
  const adapter = new FileSync(dbFilename);
  const _db = low(adapter);

  if (!isExists) {
    _db.defaults({
      users: [],
      auth: [],
      chats: [],
      messages: []
    }).write();
  }
  db = _db;
  console.log('Called createDb', testMode ? 'test' : 'app', typeof db);
  return db;
}

function getDb() {
  console.log('getDb', typeof db);
  return db;
}

function cleanTestDb() {
  fs.existsSync(TEST_DB_FILENAME) && fs.unlinkSync(TEST_DB_FILENAME);
}

module.exports = {
  initDb,
  getDb,
  cleanTestDb,
  db
};
