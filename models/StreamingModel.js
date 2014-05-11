var fs = require('fs');
var async = require('async');

var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
    consumerKey: 'a7ZYldOLb4XiG0YTkQro8Qv6r',
    consumerSecret: 'w39aaLvDkcoM54lLNEmOk22JowvchlNYx8M2lUvR4jushklBAZ',
    callback: ' '
});

var mongoose = require('mongoose');
var TweetModel = mongoose.model('TweetModel');


var auth_data = {
    accessToken: '2438437632-X0Ufc7sHAIqsjxk9P8RShFqCYH2fn45O0wMKRvS',
    accessTokenSecret: 'ywqj8lTkrnVAAMXs0bHGgBOeDv9fIA5daR6pXOGJnt7FU',
};

twitter.getStream('sample', {}, auth_data.accessToken, auth_data.accessTokenSecret, function(null, data, ret, res) {
    if (data && data.id && data.coordinates) {
        var t = new TweetModel({
            _id: data.id_str,
            content: data
        });
        t.save(function(err) {
            if (err) {
                console.log(err);
            }
        });
    }
}, function() {console.log('======END======');});
