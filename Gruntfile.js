// Gruntfile

module.exports = function(grunt) {
  'use strict'
  require('load-grunt-tasks')(grunt);

  var baseJsSourcePath = 'src/js/',
      fileToBuild = 'dist/js/' + 'proact.js';

  grunt.initConfig({
    concat: {
      dist: {
        src: '<%= customBuild.files %>',
        dest: fileToBuild
      }
    },
    wrap: {
      modules: {
        src: [fileToBuild],
        dest: '',
        options: {
          wrapper: [
            ';(function (pro) {\n' +
            '\tif (typeof module === "object" && typeof module.exports === "object") {\n' +
            '\t\tmodule.exports = pro();\n' +
            '\t} else {\n' +
            '\t\twindow.Pro = window.ProAct = window.P = pro();\n' +
            '\t}\n' +
            '}(function() {', '\treturn Pro;\n}));'
          ],
          indent: '\t',
          separator: '\n'
        }
      }
    },
    uglify: {
      main: {
        files: {
          'dist/js/proact.min.js': ['dist/js/proact.js']
        }
      }
    },
    clean: {
      dist: ['tmp', 'dist']
    },

    jshint: {
      all: ['src/js/**/*.js'],
      options: {
        curly: true,
        multistr: true,
        quotmark: 'single',
        camelcase: false,
        bitwise: false,
        unused: true,
        eqeqeq: true,
        indent: 2,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        boss: true,
        es5: true,
        eqnull: true,
        evil: true,
        scripturl: true,
        smarttabs: true,
        maxparams: 5,
        maxdepth: 3,
        maxlen: 100,
        globals: {}
      }
    },

    jsdoc : {
      dist : {
        src: ['src/js/**/*.js'],
        options: {
          destination: 'doc'
        }
      }
    },

    pkg: grunt.file.readJSON('package.json'),
    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        logo: '../proact_logo_icon.png',
        options: {
          linkNatives: true,
          paths: [
            'src/js/core',
            'src/js/properties',
            'src/js/streams',
            'src/js/arrays'
          ],
          exclude: [
            'cores',
            'events',
            'flow',
            'objects',
            'registry'
          ].join(','),
          outdir: 'doc',
          themedir: '../yuidoc-bootstrap-theme',
          helpers: ['../yuidoc-bootstrap-theme/helpers/helpers.js']
        }
      }
    },

    todo: {
      options: {
        verbose: true,
        marks: [
          {
            name: 'TODO',
            pattern: /TODO|\@todo/,
            color: "magenta"
          }
        ]
      },
      src : [
        'spec/unit/flow/flow.spec.js',
        'spec/unit/arrays/array.spec.js',
        'src/js/core/pro.js',
        'src/js/flow/queue.js',
        'src/js/flow/queues.js',
        'src/js/flow/flow.js',
        'src/js/core/actor_util.js',
        'src/js/core/actor.js',
        'src/js/core/event.js',
        'src/js/core/core.js',
        'src/js/events/value_event.js',
        'src/js/streams/stream.js',
        'src/js/streams/buffered_stream.js',
        'src/js/streams/size_buffered_stream.js',
        'src/js/streams/delayed_stream.js',
        'src/js/streams/throttling_stream.js',
        'src/js/streams/debouncing_stream.js',
        'src/js/streams/subscribable_stream.js',
        'src/js/arrays/array.js',
        'src/js/arrays/listeners.js',
        'src/js/properties/property.js',
        'src/js/dsl/registry.js',
        'src/js/dsl/provider.js'
      ]
    },

    compress: {
      main: {
        options: {
          mode: 'gzip'
        },
        files: [
          {expand: true, src: ['dist/js/proact.min.js'], dest: '', ext: '.min.gz.js'}
        ]
      }
    },

    karma: {
      unit: {
        configFile: 'spec/config/karma.conf.js',
        keepalive: true
      },
      integration: {
        configFile: 'spec/config/karma.integration.conf.js',
        keepalive: true
      },
      coverage: {
        configFile: 'spec/config/karma.coverage.conf.js',
        singleRun: true,
        browsers: ['PhantomJS']
      }
    }
  });

  grunt.registerTask('setup', 'build task', function() {

    var defaultFiles = [
          'core/pro',
          'flow/queue',
          'flow/queues',
          'flow/flow',
          'core/actor_util',
          'core/actor',
          'core/event',
          'core/core',
          'events/value_event',
          'streams/stream',
          'streams/buffered_stream',
          'streams/size_buffered_stream',
          'streams/delayed_stream',
          'streams/throttling_stream',
          'streams/debouncing_stream',
          'streams/subscribable_stream',
          'properties/property',
          'properties/auto_property',
          'properties/object_property',
          'properties/array_property',
          'properties/proxy_property',
          'properties/property_provider',
          'properties/object_core',
          'arrays/array_core',
          'arrays/array',
          'arrays/listeners',
          'objects/prob',
          'dsl/registry',
          'dsl/dsl',
          'dsl/provider',
        ],
        args = this.args, customFiles = [], index, i = -1;

    if (args.length) {
      while (++i < args.length) {
        index = defaultFiles.indexOf(args[i]);
        if (index !== -1) {
          defaultFiles.splice(index, 1);
        }
      }
    }

    customFiles = defaultFiles.map(function(currentFile) {
      return baseJsSourcePath + currentFile + '.js';
    });

    grunt.config.set('customBuild.files', customFiles);
  });

  grunt.registerTask('build', ['clean:dist', 'setup', 'concat', 'wrap', 'uglify', 'compress', 'karma:integration']);
  grunt.registerTask('spec', ['karma:unit']);
  grunt.registerTask('all', ['lint', 'todo', 'spec', 'jsdoc', 'build']);

  grunt.registerTask('default', ['build']);

};
