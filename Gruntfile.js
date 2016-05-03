'use strict';

module.exports = function (grunt) {
  var localConfig;
  try {
    localConfig = require('./server/config/local.env');
  } catch(e) {
    localConfig = {};
  }

  var version = "1.0";
  var fullVersion = version + ".0.0";

  var buildTimeStamp = Date.now();
  var buildVersion = version + "." + buildTimeStamp;

  // Load grunt tasks automatically, when needed
  require('jit-grunt')(grunt, {
    express: 'grunt-express-server',
    useminPrepare: 'grunt-usemin',
    ngtemplates: 'grunt-angular-templates',
    cdnify: 'grunt-google-cdn',
    protractor: 'grunt-protractor-runner',
    injector: 'grunt-asset-injector',
    buildcontrol: 'grunt-build-control',
    eol: 'grunt-eol',
    compress: 'grunt-contrib-compress',
    exec: 'grunt-exec'
  });

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    pkg: grunt.file.readJSON('package.json'),

    yeoman: {
      // configurable paths
      client: require('./bower.json').appPath || 'client',
      dist: 'dist'
    },

    express: {
      options: {
        port: localConfig.PORT || 9000
      },
      dev: {
        options: {
          script: 'server/app.js',
          debug: false
        }
      },
      prod: {
        options: {
          script: 'dist/server/app.js'
        }
      }
    },

    open: {
      server: {
        url: 'http://localhost:<%= express.options.port %>'
      }
    },

    watch: {
      injectJS: {
        files: [
          '<%= yeoman.client %>/app/*.js',
          '<%= yeoman.client %>/{app,components}/**/*.js',
          '!<%= yeoman.client %>/{app,components}/**/*.spec.js',
          '!<%= yeoman.client %>/{app,components}/**/*.mock.js',
          '!<%= yeoman.client %>/app/server.env.spec.js'],
        tasks: ['injector:scripts']
      },
      injectCss: {
        files: [
          '<%= yeoman.client %>/{app,components,style}/**/*.css'
        ],
        tasks: ['injector:css']
      },
      injectQlikJs: {
        files: [
          '<%= yeoman.client %>/qlik/*.js',
          '<%= yeoman.client %>/qlik/**/*.js'
        ],
        tasks: ['injector:qlikScripts']
      },
      mochaTest: {
        files: ['server/**/*.spec.js'],
        tasks: ['env:test', 'mochaTest']
      },
      jsTest: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.spec.js',
          '<%= yeoman.client %>/{app,components}/**/*.mock.js'
        ],
        // tasks: ['newer:jshint:all', 'karma']
        tasks: ['karma']
      },
      injectSass: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.{scss,sass}'],
        tasks: ['injector:sass']
      },
      sass: {
        files: [
          '<%= yeoman.client %>/{app,components,qlik}/**/*.{scss,sass}'],
        tasks: ['sass', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        files: [
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.css',
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.html',
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.js',
          '!{.tmp,<%= yeoman.client %>}{app,components}/**/*.spec.js',
          '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.mock.js',
          '<%= yeoman.client %>/assets/images/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= yeoman.client %>/assets/style/{,*//*}*.css'
        ],
        options: {
          livereload: true
        }
      },
      express: {
        files: [
          'server/**/*.{js,json}',
          '!server/api/swagger-gen.js'
        ],
        tasks: ['express:dev', 'wait'],
        options: {
          livereload: true,
          nospawn: true //Without this option specified express won't be reloaded
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '<%= yeoman.client %>/.jshintrc',
        reporter: require('jshint-stylish')
      },
      server: {
        options: {
          jshintrc: 'server/.jshintrc'
        },
        src: [ 'server/{,*/}*.js']
      },
      all: [
        '<%= yeoman.client %>/{app,components,qlik}/**/*.js',
        '!<%= yeoman.client %>/{app,components,qlik}/**/*.spec.js',
        '!<%= yeoman.client %>/{app,components,qlik}/**/*.mock.js'
      ],
      test: {
        src: [
          '<%= yeoman.client %>/{app,components}/**/*.spec.js',
          '<%= yeoman.client %>/{app,components}/**/*.mock.js'
        ]
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*',
            '!<%= yeoman.dist %>/.openshift',
            '!<%= yeoman.dist %>/Procfile'
          ]
        }]
      },
      archives: {
        files:[{
          dot: true,
          src:[
            '.archives/*'
          ]
        }]
      },
      ngdocs: {
        files:[{
          dot: true,
          src:[
            'docs'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/',
          src: '{,*/}*.css',
          dest: '.tmp/'
        }]
      }
    },

    // Debugging with node inspector
    'node-inspector': {
      custom: {
        options: {
          'web-host': 'localhost'
        }
      }
    },

    // Use nodemon to run server in debug mode with an initial breakpoint
    nodemon: {
      debug: {
        script: 'server/app.js',
        options: {
          nodeArgs: ['--debug-brk'],
          env: {
            PORT: localConfig.PORT || 9000
          },
          callback: function (nodemon) {
            nodemon.on('log', function (event) {
              console.log(event.colour);
            });

            // opens browser on initial server start
            nodemon.on('config:update', function () {
              setTimeout(function () {
                require('open')('http://localhost:8080/debug?port=5858');
              }, 500);
            });
          }
        }
      }
    },

    uglify: {
      options: {
        mangle: false,
        compress: false
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      target: {
        src: '<%= yeoman.client %>/index.html',
        ignorePath: '<%= yeoman.client %>/',
        exclude: [/bootstrap-sass-official/, /bootstrap.js/, '/json3/', '/es5-shim/', /bootstrap.css/ ]
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/public/{,*/}*.js',
            '<%= yeoman.dist %>/public/{,*/}*.css$',
            '<%= yeoman.dist %>/public/app/{,*/}*.css',
            '<%= yeoman.dist %>/public/app/style/{,*/}*.css',
            '<%= yeoman.dist %>/public/assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/public/assets/style/{,*/}*.css',
            '<%= yeoman.dist %>/public/assets/fonts/*'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: ['<%= yeoman.client %>/index.html',
             '<%= yeoman.client %>/qlik.html'],
      options: {
        dest: '<%= yeoman.dist %>/public'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/public/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/public/**/{,*/}*.css'],
      js: ['<%= yeoman.dist %>/public/{,*/}*.js'],
      options: {
        assetsDirs: [
          '<%= yeoman.dist %>/public',
          '<%= yeoman.dist %>/public/assets/images'
        ],
        // This is so we update image references in our ng-templates
        patterns: {
          js: [
            [/(assets\/images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the JS to reference our revved images'],
            [/(assets\/style\/.*?\.(?:css))/gm, 'Update the CSS to reference our revved css assets']
          ]
        }
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    // imagemin: {
    //   dist: {
    //     files: [{
    //       expand: true,
    //       cwd: '<%= yeoman.client %>/assets/images',
    //       src: '{,*/}*.{png,jpg,jpeg,gif}',
    //       dest: '<%= yeoman.dist %>/public/assets/images'
    //     }]
    //   }
    // },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.client %>/assets/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/public/assets/images'
        }]
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat',
          src: '*/**.js',
          dest: '.tmp/concat'
        }]
      }
    },

    // Package all the html partials into a single javascript payload
    ngtemplates: {
      options: {
        // This should be the name of your apps angular module
        module: 'limestoneApp',
        // 3/5/2015 -- TODO: explore how to fix htmlmin or an alternate library. This causes the build to fail
        htmlmin: {
          // Disable htmlmin setting due to non-stable situation
          // collapseBooleanAttributes: false,
          // collapseWhitespace: true,
          // removeAttributeQuotes: true,
          // removeEmptyAttributes: true,
          // removeRedundantAttributes: true,
          // removeScriptTypeAttributes: true,
          // removeStyleLinkTypeAttributes: true
        },
        usemin: 'app/app.js'
      },
      main: {
        cwd: '<%= yeoman.client %>',
        src: ['{app,components}/**/*.html'],
        dest: '.tmp/templates.js'
      },
      tmp: {
        cwd: '.tmp',
        src: ['{app,components}/**/*.html'],
        dest: '.tmp/tmp-templates.js'
      },
      qlikMain: {
        cwd: '<%= yeoman.client %>',
        src: ['qlik/**/*.html'],
        dest: '.tmp/qlik-templates.js',
        options: {
          usemin: 'qlik/qlik.js',
          module: 'qlik/module',
          bootstrap: function(module, script) {
            //Wrap the generated templates for use with RequireJS
            return 'define(\'qlik/templates\',[\'' + module + '\'], function(module) { module.run([\'$templateCache\',function($templateCache) { ' + script + ' }]); });';
          }
        }
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/public/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.client %>',
          dest: '<%= yeoman.dist %>/public',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'bower_components/**/*',
            'assets/images/{,*/}*.{webp}',
            'assets/images/*',
            'assets/style/*.css',
            'app/languages/*',
            'app/languages/locales/*',
            'app/style/*.png',
            'index.html',
            'qlik.html'
          ]
        }, {
          // bootstrap fonts
          expand: true,
          dot: true,
          cwd: '<%= yeoman.client %>/bower_components/bootstrap/dist',
          dest: '<%= yeoman.dist %>/public',
          src: ['fonts/*.*']
        }, {
          // font-awesome
          expand: true,
          dot: true,
          cwd: '<%= yeoman.client %>/bower_components/font-awesome',
          dest: '<%= yeoman.dist %>/public',
          src: ['fonts/*.*']
        }, {
          // Material Design Iconic Font
          expand: true,
          dot: true,
          cwd: '<%= yeoman.client %>/bower_components/material-design-iconic-font',
          dest: '<%= yeoman.dist %>/public',
          src: ['fonts/*.*']
        }, {
          // Images
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/public/assets/images',
          src: ['generated/*']
        }, {
          // JSON
          expand: true,
          dest: '<%= yeoman.dist %>',
          src: [
            'package.json',
            'server/**/*'
          ]
        }, {
          expand: true,
          dot: true,
          cwd: '.tmp/concat/',
          dest: '<%= yeoman.dist %>/public',
          src: [
            '**/*.js',
          ]
        }]
      },
      distClientConfig:{
        expand: true,
        cwd: '<%= yeoman.client %>/app/',
        dest: '<%= yeoman.client %>/app/',
        src: ['server.env.spec.js'],
        rename: function(dest, src){
          return dest + src.replace('.spec', '');
        }
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.client %>',
        dest: '.tmp/',
        src: ['{app,components,qlik}/**/*.css']
      },
      preDistCompress:{
        dest: '.archives/',
        src: ['deploy.Rho.Client.Server.'+ fullVersion + '.ps1', 'readme.deployment.txt', 'Rho.*.DeploymentConfig.xml']
      }
    },

    rename: {
      deployScript: {
        files: [
              {src: ['.archives/deploy.Rho.Client.Server.'+ fullVersion +'.ps1'], dest: '.archives/deploy.Rho.Client.Server.' + buildVersion + '.ps1'},
            ]
      },
    },

    buildcontrol: {
      options: {
        dir: 'dist',
        commit: true,
        push: true,
        connectCommits: false,
        message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
      },
      heroku: {
        options: {
          remote: 'heroku',
          branch: 'master'
        }
      },
      openshift: {
        options: {
          remote: 'openshift',
          branch: 'master'
        }
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      unit_test: {
        tasks: ['karma', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      },
      server: [
        'sass',
      ],
      test: [
        'sass',
      ],
      debug: {
        tasks: [
          'nodemon',
          'node-inspector'
        ],
        options: {
          logConcurrentOutput: true
        }
      },
      dist: [
        'sass',
        // 'imagemin',
        'svgmin'
      ]
    },

    // Unit Testing - Karma
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true // Used by -> grunt test:client
      }
    },

    // Mocha test for server. Built by offshore QA.
    mochaTest: {
      options: {
        reporter: 'spec'
      },
      src: ['server/**/*.spec.js']
    },

    // e2e Testing - Protractor
    protractor: {
      options: {
        configFile: 'protractor.conf.js'
      },
      chrome: {
        options: {
          args: {
            browser: 'chrome'
          }
        }
      }
    },

    env: {
      test: {
        NODE_ENV: 'test'
      },
      prod: {
        NODE_ENV: 'production'
      },
      all: localConfig
    },

    // Compiles Sass to CSS
    sass: {
      server: {
        options: {
          loadPath: [
            '<%= yeoman.client %>/bower_components',
            '<%= yeoman.client %>/app',
            '<%= yeoman.client %>/components',
            '<%= yeoman.client %>/qlik'
          ],
          compass: false
        },
        files: {
          '.tmp/app/style/app.css' : '<%= yeoman.client %>/app/style/app.scss',
          '.tmp/qlik/style/qlik.css' : '<%= yeoman.client %>/qlik/style/qlik.scss'
        }
      }
    },

    injector: {
      options: {

      },
      // Inject application script files into index.html (doesn't include bower)
      scripts: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/client/', '');
            filePath = filePath.replace('/.tmp/', '');
            return '<script src="' + filePath + '"></script>';
          },
          starttag: '<!-- injector:js -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          '<%= yeoman.client %>/index.html': [
              ['{.tmp,<%= yeoman.client %>}/{app,components}/**/*.js',
               '!{.tmp,<%= yeoman.client %>}/app/app.js',
               '!{.tmp,<%= yeoman.client %>}/app/config.js',
               '!{.tmp,<%= yeoman.client %>}/app/config.exceptionHandler.js',
               '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.spec.js',
               '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.mock.js']
            ]
        }
      },

      qlikScripts: {
        options: {
          transform: function(filePath) {
            var origFilePath = filePath.replace(/^\//,'');

            filePath = filePath.replace('/client/', '');
            filePath = filePath.replace('/.tmp/', '');

            // Ensure you can't have anonymous RequireJS modules
            // This is a really bad way to do this, but getting
            // grunt requirejs working with a project that's
            // only partially using requirejs wasn't working.
            var fs = require('fs');

            var anonModule = fs.readFileSync(origFilePath, 'utf-8');

            if (anonModule.match(/^\s*define\s*\(\s*\[/)) {
              anonModule = anonModule.replace(/^(\s*define\s*)\(\s*\[/, '$1(\'' +
                filePath.replace(/\.js/,'') + '\',[');

              fs.writeFileSync(origFilePath,anonModule, 'utf-8');
            }

            return '<script src="' + filePath + '"></script>';
          },
          starttag: '<!-- injector:qlikjs -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          '<%= yeoman.client %>/qlik.html': [
            [
              '{.tmp,<%= yeoman.client %>}/qlik/**/*.js',
              '!{.tmp,<%= yeoman.client %>}/qlik/templates.js'
            ]
          ]
        }
      },

      // Inject component scss into app.scss
      sass: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/client/app/', '');
            filePath = filePath.replace('/client/components/', '');
            return '@import \'' + filePath + '\';';
          },
          starttag: '// injector',
          endtag: '// endinjector'
        },
        files: {
          '<%= yeoman.client %>/app/style/app.scss': [
            '<%= yeoman.client %>/{app,components}/**/*.{scss,sass}',
            '!<%= yeoman.client %>/app/style/colors.{scss,sass}',
            '!<%= yeoman.client %>/app/style/app.{scss,sass}'
          ]
        }
      },

      // Inject component css into index.html
      css: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/client/', '');
            filePath = filePath.replace('/.tmp/', '');
            return '<link rel="stylesheet" href="' + filePath + '">';
          },
          starttag: '<!-- injector:css -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          '<%= yeoman.client %>/index.html': [
            '<%= yeoman.client %>/{app,components}/**/*.css'
          ]
        }
      }
    },

    eol: {
      html: {
        options: {
          eol: 'lf',
          replace: true
        },
        files: [
          { src: ['<%= yeoman.client %>/*.html'] }
        ]
      }
    },

    compress: {
      dist: {
        options: {
          archive: '.archives/Rho.Client.ServerPackage.'+ buildVersion +'.zip'
        },
        files: [
          {expand: true , cwd:'<%= yeoman.dist %>', src: ['**/*']},
        ]
      },
      resources: {
    		options: {
    		  archive: '.archives/Rho.Client.ServerPackage.'+ buildVersion +'.languages.zip'
    		},
    		files: [
    		  {expand: true , cwd:'<%= yeoman.dist %>', src: ['public/app/languages/**/*']},
        ]
  	  },
    },

    exec: {
      installProdModules: {
        cmd: 'npm install --production',
        cwd: '<%= yeoman.dist %>'
      }
    },

    // grunt-ngdocs
    ngdocs: {
      options: {
        scripts: [
          // 'client/bower_components/jquery/dist/jquery.js',
          // 'client/bower_components/angular/angular.js',
          // CDN jQuery & AngulerJS so it is easier for Edit in Plunkr.
          'https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.2/jquery.js',
          'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.15/angular.js',
          'client/bower_components/angular-animate/angular-animate.js',
          'client/bower_components/angular-cookies/angular-cookies.js',
          'client/bower_components/angular-resource/angular-resource.js',
          'client/bower_components/angular-sanitize/angular-sanitize.js',
          'client/bower_components/ngstorage/ngstorage.js',
          'client/bower_components/angular-translate/angular-translate.js',
          'client/bower_components/angular-dynamic-locale/src/tmhDynamicLocale.js',
          'client/bower_components/angular-ui-router/release/angular-ui-router.js',
          'client/app/javascript/ui-bootstrap-tpls.js',
          'client/bower_components/angular-ui-select/dist/select.min.js',
          'client/bower_components/ng-grid/build/ng-grid.js',
          'client/bower_components/angular-smart-table/dist/smart-table.min.js',
          'client/bower_components/d3/d3.js',
          'client/bower_components/nvd3/build/nv.d3.js',
          'client/bower_components/angularjs-nvd3-directives/dist/angularjs-nvd3-directives.js',
          'client/bower_components/angular-ui-utils/ui-utils.js',
          'client/app/app.js',
          'client/app/common/common.js',
          'client/app/common/bootstrap/bootstrap.dialog.js',
          'client/app/javascript/unsavedChanges.js',
          'client/app/javascript/angular-file-upload.js',
          'client/app/javascript/angular-placeholder-shim.js'
        ],
        html5Mode: false
      },
      all: ['client/app/**/*.js']
    },

    // grunt-ngdocs: Open browser w/ localhost:8888
    connect: {
      options: {
        keepalive: true
      },
      server: {
        options: {
          port: 8888
        }
      }
    }

  });

  // Used for delaying livereload until after server has restarted
  grunt.registerTask('wait', function () {
    grunt.log.ok('Waiting for server reload...');

    var done = this.async();

    setTimeout(function () {
      grunt.log.writeln('Done waiting!');
      done();
    }, 1500);
  });

  grunt.registerTask('make-build-version-file', function(){
    grunt.file.write("dist/buildversion.txt", buildVersion);
  });

  grunt.registerTask('express-keepalive', 'Keep grunt running', function() {
    this.async();
  });

  // grunt-ngdocs
  grunt.registerTask('docs', [
    'clean:ngdocs',
    'ngdocs',
    'connect'
  ]);

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run([
        'build',
        'env:all',
        'env:prod',
        'express:prod',
        'wait',
        'open',
        'express-keepalive'
      ]);
    }

    if(target === 'dist-without-build'){
      return grunt.task.run([
        'env:all',
        'env:prod',
        'express:prod',
        'wait',
        'express-keepalive'
      ]);
    }

    if (target === 'debug') {
      return grunt.task.run([
        'clean:server',
        'env:all',
        'injector:sass',
        'concurrent:server',
        'injector',
        'wiredep',
        'autoprefixer',
        'concurrent:debug'
      ]);
    }

    if (target === 'unittest') {
      return grunt.task.run([
        'clean:server',
        'env:all',
        'injector:sass',
        'concurrent:server',
        'injector',
        'wiredep',
        'autoprefixer',
        'express:dev',
        'wait',
        'open',
        'concurrent:unit_test'
      ]);
    }

    grunt.task.run([
      'clean:server',
      'env:all',
      'injector:sass',
      'concurrent:server',
      'injector',
      'wiredep',
      'autoprefixer',
      'express:dev',
      'wait',
      'open',
      'watch'
    ]);
  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  grunt.registerTask('test', function(target) {
    if (target === 'server') {
      return grunt.task.run([
        'env:all',
        'env:test',
        'mochaTest'
      ]);
    }

    else if (target === 'client') {
      return grunt.task.run([
        'clean:server',
        'env:all',
        'injector:sass',
        'concurrent:test',
        'injector',
        'autoprefixer',
        'karma'
      ]);
    }

    else if (target === 'e2e') {
      return grunt.task.run([
        'clean:server',
        'env:all',
        'env:test',
        'injector:sass',
        'concurrent:test',
        'injector',
        'wiredep',
        'autoprefixer',
        'express:dev',
        'protractor'
      ]);
    }

    else{
      grunt.task.run([
        'test:server',
        'test:client'
      ]);
    }
  });

  grunt.registerTask('build', [
    /*'karma',*/	// TEMPORARY disable karma unit testing on build - DLM 9-14-2015
    'eol:html', // usemin has a bug where it will fail on windows line endings.
    'copy:distClientConfig', // make sure the client has a server config
    'clean:dist',
    'injector:sass',
    'concurrent:dist',
    'injector',
    'wiredep',
    'useminPrepare',
    'autoprefixer',
    'ngtemplates',
    'concat',
    //'ngAnnotate',
    'copy:dist',
    'cdnify',
    'cssmin',
    'uglify',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);

  grunt.registerTask('package-dist', [
    'clean:archives',
    'build',
    'make-build-version-file',
    'copy:preDistCompress',
    'rename:deployScript',
    'exec:installProdModules',
    'compress:dist',
    'compress:resources'
  ]);

};
