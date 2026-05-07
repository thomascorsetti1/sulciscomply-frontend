const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.db');
const schemaPath = path.join(__dirname, '..', 'schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database at', dbPath);
    initializeDatabase();
  }
});

function initializeDatabase() {
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  
  db.serialize(() => {
    schema.split(';').forEach((statement) => {
      if (statement.trim()) {
        db.run(statement, (err) => {
          if (err && !err.message.includes('already exists')) {
            console.error('Error executing schema:', err);
          }
        });
      }
    });
  });
}

module.exports = db;
