var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TweetsModelSchema = new Schema({
    _id: {type: String},
    content: {}
});

// Built and exports Model from Schema
mongoose.model('TweetModel', TweetsModelSchema);
exports.TweetsModel = mongoose.model('TweetModel');