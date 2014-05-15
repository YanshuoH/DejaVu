var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TweetModelSchema = new Schema({
    _id: {type: String},
    content: {},
    created_at: {type: Date},
    entities: {},
    lat: {type: Number},
    lng: {type: Number},
    coordinates: {},
});


TweetModelSchema.statics = {
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
exports.TweetModelSchema = TweetModelSchema;
mongoose.model('TweetModel', TweetModelSchema);
exports.TweetModel = mongoose.model('TweetModel');
