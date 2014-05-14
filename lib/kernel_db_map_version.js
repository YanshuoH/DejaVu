var utils = require('./utils');
var async = require('async');

var mongoose = require('mongoose');
var TweetModel = mongoose.model('TweetModel');

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
                var render_data = {
                    affected: list.length,
                    options: options
                };
                callback(null, list, render_data);
            });
        },
        // for each tweet, find tweets satisfying the query conditions
        // Map Reduce by async.each
        function(list, render_data, callback) {
            var result = [];
            var index = 0;
            // Calculate distance for lng and lon
            // Version of querying db
            var options = render_data.options;
            async.waterfall([
                function(waterfall_callback) {
                    // Map reduce
                    async.map(list, function(tweet_source, map_callback) {
                        var around = utils.getAround(tweet_source.coordinates.coordinates, query_data.r);
                        // Prepare query data
                        options.criteria.lat = {"$gt": around.minLat, "$lt": around.maxLat};
                        options.criteria.lng = {"$gt": around.minLng, "$lt": around.maxLng};
                        // console.log(options.criteria);
                        TweetModel.list(options, function(err, rough_list_per_tweet) {
                            if (err) console.log(err);
                            index++;
                            console.log(index);
                            map_callback(null, rough_list_per_tweet);
                        });
                    }, function(err, rough_list) {
                        if (err) console.log(err);
                        console.log('=================');
                        console.log(rough_list.length);
                        // Execution time
                        var end = new Date().getTime();
                        var time = end - start;
                        console.log('Execution time: ' + time);
                    });
                }
            ], function(err, result) {
                // I prefer not to query the db which sucks the ROM of server
                // Map-Reduce
                /*
                async.each(list, function(tweet_source, iterator_callback) {
                    index ++;
                    var list_per_tweet = computeDistanceFromList(query_data, tweet_source, list);
                    result = result.concat(list_per_tweet);
                });
                */
                console.log("Number of elements to calculate: " + result.length);
                render_data.elements = result.length;
                callback(null, result, render_data);
            });

        },
        // Manage rough result, group by (u, v)
        function(rough_list, render_data, callback) {
            var result = [
                // {users: [u_user, v_user], tweets: [[u_tweet, v_tweet]]}
            ];
            for (var index=0; index<rough_list.length; index++) {
                // 1.check user(u, v)
                var element = rough_list[index];
                var user_position = utils.checkUserExisting(element, result);
                if (user_position > -1) {
                    // 2.check tweets(u, v)
                    if (utils.checkTweetExisting(element, result[user_position].tweets) > -1) {
                        // do nothing
                    }
                    else {
                        result[user_position].tweets.push([element.u.content, element.v.content]);
                    }
                }
                else {
                    result.push({
                        users: [element.u.content.user.id, element.v.content.user.id],
                        tweets: [[element.u.content, element.v.content]]
                    })
                }
            }
            console.log("Number of group users obtained: " + result.length);

            // render_data
            render_data.groups = result.length;
            callback(null, result, render_data);
        }
    ], function() {console.log("=======END=====");})
}


// "coordinates": [longitude, latitude]
function computeDistanceFromList(query_data, tweet_source, list) {
    var result = []
    var index = 0;
    async.each(list, function(tweet_target, iterator_callback) {
        // Do not compute for itself
        if (tweet_source._id == tweet_target._id) {
            return;
        }
        // And not compute its proper user
        if (tweet_source.content.user.id.toString() == tweet_target.content.user.id.toString()) {
            return ;
        }
        var point_source = {
            lat: tweet_source.coordinates.coordinates[1],
            lng: tweet_source.coordinates.coordinates[0],
        };
        var point_target = {
            lat: tweet_target.coordinates.coordinates[1],
            lng: tweet_target.coordinates.coordinates[0],
        };
        var d = utils.getDistance(point_source, point_target);
        if (d <= query_data.r) {
            var element = {u: tweet_source, v: tweet_target, d: d};
            result.push(element);
        }
        index++;
    });
    return result;
}
