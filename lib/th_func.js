var utils = require('./utils');

var th_func = function() {
    console.log('======Create a thread=======');

    var buffer = JSON.parse(thread.buffer.toString());
    var computeChildListTweets = function(child_list, list, query_data) {
        var child_result = [];
        for (var index=0; index<child_list.length; index++) {
            var tweet_source = child_list[index];
            var list_per_tweet = computeDistanceFromList(query_data, tweet_source, list);
            child_result.push({
                tweet_source: tweet_source,
                list_per_tweet: list_per_tweet
            });
        }

        return child_result;
    }
    // "coordinates": [longitude, latitude]
    function computeDistanceFromList(query_data, tweet_source, list) {
        var result = []
        var index = 0;
        for (var i=0; i<list.length; i++) {
            var tweet_target = list[i];
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
            var d = getDistance(point_source, point_target);
            if (d <= query_data.r) {
                var element = {u: tweet_source, v: tweet_target, d: d};
                result.push(element);
            }
            index++;
        }

        return result;
    }
    function getDistance(source, target) {
        var R = 6371;
        var dLat = deg2rad(target.lat - source.lat);
        var dLng = deg2rad(target.lng - source.lng);
        var a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(source.lat)) * Math.cos(deg2rad(target.lat)) *
            Math.sin(dLng/2) * Math.sin(dLng/2);

        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c; // Distance in km

        return d;
    }

    function deg2rad(deg) {
      return deg * (Math.PI/180)
    }


    thread.end(computeChildListTweets(buffer.source_list, buffer.target_list, buffer.query_data));
}

exports.th_func = th_func;
