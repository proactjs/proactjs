ProAct.Registry = P.R = function () {
  this.providers = {};
};

ProAct.Registry.prototype = rProto = {
  constructor: ProAct.Registry,
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
    var self = this;
    if (!P.U.isArray(array)) {
      return this.toObject(array);
    }
    return map.call(array, function (el) {
      return self.toObject(el);
    });
  },
  toObject: function (data) {
    if (P.U.isString(data)) {
      var result = this.get(data);
      return result ? result : data;
    }

    return data;
  }
};
