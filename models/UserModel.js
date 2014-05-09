var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserModelSchema = new Schema({});


// Built and exports Model from Schema
mongoose.model('UserModel', UserModelSchema);
exports.UserModel = mongoose.model('UserModel');
