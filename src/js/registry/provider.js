function Provider () {
  this.stored = {};
}
function StreamProvider () {
  P.R.Provider.call(this);
}
function FunctionProvider () {
  P.R.Provider.call(this);
}
function ProObjectProvider () {
  P.R.Provider.call(this);
}

function streamConstructArgs (args) {
  var queueName;
  if (args.length === 2) {
    queueName = args[0];
    args[0] = args[1];
  }
  return [queueName].concat(args);
}

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
  Provider: Provider,

  /**
   * Constructs a ProAct.Registry.StreamProvider. The {@link ProAct.Registry} uses registered stream providers as storage for {@link ProAct.Stream}s.
   *
   * @class ProAct.Registry.StreamProvider
   * @extends ProAct.Registry.Provider
   * @memberof ProAct.Registry
   * @static
   * @see {@link ProAct.Registry}
   */
  StreamProvider: StreamProvider,

  /**
   * Constructs a ProAct.Registry.FunctionProvider. The {@link ProAct.Registry} uses registered function providers as storage for Functions.
   * <p>
   *  The function provider doesn't have implementation for creation of new functions, only for storing, readin and removing them.
   * </p>
   *
   * @class ProAct.Registry.FunctionProvider
   * @extends ProAct.Registry.Provider
   * @memberof ProAct.Registry
   * @static
   * @see {@link ProAct.Registry}
   */
  FunctionProvider: FunctionProvider,

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
  ProObjectProvider: ProObjectProvider
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
   * @param {Array} options
   *      Array containing options for the creation process. For example the exact sub-type of the object to create (optional).
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

  /**
   * Reads a stored instance.
   *
   * @memberof ProAct.Registry.Provider
   * @instance
   * @method get
   * @param {String} key
   *      The key to read.
   * @return {Object}
   *      The stored object corresponding to the passed <i>key</i> or undefined if there is no such object.
   */
  get: function (key) { return this.stored[key]; },

  /**
   * Deletes a stored instance.
   *
   * @memberof ProAct.Registry.Provider
   * @instance
   * @method delete
   * @param {String} key
   *      The key to delete.
   * @return {Object}
   *      The stored object corresponding to the passed <i>key</i> or undefined if there is no such object.
   */
  del: function(key) {
    var deleted = this.get(key);
    delete this.stored[key];
    return deleted;
  },

  /**
   * A callback called by the {@link ProAct.Registry} when <i>this</i> ProAct.Registry.Provider is registered.
   *
   * @memberof ProAct.Registry.Provider
   * @instance
   * @abstract
   * @method registered
   * @param {ProAct.Registry} registery
   *      The registry in which <i>this</i> is being registered.
   */
  registered: function (registry) {},

  /**
   * An object containing all the available sub-types constructions of the managed by <i>this</i> class.
   * <p>
   *  Should always have a 'basic' field for the default construction operation.
   * </p>
   *
   * @namespace ProAct.Registry.Provider.types
   * @memberof ProAct.Registry.Provider
   * @static
   */
  types: {

    /**
     * Defines default construction logic for the managed object.
     * <p>
     *  For example if we have a 'FooProvider', this method will be something like:
     *  <pre>
     *    return new Foo();
     *  </pre>
     * </p>
     * <p>
     *  It is abstract and must be overridden by the extenders, or an Error will be thrown.
     * </p>
     *
     * @memberof ProAct.Registry.Provider.types
     * @instance
     * @abstract
     * @method basic
     * @return {Object}
     *      An isntance of the managed class of objects.
     */
    basic: function () { throw new Error('Abstract: implement!'); }
  },

  /**
   * Provides a new instance of the managed by <i>this</i> ProAct.Registry.Provider object.
   *
   * @memberof ProAct.Registry.Provider
   * @instance
   * @method provide
   * @param {Array} options
   *      An array containing the key of the object to create and store. It may contain data to pass to the constructor of the object.
   * @param [...]
   *      Arguments that should be passed to the constructor.
   * @return {Object}
   *      An isntance of the managed class of objects.
   */
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

  /**
   * Reference to the constructor of this object.
   *
   * @memberof ProAct.Registry.StreamProvider
   * @instance
   * @constant
   * @default ProAct.Registry.StreamProvider
   */
  constructor: ProAct.Registry.StreamProvider,

  /**
   * A callback called by the {@link ProAct.Registry} when <i>this</i> ProAct.Registry.StreamProvider is registered.
   * <p>
   *  It adds the methods <i>s</i> and <i>stream</i> to the {@link ProAct.Registry}, which are aliases of <i>this</i>' {@link ProAct.Registry.StreamProvider#get} method.
   * </p>
   *
   * @memberof ProAct.Registry.StreamProvider
   * @instance
   * @method registered
   * @param {ProAct.Registry} registery
   *      The registry in which <i>this</i> is being registered.
   */
  registered: function (registry) {
    registry.s = registry.stream = P.U.bind(this, this.get);
  },

  /**
   * An object containing all the available sub-types constructions of the managed by <i>this</i> class.
   *
   * @namespace ProAct.Registry.StreamProvider.types
   * @memberof ProAct.Registry.StreamProvider
   * @static
   */
  types: {

    /**
     * Constructs a simple {@link ProAct.Stream}
     * <p>
     *  <pre>
     *    return new ProAct.Stream();
     *  </pre>
     * </p>
     *
     * @memberof ProAct.Registry.StreamProvider.types
     * @instance
     * @method basic
     * @return {ProAct.Stream}
     *      An isntance of {@link ProAct.Stream}.
     * @see {@link ProAct.Stream}
     */
    basic: function (args) { return new P.S(args[0]); },

    /**
     * Constructs a {@link ProAct.DelayedStream}
     * <p>
     *  <pre>
     *    return new ProAct.DelayedStream(delay);
     *  </pre>
     * </p>
     *
     * @memberof ProAct.Registry.StreamProvider.types
     * @instance
     * @method delayed
     * @param {Array} args
     *      An array of arguments - the first element of which is the <i>delay</i> of the stream to construct.
     * @return {ProAct.DelayedStream}
     *      An isntance of {@link ProAct.DelayedStream}.
     * @see {@link ProAct.DelayedStream}
     */
    delayed: function (args) {
      var args = streamConstructArgs(args);
      return new P.DBS(args[0], parseInt(args[1], 10));
    },

    /**
     * Constructs a {@link ProAct.SizeBufferedStream}
     * <p>
     *  <pre>
     *    return new ProAct.SizeBufferedStream(size);
     *  </pre>
     * </p>
     *
     * @memberof ProAct.Registry.StreamProvider.types
     * @instance
     * @method size
     * @param {Array} args
     *      An array of arguments - the first element of which is the <i>size</i> of the stream to construct.
     * @return {ProAct.SizeBufferedStream}
     *      An isntance of {@link ProAct.SizeBufferedStream}.
     * @see {@link ProAct.SizeBufferedStream}
     */
    size: function (args) {
      var args = streamConstructArgs(args);
      return new P.SBS(args[0], parseInt(args[1], 10));
    },

    /**
     * Constructs a {@link ProAct.DebouncingStream}
     * <p>
     *  <pre>
     *    return new ProAct.DebouncingStream(delay);
     *  </pre>
     * </p>
     *
     * @memberof ProAct.Registry.StreamProvider.types
     * @instance
     * @method debouncing
     * @param {Array} args
     *      An array of arguments - the first element of which is the <i>delay</i> of the stream to construct.
     * @return {ProAct.DebouncingStream}
     *      An isntance of {@link ProAct.DebouncingStream}.
     * @see {@link ProAct.DebouncingStream}
     */
    debouncing: function (args) {
      var args = streamConstructArgs(args);
      return new P.DDS(args[0], parseInt(args[1], 10));
    },

    /**
     * Constructs a {@link ProAct.ThrottlingStream}
     * <p>
     *  <pre>
     *    return new ProAct.ThrottlingStream(delay);
     *  </pre>
     * </p>
     *
     * @memberof ProAct.Registry.StreamProvider.types
     * @instance
     * @method throttling
     * @param {Array} args
     *      An array of arguments - the first element of which is the <i>delay</i> of the stream to construct.
     * @return {ProAct.ThrottlingStream}
     *      An isntance of {@link ProAct.ThrottlingStream}.
     * @see {@link ProAct.ThrottlingStream}
     */
    throttling: function (args) {
      var args = streamConstructArgs(args);
      return new P.TDS(args[0], parseInt(args[1], 10));
    }
  }
});

var higher = {
  split: function (provider, action, data) {
    var keys = data.split(action),
        ln = keys.length, i,
        functions = [];
    for (i = 0; i < ln; i++) {
      functions.push(provider.get(keys[i].trim()));
    }

    return functions;
  },

  accumulator: function (functions, initial, computation) {
    return function () {
      var i, ln = functions.length, result = initial;
      for (i = 0; i < ln; i++) {
        result = computation(result, functions[i].apply(null, arguments));
      }
      return result;
    };
  },
  or: function (tillNow, argument) {
    return tillNow || argument;
  },
  and: function (tillNow, argument) {
    return tillNow && argument;
  }
};

ProAct.Registry.FunctionProvider.prototype = P.U.ex(Object.create(P.R.Provider.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @memberof ProAct.Registry.FunctionProvider
   * @instance
   * @constant
   * @default ProAct.Registry.FunctionProvider
   */
  constructor: ProAct.Registry.FunctionProvider,

  // Private stuff
  predefinedActions: {
    map: 'mapping',
    filter: 'filtering',
    acc: 'accumulation'
  },

  /**
   * Reads a stored instance.
   * <p>
   *  If stored instance is not found and the key is in the form:
   *  actions(arg) - it is searched in the predefined lambdas, for example:
   *  <pre>
   *    map(+)
   *  </pre>
   * </p>
   *
   * @memberof ProAct.Registry.FunctionProvider
   * @instance
   * @method get
   * @param {String} key
   *      The key to read.
   * @return {Object}
   *      The stored object corresponding to the passed <i>key</i> or
   *      predefined lambda or undefined if there is no such object.
   */
  get: function (key) {
    var func,
        reg, matched,
        action, args,
        i, ln;

    if (key.indexOf('OR') !== -1) {
      return higher.accumulator(higher.split(this, 'OR', key), false, higher.or);
    } else if (key.indexOf('AND') !== -1) {
      return higher.accumulator(higher.split(this, 'AND', key), true, higher.and);
    } else if (key.indexOf('!') === 0) {
      func = this.get(key.substring(1));
      return function () {
        return !func.apply(null, arguments);
      };
    }

    func = this.stored[key];
    if (!func) {
      reg = new RegExp("(\\w*)\\(([\\s\\S]*)\\)");
      matched = reg.exec(key);
      if (matched) {
        action = matched[1], args = matched[2],
        func = dsl.predefined[this.predefinedActions[action]][args];
      }
    }

    return func;
  }
});

ProAct.Registry.ProObjectProvider.prototype = P.U.ex(Object.create(P.R.Provider.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @memberof ProAct.Registry.ProObjectProvider
   * @instance
   * @constant
   * @default ProAct.Registry.ProObjectProvider
   */
  constructor: ProAct.Registry.ProObjectProvider,

  /**
   * A callback called by the {@link ProAct.Registry} when <i>this</i> ProAct.Registry.ProObjectProvider is registered.
   * <p>
   *  It adds the methods <i>po</i> and <i>proObject</i> to the {@link ProAct.Registry}, which are aliases of <i>this</i>' {@link ProAct.Registry.ProObjectProvider#get} method.
   * </p>
   * <p>
   *  It adds the method <i>prob</i> to the {@link ProAct.Registry}, which is alias of <i>this</i>' {@link ProAct.Registry.ProObjectProvider#make} method.
   * </p>
   *
   * @memberof ProAct.Registry.StreamProvider
   * @instance
   * @method registered
   * @param {ProAct.Registry} registery
   *      The registry in which <i>this</i> is being registered.
   */
  registered: function (registry) {
    registry.po = registry.proObject = P.U.bind(this, this.get);
    registry.prob = P.U.bind(this, function (key, val, meta) {
      return this.make(key, null, val, meta);
    });
  },

  /**
   * An object containing all the available sub-types constructions of the managed by <i>this</i> class.
   *
   * @namespace ProAct.Registry.ProObjectProvider.types
   * @memberof ProAct.Registry.ProObjectProvider
   * @static
   */
  types: {

    /**
     * Constructs a ProAct.js reactive object from original one, using {@link ProAct.prob}
     * <p>
     *  <pre>
     *    return new ProAct.prob(value, meta);
     *  </pre>
     * </p>
     *
     * @memberof ProAct.Registry.ProObjectProvider.types
     * @instance
     * @method basic
     * @param {Array} options
     *      Array containing options for the creation process.
     * @param {Object} value
     *      The object/value to make reactive.
     * @param {Object|String} meta
     *      Meta-data used to help in the reactive object creation.
     * @return {Object}
     *      A ractive object.
     * @see {@link ProAct.prob}
     */
    basic: function (options, value, meta) {
      return P.prob(value, meta);
    }
  }
});

streamProvider = new P.R.StreamProvider();
functionProvider = new P.R.FunctionProvider();
proObjectProvider = new P.R.ProObjectProvider();

/**
 * The {@link ProAct.Registry} instance used by ProAct's by default.
 * <p>
 *  It has a {@link ProAct.Registry.StreamProvider} registered on the <i>s</i> namespace.
 * </p>
 * <p>
 *  It has a {@link ProAct.Registry.ProObjectProvider} registered on the <i>po</i> and <i>obj</i> namespaces.
 * </p>
 * <p>
 *  It has a {@link ProAct.Registry.FunctionProvider} registered on the <i>f</i> and <i>l</i> namespaces.
 * </p>
 * <p>
 *  Override this instance or register your own providers in it to extend the ProAct.js DSL.
 * </p>
 *
 * @type ProAct.Registry
 * @memberof ProAct
 * @static
 */
ProAct.registry = new P.R()
  .register('s', streamProvider)
  .register('po', proObjectProvider)
  .register('obj', proObjectProvider)
  .register('f', functionProvider)
  .register('l', functionProvider);
