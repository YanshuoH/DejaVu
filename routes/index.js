/*
 * Expose routes
 */
var path = require('path');
var mongoose = require('mongoose');
var TweetModel = mongoose.model('TweetModel');

exports.index = function(req, res) {
    return res.render('index', {
        title: 'Welcome!!',
        req: req
    });
}

exports.run = function(req, res) {
    
}