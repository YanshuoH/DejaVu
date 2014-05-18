var utils = require('./utils');
var async = require('async');
var mongoose = require('mongoose');
var UserModelFile = require('../models/UserModel');
var TweetModelFile = require('../models/TweetModel');
var QueryModelFile = require('../models/QueryModel');
UserModel = mongoose.model('UserModel', UserModelFile.UserModelSchema);
TweetModel = mongoose.model('TweetModel', TweetModelFile.TweetModelSchema);
QueryModel = mongoose.model('QueryModel', QueryModelFile.QueryModelSchema);

//==========Build access data================
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

// { _csrf: '5ADqo0kEnnnTE7K10gToRZjgdw2I22N+vimdM=',
//   event_type: 'at',
//   event_name: 'man',
//   start_date: '05/17/2014 00:00',
//   end_date: '05/18/2014 11:37',
//   dt: '1000',
//   r: '1000',
//   location: '69 Avenue des Lombards, 10000 Troyes, France',
//   radius: '100' }

var hour = 1000*60*60;
TwitterSearch.prototype.period_data = {};
// Constructor
function TwitterSearch(query_data) {
    // always initialize all instance properties
    this.query_data = query_data;
    this.buildSchedule(this, this.query_data);
}

TwitterSearch.prototype.buildSchedule = function(self) {
    this.dateConvertToISOString();
    if (this.query_data.start_date < this.query_data.created_date && this.query_data.end_date < this.query_data.created_date) {
        var dates = {
            until: new Date(this.query_data.created_date).Format("yyyy-MM-dd"),
            since : new Date(this.query_data.start_date).Format("yyyy-MM-dd")
        };
        this.runSearch(this, dates);
    }
    else if (this.query_data.start_date < this.query_data.created_date && this.query_data.end_date > this.query_data.created_date) {
        // search in the past,
        var dates = {
            until: new Date().Format("yyyy-MM-dd"),
            since : new Date(this.query_data.start_date).Format("yyyy-MM-dd")
        };
        this.runSearch(this, dates);
        // search in the future
        this.makePeriod(2);
        for (var index=1; index<this.period_data.times; index++) {
            setTimeout(function() {
                self.runSearch(self, false)
            }, index * 4 * hour);
        }

    }
    else if (this.query_data.start_date > this.query_data.created_date && this.query_data.end_date > this.query_data.created_date) {
        this.makePeriod(3);
        this.period_data.ecart = 1;
        for (var index=1; index<this.period_data.times; index++) {
            setTimeout(function() {
                self.runSearch(self, false)
            }, 4 * hour * index + this.period_data.ecart);
        }
    }
}

// class methods
TwitterSearch.prototype.runSearch = function(slef, dates) {
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
        since: dates.since,
        until: dates.until,
        count: 100,
        geocode: slef.makeGeocodeQuery()
        // result_type: 'mixed'
    };

    if (!slef.query_data.event_name) {
        // params.q = "a OR e OR i OR OR o OR u";
    }
    slef.queryTwitterAPI(slef, params);
};

TwitterSearch.prototype.queryTwitterAPI = function(self, params) {
    twitter.search(params, auth_data.accessToken, auth_data.accessTokenSecret, function(err, data, response) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('============Run TwitterSearch================');
            if (typeof(data.statuses) !== 'undefined' && data.statuses.length > 0) {
                var user_affected = [];
                // 1. Store User Info
                // 2. Store Tweet Info with geo tag
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
                                console.log(queryDoc.users);
                                queryDoc.save(function(err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                            }
                        });
                        callback();
                    }
                ], function() {
                    // do nothing
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
    if (cases == 2) {
        var created_date = new Date(this.query_data.created_date).getTime();
        var end_date = new Date(this.query_data.end_date).getTime();
        var diff = end_date - created_date;
        var ecart = 0;
    }
    else if (cases == 3) {
        var start_date = new Date(this.query_data.start_date).getTime();
        var end_date = new Date(this.query_data.end_date).getTime();
        var created_date = new Date(this.query_data.created_date).getTime();
        var diff = end_date - created_date;
        var ecart = start_date - created_date;
    }
    this.period_data = {
        times: diff / (hour*4),
        ecart: ecart
    };
}

TwitterSearch.prototype.makeGeocodeQuery = function() {
    var geoQuery = this.query_data.geocode.replace('(', '');
    geoQuery = geoQuery.replace(')', '');
    geoQuery = geoQuery.replace(' ', '');
    geoQuery += ',' + this.query_data.radius + 'km'
    return geoQuery;
}
// export the 
module.exports = TwitterSearch;