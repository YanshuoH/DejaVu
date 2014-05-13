// BaseModel

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TweetModel = require('../models/TweetModel');
var getStreaming = require('../lib/getStreaming');
/*
 * Execute time 
 */
// var start = new Date().getTime()
// getStreaming.run(function() {
    // console.log('=============End getStreaming=====================');
    // var end = new Date().getTime();
    // var time = end - start;
    // console.log('Execution time: ' + time);
// });


var kernel = require('../lib/kernel');
var query_data = {
    _csrf: 'IACJHXqYI4dMal9n7MdV+waLxYpQkPXdu4+J0=',
    event_type: 'at',
    event_name: 'x',
    start_date: '05/13/2014 15:05',
    end_date: '05/13/2014 15:08',
    dt: '1',
    r: '1000'
};
kernel.run(query_data, function(err, results, render_data) {
    console.log('=============DONE==============');
});

