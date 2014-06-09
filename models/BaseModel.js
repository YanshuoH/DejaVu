// BaseModel

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var utils = require('../lib/utils');
var UserModel = require('../models/UserModel');
var QueryModel = require('../models/QueryModel');
var TweetModel = require('../models/TweetModel');
var ResultModel = require('../models/ResultModel');

var OfflineSearch = require('../lib/OfflineSearch');
var TwitterSearch = require('../lib/TwitterSearch');
var Kernel = require('../lib/Kernel');

// var async = require('async');
// var QueryModel = mongoose.model('QueryModel');
// var ResultModel = mongoose.model('ResultModel');
// var Kernel = require('../lib/Kernel');

// var req = {
//     body: {
//       geocode: '(48.856614, 2.3522219000000177)',
//       description: '',
//       start_date: '05/01/2014 00:00',
//       end_date: '06/07/2014 00:00',
//       location: 'Paris, France',
//       radius: '1000',
//       dt: '1000',
//       r: '1000',
//       events: '',
//       created_date: new Date()
//     }
// };

// // TODO: check existing
// // Wait for saving tweets,
// // Then run Kernel_mapreduce
// async.waterfall([
//     function(callback) {
//         var q = new QueryModel(req.body);
//         q.users = [];
//         var results = new ResultModel({query_id: q._id});
//         results.save(function(err) {
//             if (err) {
//                 console.log(err);
//             }
//         });
//         q.results_id = results._id;
//         q.save(function(err) {
//             if (err) {
//                 var err_info = utils.errors(err);
//                 req.flash('errors', err_info);
//                 return res.redirect('/');
//             }
//             else {
//                 var data = req.body;
//                 data.queryObj = q._id;
//                 // Run TwitterSearch utils, add schedule in process
//                 var ts = new OfflineSearch(data);
//                 callback(null, q, results);
//             }
//         });
//     },
//     // Set 5mins after schedule OfflineSearch
//     function(queryObj, results, callback) {
//         setTimeout(function() {
//             var kernel = new Kernel(queryObj, results._id);
//             kernel.buildSchedule(kernel);
//         }, 1000 * 60 * 5);
//         callback(null, results._id);
//     }
// ], function(err, results_id) {
//     console.log('===fin===');
// });