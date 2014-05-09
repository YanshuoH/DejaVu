/*
 * Expose routes
 */
var path = require('path');
var mongoose = require('mongoose');
/* GET home page. */

exports.index = function(req, res) {
    return res.render('index', {title: 'Welcome!!'});
}