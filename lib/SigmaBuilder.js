var async = require('async');
var mongoose = require('mongoose');
var utils = require('../lib/utils');
var ResultModel = mongoose.model('ResultModel');

function SigmaBuilder() {

}

SigmaBuilder.prototype.build = function(req, cb) {
    // Use async to callback the result
    async.waterfall([
        function(callback) {
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
                    var results_length = resultObj.results.length;
                    if (timelineId) {
                        results_length = timelineId;
                    }
                    for (var results_index=0; results_index<results_length; results_index++) {
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
                callback(null, render_data);
            });
        }
    ], cb);
}

module.exports = SigmaBuilder;