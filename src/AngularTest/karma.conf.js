module.exports = function (config) {
    config.set({

        basePath: './',

        files: [
          'wwwroot/lib/angular/angular.js',
          'wwwroot/lib/angular-mocks/angular-mocks.js',
          'wwwroot/lib/angular-uuid/uuid.js',
          'wwwroot/lib/angular-local-storage/dist/angular-local-storage.js',
          'wwwroot/js/modules/*.js',
          'Tests/fdAuth.test.js'
        ],

        autoWatch: true,

        frameworks: ['jasmine'],

        browsers: ['PhantomJS'],

        plugins: [
                'karma-chrome-launcher',
                'karma-phantomjs-launcher',
                'karma-jasmine',
                'karma-junit-reporter'
        ],

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};
