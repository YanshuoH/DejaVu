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

exports.run = function(req, res) {
    req.body.created_date = new Date();
    // TODO: check existing
    // Wait for saving tweets,
    // Then run Kernel_mapreduce
    async.waterfall([
        function(callback) {
            var q = new QueryModel(req.body);
            q.users = [];
            var results = new ResultModel({query_id: q._id});
            results.save(function(err) {
                if (err) {
                    console.log(err);
                }
            });
            q.results_id = results._id;
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
                    callback(null, q, results);
                }
            });
        },
        // Set an hour after schedule TwitterSearch
        function(queryObj, results, callback) {
            setTimeout(function() {
                var kernel = new Kernel(queryObj, results._id);
                kernel.buildSchedule(kernel);
            }, 1000 * 60 * 5);
            callback(null, results._id);
        }
    ], function(err, results_id) {
        return res.redirect('/results/' + results_id.toString());
    });
}

exports.queries = function(req, res) {
    QueryModel.find({display: 1}).sort({"created_date": 1}).exec(function(err, queries) {
        if (err) {
            req.flash('errors', utils.errors(err));
            return res.redirect('/');
        }

        res.render('queries', {
            title: 'Quries',
            queries: queries,
            req: req
        });
    });
}

exports.result = function(req, res) {
    return res.render('results', {
        title: 'Results',
        req: req
    });
}

exports.resultJson = function(req, res) {
    ResultModel.load(req.params.resultId.toString(), function(err, resultObj) {
        if (err) {
            console.log(err);
        }
        if (resultObj) {
            return res.json(resultObj);
        }
        else {
            return res.json([]);
        }
    });
}

exports.queryJson = function(req, res) {
    QueryModel.load(req.params.queryId.toString(), function(err, query) {
        if (err) {
            console.log(err);
        }
        return res.json(query);
    });
}

exports.deleteQuery = function(req, res) {
    QueryModel.load(req.params.queryId.toString(), function(err, query) {
        if (err) {
            console.log(err);
        }
        if (query) {
            query.display = -1;
            query.save(function(err) {
                if (err) {
                    console.log(err);
                }
                return res.redirect('/queries');
            });
        }
        else {
            req.flash('warning', 'Ooups, Something went wrong');
            return res.redirect('/queries');
        }
    });
}