// BaseModel

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TweetModel = require('../models/TweetModel');
var getStreaming = require('../lib/getStreaming');

// getStreaming.run(function() {
    // console.log('=============End getStreaming=====================');
// });