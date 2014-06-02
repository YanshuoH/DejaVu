/*
 * Expose routes
 */
var utils = require('../lib/utils');
var async = require('async');
var mongoose = require('mongoose');

var QueryModel = mongoose.model('QueryModel');
var ResultModel = mongoose.model('ResultModel');
var TwitterSearch = require('../lib/TwitterSearch');
var Kernel = require('../lib/Kernel');
var Shifting = require('../lib/Shifting');


exports.index = function(req, res) {
    return res.render('index', {
        title: 'Welcome!!',
        req: req
    });
}

exports.run = function(req, res) {
    req.body.created_date = new Date();
    console.log(req.body);
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
    return res.render('results', {
        title: 'Results - Map',
        req: req
    });
}

exports.graph = function(req, res) {
    return res.render('graph', {
        title: 'Results - Graph',
        req: req
    });
}

exports.graphJson = function(req, res) {
    if (typeof(req.query.timelineid) !== 'undefined' && req.query.timelineid !== 'undefined') {
        var timelineId = req.query.timelineid;
    }
    else {
        var timelineId = false;
    }
    ResultModel.load(req.params.resultId.toString(), function(err, resultObj) {
        if (err) {
            console.log(err);
        }
        // bounding of the graph
        var origin = {
            lat: -90,
            lng: 0
        };
        var nodes = [];
        var edges = [];
        var nodeCount = 0;
        if (typeof(resultObj.results) !== 'undefined') {
            var results_length = resultObj.results.length - 1;
            if (timelineId) {
                results_length = timelineId;
            }
            for (var results_index=0; results_index<=results_length; results_index++) {
                var result = resultObj.results[results_index];
                async.each(result.groups, function(group, group_callback) {
                    var tweets = group.tweets[0]
                    var tweet1 = group.tweets[0][0]
                    var tweet2 = group.tweets[0][1]
                    // Make nodes
                    var xy = utils.geocode2xy({lat: tweet1.lat, lng: tweet1.lng}, origin);
                    var node1 = {
                        // "id": "n" + tweet1.id.toString(),
                        "id": "n" + nodeCount,
                        "content": tweet1.text, // TODO, add content in kernel
                        "x": xy.x,
                        "y": xy.y,
                        "size": 1
                        // "drawLabels": false
                    };
                    nodeCount++;
                    var xy = utils.geocode2xy({lat: tweet2.lat, lng: tweet2.lng}, origin);
                    var node2 = {
                        "id": "n" + nodeCount,
                        "content": tweet2.text,
                        "x": xy.x,
                        "y": xy.y,
                        "size": 1
                        // "drawLabels": false
                    };
                    var edge = {
                        "id": "e" + node1.id,
                        //"id" : "e" + tweet1.id.toString(),
                        "source": node1.id,
                        "target": node2.id
                    };
                    nodeCount++;
                    nodes.push(node1);
                    nodes.push(node2);
                    edges.push(edge);
                    group_callback();
                });
            }
        }

        var data = {
            "nodes": nodes,
            "edges": edges,
            "width": 0,
            "height": 0
        };
        var render_data = {
            status: resultObj.status,
            data: data,
            query_id: resultObj.query_id
        };

        return res.json(render_data);
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
      omnipotentCollector.stop(omnipotentCollector);
    } catch(e) {
        console.log(e);
    }
    return res.json({message: 'Streaming Stopped'});
}

exports.streamingInfo = function(req, res) {
    var msg = {};
    async.waterfall([
        function(callback) {
            omnipotentCollector.connect();
            callback();
        },
        function(callback) {
            omnipotentCollector.getStatus(function(err, streamObj) {
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
            omnipotentCollector.disconnect();
        }, 30*1000)
        return res.json(msg);
    });
}

exports.streamingStatus = function(req, res) {
    omnipotentCollector.getStatus(function(err, streamObj) {
        omnipotentCollector.disconnect();
        if (err) console.log(err);
        if (!streamObj) {
            // omnipotentCollector.disconnect();
            return res.json({status: 0});
        }
        else {
            return res.json({status: 1});
        }
    });
}

exports.streamingExport = function(req, res) {
    omnipotentCollector.exportJson(omnipotentCollector, function(err, user_filename, tweet_filename) {
        return res.json({status: 1});
    });
}

// exports.streamingInfo = function(req, res) {
//     omnipotentCollector.connect();
//     omnipotentCollector.getDBInfo(omnipotentCollector, function(err, user_count, tweet_count) {
//         var streamingInfo = {
//             user_count: user_count,
//             tweet_count: tweet_count,
//             user_size: (user_count * 1500) / (1024 * 1024),
//             tweet_size: (tweet_count * 3000) / (1024 * 1024)
//         };
//         setTimeout(function() {
//             omnipotentCollector.disconnect();
//         }, 10*1000)
//         return res.json({info: streamingInfo});
//     });
// }