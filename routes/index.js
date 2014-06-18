/*
 * Expose routes
 */
var fs = require('fs');
var utils = require('../lib/utils');
var async = require('async');
var mongoose = require('mongoose');

var QueryModel = mongoose.model('QueryModel');
var ResultModel = mongoose.model('ResultModel');
var TwitterSearch = require('../lib/TwitterSearch');
var OfflineSearch = require('../lib/OfflineSearch');

var Kernel = require('../lib/Kernel');
var Shifting = require('../lib/Shifting');
var SigmaBuilder = require('../lib/SigmaBuilder');
var GexfBuilder = require('../lib/GexfBuilder');

exports.index = function(req, res) {
    return res.render('index', {
        title: 'Welcome!!',
        req: req
    });
}

function ProceedRTString(body) {
    var events = body.events.split(' ');
    body.is_retweet = false;
    for (var index=0; index<events.length; index++) {
        if (events[index] === 'RT') {
            events[index] = 'RT OR';
            body.is_retweet = true;
        }
    }
    body.events = events.join(' ');
    return body;
}

exports.run = function(req, res) {
    req.body.created_date = new Date();
    // Proceed query string if RT
    // req.body = ProceedRTString(req.body);
    var errors = utils.fieldValidation(req.body);
    if (errors.length > 0) {
        req.flash('warning', errors);
        return res.render('index', {
            title: 'Welcome!!',
            req: req
        });
    }
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
            }, 1000 * 60 * 10);
            callback(null, results._id);
        }
    ], function(err, results_id) {
        return res.redirect('/results/' + results_id.toString() + '/graph');
    });
}

exports.offlineForm = function(req, res) {
    return res.render('offline', {
        title: 'Offline Graph Generation',
        req: req
    });
}

exports.offline = function(req, res) {
    req.body.created_date = new Date();
    // Proceed query string if RT
    // req.body = ProceedRTString(req.body);
    console.log(req.body);
    var errors = utils.fieldValidation(req.body);
    if (errors.length > 0) {
        req.flash('warning', errors);
        return res.render('offline', {
            title: 'Welcome!!',
            req: req
        });
    }
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
                    var ts = new OfflineSearch(data);
                    setTimeout(function() {
                        ts.buildSchedule(ts);
                    }, 5*1000);
                    callback(null, q, results);
                }
            });
        },
        // Set 5mins after schedule OfflineSearch
        function(queryObj, results, callback) {
            setTimeout(function() {
                var kernel = new Kernel(queryObj, results._id);
                kernel.buildSchedule(kernel);
            }, 1000 * 60 * 5);
            callback(null, results._id);
        }
    ], function(err, results_id) {
        return res.redirect('/results/' + results_id.toString() + '/graph');
    });
}


exports.exportQuery = function(req, res) {
    QueryModel.load(req.params.queryId.toString(), function(err, queryObj) {
        if (err) console.log(err);
        if (queryObj) {
            var s = new Shifting(queryObj);
            s.export(s);
        }
        queryObj.display = -1;
        queryObj.save(function(err) {
            if (err) console.log(err);
            return res.redirect('/queries');
        });
    });
}

exports.queries = function(req, res) {
    QueryModel.find({display: 1}).sort({"created_date": -1}).exec(function(err, queries) {
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

exports.result = function(req, res) {
    var render_data = {
        title: 'Results - Map',
        req: req
    };
    ResultModel.load(req.params.resultId.toString(), function(err, resultObj) {
        if (err) console.log(err);
        if (!resultObj) {
            req.flash('warning', 'Cannot find result id');
        }
        else {
            render_data.queryId = resultObj.query_id;
        }
        return res.render('results', render_data);
    });
}

exports.graph = function(req, res) {
    var render_data = {
        title: 'Results - Graph',
        req: req
    };
    ResultModel.load(req.params.resultId.toString(), function(err, resultObj) {
        if (err) console.log(err);
        if (!resultObj) {
            req.flash('warning', 'Cannot find result id');
        }
        else {
            render_data.queryId = resultObj.query_id;
        }
        return res.render('graph', render_data);
    });
}

exports.graphJson = function(req, res) {
    var s = new SigmaBuilder();
    s.build(req, function(err, render_data) {
        return res.json(render_data);
    });
}


exports.graphExportGexf = function(req, res) {
    var g = new GexfBuilder(req.params.resultId.toString());
    g.build(g, function(err, doc) {
        if (err) console.log(err);
        var filename = './public/tmp/graph.gexf';
        fs.writeFile(filename, doc.toString({ pretty: true }), function(err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log('Gexf saved to ' + filename);
            }
            return res.json({status: 1});
        });
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

exports.streaming = function(req, res) {
    // console.log(omnipotentCollector);
    return res.render('streaming', {
        title: 'Omnipotent Streaming',
        req: req
    });
}

exports.streamingRun = function(req, res) {
    omnipotentCollector.connect();
    omnipotentCollector.run(omnipotentCollector);
    return res.json({message: 'Streaming Run'});
}

exports.streamingStop = function(req, res) {
    try {
        setTimeout(function() {
            omnipotentCollector.stop(omnipotentCollector);
        }, 5*1000);
    } catch(e) {
        console.log(e);
    }
    return res.json({message: 'Streaming Stopped'});
}

exports.streamingInfo = function(req, res) {
    var msg = {};
    async.waterfall([
        function(callback) {
            omnipotentCollector.infoConnect();
            callback();
        },
        function(callback) {
            omnipotentCollector.getStatus(omnipotentCollector, function(err, streamObj) {
                if (err) console.log(err);
                if (!streamObj) {
                    // omnipotentCollector.disconnect();
                    msg.status = 0;
                }
                else {
                    msg.status = 1;
                }
                callback(null, msg);
            });
        },
        function(msg, callback) {
            omnipotentCollector.getDBInfo(omnipotentCollector, function(err, user_count, tweet_count) {
                var streamingInfo = {
                    user_count: user_count,
                    tweet_count: tweet_count,
                    user_size: (user_count * 1500) / (1024 * 1024),
                    tweet_size: (tweet_count * 3000) / (1024 * 1024)
                };
                msg.info = streamingInfo;
                callback(null, msg);
            });
        }
    ], function(err, msg) {
        setTimeout(function() {
            omnipotentCollector.infoDisconnect(omnipotentCollector);
        }, 30*1000)
        return res.json(msg);
    });
}

exports.streamingExport = function(req, res) {
    omnipotentCollector.exportJson(omnipotentCollector, function(err, user_filename, tweet_filename) {
        omnipotentCollector.exportDisconnect();
        return res.json({status: 1});
    });
}
