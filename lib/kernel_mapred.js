var mongoose = require('mongoose');
var utils = require('./utils');
var async = require('async');
var mapreduce = require('mapred')(1);

// Re-import schema and connect to mongoDB
var TweetModelFile = require('../models/TweetModel');
mongoose.model('TweetModel', TweetModelFile.TweetModelSchema);
TweetModel = mongoose.model('TweetModel');

/*
 * Execute time 
 */
var start = new Date().getTime()

exports.run = function(query_data, cb) {
    async.waterfall([
        // get "T" list
        function(callback) {
            /*
            *  Add More criterias here like events
            */
            var options = {
                criteria: {
                    created_at : {
                            "$gt": new Date(query_data.start_date).toISOString(),
                            "$lt": new Date(query_data.end_date).toISOString()
                    }
                }
            };
            TweetModel.list(options, function(err, list) {
                console.log('Number of Tweets affected: ' + list.length);
                console.log('==============Start=============');
                var render_data = {
                    affected: list.length,
                    options: options
                };
                callback(null, list, render_data);
            });
        },
        // for each tweet, find tweets satisfying the query conditions (dt, R)
        // Map Reduce by async.each
        function(list, render_data, callback) {
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
            console.log('=======Make Map==========');
            var map = function(source_tweet, entire_list) {
                var elements = [];
                var position = 0;
                for (var index=0; index<entire_list.length; index++) {
                    if (
                        utils.getDistance({ lat: source_tweet.lat, lng: source_tweet.lng}, {lat: entire_list[index].lat, lng: entire_list[index].lng}) < query_data.r
                        && utils.getTimeDifference(source_tweet.created_at, entire_list[index].created_at) < query_data.dt
                        ) {
                        elements.push([
                            [source_tweet.content.user.id, entire_list[index].content.user.id],
                            [source_tweet, entire_list[index]]
                        ]);
                    }
                }
                return elements;
            };

            var reduce = function(key, values) {
                // We do it in node_module customizing
                // Skip
                return null;
            };

            mapreduce(information, map, reduce, function(results) {
                console.log("Number of elements to calculate: " + results.length);
                callback(null, results, render_data);
            });
        },
        // Manage rough result, group by (u, v)
        function(list, render_data, callback) {
            var end = new Date().getTime();
            var time = end - start;
            console.log("Number of group users obtained: " + list.length);
            console.log("Total calculat time: " + time);
            // render_data
            render_data.groups = list.length;
            render_data.time = time;
            callback(null, list, render_data);
        }
    ], cb);
}

