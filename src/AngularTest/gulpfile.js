/// <binding AfterBuild='test' />
/*
This file in the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/

var gulp = require('gulp');
var gutil = require('gulp-util');
var Server = require('karma').Server;

var paths = {
    webroot: "./wwwroot/",
    bower: "./bower_components/",
    lib: "./wwwroot/lib/"
};


/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
    new Server({
        configFile: __dirname +'/karma.conf.js',
        singleRun: true
    }, done).start();
});

