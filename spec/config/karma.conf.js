module.exports = function(karma) {
  karma.set({
    basePath: '../..',
    frameworks: ['jasmine'],

    files: [
      'src/js/pro.js',
      'src/js/flow/queue.js',
      'src/js/flow/queues.js',
      'src/js/flow/flow.js',
      'src/js/objects/observable.js',
      'src/js/events/pro_event.js',
      'src/js/streams/stream.js',
      'src/js/streams/buffered_stream.js',
      'src/js/streams/size_buffered_stream.js',
      'src/js/streams/delayed_stream.js',
      'src/js/streams/throttling_stream.js',
      'src/js/streams/debouncing_stream.js',
      'src/js/arrays/pro_array.js',
      'src/js/arrays/listeners.js',
      'src/js/properties/property.js',
      'src/js/properties/null_property.js',
      'src/js/properties/auto_property.js',
      'src/js/properties/object_property.js',
      'src/js/properties/array_property.js',
      'src/js/objects/pro_core.js',
      'src/js/objects/pro_val.js',
      'src/js/objects/prob.js',
      'src/js/registry/registry.js',
      'src/js/registry/dsl.js',
      'spec/spec_helper.js',
      'spec/unit/**/*.spec.js'
    ],

    browsers: ['PhantomJS'],
    captureTimeout: 5000,
    singleRun: true,
    reportSlowerThan: 500,

    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-phantomjs-launcher'
    ]
  });
};
