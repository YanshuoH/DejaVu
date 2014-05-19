// ResultModel.js
// QueryModel.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ResultModelSchema = new Schema({
    query_id: {type: ObjectId, ref: 'query'},
    results: [],
    // 1. In process
    // 2. Done
    status: {type: Number, default: 1}
    /*
    [{
        kenel_start:
        kernel_end:
        groups: [
            [user1, user2], [
                [tweet1, tweet2], [tweet3, tweet4]
            ]
        ]
    }]
    */
});

ResultModelSchema.statics = {
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
}


// Built and exports Model from Schema
exports.ResultModelSchema = ResultModelSchema;
mongoose.model('ResultModel', ResultModelSchema);
exports.ResultModel = mongoose.model('ResultModel');
