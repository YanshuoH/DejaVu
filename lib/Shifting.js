// Shifting
var utils = require('../lib/utils');
var async = require('async');

var mongoose = require('mongoose');

var UserModelFile = require('../models/UserModel');
var TweetModelFile = require('../models/TweetModel');

// Passive DB config
var uriPassive = 'mongodb://localhost:27017/streaming'
// Active DB config
var uriActive = 'mongodb://localhost:27017/twc'

var options = {
    server: {
        auto_reconnecdt: true,
        socketOptions: {
            KeepAlive: 1
        },
        poolSize: 20
    }
};


function Shifting(queryObj) {
    this.query = queryObj;
    this.connect();
}

Shifting.prototype.connect = function() {
    console.log('=======SHIFTING: connect to passive DB============');
    var conPassive = mongoose.createConnection(uriPassive, options);
    mongoose.connection.on('error', function(err) {
        console.log(err);
    });
    this.conPassive = conPassive;
    this.UserModelPassive = this.conPassive.model('UserModel', UserModelFile.UserModelSchema);
    this.TweetModelPassive = this.conPassive.model('TweetModel', TweetModelFile.TweetModelSchema);

    console.log('=======SHIFTING: connect to active DB============');
    var conActive = mongoose.createConnection(uriActive, options);
    mongoose.connection.on('error', function(err) {
        console.log(err);
    });
    this.conActive = conActive;
    this.UserModelActive = this.conActive.model('UserModel', UserModelFile.UserModelSchema);
    this.TweetModelActive = this.conActive.model('TweetModel', TweetModelFile.TweetModelSchema);
}

Shifting.prototype.disconnect = function() {
    console.log('=======SHIFTING: disconnect to passive DB============');
    this.conPassive.close();
    console.log('=======SHIFTING: disconnect to active DB============');
    this.conActive.close();
}

Shifting.prototype.export = function(self) {
    // use con from mongoose
    // create con to streaming
    async.parallel([
        // Export Users
        function(callback) {
            var options = {
                where: {
                    field: '_id',
                    value: self.query.users
                }
            };
            self.UserModelActive.list(options, function(err, users) {
                for (var index=0; index<users.length; index++) {
                    var u = new self.UserModelPassive(users[index]);
                    u.save(function(err) {
                        if (err && err.code !== 11000) console.log(err);
                    });
                    users[index].remove(function(err) {
                        if (err) console.log(err);
                    });
                }
            });
        },
        // Export Tweets
        function(callback) {
            var options = {
                where: {
                    field: '_id',
                    value: self.query.tweets
                }
            };
            self.TweetModelActive.list(options, function(err, tweets) {
                for (var index=0; index<tweets.length; index++) {
                    var t = new self.TweetModelPassive(tweets[index]);
                    t.save(function(err) {
                        if (err && err.code !== 11000) console.log(err);
                    });
                    tweets[index].remove(function(err) {
                        if (err) console.log(err);
                    });
                }
            });
        }
    ], function(err, msg) {
        if (err) console.log(err);
        self.disconnect();
    });
}

module.exports = Shifting;
