// StreamingModel.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var StreamingModelSchema = new Schema({
    created_date : {type: Date, default: new Date},
    end_date: {type: Date},
    status: {type: Number, default: 0},
});

StreamingModelSchema.statics = {
    load: function(id, cb) {
        this.findOne({ _id: id }).exec(cb);
    },
    loadByStatus: function(status, cb) {
        this.findOne({status: status}).exec(cb);
    },
    loadJson: function(id, cb) {
        this.findOne({ _id: id }).lean().exec(cb);
    },
}


// Built and exports Model from Schema
exports.StreamingModelSchema = StreamingModelSchema;
mongoose.model('StreamingModel', StreamingModelSchema);
exports.StreamingModel = mongoose.model('StreamingModel');
