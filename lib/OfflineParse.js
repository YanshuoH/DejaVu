// offline parse 
var fs = require('fs');
var utils = require('./utils');
var async = require('async');
var geoUtils = require('geojson-utils');
var CronJob = require('cron').CronJob;
var mongoose = require('mongoose');

var TweetModel = mongoose.model('TweetModel');
var UserModel = mongoose.model('UserModel');
var QueryModel = mongoose.model('QueryModel');
var ResultModel = mongoose.model('ResultModel');

function OfflineParse(query_data, content) {
    // always initialize all instance properties
    this.query_data = query_data;
    try {
        this.content = JSON.parse(content);
    } catch (e) {
        console.log(e);
        this.content = false;
    }
    this.buildSchedule(this);
}

OfflineParse.prototype.period_data = {};

OfflineParse.prototype.buildSchedule = function(self) {
    this.dateConvertToISOString();
    if (this.query_data.start_date <= this.query_data.created_date && this.query_data.end_date <= this.query_data.created_date) {
        // search in the past,
        var dates = {
            since: new Date(new Date(this.query_data.start_date) - self.query_data.dt),
            until: new Date(new Date(this.query_data.end_date) + self.query_data.dt)
        }
        self.runParse(self, dates);
    }
}

OfflineParse.prototype.runParse = function(self, dates) {
    console.log('==========Start Offline Parse File============');
    async.waterfall([
        function(callback) {
            var user_affected = [];
            var tweet_affected = [];
            var data = self.content;
            for (var index=0; index<data.length; index++) {
                if (typeof(data[index].coordinates) == 'undefined' || data[index].coordinates == null) {
                    continue;
                }
                var user = new UserModel(data[index].user);
                user._id = data[index].user.id;
                user.save(function(err) {
                    if (err && err.code !== 11000) {
                        console.log(err);
                    }
                });
                var t = new TweetModel(data[index]);
                t._id = data[index].id
                t.user_id = user._id;
                t.save(function(err) {
                    if (err && err.code !== 11000) {
                        console.log(err);
                    }
                });
                if (user_affected.indexOf(user._id) == -1) {
                    user_affected.push(user._id);
                }
                if (tweet_affected.indexOf(t._id) == -1) {
                    tweet_affected.push(t._id);
                }
            }
            callback(null, user_affected, tweet_affected);
        },
        function(user_affected, tweet_affected, callback) {
            var query_id = self.query_data.queryObj;
            QueryModel.load(query_id, function(err, queryDoc) {
                if (queryDoc) {
                    queryDoc.users = queryDoc.users.concat(user_affected).unique();
                    queryDoc.tweets = queryDoc.tweets.concat(tweet_affected).unique();
                    queryDoc.save(function(err) {
                        if (err) {
                            console.log(err);
                        }
                        callback();
                    });
                }
            });
        }
    ],function() {
        // Do nothing
    });
}

OfflineParse.prototype.makePeriod = function(cases) {
    if (cases == 0) {
        var start_date = new Date(this.query_data.start_date).getTime();
        var end_date = new Date(this.query_data.end_date).getTime();
        var diff = end_date - start_date;
        var ecart = 0;
    }
    if (cases == 0) {
        var times_arr = []
        for (var index=0; index<=(diff/(hour*24)); index++) {
            times_arr.push(index);
        }
        this.period_data = {
            times_arr : times_arr
        }
    }
}

OfflineParse.prototype.dateConvertToISOString = function() {
    this.query_data.created_date = new Date(this.query_data.created_date).toISOString();
    this.query_data.start_date = new Date(this.query_data.start_date).toISOString();
    this.query_data.end_date = new Date(this.query_data.end_date).toISOString();
}

// ============================
module.exports = OfflineParse;