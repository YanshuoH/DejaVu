var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TweetsModelSchema = new Schema({});

// Built and exports Model from Schema
mongoose.model('TweetsModel', TweetsModelSchema);
exports.TweetsModel = mongoose.model('TweetsModel');