var mongoose = require('mongoose');
var TweetModel = mongoose.model('TweetModel');
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

exports.run = function run(cb) {
    params = {
        locations: '-180,-90,180,90',
        delimited: 3000
    }
    console.log('===========Run getStreaming===================');
    twitter.getStream('filter', params, auth_data.accessToken, auth_data.accessTokenSecret, function(err, data, ret, res) {
        // We only process datas with coordinates (geometry)
        if (data && data.id && data.coordinates) {
            console.log('Tweet Id: ' + data.id.toString());
            var t = new TweetModel({
                _id: data.id.toString(),
                content: data
            });
            t.save(function(err) {
                if (err) {
                    console.log(err);
                }
                console.log('Tweet Id: ' + data.id.toString() + ' SAVED');
            });
        }
    }, cb);
}
