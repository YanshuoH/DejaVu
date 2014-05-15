// ==== Connection DB =====//
var config = require('../config/config')
// Connect to mongodb
var mongoose = require('mongoose');
var connect = function() {
    var options = {
        server: {
            auto_reconnect: true,
            socketOptions: {
                KeepAlive: 1,
            },
            poolSize: 15
        }
    };
    mongoose.connect(config.db, options)
};
connect();

// Error handler
mongoose.connection.on('error', function(err) {
    console.log(err)
});

// Reconnect when closed
mongoose.connection.on('disconnected', function() {
    connect();
});
// ==== End Connection DB=====//


// var query_data = {
    // event_type: 'at',
    // event_name: 'x',
    // start_date: '05/13/2014 15:06',
    // end_date: '05/13/2014 15:08',
    // dt: '100',
    // r: '1000'
// };
exports.runKernel = function(query_data, cb) {
    var kernel = require('./kernel_mapred');
    kernel.run(query_data, cb);
    // kernel.run(query_data, function(err, results, render_data) {
        // console.log('=============DONE==============');
    // });
}
