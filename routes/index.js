/*
 * Expose routes
 */
var async = require('async');
var mongoose = require('mongoose');
var QueryModel = mongoose.model('QueryModel');
var ResultModel = mongoose.model('ResultModel');
var TwitterSearch = require('../lib/TwitterSearch');
var Kernel = require('../lib/Kernel');
exports.index = function(req, res) {
    return res.render('index', {
        title: 'Welcome!!',
        req: req
    });
}

// var data = {
//   event_type: 'at',
// //   event_name: 'man',
//   start_date: '05/17/2014 00:00',
//   end_date: '05/20/2014 11:39',
//   dt: '1000',
//   r: '1000',
//   location: '69 Avenue des Lombards, 10000 Troyes, France',
//   geocode : '(48.856614, 2.3522219000000177)',
//   created_date: new Date(),
//   radius: '1000' }

exports.run = function(req, res) {
    req.body.created_date = new Date();
    // TODO: check existing
    // Wait for saving tweets,
    // Then run Kernel_mapreduce
    async.waterfall([
        function(callback) {
            var q = new QueryModel(req.body);
            q.users = [];
            q.save(function(err) {
                if (err) {
                    var err_info = utils.errors(err);
                    req.flash('errors', err_info);
                    return res.redirect('/');
                }
                else {
                    var data = req.body;
                    data.queryObj = q._id;
                    // Run TwitterSearch utils, add schedule in process
                    var ts = new TwitterSearch(data);
                    callback(null, q);
                }
            });
        },
        // Set an hour after schedule TwitterSearch
        function(queryObj, callback) {
            var results = new ResultModel({query_id: queryObj._id});
            results.save(function(err) {
                if (err) {
                    console.log(err);
                }
            });
            var kernel = new Kernel(queryObj, results._id);
            setTimeout(function() {
                kernel.buildSchedule(kernel);
            }, 1000 * 3600);
            callback(null, results._id);
        }
    ], function(err, results_id) {
        return res.redirect('/');
    });
}