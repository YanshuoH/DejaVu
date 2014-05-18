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

// Constructor
function TwitterSearch(query_data) {
  // always initialize all instance properties
  this.query_data = query_data;
}

// class methods
TwitterSearch.prototype.runSearch = function() {
    console.log(this.query_data);
};

// export the class
module.exports = TwitterSearch;