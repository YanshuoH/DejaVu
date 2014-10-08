/*
 * Express apps
 */

var express = require('express');
var mongoStore = require('connect-mongo')(express)
var flash = require('connect-flash');
var pkg = require('../package.json');

var OmnipotentCollector = require('../lib/OmnipotentCollector');

module.exports = function(app, config) {
    app.set('showStackError', true);

    // set views path, template engine and default layout
    app.set('views', config.root + '/views');
    app.set('view engine', 'jade');
    app.configure(function() {
        app.use(function (req, res, next) {
            res.locals.pkg = pkg;
            next();
        });
    });
    // cookieParser should be above session
    app.use(express.cookieParser());

    // bodyParser should be above methodOverride
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    // mongo session storage
    app.use(express.session({
        secret: pkg.name,
        // store: new mongoStore({
        //     url: config.db,
        //     collection: 'sessions'
        // })
    }));

    // connect flash for flash message
    // should be after session
    app.use(flash());

    /*
    // Goodbye CSRF
    app.use(express.csrf());

    // This could be moved to view-helpers :-)
    app.use(function(req, res, next){
        res.locals.csrf_token = req.csrfToken();
        next();
    });
    */
    app.use(express.favicon("public/images/favicon.ico"));
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());

    // Create Streaming object as global variable
    omnipotentCollector =  new OmnipotentCollector();

    app.use(app.router);
    app.use(express.static(config.root + '/public'));

    // Create a 404-500 middleware to handle the errors
    app.use(function(err, req, res, next) {
        // if Object not found, treat as 404
        if (err.message
            && (~err.message.indexOf('not found')
            || (~err.message.indexOf('Cast to ObjectId failed')))) {
                return next();
        }
        // log
        // send emails if want
        console.error(err.stack)
        // error page
        res.status(500).render('500', { error: err.stack, req: req});
    });
    // assume 404 since no middleware responded
    app.use(function(req, res, next) {
        res.status(404).render('404', {
            url: req.originalUrl,
            error: 'Page Not Found',
            req: req
        });
    });
}