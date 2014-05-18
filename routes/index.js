/*
 * Expose routes
 */
var async = require('async');
var mongoose = require('mongoose');
var QueryModel = mongoose.model('QueryModel');
var TwitterSearch = require('../lib/TwitterSearch');

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
    var q = new QueryModel(req.body);
    q.users = [];
    q.save(function(err) {
        if (err) {
            var err_info = utils.errors(err);
            req.flash('warning', err_info);
        }
        else {
            var data = req.body;
            data.queryObj = q._id;
            // Run TwitterSearch utils, add schedule in process
            var ts = new TwitterSearch(data);
        }
    });
    return res.redirect('/');
}