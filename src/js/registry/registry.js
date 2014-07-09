Pro.Registry = Pro.R = function () {
  this.providers = {};
};

Pro.Registry.prototype = rProto = {
  constructor: Pro.Registry,
  register: function (namespace, provider) {
    if (this.providers[namespace]) {
      throw new Error(namespace + 'is already registered in this registry.');
    }
    this.providers[namespace] = provider;
    if (provider.registered) {
      provider.registered(this);
    }
    return this;
  },
  make: function (name, options) {
    var args = slice.call(arguments, 2),
        p = this.getProviderByName(name),
        observable;

    if (p[0]) {
      observable = p[0].make.apply(p[0], [p[1], p[2]].concat(args));
      return this.setup(observable, options, args);
    }
    return null;
  },
  setup: function (object, options, args) {
    return dsl.run.apply(null, [object, options, this].concat(args));
  },
  store: function (name, object, options) {
    var args = slice.call(arguments, 2),
        p = this.getProviderByName(name);

    if (p[0]) {
      return p[0].store.apply(p[0], [p[1], object, p[2]].concat(args));
    }
    return null;
  },
  get: function (name) {
    var p = this.getProviderByName(name);

    if (p[0]) {
      return p[0].get(p[1]);
    }
    return null;
  },
  getProviderByName: function (name) {
    var parts = name.split(':');

    return [this.providers[parts[0]], parts[1], parts.slice(2)];
  },
  toObjectArray: function (array) {
    var _this = this;
    if (!Pro.U.isArray(array)) {
      return this.toObject(array);
    }
    return map.call(array, function (el) {
      return _this.toObject(el);
    });
  },
  toObject: function (data) {
    if (Pro.U.isString(data)) {
      var result = this.get(data);
      return result ? result : data;
    }

    return data;
  }
};

Pro.U.ex(Pro.Registry, {
  Provider: function () {
    this.stored = {};
  },
  StreamProvider: function () {
    Pro.Registry.Provider.call(this);
  },
  FunctionProvider: function () {
    Pro.Registry.Provider.call(this);
  }
});

Pro.Registry.Provider.prototype = {
  constructor: Pro.Registry.Provider,
  make: function (key, options) {
    var stream;
    this.stored[key] = stream = this.provide(options);
    return stream;
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
    var type = options[0], regexp, matched, args;
    if (type) {
      regexp = new RegExp("(\\w*)\\(([\\s\\S]*)\\)");
      matched = regexp.exec(type);
      args = matched[2];
      if (args) {
        args = args.split(',');
      }
      type = matched[1];
      if (type && this.types[type]) {
        return this.types[type].call(this, args);
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

streamProvider = new Pro.Registry.StreamProvider();
functionProvider = new Pro.Registry.FunctionProvider();

Pro.registry = new Pro.Registry()
  .register('s', streamProvider)
  .register('f', functionProvider)
  .register('l', functionProvider);
