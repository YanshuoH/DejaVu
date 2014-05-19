/*
 * Expose routes
 */
var path = require('path');
var mongoose = require('mongoose');
var routes = require('../routes/index');
/* GET home page. */

module.exports = function (app, config) {
    app.get('/', routes.index);
    app.post('/run', routes.run);
    app.get('/queries', routes.queries);
    app.get('/results/:resultId', routes.result);
    app.get('/results/:resultId/json', routes.resultJson);
    app.get('/queries/delete/:queryId', routes.deleteQuery);
    app.get('/queries/:queryId/json', routes.queryJson);
}
