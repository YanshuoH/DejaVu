// BaseModel

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var utils = require('../lib/utils');
var QueryModel = require('../models/QueryModel');
var TweetModel = require('../models/TweetModel');

var TwitterSearch = require('../lib/TwitterSearch');


// var data = {
//   event_type: 'at',
// //   event_name: 'man',
//   start_date: '05/15/2014 00:00',
//   end_date: '05/20/2014 11:39',
//   dt: '1000',
//   r: '1000',
//   location: 'Paris, France',
//   geocode : '(48.856614, 2.3522219000000177)',
//   created_date: new Date(),
//   radius: '1000'}

// var QueryModel = mongoose.model('QueryModel');

// var q = new QueryModel(data);
// q.users = [];
// q.save(function(err) {
//     if (err) {
//         var err_info = utils.errors(err);
//     }
//     else {
//         data.queryObj = q._id;
//         // Run TwitterSearch utils, add schedule in process
//         var ts = new TwitterSearch(data);
//     }
// });


// var getStreaming = require('../lib/getStreaming');
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
