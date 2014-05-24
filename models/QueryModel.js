// QueryModel.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var QueryModelSchema = new Schema({
    description: {type: String},
    event_type: {type: String},
    event_name: {type: String},
    start_date: {type: Date},
    end_date: {type: Date},
    dt: {type: Number},
    r: {type: Number},
    location: {type: String},
    geocode : {type: String},
    radius: {type: String},
    created_date: {type: Date, default: Date.now},
    results_id : {type: ObjectId, ref: 'result'},
    users: [],
    display: {type: Number, default: 1}
});

QueryModelSchema.statics = {
    load: function(id, cb) {
        this.findOne({ _id: id }).exec(cb);
    },
    loadJson: function(id, cb) {
        this.findOne({ _id: id }).lean().exec(cb);
    },
    list: function (options, cb) {
        var criteria = options.criteria || {};
        this.find(criteria).exec(cb);
    },
    listToJson: function(options, cb) {
        var criteria = options.criteria || {};
        var query = this.find(criteria).lean();
        if (options.select) {
            query.select(options.select);
        }
        query.exec(cb);
    },
    checkExisting: function(data, cb) {
        this.findOne(data).exec(cb);
    }
}


// Built and exports Model from Schema
exports.QueryModelSchema = QueryModelSchema;
mongoose.model('QueryModel', QueryModelSchema);
exports.QueryModel = mongoose.model('QueryModel');
