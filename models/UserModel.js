// QueryModel.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserModelSchema = new Schema({
    _id: {type: Number},
    id_str: {},
    name: {},
    screen_name: {},
    location: {},
    description: {},
    url: {},
    entities: {},
    protected: {},
    followers_count: {},
    friends_count: {},
    listed_count: {},
    created_at: {},
    favourites_count: {},
    utc_offset: {},
    time_zone: {},
    geo_enabled: {},
    verified: {},
    statuses_count: {},
    lang: {},
    contributors_enabled: {},
    is_translator: {},
    is_translation_enabled: {},
    profile_background_color: {},
    profile_background_image_url: {},
    profile_background_image_url_https: {},
    profile_background_tile: {},
    profile_image_url: {},
    profile_image_url_https: {},
    profile_banner_url: {},
    profile_link_color: {},
    profile_sidebar_border_color: {},
    profile_sidebar_fill_color: {},
    profile_text_color: {},
    profile_use_background_image: {},
    default_profile: {},
    default_profile_image: {},
    following: {},
    follow_request_sent: {},
    notifications: {}
});

UserModelSchema.statics = {
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
exports.UserModelSchema = UserModelSchema;
mongoose.model('UserModel', UserModelSchema);
exports.UserModel = mongoose.model('UserModel');
