const fs = require('fs');
const low = require('lowdb');
const path = require('path');
const FileAsync = require('lowdb/adapters/FileSync');

const dbPath = path.resolve(__dirname, './data/db.json');

// Create db file if it doesn't exist
try {
    fs.writeFileSync(dbPath, '', { flag: 'wx' });
} catch (error) {
    if (error.code !== 'EEXIST') {
        console.error(error);
    }
}

const adapter = new FileAsync(dbPath);
const db = low(adapter);

db.defaults({
    auth: {
        tokens: {}
    },
    cache: {
        videoLength: {}
    },
    home: [],
    settings: {
        homeDetection: false,
        motionDetection: false
    }
})
    .write();

module.exports = db;
