var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TweetModelSchema = new Schema({
    _id: {type: Number},
    metadata: {},
    created_at: {},
    id_str: {},
    text: {},
    source: {},
    truncated: {},
    in_reply_to_status_id: {},
    in_reply_to_status_id_str: {},
    in_reply_to_user_id: {},
    in_reply_to_user_id_str: {},
    in_reply_to_screen_name: {},
    user_id: {type: Number, ref: 'user'},
    geo: {},
    coordinates: {},
    place: {},
    contributors: {},
    retweeted_status: {},
    retweet_count: {},
    favorite_count: {},
    entities: {},
    favorited: {},
    retweeted: {},
    lang: {}
});


// Pre save, convert date to ISO date
TweetModelSchema.pre('save', function(next) {
    this.created_at = new Date(this.created_at).toISOString();
    next();
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
        var query = this.find(criteria);
        if (options.where) {
            query.where(options.where.field).in(options.where.value);
        }
        query.exec(cb);
    },
    listToJson: function(options, cb) {
        var criteria = options.criteria || {};
        var query = this.find(criteria).lean();
        if (options.select) {
            query.select(options.select);
        }
        query.exec(cb);
    }
}


// Built and exports Model from Schema
exports.TweetModelSchema = TweetModelSchema;
mongoose.model('TweetModel', TweetModelSchema);
exports.TweetModel = mongoose.model('TweetModel');
