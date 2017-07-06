/**
 * Created by mattijsnaus on 1/27/16.
 */
/* globals desc:false, task:true, fail:false, complete:false, jake:false, directory:false */
(function () {
    "use strict";

    var packageJson = require('./package.json');
    var semver = require('semver');
    var minifier = require('minifier');
    var concat = require('concat');
    var jshint = require('simplebuild-jshint');
    var shell = require('shelljs');

    var JSBUILD_DIR = 'js/build/';

    var lintFiles = [
        "Jakefile.js",
        "js/modules/*.js"
    ];

    var lintOptions = {
        bitwise: true,
        eqeqeq: true,
        forin: true,
        freeze: true,
        futurehostile: true,
        newcap: true,
        latedef: 'nofunc',
        noarg: true,
        nocomma: true,
        nonbsp: true,
        nonew: true,
        strict: true,
        undef: true,
        node: true,
        browser: true,
        loopfunc: true,
        laxcomma: true,
        '-W089': false,
        '-W055': false,
        '-W069': false
    };

    var lintGlobals = {
        define: false,
        alert: false,
        confirm: false,
        ace: false,
        $: false,
        jQuery: false
    };

    var requiredJS = [
        {
            files: ['js/vendor/jquery.min.js', 'js/vendor/jquery-ui.min.js', 'js/vendor/flat-ui-pro.min.js', 'js/vendor/chosen.min.js', 'js/vendor/jquery.zoomer.js', 'js/vendor/spectrum.js', 'js/vendor/summernote.min.js', 'js/vendor/ace/ace.js', 'js/build/builder.js'],
            output: "js/build/builder.min.js"
        },
        {
            files: ['js/vendor/jquery.min.js', 'js/vendor/jquery-ui.min.js', 'js/vendor/flat-ui-pro.min.js', 'js/vendor/jquery.zoomer.js', 'js/build/sites.js'],
            output: "js/build/sites.min.js"
        },
        {
            files: ['js/vendor/jquery.min.js', 'js/vendor/flat-ui-pro.min.js', 'js/vendor/chosen.min.js', 'js/vendor/jquery.zoomer.js', 'js/build/images.js'],
            output: "js/build/images.min.js"
        },
        {
            files: ['js/vendor/jquery.min.js', 'js/vendor/flat-ui-pro.min.js'],
            output: "js/build/login.min.js"
        },
        {
            files: ['js/vendor/jquery.min.js', 'js/vendor/flat-ui-pro.min.js', 'js/build/settings.js'],
            output: "js/build/settings.min.js"
        },
        {
            files: ['js/vendor/jquery.min.js', 'js/vendor/jquery.zoomer.js', 'js/vendor/flat-ui-pro.min.js', 'js/build/users.js'],
            output: "js/build/users.min.js"
        }
    ];


    //**** Main Jake tasks

    desc("The default build task");
    task("default", [ "nodeversion", "build" ], function () {

        console.log('Build OK');

    });

    desc("The actual build task");
    task("build", [ "linting", "minifyElementJS", "minifyElementCSS", "minifyMainCSS", "minifySkeletonCSS", "minifyBuilderCSS", "browserify" ], function () {

        console.log("Building SiteBuilder Lite");

    });

    desc("The actual build task, builder JS only");
    task("buildJS", [ "linting" ], function () {

        console.log("Building SiteBuilder Lite, UI js code");

        shell.rm('-rf', JSBUILD_DIR + "builder.js");

        var cmds = [
            "node node_modules/browserify/bin/cmd.js js/builder.js --debug -o " + JSBUILD_DIR + "builder.js"
        ];

        //sites.js
        jake.exec(
            cmds, 
            { interactive: true }, 
            function () {
                
                console.log("Minifying builder JS: .");

                minifier.minify(requiredJS[0].files, {output: requiredJS[0].output});

                complete();
            }
        );

    });


    //**** Supporting Jake tasks

    desc("Check Nodejs version");
    task("nodeversion", function () {

        console.log("Checking Nodejs version: .");

        var requiredVersion = packageJson.engines.node;
        var actualVersion = process.version;

        if( semver.neq(requiredVersion, actualVersion) ) {
            fail("Incorrect Node version; expected " + requiredVersion + " but found " + actualVersion);
        }

    });

    desc("Linting of JS files");
    task("linting", function () {

        process.stdout.write("Linting JS code: ");
        
        jshint.checkFiles({
            files: lintFiles,
            options: lintOptions,
            globals: lintGlobals
        }, complete, fail);

    }, { async: true });

    desc("Compile front-end modules");
    task("browserify", [ JSBUILD_DIR ], function () {

        console.log("Building Javascript code: .");

        shell.rm('-rf', JSBUILD_DIR + "*");

        var cmds = [
            "node node_modules/browserify/bin/cmd.js js/builder.js --debug -o " + JSBUILD_DIR + "builder.js",
            "node node_modules/browserify/bin/cmd.js js/sites.js --debug -o " + JSBUILD_DIR + "sites.js",
            "node node_modules/browserify/bin/cmd.js js/images.js --debug -o " + JSBUILD_DIR + "images.js",
            "node node_modules/browserify/bin/cmd.js js/settings.js --debug -o " + JSBUILD_DIR + "settings.js",
            "node node_modules/browserify/bin/cmd.js js/users.js --debug -o " + JSBUILD_DIR + "users.js",
        ];

        //sites.js
        jake.exec(
            cmds, 
            { interactive: true }, 
            function () {
                jake.Task['minifyMainJS'].invoke();
                complete();
            }
        );

    }, { async: true });


    desc("Minify elements JS");
    task("minifyElementJS", function () {

        console.log("Minifying elements JS: .");

        minifier.minify(
            ['elements/js/vendor/jquery.min.js', 'elements/js/flat-ui-pro.min.js', 'elements/js/custom.js'],
            {output: 'elements/js/build/build.min.js'}
        );

    });

    desc("Concatenate and minify element CSS");
    task("minifyElementCSS", function () {

        console.log("Concatenating element CSS: .");

        concat([
                'elements/css/vendor/bootstrap.min.css',
                'elements/css/flat-ui-pro.min.css',
                'elements/css/style.css',
                'elements/css/font-awesome.css'
            ],
            'elements/css/build.css',
            function (error) {

                if( error ) {
                    console.log(error);
                } else {
                    console.log("Minifying element CSS: .");
                    minifier.minify('elements/css/build.css', { output: 'elements/css/build.css' });
                }

                complete();

            }
        );

    }, { async: true });

    desc("Concatenate and minify main css");
    task("minifyMainCSS", function () {

        console.log("Concatenate main CSS: .");

        concat([
                'css/vendor/bootstrap.min.css',
                'css/flat-ui-pro.css',
                'css/style.css',
                'css/login.css',
                'css/font-awesome.css'
            ],
            'css/build-main.css',
            function (error) {

                if( error ) {
                    console.log(error);
                } else {
                    console.log("Minifying main CSS: .");
                    minifier.minify('css/build-main.css', { output: 'css/build-main.min.css' });
                }

                complete();

            }
        );

    }, { async: true });

    desc("Concatenate and minify skeleton CSS");
    task("minifySkeletonCSS", function () {

        console.log("Concatenate skeleton CSS: .");

        concat([
                'elements/css/build.css',
                'elements/css/style-contact.css',
                'elements/css/style-content.css',
                'elements/css/style-dividers.css',
                'elements/css/style-footers.css',
                'elements/css/style-headers.css',
                'elements/css/style-portfolios.css',
                'elements/css/style-pricing.css',
                'elements/css/style-team.css',
                'elements/css/nivo-slider.css'
            ],
            'elements/css/skeleton.css',
            function (error) {
                
                if( error ) {
                    console.log(error);
                } else {
                    console.log("Minifying skeleton CSS: .");
                    minifier.minify('elements/css/skeleton.css', { output: 'elements/css/skeleton.css' });
                }

                complete();

            }
        );

    }, { async: true });

    desc("Concatenate and minify builder CSS");
    task("minifyBuilderCSS", function () {

        console.log("Concatenate builder CSS: .");

        concat([
                'css/builder.css',
                'css/spectrum.css',
                'css/chosen.css',
                'css/summernote.css'
            ],
            'css/build-builder.css',
            function (error) {
                
                if( error ) {
                    console.log(error);
                } else {
                    console.log("Minifying builder CSS: .");
                    minifier.minify('css/build-builder.css', { output: 'css/build-builder.min.css' });
                }

                complete();

            }
        );

    }, { async: true });

    desc("Concatenate and minify builder JS");
    task("minifyMainJS", function (page) {

        console.log("Minifying builder JS: .");

        for( var x = 0; x < requiredJS.length; x++ ) {
            minifier.minify(requiredJS[x].files, {output: requiredJS[x].output});
        }

    });

    desc("Runs a local http server");
    task("serve", function () {

        console.log("Serve block locally:");

        jake.exec("node_modules/.bin/http-server elements", { interactive: true }, complete);

    }, { async: true });

    directory(JSBUILD_DIR);

}());