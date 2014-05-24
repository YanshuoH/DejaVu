// BaseModel

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var utils = require('../lib/utils');
var UserModel = require('../models/UserModel');
var QueryModel = require('../models/QueryModel');
var TweetModel = require('../models/TweetModel');
var ResultModel = require('../models/ResultModel');

var TwitterSearch = require('../lib/TwitterSearch');
var Kernel = require('../lib/Kernel');



var async = require('async');
var QueryModel = mongoose.model('QueryModel');
var ResultModel = mongoose.model('ResultModel');
var Kernel = require('../lib/Kernel');

// async.waterfall([
//     function(callback) {
//         var results = new ResultModel({query_id: '537a50f35082309c1dae0c08'});
//         results.save(function(err) {
//             if (err) {
//                 console.log(err);
//             }
//         });
//         QueryModel.load('537a50f35082309c1dae0c08', function(err, queryObj) {
//             callback(null, queryObj, results);
//         });
//     },
//     // Set an hour after schedule TwitterSearch
//     function(queryObj, results, callback) {
//         setTimeout(function() {
//             var kernel = new Kernel(queryObj, results._id);
//             kernel.buildSchedule(kernel);
//             // TODO: set to an hour
//         }, 2000);
//         callback(null, results._id);
//     }
// ], function(err, results_id) {
//     //
// });
