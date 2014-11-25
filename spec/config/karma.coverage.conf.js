module.exports = function(karma) {
  karma.set({
    basePath: '../..',
    frameworks: ['jasmine'],

    files: [
      'src/js/pro.js',
      'src/js/flow/queue.js',
      'src/js/flow/queues.js',
      'src/js/flow/flow.js',
      'src/js/actor.js',
      'src/js/events/event.js',
      'src/js/events/value_event.js',
      'src/js/streams/stream.js',
      'src/js/streams/buffered_stream.js',
      'src/js/streams/size_buffered_stream.js',
      'src/js/streams/delayed_stream.js',
      'src/js/streams/throttling_stream.js',
      'src/js/streams/debouncing_stream.js',
      'src/js/properties/property.js',
      'src/js/properties/null_property.js',
      'src/js/properties/auto_property.js',
      'src/js/properties/object_property.js',
      'src/js/properties/array_property.js',
      'src/js/properties/proxy_property.js',
      'src/js/properties/property_provider.js',
      'src/js/cores/core.js',
      'src/js/cores/array_core.js',
      'src/js/cores/object_core.js',
      'src/js/arrays/array.js',
      'src/js/arrays/listeners.js',
      'src/js/objects/val.js',
      'src/js/objects/prob.js',
      'src/js/registry/registry.js',
      'src/js/registry/dsl.js',
      'src/js/registry/provider.js',
      'spec/spec_helper.js',
      'spec/unit/**/*.spec.js',
      'spec/integration/**/*.spec.js'
    ],

    reporters: ['progress', 'coverage'],

    preprocessors: {
      'src/**/*.js': 'coverage'
    },

    coverageReporter: {
      type : 'html',
      dir : 'coverage/'
    },

    browsers: ['PhantomJS'],
    captureTimeout: 5000,
    singleRun: true,
    reportSlowerThan: 500,

    plugins: [
      'karma-jasmine',
      'karma-coverage',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-phantomjs-launcher'
    ]
  });
};
