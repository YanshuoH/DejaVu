// Kernel
var utils = require('./utils');
var geoUtils = require('geojson-utils');
var async = require('async');
var mapreduce = require('mapred')(1);
var mongoose = require('mongoose');
var CronJob = require('cron').CronJob;
var TweetModel = mongoose.model('TweetModel');
var UserModel = mongoose.model('UserModel');
var QueryModel = mongoose.model('QueryModel');
var ResultModel = mongoose.model('ResultModel');

var hour = 1000*60*60;


function Kernel(query_data, result_id) {
    this.query_data = query_data;
    this.result_id = result_id;
}

Kernel.prototype.buildSchedule = function(self) {
    this.dateConvertToISOString();
    console.log('==============Kernel Build Schedule==================');
    if (this.query_data.start_date < this.query_data.created_date && this.query_data.end_date < this.query_data.created_date) {
        // search in the past,
        this.makePeriod(0);
        // Use still series to avoid crashing DB
        // More time, much Safer
        console.log(this.period_data.times_arr);
        async.eachSeries(this.period_data.times_arr, function(index, iterator_callback) {
            var current = new Date(self.query_data.end_date);
            var until = new Date().setHours(current.getHours() - index * 24);
            var since = new Date().setHours(current.getHours() - (index + 1) * 24);
            var dates = {
                since: since,
                until: until
            }
            self.runKernel(self, dates, iterator_callback);
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
                since: since,
                until: until
            }
            self.runKernel(self, dates, iterator_callback);
        });
        // search in the future
        this.makePeriod(2);
        console.log(this.period_data.crons);
        for (var index=0; index<this.period_data.crons.length; index++) {
            new CronJob(this.period_data.crons[index], function() {
                self.runKernel(self, false, '');
            }, null, true);
            // setTimeout(function() {
            //     self.runKernel(self, false, '');
            // }, index * 24 * hour);
        }
    }
    else if (this.query_data.start_date > this.query_data.created_date && this.query_data.end_date > this.query_data.created_date) {
        // search in the future
        this.makePeriod(3);
        console.log(this.period_data.crons);
        for (var index=0; index<this.period_data.crons.length; index++) {
            new CronJob(this.period_data.crons[index], function() {
                self.runKernel(self, false, '');
            }, null, true);
        }
    }
}

Kernel.prototype.runKernel = function(self, dates, iterator_callback) {
    var iterator_callback = iterator_callback || function() {};
    if (dates) {
        // Already built in schedule function
        // means in the pas
    }
    else {
        // in the future
        var current = new Date();
        var since = new Date(current).setHours(current.getHours() - 24);

        var dates = {
            until: current,
            since: since,
        };
    }
    async.waterfall([
        function(callback) {
            console.log('==============Start Kernel==============');
            console.log('Since: ' + new Date(dates.since));
            console.log('Until: ' + new Date(dates.until));
            // Load query doc
            QueryModel.load(self.query_data._id, function(err, queryObj) {
                if (err) {
                    console.log(err);
                }
                callback(null, queryObj);
            });
        },
        function(queryObj, callback) {
            // According to user and dates, load tweets
            // Convert dates into seconds
            dates.until = dates.until + queryObj.dt;
            dates.since = dates.since - queryObj.dt;
            var options = {
                where: {
                    field: 'user_id',
                    value: queryObj.users
                },
                criteria: {
                    created_at: {
                        "$gt": new Date(dates.since).toISOString(),
                        "$lt": new Date(dates.until).toISOString()
                    }
                }
            };
            TweetModel.list(options, function(err, list) {
                if (err) {
                    console.log(err);
                }
                console.log('Number of tweets affected: ' + list.length);
                callback(null, queryObj, list)
            });
        },
        function(queryObj, list, callback) {
            var information = [];
            var result = [];
            var user_pair = [];
            var index = 0;
            for (var index=0; index<list.length; index++) {
                information.push([
                    list[index],
                    list
                ]);
            }
            console.log('========Make Map========');
            var map = function(source_tweet, entire_list) {
                var elements = [];
                var position = 0;
                for (var index=0; index<entire_list.length; index++) {
                    if (source_tweet._id == entire_list[index]._id) {
                        continue;
                    }
                    // extract geocode
                    var source_geocode = self.extractGeocode(source_tweet);
                    var target_geocode = self.extractGeocode(entire_list[index]);
                    if (
                        utils.getDistance(source_geocode, target_geocode) < queryObj.r
                        && utils.getTimeDifference(source_tweet.created_at, entire_list[index].created_at) < queryObj.dt
                    ) {
                        elements.push([
                            [source_tweet.user_id, entire_list[index].user_id],
                            [{
                                id: source_tweet._id,
                                user_id: source_tweet.user_id,
                                lat: source_geocode.lat,
                                lng: source_geocode.lng,
                                text: source_tweet.text,
                                created_at: source_tweet.created_at
                            }, {
                                id: entire_list[index]._id,
                                user_id: entire_list[index].user_id,
                                lat: target_geocode.lat,
                                lng: target_geocode.lng,
                                text: entire_list[index].text,
                                created_at: entire_list[index].created_at
                            }]
                        ]);
                    }
                }
                return elements;
            }

            var reduce = function(key, values) {
                return null;
            }

            mapreduce(information, map, reduce, function(results) {
                console.log("Number of group uesrs obtained: " + results.length);
                callback(null, queryObj, results);
            });
        }
    ], function(err, queryObj, results) {
        if (results.length == 0) {
            iterator_callback();
        }
        ResultModel.load(self.result_id, function(err, resultObj) {
            if (err) {
                console.log(err);
            }
            if (resultObj) {
                // make transation doc and push into result obj
                var resultDoc = {
                    calculat_time: new Date(),
                    groups: results
                };
                resultObj.results.push(resultDoc);

                var until = new Date(self.query_data.end_date);
                until = until.setHours(until.getHours(), until.getMinutes(), 0, 0);
                var current = new Date().setHours(new Date().getHours(), new Date().getMinutes(), 0, 0);
                if (current >= until) {
                    console.log('==========Kernel task finished===========');
                    resultObj.status = 2;
                }
                resultObj.save(function(err) {
                    if (err) {
                        console.log(err);
                    }
                    if (iterator_callback) {
                        iterator_callback();
                    }
                });
            }
        });
        // hehe
    });
}

Kernel.prototype.makePeriod = function(cases) {
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
        for (var index=0; index<=(diff/(hour*24) + 1); index++) {
            var cronDate = new Date(this.query_data.created_date).getTime() + (24 * index * hour);
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
        var created_date = new Date(this.query_data.created_date).getTime();
        var diff = end_date - start_date;
        var crons = [];
        for (var index=0; index<=(diff/(hour*24) + 1); index++) {
            var cronDate = new Date(this.query_data.start_date).getTime() + (24 * index * hour);
            if (cronDate > end_date) {
                cronDate = end_date;
                console.log(new Date(cronDate));
            }
            var cronPattern = utils.makeCronPattern(cronDate);
            crons.push(cronPattern);
        }
    }
    if (cases == 0 || cases == 1) {
        var times_arr = []
        for (var index=0; index<(diff/(hour*24)); index++) {
            times_arr.push(index);
        }
        this.period_data = {
            times_arr : times_arr
        }
    }
    else {
        this.period_data = {
            times: diff / (hour*24),
            crons: crons
        };
    }
}

Kernel.prototype.dateConvertToISOString = function() {
    this.query_data.created_date = new Date(this.query_data.created_date).toISOString();
    this.query_data.start_date = new Date(this.query_data.start_date).toISOString();
    this.query_data.end_date = new Date(this.query_data.end_date).toISOString();
}

Kernel.prototype.extractGeocode = function(tweet) {
    if (tweet.coordinates) {
        return {
            lng: tweet.coordinates.coordinates[0],
            lat: tweet.coordinates.coordinates[1]
        }
    }
    else {
        var point = geoUtils.rectangleCentroid({
            coordinates: tweet.place.bounding_box.coordinates
        });
        return {
            lat: point[0],
            lng: point[1]
        }
    }
}

// ===========================
module.exports = Kernel;