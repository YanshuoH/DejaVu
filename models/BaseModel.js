// BaseModel

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var QueryModel = require('../models/QueryModel');
var TweetModel = require('../models/TweetModel');
var TwitterSearch = require('../lib/TwitterSearch');


var data = {
  event_type: 'at',
  event_name: 'man',
  start_date: '05/17/2014 00:00',
  end_date: '05/19/2014 00:00',
  dt: '1000',
  r: '1000',
  location: '69 Avenue des Lombards, 10000 Troyes, France',
  radius: '100' }
var ts = new TwitterSearch(data);
ts.runSearch();

// var getStreaming = require('../lib/getStreaming');
/*
 * Execute time 
 */
// var start = new Date().getTime()
// getStreaming.run(function() {
    // console.log('=============End getStreaming=====================');
    // var end = new Date().getTime();
    // var time = end - start;
    // console.log('Execution time: ' + time);
// });
