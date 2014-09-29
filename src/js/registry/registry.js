/**
 * <p>
 *  Constructs a ProAct.Registry. It is used to store/create objects that can be referenced or configured using the {@link ProAct.DSL}.
 * </p>
 * <p>
 *  ProAct.Registry is part og the DSL module of ProAct.js.
 * </p>
 *
 * @class ProAct.Registry
 */
function Registry () {
  this.providers = {};
}
ProAct.Registry = P.R = Registry;

ProAct.Registry.prototype = rProto = {

  /**
   * Reference to the constructor of this object.
   *
   * @memberof ProAct.Registry
   * @instance
   * @constant
   * @default ProAct.Registry
   */
  constructor: ProAct.Registry,

  /**
   * Registers a {@link ProAct.Registry.Provider} for the passed <i>namespace</i> in the registry.
   *
   * @memberof ProAct.Registry
   * @instance
   * @method register
   * @param {String} namespace
   *      The namespace to register the <i>provider</i> in.
   * @param {ProAct.Registry.Provider} provider
   *      The {@link ProAct.Registry.Provider} to register.
   * @return {ProAct.Registers}
   *      <i>this</i>
   * @throws {Error}
   *      If a {@link ProAct.Registry.Provider} is already registered for the passed <i>namespace</i>.
   * @see {@link ProAct.Registry.Provider}
   */
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

  /**
   * Retrieves the right {@link ProAct.Registry.Provider} using the <i>name</i> of stored
   * in <i>this</i> ProAct.Registry object, or the <i>name</i> of an object to be stored
   *
   * @memberof ProAct.Registry
   * @instance
   * @method getProviderByName
   * @param {String} name
   *      The name of storable object.
   *      <p>
   *        It must be in the format '{namespace}:{key}'.
   *      </p>
   *      <p>
   *        Here the namespace is the namespace the {@link ProAct.Registry.Provider} manages.
   *      </p>
   * @return {Array}
   *      The first element in the result is the {@link ProAct.Registry.Provider} or undefined if not found.
   *      <p>
   *        The second one is the <b>key</b> at which an object is stored or will be stored in the provider.
   *      </p>
   *      <p>
   *        The third element is an array with options for storing/creating an object passed to the provider using
   *        the <i>name</i> string.
   *      </p>
   * @see {@link ProAct.Registry.Provider}
   */
  getProviderByName: function (name) {
    var parts = name.split(':');

    return [this.providers[parts[0]], parts[1], parts.slice(2)];
  },

  /**
   * Configures an object to be stored using {@link ProAct.DSL} passed through <i>options</i> and DSL arguments.
   * <p>
   *  Example usage:
   * </p>
   * <p>
   *  A {@link ProAct.Stream} is passed to the registry for setup with DSL data.
   * </p>
   * <p>
   *  The data passed through the <i>options</i> parameter is
   *  <pre>
   *    '<<(s:foo)|map(-)|filter($1)'
   *  </pre>
   * </p>
   * <p>
   *  And the arguments for the DSL machine passed through the <i>args</i> parameter are
   *  <pre>
   *    [function (v) {
   *      return v % 2 === 0;
   *    }]
   *  </pre>
   * </p>
   * <p>
   *  This means that a {@link ProAct.Stream} stored in <i>this</i> registry by the key 'foo' should be set
   *  as a source to the passed as the <i>object</i> parameter simple {@link ProAct.Stream}.
   * </p>
   * <p>
   *  It also means that for every value comming in the <i>object</i> parameter's stream there should be mapping of negativity and
   *  only even values should be passed to it.
   * </p>
   * <p>
   *  So if we trigger in the 'foo' stream the value of <b>4</b> in our stream we will get <b>-4</b>, and if we trigger 5, we won't get anything.
   * </p>
   *
   * @memberof ProAct.Registry
   * @instance
   * @method setup
   * @param {Object} object
   *      The object to setup.
   * @param {String|Object} options
   *      A {@link ProAct.DSL} data object or string used to setup the object.
   * @param {Array} args
   *      Arguments to be used by the {@link ProAct.DSL#run} method while configuring the passed <i>object</i>.
   * @return {Object}
   *      Ready to strore object.
   * @see {@link ProAct.DSL}
   * @see {@link ProAct.DSL#run}
   */
  setup: function (object, options, args) {
    return dsl.run.apply(null, [object, options, this].concat(args));
  },

  /**
   * Creates a new object and stores it in <i>this</i> registry, using the right provider for the creation
   * and configuring it using the DSL passed through the <i>options</i> parameter.
   * <p>
   *  {@link ProAct.Registry#getProviderByName} is used to locate the right provider to create the object with.
   * </p>
   * <p>
   *  {@link ProAct.Registry#setup} is used to setup the newly created object using the {@link ProAct.DSL}
   * </p>
   * <p>
   *  The idea of this method is to create and configure {@link ProAct.Actor} objects.
   * </p>
   *
   * @memberof ProAct.Registry
   * @instance
   * @method make
   * @param {String} name
   *      Name of the object to create and store.
   *      <p>
   *        It must be in the format '{namespace}:{key}'
   *      </p>
   * @param {String|Object} options
   *      A {@link ProAct.DSL} data object or string used to setup the object to be created.
   * @param [...]
   *      <b>Arguments</b> to be used by the {@link ProAct.DSL#run} method while configuring the newly created <i>object</i>.
   * @return {Object}
   *      The newly created, stored and configured object, or null if there was no {@link ProAct.Registry.Provider} register for its type.
   * @see {@link ProAct.DSL}
   * @see {@link ProAct.Registry#getProviderByName}
   * @see {@link ProAct.Registry#setup}
   * @see {@link ProAct.Actor}
   */
  make: function (name, options) {
    var args = slice.call(arguments, 2),
        p = this.getProviderByName(name),
        actor;

    if (p[0]) {
      actor = p[0].make.apply(p[0], [p[1], p[2]].concat(args));
      return this.setup(actor, options, args);
    }
    return null;
  },

  /**
   * Stores an object  in <i>this</i> registry, using the right provider to configure it using the DSL passed through the <i>options</i> parameter.
   * <p>
   *  {@link ProAct.Registry#getProviderByName} is used to locate the right provider to store the object to.
   * </p>
   *
   * @memberof ProAct.Registry
   * @instance
   * @method store
   * @param {String} name
   *      Name of the object to store.
   *      <p>
   *        It must be in the format '{namespace}:{key}'
   *      </p>
   * @param {Object} object
   *      The object to store.
   * @param {String|Object} options
   *      A {@link ProAct.DSL} data object or string used to setup the object to be stored (optional).
   * @param [...]
   *      <b>Arguments</b> to be used by the {@link ProAct.DSL#run} method while configuring the <i>object</i>.
   * @return {Object}
   *      The stored and configured object, or null if there was no {@link ProAct.Registry.Provider} register for its type.
   * @see {@link ProAct.DSL}
   * @see {@link ProAct.Registry#getProviderByName}
   */
  store: function (name, object, options) {
    var args = slice.call(arguments, 2),
        p = this.getProviderByName(name);

    if (p[0]) {
      return p[0].store.apply(p[0], [p[1], object, p[2]].concat(args));
    }
    return null;
  },

  /**
   * Retrieves an object, stored <i>this</i> registry.
   * <p>
   *  {@link ProAct.Registry#getProviderByName} is used to locate the right provider to retrieve the object from.
   * </p>
   *
   * @memberof ProAct.Registry
   * @instance
   * @method get
   * @param {String} name
   *      Name of the object to find.
   *      <p>
   *        It must be in the format '{namespace}:{key}'
   *      </p>
   * @return {Object}
   *      The stored object, or null if there was no {@link ProAct.Registry.Provider} register for its type or no object registered for the passed <i>name</i>.
   * @see {@link ProAct.Registry#getProviderByName}
   */
  get: function (name) {
    var p = this.getProviderByName(name);

    if (p[0]) {
      return p[0].get(p[1]);
    }
    return null;
  },

  /**
   * Helper method for transforming an array of keys of stored items in <i>this</i> ProAct.Registry to an array of the actual items.
   * <p>
   *  Mainly used by the {@link ProAct.DSL} logic.
   * </p>
   *
   * @memberof ProAct.Registry
   * @instance
   * @method toObjectArray
   * @param {Array} array
   *      Array of string keys to objects stored in <i>this</i> registry to be retrieved using {@link ProAct.Registry#toObject}.
   *      <p>
   *        If object is not stored on some key, the key itself is returned in the same possition in the result array.
   *      </p>
   * @return {Array}
   *      Of the retrieved objects, in the same order as the keys.
   * @see {@link ProAct.Registry#toObject}
   * @see {@link ProAct.DSL}
   */
  toObjectArray: function (array) {
    var self = this;
    if (!P.U.isArray(array)) {
      return this.toObject(array);
    }
    return map.call(array, function (el) {
      return self.toObject(el);
    });
  },

  /**
   * Helper method for transforming a key of stored item in <i>this</i> ProAct.Registry to the actual item or returning the key, if
   * the item is not found in the ProAct.Registry.
   * <p>
   *  Mainly used by the {@link ProAct.DSL} logic.
   * </p>
   *
   * @memberof ProAct.Registry
   * @instance
   * @method toObject
   * @param {String|Object} data
   *      Key of strored object or something else. If the key is valid and there is something stored on it, the stored object is retrieved.
   *      <p>
   *        If there is nothing stored for this <i>data</i>, the <i>data</i> itself is returned.
   *      </p>
   * @return {Object}
   *      Stored object, if found using the passed <i>data</i> or the <i>data</i> itself.
   * @see {@link ProAct.DSL}
   * @see {@link ProAct.Registry#get}
   */
  toObject: function (data) {
    if (P.U.isString(data)) {
      var result = this.get(data);
      return result ? result : data;
    }

    return data;
  }
};
