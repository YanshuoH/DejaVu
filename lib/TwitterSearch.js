var utils = require('./utils');
var async = require('async');
var CronJob = require('cron').CronJob;
var mongoose = require('mongoose');
var UserModelFile = require('../models/UserModel');
var TweetModelFile = require('../models/TweetModel');
var QueryModelFile = require('../models/QueryModel');
UserModel = mongoose.model('UserModel', UserModelFile.UserModelSchema);
TweetModel = mongoose.model('TweetModel', TweetModelFile.TweetModelSchema);
QueryModel = mongoose.model('QueryModel', QueryModelFile.QueryModelSchema);

//==========Build access data for node-twitter-api================
var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
    consumerKey: 'a7ZYldOLb4XiG0YTkQro8Qv6r',
    consumerSecret: 'w39aaLvDkcoM54lLNEmOk22JowvchlNYx8M2lUvR4jushklBAZ',
    callback: ' '
});

var auth_data = {
    accessToken: '2438437632-X0Ufc7sHAIqsjxk9P8RShFqCYH2fn45O0wMKRvS',
    accessTokenSecret: 'ywqj8lTkrnVAAMXs0bHGgBOeDv9fIA5daR6pXOGJnt7FU',
};
//==========FIN=============================
//=========Build access data for twit=================
var Twit = require('twit')

var T = new Twit({
    consumer_key: 'a7ZYldOLb4XiG0YTkQro8Qv6r',
    consumer_secret: 'w39aaLvDkcoM54lLNEmOk22JowvchlNYx8M2lUvR4jushklBAZ',
    access_token: '2438437632-X0Ufc7sHAIqsjxk9P8RShFqCYH2fn45O0wMKRvS',
    access_token_secret: 'ywqj8lTkrnVAAMXs0bHGgBOeDv9fIA5daR6pXOGJnt7FU',
});
//==========FIN============================

var hour = 1000*60*60;
TwitterSearch.prototype.period_data = {};
// Constructor
function TwitterSearch(query_data) {
    // always initialize all instance properties
    this.query_data = query_data;
    this.buildSchedule(this, this.query_data);
    // this.runStreaming(this, false, '');
}

TwitterSearch.prototype.buildSchedule = function(self) {
    this.dateConvertToISOString();
    if (this.query_data.start_date < this.query_data.created_date && this.query_data.end_date < this.query_data.created_date) {
        // search in the past,
        this.makePeriod(0);
        async.eachSeries(this.period_data.times_arr, function(index, iterator_callback) {
            var current = new Date(self.query_data.end_date);
            var until = new Date().setHours(current.getHours() - index * 24);
            var since = new Date().setHours(current.getHours() - (index + 1) * 24);
            var dates = {
                since: new Date(since).Format('yyyy-MM-dd'),
                until: new Date(until).Format('yyyy-MM-dd')
            }
            self.runSearch(self, dates, iterator_callback);
        });
    }
    else if (this.query_data.start_date < this.query_data.created_date && this.query_data.end_date > this.query_data.created_date) {
        // search in the past,
        this.makePeriod(1);
        async.eachSeries(this.period_data.times_arr, function(index, iterator_callback) {
            var current = new Date();
            var until = new Date().setHours(current.getHours() - index * 24);
            var since = new Date().setHours(current.getHours() - (index + 1) * 24);
            var dates = {
                since: new Date(since).Format('yyyy-MM-dd'),
                until: new Date(until).Format('yyyy-MM-dd')
            }
            self.runSearch(self, dates, iterator_callback);
        });
        // search in the future
        this.makePeriod(2);
        this.runStreaming(this, false, '');
        // console.log(this.period_data.crons);
        // for (var index=0; index<this.period_data.crons.length; index++) {
        //     new CronJob(this.period_data.crons[index], function() {
        //         self.runSearch(self, false, '');
        //     }, null, true);
        // }
    }
    else if (this.query_data.start_date > this.query_data.created_date && this.query_data.end_date > this.query_data.created_date) {
        this.makePeriod(3);
        console.log(this.period_data.crons);
        new CronJob(this.period_data.crons[0], function() {
            self.runStreaming(self, false, '');
        });
        // for (var index=0; index<this.period_data.crons.length; index++) {
        //     new CronJob(this.period_data.crons[index], function() {
        //         self.runSearch(self, false, '');
        //     }, null, true);
        // }
    }
}

TwitterSearch.prototype.runStreaming = function(self, dates, iterator_callback) {
    var iterator_callback = iterator_callback || function() {};
    var around = self.makeStreamingLocation();
    var params = {};
    if (self.query_data.events) {
        params.track = self.query_data.events;
    }
    params.locations = around;
    params.filter_level = "medium";
    // console.log(self.query_data);
    console.log('=================Run Streaming==============');
    var index = 0;
    var user_affected = [];
    var stream = T.stream('statuses/filter', params);

    async.waterfall([
        function(callback) {
            stream.on('disconnect', function(disconnectMessage) {
                console.log(disconnectMessage);
            });
            stream.on('tweet', function(data) {
                if (data && data.id && (data.coordinates || data.place)) {
                    var user = new UserModel(data.user);
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
                    if (utils.fetchEvents(self.query_data.events, data.text)) {
                        var t = new TweetModel(data);
                        t._id = data.id;
                        t.user_id = user._id;
                        t.created_at = self.parseTwitterDate(data.created_at);
                        t.save(function(err) {
                            if (err) {
                                if (err.code !== 11000) {
                                    console.log(err);
                                }
                            }
                            else {
                                console.log('Tweet ID: ' + t._id + ' Saved');
                            }
                        });
                        if (user_affected.indexOf(user._id) == -1) {
                            user_affected.push(user._id);
                        }
                    }
                    if (user_affected.length > 0) {
                        callback(null, user_affected);
                    }
                }
            });
        },
        function(user_affected, callback) {
            var query_id = self.query_data.queryObj;
            QueryModel.load(query_id, function(err, queryDoc) {
                if (queryDoc) {
                    queryDoc.users = queryDoc.users.concat(user_affected).unique();
                    queryDoc.save(function(err) {
                        if (err) {
                            console.log(err);
                        }
                        callback(null, 'DONE');
                    });
                }
            });
        }
    ], function(err, msg) {
        // do nothing
    });

    new CronJob(utils.makeCronPattern(self.query_data.end_date), function() {
        stream.stop();
        console.log('=================End Streaming==================');
    }, null, true);
    // async.waterfall([
    //     function(callback) {

    //         twitter.getStream('filter', params, auth_data.accessToken, auth_data.accessTokenSecret, function(err, data, ret, res) {
    //             index ++;
    //             if (err) console.log(err);

    //             if (data && data.id && data.coordinates && data.coordinates.coordinates[0] !== 0 && data.coordinates.coordinates[1] !== 0) {
    //                 var user = new UserModel(data.user);
    //                 user._id = data.user.id;
    //                 user.save(function(err) {
    //                     if (err) {
    //                         if (err.code !== 11000) {
    //                             console.log(err);
    //                         }
    //                     }
    //                     else {
    //                         // console.log('UserID ' + user._id + ' Saved');
    //                     }
    //                 });
    //                 // console.log(data.statuses[index].user);
    //                 if (utils.fetchEvents(self.query_data.events, data.text)) {
    //                     var t = new TweetModel(data);
    //                     t._id = data.id;
    //                     t.user_id = user._id;
    //                     t.created_at = self.parseTwitterDate(data.created_at);
    //                     t.save(function(err) {
    //                         if (err) {
    //                             if (err.code !== 11000) {
    //                                 console.log(err);
    //                             }
    //                         }
    //                         else {
    //                             console.log('Tweet ID: ' + t._id + ' Saved');
    //                         }
    //                     });
    //                     if (user_affected.indexOf(user._id) == -1) {
    //                         user_affected.push(user._id);
    //                     }
    //                 }
    //                 if (user_affected.length > 0) {
    //                     callback(null, user_affected);
    //                 }
    //             }
    //         }, function(params) {
    //             // End condition
    //             console.log(self.query_data);
    //         });
    //     },
    //     function(user_affected, callback) {
    //         var query_id = self.query_data.queryObj;
    //         QueryModel.load(query_id, function(err, queryDoc) {
    //             if (queryDoc) {
    //                 queryDoc.users = queryDoc.users.concat(user_affected).unique();
    //                 queryDoc.save(function(err) {
    //                     if (err) {
    //                         console.log(err);
    //                     }
    //                     callback(null, 'DONE');
    //                 });
    //             }
    //         });
    //     }
    // ], function(err, msg) {
    //     // Do nothing
    // });
}

// class methods
TwitterSearch.prototype.runSearch = function(slef, dates, iterator_callback) {
    var iterator_callback = iterator_callback || function() {};
    if (dates) {
        // Already built in schedule function
        // means in the past
    }
    else {
        var current = new Date();
        var since = new Date(current).setHours(current.getHours() - 4);

        var dates = {
            until: new Date(current).Format("yyyy-MM-dd"),
            since: new Date(since).Format("yyyy-MM-dd")
        };
    }

    var params = {
        q: ' ',
        since: dates.since,
        until: dates.until,
        count: 100,
        geocode: slef.makeGeocodeQuery()
        // result_type: 'mixed'
    };
    if (params.since == params.until) {
        delete params.until;
    }

    if (slef.query_data.events) {
        params.q = slef.query_data.events;
    }
    slef.queryTwitterAPI(slef, params, iterator_callback);
};

TwitterSearch.prototype.queryTwitterAPI = function(self, params, iterator_callback) {
    twitter.search(params, auth_data.accessToken, auth_data.accessTokenSecret, function(err, data, response) {
        console.log('===============Data Length================');
        console.log(data.statuses.length);
        if (err) {
            console.log(err);
        }
        if (data.statuses.length == 0) {
            console.log(data);
        }
        else {
            console.log('============Run TwitterSearch================');
            if (typeof(data.statuses) !== 'undefined' && data.statuses.length > 0) {
                var user_affected = [];
                // 1. Store User Info
                // 2. Store Tweet Info with geo tag
                console.log(data.search_metadata);
                async.waterfall([
                    function(callback) {
                        for (var index=0; index<data.statuses.length; index++) {
                            var user = new UserModel(data.statuses[index].user);
                            user._id = data.statuses[index].user.id;
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
                            if (data.statuses[index].place || data.statuses[index].coordinates) {
                                var t = new TweetModel(data.statuses[index]);
                                t._id = data.statuses[index].id;
                                t.user_id = user._id;
                                t.save(function(err) {
                                    if (err) {
                                        if (err.code !== 11000) {
                                            console.log(err);
                                        }
                                    }
                                    else {
                                    }
                                });
                                if (user_affected.indexOf(user._id) == -1) {
                                    user_affected.push(user._id);
                                }
                            }
                        }
                        callback(null, user_affected);
                    },
                    function(user_affected, callback) {
                        var query_id = self.query_data.queryObj;
                        QueryModel.load(query_id, function(err, queryDoc) {
                            if (queryDoc) {
                                queryDoc.users = queryDoc.users.concat(user_affected).unique();
                                queryDoc.save(function(err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    callback();
                                });
                            }
                        });
                    }
                ], function() {
                    if (typeof(iterator_callback) !== 'undefined') {
                        iterator_callback();
                    }
                });
            }
            if (typeof(data.search_metadata.next_results) !== 'undefined') {
                params.max_id = utils.parseQueryString(data.search_metadata.next_results).max_id;
                self.queryTwitterAPI(self, params);
            }
        }
    });
}

TwitterSearch.prototype.dateConvertToISOString = function() {
    this.query_data.created_date = new Date(this.query_data.created_date).toISOString();
    this.query_data.start_date = new Date(this.query_data.start_date).toISOString();
    this.query_data.end_date = new Date(this.query_data.end_date).toISOString();
}

TwitterSearch.prototype.makePeriod = function(cases) {
    if (cases == 0) {
        var start_date = new Date(this.query_data.start_date).getTime();
        var end_date = new Date(this.query_data.end_date).getTime();
        var diff = end_date - start_date;
        var ecart = 0;
    }
    else if (cases == 1) {
        var start_date = new Date(this.query_data.start_date).getTime();
        var created_date = new Date(this.query_data.created_date).getTime();
        var diff = created_date - start_date;
        var ecart = 0;
    }
    else if (cases == 2) {
        var created_date = new Date(this.query_data.created_date).getTime();
        var end_date = new Date(this.query_data.end_date).getTime();
        var diff = end_date - created_date;
        var crons = [];
        for (var index=0; index<=(diff/(hour*4) + 1); index++) {
            var cronDate = new Date(this.query_data.created_date).getTime() + 4 * index * hour;
            if (cronDate > end_date) {
                cronDate = end_date;
            }
            var cronPattern = utils.makeCronPattern(cronDate);
            crons.push(cronPattern);
        }
    }
    else if (cases == 3) {
        var start_date = new Date(this.query_data.start_date).getTime();
        var end_date = new Date(this.query_data.end_date).getTime();
        var diff = end_date - start_date;
        var crons = [];
        for (var index=0; index<=(diff/(hour*4) + 1); index++) {
            var cronDate = new Date(this.query_data.start_date).getTime() + 4 * index * hour;
            if (cronDate > end_date) {
                cronDate = end_date;
            }
            var cronPattern = utils.makeCronPattern(cronDate);
            crons.push(cronPattern);
        }
    }
    if (cases == 0 || cases == 1) {
        var times_arr = []
        for (var index=0; index<=(diff/(hour*24)); index++) {
            times_arr.push(index);
        }
        this.period_data = {
            times_arr : times_arr
        }
    }
    else {
        this.period_data = {
            times: diff / (hour*4),
            crons: crons
        };
    }
}

TwitterSearch.prototype.makeGeocodeQuery = function() {
    var geoQuery = this.query_data.geocode.replace('(', '');
    geoQuery = geoQuery.replace(')', '');
    geoQuery = geoQuery.replace(' ', '');
    geoQuery += ',' + this.query_data.radius + 'km'
    return geoQuery;
}

TwitterSearch.prototype.makeStreamingLocation = function() {
    var geoQuery = this.query_data.geocode.replace('(', '');
    geoQuery = geoQuery.replace(')', '');
    geoQuery = geoQuery.replace(' ', '');
    geoQuery = geoQuery.split(',');
    var around = utils.getAround([geoQuery[1], geoQuery[0]], this.query_data.r);
    var around_arr = [];
    around_arr.push(around.minLng);
    around_arr.push(around.minLat);
    around_arr.push(around.maxLng);
    around_arr.push(around.maxLat);
    return around_arr.join(',');
}

TwitterSearch.prototype.parseTwitterDate = function (str) {
    return new Date(str).toISOString();
} 
// ============================
module.exports = TwitterSearch;