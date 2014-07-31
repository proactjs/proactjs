P.U.ex(ProAct.Registry, {

  /**
   * Constructs a ProAct.Registry.Provider. The {@link ProAct.Registry} uses registered providers as storage for different objects.
   * <p>
   *  Every provider has one or more namespaces in the {@link ProAct.Registry} it is registered to.
   * </p>
   * <p>
   *  Every provider knows how to store its type of obects, how to make them, or delete them.
   * </p>
   *
   * @class ProAct.Registry.Provider
   * @memberof ProAct.Registry
   * @static
   * @see {@link ProAct.Registry}
   */
  Provider: function () {
    this.stored = {};
  },

  /**
   * Constructs a ProAct.Registry.StreamProvider. The {@link ProAct.Registry} uses registered stream providers as storage for {@link ProAct.Stream}s.
   *
   * @class ProAct.Registry.StreamProvider
   * @extends ProAct.Registry.Provider
   * @memberof ProAct.Registry
   * @static
   * @see {@link ProAct.Registry}
   */
  StreamProvider: function () {
    P.R.Provider.call(this);
  },

  /**
   * Constructs a ProAct.Registry.FunctionProvider. The {@link ProAct.Registry} uses registered function providers as storage for Functions.
   *
   * @class ProAct.Registry.FunctionProvider
   * @extends ProAct.Registry.Provider
   * @memberof ProAct.Registry
   * @static
   * @see {@link ProAct.Registry}
   */
  FunctionProvider: function () {
    P.R.Provider.call(this);
  },

  /**
   * Constructs a ProAct.Registry.ProObjectProvider.
   * The {@link ProAct.Registry} uses registered function providers as storage for objects with reactive {@link ProAct.Property} instances.
   *
   * @class ProAct.Registry.ProObjectProvider
   * @extends ProAct.Registry.Provider
   * @memberof ProAct.Registry
   * @static
   * @see {@link ProAct.Registry}
   * @see {@link ProAct.Property}
   */
  ProObjectProvider: function () {
    P.R.Provider.call(this);
  }
});

ProAct.Registry.Provider.prototype = {

  /**
   * Reference to the constructor of this object.
   *
   * @memberof ProAct.Registry.Provider
   * @instance
   * @constant
   * @default ProAct.Registry.Provider
   */
  constructor: ProAct.Registry.Provider,

  /**
   * Creates and stores an instance of the object this ProAct.Registry.Provider manages.
   * <p>
   *  For the creation is used the {@link ProAct.Registry.Provider#provide} method.
   * </p>
   *
   * @memberof ProAct.Registry.Provider
   * @instance
   * @method make
   * @param {String} key
   *      The key on which the new instance will be stored.
   * @param {String} options
   *      String containing options for the creation process. For example the exact sub-type of the object to create (optional).
   * @param [...]
   *      Parameters passed to the constructor when the new instance is created.
   * @return {Object}
   *      The newly created and stored object.
   * @see {@link ProAct.Registry.Provider#provide}
   */
  make: function (key, options) {
    var provided, args = slice.call(arguments, 1);
    this.stored[key] = provided = this.provide.apply(this, args);
    return provided;
  },

  /**
   * Stores an instance of an object this ProAct.Registry.Provider manages.
   *
   * @memberof ProAct.Registry.Provider
   * @instance
   * @method store
   * @param {String} key
   *      The key on which the <i>object</i> will be stored.
   * @param {Object} object
   *      The object to store.
   * @return {Object}
   *      The stored object.
   */
  store: function (key, object) { return this.stored[key] = object; },
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
    if (options) {
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

    return this.types.basic.apply(this, arguments);
  }
};

ProAct.Registry.StreamProvider.prototype = P.U.ex(Object.create(P.R.Provider.prototype), {
  constructor: ProAct.Registry.StreamProvider,
  registered: function (registry) {
    registry.s = registry.stream = P.U.bind(this, this.get);
  },
  types: {
    basic: function () { return new P.S(); },
    delayed: function (args) { return new Pro.DelayedStream(parseInt(args[0], 10)); },
    size: function (args) { return new Pro.SizeBufferedStream(parseInt(args[0], 10)); },
    debouncing: function (args) { return new Pro.DebouncingStream(parseInt(args[0], 10)); },
    throttling: function (args) { return new Pro.ThrottlingStream(parseInt(args[0], 10)); }
  }
});

ProAct.Registry.FunctionProvider.prototype = P.U.ex(Object.create(P.R.Provider.prototype), {
  constructor: ProAct.Registry.FunctionProvider
});

ProAct.Registry.ProObjectProvider.prototype = P.U.ex(Object.create(P.R.Provider.prototype), {
  constructor: ProAct.Registry.ProObjectProvider,
  registered: function (registry) {
    registry.po = registry.proObject = P.U.bind(this, this.get);
    registry.prob = P.U.bind(this, function (key, val, meta) {
      return this.make(key, null, val, meta);
    });
  },
  types: {
    basic: function (options, value, meta) {
      return P.prob(value, meta);
    }
  }
});

streamProvider = new P.R.StreamProvider();
functionProvider = new P.R.FunctionProvider();
proObjectProvider = new P.R.ProObjectProvider();

P.registry = new P.R()
  .register('s', streamProvider)
  .register('po', proObjectProvider)
  .register('obj', proObjectProvider)
  .register('f', functionProvider)
  .register('l', functionProvider);
