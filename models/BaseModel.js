// BaseModel

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var utils = require('../lib/utils');
var QueryModel = require('../models/QueryModel');
var TweetModel = require('../models/TweetModel');
var ResultModel = require('../models/ResultModel');

var TwitterSearch = require('../lib/TwitterSearch');
var Kernel = require('../lib/Kernel');


var data = {
  geocode: '(48.856614, 2.3522219000000177)',
  event_type: '',
  event_name: '',
  start_date: '05/07/2014 00:00',
  end_date: '05/20/2014 00:00',
  dt: '360000',
  r: '1000',
  location: 'Paris, France',
  radius: '10000',
  created_date: new Date(),
  queryObj: '5379b6e6ce261c8026471af1'
};
var async = require('async');
var QueryModel = mongoose.model('QueryModel');
var ResultModel = mongoose.model('ResultModel');
var Kernel = require('../lib/Kernel');

async.waterfall([
    function(callback) {
        QueryModel.load('5379e4180d8c27d02ac06818', function(err, queryObj) {
            callback(null, queryObj);
        });
    },
    // Set an hour after schedule TwitterSearch
    function(queryObj, callback) {
        var results = new ResultModel();
        results.save(function(err) {
            if (err) {
                console.log(err);
            }
        });
        var kernel = new Kernel(queryObj, results._id);
        setTimeout(function() {
            kernel.buildSchedule(kernel);
            // TODO: set to an hour
        }, 2000);
        callback(null, results._id);
    }
], function(err, results_id) {
    //
});
