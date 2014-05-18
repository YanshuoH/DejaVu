var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TweetModelSchema = new Schema({
    event_type: {type: String},
    event_name: {type: String},
    start_date: {type: Date},
    end_date: {type: Date},
    dt: {type: Number},
    r: {type: Number},
    location: {type: String},
    radius: {type: String}
});


// { _csrf: '5ADqo0kEnnnTE7K10gToRZjgdw2I22N+vimdM=',
//   event_type: 'at',
//   event_name: 'man',
//   start_date: '05/17/2014 00:00',
//   end_date: '05/19/2014 00:00',
//   dt: '1000',
//   r: '1000',
//   location: '69 Avenue des Lombards, 10000 Troyes, France',
//   radius: '100' }

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
