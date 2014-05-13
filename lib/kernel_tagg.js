var utils = require('./utils');
var async = require('async');
var tagg2 = require('tagg2');
var th_func = require('./th_func');
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
        function(list, render_data, callback) {
            var result = [];
            var index = 0;

            // Failed to use MongoDB natural map-reduce
            // Multi-thread use tagg2 pool to achieve map-reduce
            // Slice array list by 200 tweets
            // Otherwise, the core dump
            var p_list = list.partition(parseInt(list.length/3));
            // Make a cluster array, this is a-priori algo
            var p_result = [];
            for (var i=0; i<p_list.length; i++) {
                for (var j=0; j<p_list.length; j++) {
                    p_result.push([p_list[i], p_list[j]]);
                }
            }

            async.map(p_result, function(list, callback){
                var buf = {
                    query_data: query_data,
                    source_list: list[0],
                    target_list: list[1]
                }
                buf = JSON.stringify(buf);
                buffer = new Buffer(buf);
                var thread = tagg2.create(th_func.th_func, { buffer:buffer }, function(err, res){
                    if(err) console.log(err);
                    callback(null, res);  
                });
            }, function(err, result) {
                console.log("Number of elements to calculate: " + result.length);
                render_data.elements = result.length;
                async.each(result, function(child_result, callback){
                    console.log(child_result);
                });
                // callback(null, result, render_data);
            });
        },
        // Manage rough result, group by (u, v)
        function(rough_list, render_data, callback) {
            var end = new Date().getTime();
            var time = end - start;
            console.log('Number of elements - Execution time: ' + time);

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
