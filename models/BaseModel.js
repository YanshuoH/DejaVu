// BaseModel

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TweetModel = require('../models/TweetModel');
// var getStreaming = require('../lib/getStreaming');
// getStreaming.run(function() {
    // console.log('=============End getStreaming=====================');
// });


var kernel = require('../lib/kernel');
var query_data = {
    _csrf: 'IACJHXqYI4dMal9n7MdV+waLxYpQkPXdu4+J0=',
    event_type: 'at',
    event_name: 'x',
    start_date: '05/12/2014 13:02',
    end_date: '05/12/2014 13:03',
    dt: '1',
    r: '10'
};
kernel.run(query_data, function(err, results) {
    console.log('=============DONE==============');
});