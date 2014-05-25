// config.js

var path = require('path');
var rootPath = path.normalize(__dirname + '/../');

module.exports = {
    root: rootPath,
    db: 'mongodb://localhost:27017/twc,mongodb://localhost:27017/streaming',
    app: {
        name: 'Tweets collecter'
    },
};