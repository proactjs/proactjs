Pro.U.ex(Pro.Registry, {
  Provider: function () {
    this.stored = {};
  },
  StreamProvider: function () {
    Pro.Registry.Provider.call(this);
  },
  FunctionProvider: function () {
    Pro.Registry.Provider.call(this);
  },
  ProObjectProvider: function () {
    Pro.Registry.Provider.call(this);
  }
});

Pro.Registry.Provider.prototype = {
  constructor: Pro.Registry.Provider,
  useOptions: true,
  make: function (key, options) {
    var provided, args = slice.call(arguments, 1);
    this.stored[key] = provided = this.provide.apply(this, args);
    return provided;
  },
  store: function (key, func, options) { return this.stored[key] = func; },
  get: function (key) { return this.stored[key]; },
  del: function(key) {
    var deleted = this.get(key);
    delete this.stored[key];
    return deleted;
  },
  registered: function (registry) {},
  types: {
    basic: function () { throw new Error('Abstract: implement!'); }
  },
  provide: function (options) {
    if (this.useOptions) {
      var type = options[0],
          regexp, matched, args,
          argumentData = slice.call(arguments, 1);
      if (type) {
        regexp = new RegExp("(\\w*)\\(([\\s\\S]*)\\)");
        matched = regexp.exec(type);
        args = matched[2];
        if (args) {
          args = args.split(',');
        }
        type = matched[1];
        if (type && this.types[type]) {
          return this.types[type].apply(this, [args].concat(argumentData));
        }
      }
    }

    return this.types.basic(options);
  }
};

Pro.Registry.StreamProvider.prototype = Pro.U.ex(Object.create(Pro.Registry.Provider.prototype), {
  constructor: Pro.Registry.StreamProvider,
  registered: function (registry) {
    registry.s = registry.stream = Pro.U.bind(this, this.get);
  },
  types: {
    basic: function () { return new Pro.Stream(); },
    delayed: function (args) { return new Pro.DelayedStream(parseInt(args[0], 10)); },
    size: function (args) { return new Pro.SizeBufferedStream(parseInt(args[0], 10)); },
    debouncing: function (args) { return new Pro.DebouncingStream(parseInt(args[0], 10)); },
    throttling: function (args) { return new Pro.ThrottlingStream(parseInt(args[0], 10)); }
  }
});

Pro.Registry.FunctionProvider.prototype = Pro.U.ex(Object.create(Pro.Registry.Provider.prototype), {
  constructor: Pro.Registry.FunctionProvider
});

Pro.Registry.ProObjectProvider.prototype = Pro.U.ex(Object.create(Pro.Registry.Provider.prototype), {
  constructor: Pro.Registry.ProObjectProvider,
  useOptions: false,
  registered: function (registry) {
    registry.po = registry.proObject = Pro.U.bind(this, this.get);
  },
  types: {
    basic: function (value) {
      return Pro.prob(value);
    }
  }
});

streamProvider = new Pro.Registry.StreamProvider();
functionProvider = new Pro.Registry.FunctionProvider();
proObjectProvider = new Pro.Registry.ProObjectProvider();

Pro.registry = new Pro.Registry()
  .register('s', streamProvider)
  .register('po', proObjectProvider)
  .register('obj', proObjectProvider)
  .register('f', functionProvider)
  .register('l', functionProvider);
