// GEXF Builder
var utils = require('../lib/utils');
var async = require('async');
var xmlbuilder = require('xmlbuilder');

var mongoose = require('mongoose');
var ResultModel = mongoose.model('ResultModel');

function GexfBuilder(result_id) {
    this.result_id = result_id;
}

GexfBuilder.prototype.build = function(self, cb) {
    async.waterfall([
        function(callback) {
            // Load results
            ResultModel.load(self.result_id.toString(), function(err, resultObj) {
                if (err) console.log(err);
                var nodesAndEdges = self.buildNodesAndEdges(resultObj);
                var doc = {
                    gexf: {
                        '@xmlns': 'http://www.gexf.net/1.2draft',
                        '@xmlns:viz': 'http://www.gexf.net/1.1draft/viz',
                        '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                        '@xsi:schemaLocation': 'http://www.gexf.net/1.2draft http://www.gexf.net/1.2draft/gexf.xsd',
                        '@version': '1.2',
                        meta: {
                            '@lastmodifieddate': new Date().Format('yyyy-MM-dd'),
                            creator: 'Déj@Vu',
                            description: 'Export Kernel Result to Gexf format'
                        },
                        graph: {
                            '@mode': 'dynamic',
                            '@defaultedgetype': 'directed',
                            '@timeformat': 'date',
                            '@start': new Date(resultObj.results[0].calculat_time).Format('yyyy-MM-dd'),
                            '@end': new Date(resultObj.results[(resultObj.results.length) - 1].calculat_time).Format('yyyy-MM-dd'),
                            nodes: nodesAndEdges.nodes,
                            edges: nodesAndEdges.edges
                        }
                    }
                };
                var gexf = xmlbuilder.create(doc);
                gexf = gexf.end({ pretty: true});
                callback(null, gexf);
            });
        },
    ], cb);
}

GexfBuilder.prototype.buildNodesAndEdges = function(resultObj) {
    var nodes = [];
    var edges = [];
    var nodeCount = 0;
    var origin = {
        lat: -90,
        lng: 0
    };
    for (var results_index=0; results_index<resultObj.results.length; results_index++) {
        for (var groups_index=0; groups_index<resultObj.results[results_index].groups.length; groups_index++) {
            var group = resultObj.results[results_index].groups[groups_index];
            var tweet1 = group.tweets[0][0];
            var tweet2 = group.tweets[0][1];
            var xy = utils.geocode2xy({lat: tweet1.lat, lng: tweet1.lng}, origin);
            // this.checkNodesExisting(node1, nodes);
            var node1 = {
                node: {
                    '@id': "n" + nodeCount,
                    '@label': tweet1.id,
                    '@start': new Date(resultObj.results[results_index].calculat_time).Format('yyyy-MM-dd'),
                    '@end': new Date(typeof(resultObj.results[results_index + 1]) == 'undefined' ? resultObj.results[results_index].calculat_time : resultObj.results[results_index + 1].calculat_time).Format('yyyy-MM-dd'),
                    'viz:color': {
                        '@r': '239',
                        '@g': '173',
                        '@b': '66',
                        '@a': '0.6'
                    },
                    'viz:position': {
                        '@x': xy.x,
                        '@y': xy.y,
                        '@z': 0
                    },
                    'viz:size': {
                        '@value': '2.0375757'
                    },
                    'viz:shape': {
                        '@value': 'disc'
                    }
                }
            };
            nodeCount++;
            var xy = utils.geocode2xy({lat: tweet2.lat, lng: tweet2.lng}, origin);
            var node2 = {
                node: {
                    '@id': "n" + nodeCount,
                    '@label': tweet2.id,
                    '@start': new Date(resultObj.results[results_index].calculat_time).Format('yyyy-MM-dd'),
                    '@end': new Date(typeof(resultObj.results[results_index + 1]) == 'undefined' ? resultObj.results[results_index].calculat_time : resultObj.results[results_index + 1].calculat_time).Format('yyyy-MM-dd'),
                    'viz:color': {
                        '@r': '239',
                        '@g': '173',
                        '@b': '66',
                        '@a': '0.6'
                    },
                    'viz:position': {
                        '@x': xy.x,
                        '@y': xy.y,
                        '@z': 0
                    },
                    'viz:size': {
                        '@value': '2.0375757'
                    },
                    'viz:shape': {
                        '@value': 'disc'
                    }
                }
            };
            nodeCount++;
            nodes.push(node1);
            nodes.push(node2);
            edges.push({
                edge: {
                    '@id': "e" + node1.node['@id'],
                    '@source': node1.node['@id'],
                    '@target': node2.node['@id'],
                    '@start': node1.node['@start'],
                    '@end': node1.node['@end'],
                }
            });
        }
    }
    var nodesAndEdges = {
        nodes: nodes,
        edges: edges
    }
    return nodesAndEdges;
}


module.exports = GexfBuilder;