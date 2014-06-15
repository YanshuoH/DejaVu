var fs = require('fs');
var util = require('util');
var async = require('async');
//=========Build access data for twit=================
var Twit = require('twit')

var T = new Twit({
    consumer_key: 'a7ZYldOLb4XiG0YTkQro8Qv6r',
    consumer_secret: 'w39aaLvDkcoM54lLNEmOk22JowvchlNYx8M2lUvR4jushklBAZ',
    access_token: '2438437632-X0Ufc7sHAIqsjxk9P8RShFqCYH2fn45O0wMKRvS',
    access_token_secret: 'ywqj8lTkrnVAAMXs0bHGgBOeDv9fIA5daR6pXOGJnt7FU',
});
//==========FIN============================
var UserModelFile = require('../models/UserModel');
var TweetModelFile = require('../models/TweetModel');
var StreamingModelFile = require('../models/StreamingModel');

// Build Mongoose connection for streaming db
var mongoose = require('mongoose');

var uri = 'mongodb://localhost:27017/streaming'
var options = {
    server: {
        auto_reconnecdt: true,
        socketOptions: {
            KeepAlive: 1
        },
        poolSize: 20
    }
};
// ========FIN==========================


function OmnipotentCollector() {
    this.params = {
        // delimited: 'length',
        locations: '-180,-90,180,90'
    }
    this.stream = T.stream('statuses/filter', this.params);
}

OmnipotentCollector.prototype.connect = function() {
    // mongoose.connect(uri, options);
    console.log('========== STREAMING: Connect To Passive DB============');
    var con = mongoose.createConnection(uri, options);
    mongoose.connection.on('error', function(err) {
        console.log(err)
    });
    // Reconnect when closed
    // mongoose.connection.on('disconnected', function() {
    //     connect();
    // });
    this.con = con;

    // Build Tweet Model Schema
    this.UserModel = this.con.model('UserModel', UserModelFile.UserModelSchema);
    this.TweetModel = this.con.model('TweetModel', TweetModelFile.TweetModelSchema);
    this.StreamingModel = this.con.model('StreamingModel', StreamingModelFile.StreamingModelSchema);
    // =========FIN============
}

OmnipotentCollector.prototype.infoConnect = function() {
    // mongoose.connect(uri, options);
    console.log('===== INFO: Connect To Passive DB============');
    var con = mongoose.createConnection(uri, options);
    mongoose.connection.on('error', function(err) {
        console.log(err)
    });
    // Reconnect when closed
    // mongoose.connection.on('disconnected', function() {
    //     connect();
    // });
    this.infoCon = con;

    // Build Tweet Model Schema
    this.UserModelInfo = this.infoCon.model('UserModel', UserModelFile.UserModelSchema);
    this.TweetModelInfo = this.infoCon.model('TweetModel', TweetModelFile.TweetModelSchema);
    this.StreamingModelInfo = this.infoCon.model('StreamingModel', StreamingModelFile.StreamingModelSchema);
    // =========FIN============
}

OmnipotentCollector.prototype.exportConnect = function() {
    // mongoose.connect(uri, options);
    console.log('========= EXPORT: Connect To Passive DB============');
    var con = mongoose.createConnection(uri, options);
    mongoose.connection.on('error', function(err) {
        console.log(err)
    });
    // Reconnect when closed
    // mongoose.connection.on('disconnected', function() {
    //     connect();
    // });
    this.exportCon = con;

    // Build Tweet Model Schema
    this.UserModelExport = this.exportCon.model('UserModel', UserModelFile.UserModelSchema);
    this.TweetModelExport = this.exportCon.model('TweetModel', TweetModelFile.TweetModelSchema);
    this.StreamingModelExport = this.exportCon.model('StreamingModel', StreamingModelFile.StreamingModelSchema);
    // =========FIN============
}

OmnipotentCollector.prototype.run = function(self) {
    // Check if already exist one open
    self.StreamingModel.loadByStatus(1, function(err, streamObj) {
        if (streamObj) {
            console.log('Already Exists, Exit');
        }
        else {
            console.log('Create a new Streaming Connection');
            var newStreamObj = new self.StreamingModel();
            self.runStreaming(self, newStreamObj);
        }
    });
}

OmnipotentCollector.prototype.runStreaming = function(self, streamingModel) {
    streamingModel.status = 1;
    streamingModel.save(function(err) {
        if (err) console.log(err);
    });

    self.streamOn(self);
}
OmnipotentCollector.prototype.streamOn = function(self) {
    console.log('===========Connect to Streaming API=============');
    self.stream.keepAlive();
    self.stream.on('disconnect', function(disconnectMessage) {
        console.log(disconnectMessage);
        streamingModel.status = 0;
        streamingModel.end_date = new Date();
        streamingModel.save(function(err) {
            if (err) console.log(err);
        });
    });
    // var ival = 60*1000
    // self.stream.on('reconnect', function (req, res, ival) {
    //     console.log('reconnect. statusCode:', res.statusCode, 'interval:', ival)
    // });
    self.stream.on('connected', function(response) {
        console.log('Connected');
    });
    self.stream.on('warning', function(warning) {
        console.log(warning);
    });
    try {
        self.stream.on('tweet', function(data) {
            var user = new self.UserModel(data.user);
            user._id = data.user.id;
            user.save(function(err) {
                if (err) {
                    if (err.code !== 11000) {
                        console.log(err);
                    }
                }
                else {
                    // console.log('UserID ' + user._id + ' Saved');
                }
            });
            // console.log(data.statuses[index].user);
            var t = new self.TweetModel(data);
            t._id = data.id;
            t.user_id = user._id;
            t.created_at = new Date(data.created_at).toISOString();
            t.save(function(err) {
                if (err) {
                    if (err.code !== 11000) {
                        console.log(err);
                    }
                }
                else {
                    // console.log('Tweet ID: ' + t._id + ' Saved');
                }
            });
        });
    } catch(e) {
        console.log(e);
    }

}
OmnipotentCollector.prototype.stop = function(self) {
    if (!self.con) {
        self.connect();
    }
    self.StreamingModel.loadByStatus(1, function(err, streamObj) {
        if (err) {
            console.log(err);
        }
        if (!streamObj) {
            console.log('No streaming running');
        }
        else {
            async.waterfall([
                function(callback) {
                    streamObj.status = 0;
                    streamObj.end_date = new Date();
                    streamObj.save(function(err) {
                        if (err) console.log(err);
                        callback(null, 'msg');
                    });
                    try {
                        self.stream.stop();
                        console.log('========Streaming API Stopped========');
                    }
                    catch(e) {
                        console.log(e);
                    }
                },
                function(msg, callback) {
                    setTimeout(function() {
                        self.disconnect();
                        callback(null, 'msg');
                    }, 10*1000);
                }], function(err, msg) {
                    // do nothing
             });
        }
    });
}

OmnipotentCollector.prototype.disconnect = function() {
    this.con.close();
    console.log('=========Streaming: disconnect to passive BD==========');
}

OmnipotentCollector.prototype.infoDisconnect = function(self) {
    console.log('===== INFO: Connect To Passive DB============');
    self.infoCon.close();
}

OmnipotentCollector.prototype.exportDisconnect = function() {
    this.exportCon.close();
}

OmnipotentCollector.prototype.getStatus = function(self, cb) {
    // self.infoConnect();
    self.StreamingModelInfo.loadByStatus(1, cb);
}

OmnipotentCollector.prototype.getDBInfo = function(self, cb) {
    async.waterfall([
        function(callback) {
            self.UserModelInfo.count({}, function(err, user_count) {
                callback(null, user_count);
            });
        },
        function(user_count, callback) {
            self.TweetModelInfo.count({}, function(err, tweet_count) {
                callback(null, user_count, tweet_count);
            });
        }
    ], cb);
}

OmnipotentCollector.prototype.exportJson = function(self, cb) {
    async.waterfall([
        function(callback) {
            self.exportConnect();
            setTimeout(function() {
                callback(null, 'msg')
            }, 10*1000);
        },
        function(msg, callback) {
            self.UserModelExport.listToJson({}, function(err, users) {
                var user = {};
                user.users = users;
                var user_filename = './public/tmp/users.json';
                console.log('Writing to: ' + user_filename);
                fs.writeFile(user_filename, JSON.stringify(users, null, 4), function(err) {
                    if(err) {
                      console.log(err);
                    } else {
                      console.log("JSON saved to " + user_filename);
                      callback(null, user_filename);
                    }
                });
            });
        },
        function(user_filename, callback) {
            self.TweetModelExport.listToJson({}, function(err, tweets) {
                var tweet = {};
                tweet.tweets = tweets;
                var tweet_filename = './public/tmp/tweets.json';
                console.log('Writing to: ' + tweet_filename);
                fs.writeFile(tweet_filename, JSON.stringify(tweets, null, 4), function(err) {
                    if(err) {
                      console.log(err);
                    } else {
                      console.log("JSON saved to " + tweet_filename);
                      callback(null, user_filename, tweet_filename);
                    }
                });
            });
        }
    ], cb);
}

module.exports = OmnipotentCollector;