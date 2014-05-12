/*
{ _csrf: 'IACJHXqYI4dMal9n7MdV+waLxYpQkPXdu4+J0=',
  event_type: 'at',
  event_name: 'x',
  start_date: '05/12/2014',
  end_date: '05/12/2014',
  dt: '1',
  r: '1' }
*/
var utils = require('./utils');
var async = require('async');
var mapreduce = require('mapred')();

var mongoose = require('mongoose');
var TweetModel = mongoose.model('TweetModel');

exports.run = function(query_data, cb) {
    async.waterfall([
        // get "T" list
        function(callback) {
            /*
            *  Add More criterias here like events
            */
            var options = {
                criteria: {
                    "created_at" : {
                            "$gt": new Date(query_data.start_date).toISOString(),
                            "$lt": new Date(query_data.end_date).toISOString()
                        }
                    }
            };
            TweetModel.list(options, function(err, list) {
                console.log('Number of Tweets affected: ' + list.length);
                callback(null, list);
            });
        },
        // for each tweet, find tweets satisfying the query conditions
        // Map Reduce
        function(list, callback) {
            var result = [];
            var index = 0;
            // Calculate distance for lng and lon
            // I prefer not to query the db which sucks the ROM of server
            // Map-Reduce
            async.each(list, function(tweet_source, iterator_callback) {
                index ++;
                var list_per_tweet = computeDistanceFromList(query_data, tweet_source, list);
                result = result.concat(list_per_tweet);
            });
            console.log("Number of elements to calculate: " + result.length);
            callback(null, result);
        },
        // Manage rough result, group by (u, v)
        function(rough_list) {
            var result = [
                // {users: [u_user, v_user], tweets: [[u_tweet, v_tweet]]}
            ];
            for (var index=0; index<rough_list.length; index++) {
                // 1.check user(u, v)
                var element = rough_list[index];
                var user_position = utils.checkUserExisting(element, result);
                if (user_position > -1) {
                    // TODO: 2.check tweets(u, v)
                    result[user_position].tweets.push([element.u.content, element.v.content]);
                }
                else {
                    result.push({
                        users: [element.u.content.user.id, element.v.content.user.id],
                        tweets: [[element.u.content, element.v.content]]
                    })
                }
            }
            console.log("Number of group users obtained: " + result.length);
        }
    ], cb)
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
