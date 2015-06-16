module.exports = function(karma) {
  karma.set({
    basePath: '../..',
    frameworks: ['jasmine'],

    files: [
      'src/js/core/pro.js',
      'src/js/flow/queue.js',
      'src/js/flow/queues.js',
      'src/js/flow/flow.js',
      'src/js/core/actor_util.js',
      'src/js/core/actor.js',
      'src/js/core/event.js',
      'src/js/core/core.js',
      'src/js/core/functions.js',
      'src/js/streams/stream.js',
      'src/js/streams/buffered_stream.js',
      'src/js/streams/size_buffered_stream.js',
      'src/js/streams/delayed_stream.js',
      'src/js/streams/throttling_stream.js',
      'src/js/streams/debouncing_stream.js',
      'src/js/streams/subscribable_stream.js',
      'src/js/streams/functions.js',
      'src/js/properties/value_event.js',
      'src/js/properties/property.js',
      'src/js/properties/auto_property.js',
      'src/js/properties/object_property.js',
      'src/js/properties/array_property.js',
      'src/js/properties/proxy_property.js',
      'src/js/properties/property_provider.js',
      'src/js/properties/object_core.js',
      'src/js/properties/functions.js',
      'src/js/arrays/array_core.js',
      'src/js/arrays/array.js',
      'src/js/arrays/listeners.js',
      'src/js/dsl/registry.js',
      'src/js/dsl/dsl.js',
      'src/js/dsl/provider.js',
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
