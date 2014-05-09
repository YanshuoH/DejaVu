/*
 * Expose routes
 */
var path = require('path');
var mongoose = require('mongoose');
var routes = require('../routes/index');
/* GET home page. */

module.exports = function (app, config) {
    app.get('/', routes.index);
}
