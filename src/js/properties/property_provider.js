/**
 * @module proact-properties
 */

/**
 * <p>
 *  The `ProAct.PropertyProvider` is an abstract class.
 * </p>
 * <p>
 *  Many providers can be registered for many kinds of properties.
 * </p>
 * <p>
 *  When a ProAct.js object is initialized its fields are turned into properties.
 *  Depending on the type and the name of the field, as well as meta information the valid
 *  type of {{#crossLink "ProAct.Property"}}{{/crossLink}} is created and used.
 *  The `PropertyProviders` have 'filter' method and depending on it the valid kind is decided.
 * </p>
 * <p>
 *  ProAct.PropertyProvider is part of the proact-properties module of ProAct.js.
 * </p>
 *
 * @class ProAct.PropertyProvider
 * @constructor
 */
function PropertyProvider () {}
ProAct.PropertyProvider = P.PP = PropertyProvider;


(function (P) {
  var providers = [];

  P.U.ex(P.PP, {


    /**
     * Registers a `ProAct.PropertyProvider`.
     * <p>
     *  The provider is appended in the end of the list of `ProAct.PropertyProviders`.
     * </p>
     * <p>
     *  When a property must be provided if there is a `ProAct.PropertyProvider` registered before
     *  the passed <i>propertyProvider</i>, with valid filtering for the passed field, it will
     *  be used instead.
     * </p>
     *
     * @for ProAct.PropertyProvider
     * @method registerProvider
     * @static
     * @param {ProAct.PropertyProvider} propertyProvider
     *      The `ProAct.PropertyProvider` to register.
     */
    registerProvider: function (propertyProvider) {
      providers.push(propertyProvider);
    },

    /**
     * Registers a `ProAct.PropertyProvider`.
     * <p>
     *  The provider is prepended in the beginning of the list of `ProAct.PropertyProviders`.
     * </p>
     * <p>
     *  It's filtering will be called before any other registered provider.
     * </p>
     *
     * @for ProAct.PropertyProvider
     * @method prependProvider
     * @static
     * @param {ProAct.PropertyProvider} propertyProvider
     *      The `ProAct.PropertyProvider` to register.
     */
    prependProvider: function (propertyProvider) {
      providers.unshift(propertyProvider);
    },

    /**
     * Removes a `ProAct.PropertyProvider` from the list of the registered `ProAct.PropertyProviders`.
     *
     * @for ProAct.PropertyProvider
     * @method unregisterProvider
     * @static
     * @param {ProAct.PropertyProvider} propertyProvider
     *      The ProAct.PropertyProvider to unregister.
     */
    unregisterProvider: function (propertyProvider) {
      P.U.remove(providers, propertyProvider);
    },

    /**
     * Removes all `ProAct.PropertyProviders` from the list of the registered `ProAct.PropertyProviders`.
     *
     * @for ProAct.PropertyProvider
     * @static
     * @method clearProviders
     */
    clearProviders: function () {
      providers = [];
    },

    /**
     * Provides a {{#crossLink "ProAct.Property"}}{{/crossLink}} instance using the list of the registered
     * `ProAct.PropertyProviders`.
     * <p>
     *  The providers are tried in the order of their registration
     *  (the order can be changed using {{#crossLink "ProAct.PropertyProvider/prependProvider:method"}}{{/crossLink}}).
     * </p>
     * <p>
     *  The {{#crossLink "ProAct.PropertyProvider/filter:method"}}{{/crossLink}} method is used to check
     *  if a provider is compliant with the passed arguments.
     * </p>
     * <p>
     *  If a compliant provider is found, its {{#crossLink "ProAct.PropertyProvider/provide:method"}}{{/crossLink}} method
     *  is used to provide the {{#crossLink "ProAct.Property"}}{{/crossLink}} instance.
     * </p>
     *
     * @for ProAct.PropertyProvider
     * @static
     * @param {String} queueName
     *      The name of the queue all the updates should be pushed to.
     *      <p>
     *        If this parameter is null/undefined the default queue of
     *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
     *      </p>
     *      <p>
     *        If this parameter is not a string it is used as the
     *        <i>object</i>.
     *      </p>
     * @param {Object} object
     *      The object to provide a {{#crossLink "ProAct.Property"}}{{/crossLink}} instance for.
     * @param {String} property
     *      The field name of the <i>object</i> to turn into a {{#crossLink "ProAct.Property"}}{{/crossLink}}.
     * @param {String|Array} meta
     *      Meta information to be used for filtering and configuration of the {{#crossLink "ProAct.Property"}}{{/crossLink}} instance to be provided.
     * @return {ProAct.Property}
     *      A property provided by registered provider, or null if there is no compliant provider.
     */
    provide: function (queueName, object, property, meta) {
      if (queueName && !P.U.isString(queueName)) {
        meta = property;
        property = object;
        object = queueName;
        queueName = null;
      }
      var ln = providers.length,
          prop = null,
          provider = null,
          i;

      for (i = 0; i < ln; i++) {
        provider = providers[i];
        if (provider.filter(object, property, meta)) {
          break;
        } else {
          provider = null;
        }
      }

      if (provider) {
        prop = provider.provide(queueName, object, property, meta);
      }

      return prop;
    }
  });
}(P));

ProAct.PropertyProvider.prototype = {

  /**
   * Reference to the constructor of this object.
   *
   * @property constructor
   * @type ProAct.PropertyProvider
   * @final
   * @for ProAct.PropertyProvider
   */
  constructor: ProAct.PropertyProvider,

  /**
   * Used to check if this {@link ProAct.PropertyProvider} is compliant with the field and meta data
   * to be used for creating a {@link ProAct.Property} instance with {@link ProAct.PropertyProvider#provide}.
   * <p>
   *  Abstract - must be implemented in an extender.
   * </p>
   *
   * @memberof ProAct.PropertyProvider
   * @abstract
   * @instance
   * @method filter
   * @param {Object} object
   *      The object to which a new {@link ProAct.Property} instance should be provided.
   * @param {String} property
   *      The field name of the <i>object</i> to turn into a {@link ProAct.Property}. Can be used in the filtering process.
   *      <p>
   *        For example field name beginning with foo. Can be turned into a FooProperty.
   *      </p>
   * @param {String|Array} meta
   *      Meta information to be used for filtering and configuration of the {@link ProAct.Property} instance to be provided.
   * @return {Boolean}
   *      If <i>this</i> provider is compliant with the passed arguments.
   */
  filter: function (object, property, meta) {
    throw new Error('Abstract! Implement!');
  },

  /**
   * Provides an instance of {@link ProAct.Property}.
   * <p>
   *  It should be called only after <i>this</i> {@link ProAct.PropertyProvider#filter} method,
   *  called with the same arguments returns true.
   * </p>
   * <p>
   *  Abstract - must be implemented in an extender.
   * </p>
   *
   * @memberof ProAct.PropertyProvider
   * @abstract
   * @instance
   * @method provide
   * @param {String} queueName
   *      The name of the queue all the updates should be pushed to.
   *      <p>
   *        If this parameter is null/undefined the default queue of
   *        {@link ProAct.flow} is used.
   *      </p>
   * @param {Object} object
   *      The object to which a new {@link ProAct.Property} instance should be provided.
   * @param {String} property
   *      The field of the <i>object</i> to turn into a {@link ProAct.Property}. Can be used in the filtering process.
   * @param {String|Array} meta
   *      Meta information to be used for filtering and configuration of the {@link ProAct.Property} instance to be provided.
   * @return {ProAct.Property}
   *      A property provided by <i>this</i> provider.
   */
  provide: function (queueName, object, property, meta) {
    throw new Error('Abstract! Implement!');
  }
};

/**
 * <p>
 *  Constructor for ProAct.SimplePropertyProvider.
 * </p>
 * <p>
 *  Provides {@link ProAct.Property} instances for fields of simple types - strings, numbers, booleans.
 * </p>
 * <p>
 *  ProAct.SimplePropertyProvider is part of the properties module of ProAct.js.
 * </p>
 *
 * @class ProAct.SimplePropertyProvider
 * @extends ProAct.PropertyProvider
 * @see {@link ProAct.Property}
 */
ProAct.SimplePropertyProvider = P.SPP = function () {
  P.PP.call(this);
};

ProAct.SimplePropertyProvider.prototype = P.U.ex(Object.create(P.PP.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @memberof ProAct.SimplePropertyProvider
   * @instance
   * @constant
   * @default ProAct.SimplePropertyProvider
   */
  constructor: ProAct.SimplePropertyProvider,

  /**
   * Used to check if this {@link ProAct.SimplePropertyProvider} is compliant with the field and meta data.
   *
   * @memberof ProAct.SimplePropertyProvider
   * @instance
   * @method filter
   * @param {Object} object
   *      The object to which a new {@link ProAct.Property} instance should be provided.
   * @param {String} property
   *      The field name of the <i>object</i> to turn into a {@link ProAct.Property}. Can be used in the filtering process.
   * @param {String|Array} meta
   *      Meta information to be used for filtering and configuration of the {@link ProAct.Property} instance to be provided.
   * @return {Boolean}
   *      True if the value of <b>object[property]</b> not undefined or null as well as object, array ot function.
   */
  filter: function (object, property, meta) {
    var v = object[property];
    return (v === null || v === undefined) || (!P.U.isFunction(v) && !P.U.isArrayObject(v) && !P.U.isObject(v));
  },

  /**
   * Provides an instance of {@link ProAct.Property}.
   *
   * @memberof ProAct.SimplePropertyProvider
   * @instance
   * @method provide
   * @param {String} queueName
   *      The name of the queue all the updates should be pushed to.
   *      <p>
   *        If this parameter is null/undefined the default queue of
   *        {@link ProAct.flow} is used.
   *      </p>
   * @param {Object} object
   *      The object to which a new {@link ProAct.Property} instance should be provided.
   * @param {String} property
   *      The field of the <i>object</i> to turn into a {@link ProAct.Property}.
   * @param {String|Array} meta
   *      Meta information to be used for filtering and configuration of the {@link ProAct.Property} instance to be provided.
   * @return {ProAct.Property}
   *      A {@link ProAct.Property} instance provided by <i>this</i> provider.
   */
  provide: function (queueName, object, property, meta) {
    return new P.P(queueName, object, property);
  }
});

/**
 * <p>
 *  Constructor for ProAct.AutoPropertyProvider.
 * </p>
 * <p>
 *  Provides {@link ProAct.AutoProperty} instances for fields pointing to functions.
 * </p>
 * <p>
 *  ProAct.AutoPropertyProvider is part of the properties module of ProAct.js.
 * </p>
 *
 * @class ProAct.AutoPropertyProvider
 * @extends ProAct.PropertyProvider
 * @see {@link ProAct.AutoProperty}
 */
ProAct.AutoPropertyProvider = P.FPP = function () {
  P.PP.call(this);
};

ProAct.AutoPropertyProvider.prototype = P.U.ex(Object.create(P.PP.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @memberof ProAct.AutoPropertyProvider
   * @instance
   * @constant
   * @default ProAct.AutoPropertyProvider
   */
  constructor: ProAct.AutoPropertyProvider,

  /**
   * Used to check if this {@link ProAct.AutoPropertyProvider} is compliant with the field and meta data.
   *
   * @memberof ProAct.AutoPropertyProvider
   * @instance
   * @method filter
   * @param {Object} object
   *      The object to which a new {@link ProAct.AutoProperty} instance should be provided.
   * @param {String} property
   *      The field name of the <i>object</i> to turn into a {@link ProAct.AutoProperty}.
   * @param {String|Array} meta
   *      Meta information to be used for filtering and configuration of the {@link ProAct.AutoProperty} instance to be provided.
   * @return {Boolean}
   *      True if the value of <b>object[property]</b> a function.
   */
  filter: function (object, property, meta) {
    return P.U.isFunction(object[property]);
  },

  /**
   * Provides an instance of {@link ProAct.AutoProperty}.
   *
   * @memberof ProAct.AutoPropertyProvider
   * @instance
   * @method provide
   * @param {String} queueName
   *      The name of the queue all the updates should be pushed to.
   *      <p>
   *        If this parameter is null/undefined the default queue of
   *        {@link ProAct.flow} is used.
   *      </p>
   * @param {Object} object
   *      The object to which a new {@link ProAct.AutoProperty} instance should be provided.
   * @param {String} property
   *      The field of the <i>object</i> to turn into a {@link ProAct.AutoProperty}.
   * @param {String|Array} meta
   *      Meta information to be used for filtering and configuration of the {@link ProAct.AutoProperty} instance to be provided.
   * @return {ProAct.AutoProperty}
   *      A {@link ProAct.AutoProperty} instance provided by <i>this</i> provider.
   */
  provide: function (queueName, object, property, meta) {
    return new P.FP(queueName, object, property);
  }
});

/**
 * <p>
 *  Constructor for ProAct.ArrayPropertyProvider.
 * </p>
 * <p>
 *  Provides {@link ProAct.ArrayProperty} instances for fields pointing to arrays.
 * </p>
 * <p>
 *  ProAct.ArrayPropertyProvider is part of the properties module of ProAct.js.
 * </p>
 *
 * @class ProAct.ArrayPropertyProvider
 * @extends ProAct.PropertyProvider
 * @see {@link ProAct.ArrayProperty}
 */
ProAct.ArrayPropertyProvider = P.APP = function () {
  P.PP.call(this);
};

ProAct.ArrayPropertyProvider.prototype = P.U.ex(Object.create(P.PP.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @memberof ProAct.ArrayPropertyProvider
   * @instance
   * @constant
   * @default ProAct.ArrayPropertyProvider
   */
  constructor: ProAct.ArrayPropertyProvider,

  /**
   * Used to check if this {@link ProAct.ArrayPropertyProvider} is compliant with the field and meta data.
   *
   * @memberof ProAct.ArrayPropertyProvider
   * @instance
   * @method filter
   * @param {Object} object
   *      The object to which a new {@link ProAct.ArrayProperty} instance should be provided.
   * @param {String} property
   *      The field name of the <i>object</i> to turn into a {@link ProAct.ArrayProperty}.
   * @param {String|Array} meta
   *      Meta information to be used for filtering and configuration of the {@link ProAct.ArrayProperty} instance to be provided.
   * @return {Boolean}
   *      True if the value of <b>object[property]</b> an array.
   */
  filter: function (object, property, meta) {
    return P.U.isArrayObject(object[property]);
  },

  /**
   * Provides an instance of {@link ProAct.ArrayProperty}.
   *
   * @memberof ProAct.ArrayPropertyProvider
   * @instance
   * @method provide
   * @param {String} queueName
   *      The name of the queue all the updates should be pushed to.
   *      <p>
   *        If this parameter is null/undefined the default queue of
   *        {@link ProAct.flow} is used.
   *      </p>
   * @param {Object} object
   *      The object to which a new {@link ProAct.ArrayProperty} instance should be provided.
   * @param {String} property
   *      The field of the <i>object</i> to turn into a {@link ProAct.ArrayProperty}.
   * @param {String|Array} meta
   *      Meta information to be used for filtering and configuration of the {@link ProAct.ArrayProperty} instance to be provided.
   * @return {ProAct.ArrayProperty}
   *      A {@link ProAct.ArrayProperty} instance provided by <i>this</i> provider.
   */
  provide: function (queueName, object, property, meta) {
    return new P.AP(queueName, object, property);
  }
});

/**
 * <p>
 *  Constructor for ProAct.ObjectPropertyProvider.
 * </p>
 * <p>
 *  Provides {@link ProAct.ObjectProperty} instances for fields pointing to objects, different from arrays or functions.
 * </p>
 * <p>
 *  ProAct.ObjectPropertyProvider is part of the properties module of ProAct.js.
 * </p>
 *
 * @class ProAct.ObjectPropertyProvider
 * @extends ProAct.PropertyProvider
 * @see {@link ProAct.ObjectProperty}
 */
ProAct.ObjectPropertyProvider = P.OPP = function () {
  P.PP.call(this);
};

ProAct.ObjectPropertyProvider.prototype = P.U.ex(Object.create(P.PP.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @memberof ProAct.ObjectPropertyProvider
   * @instance
   * @constant
   * @default ProAct.ObjectPropertyProvider
   */
  constructor: ProAct.ObjectPropertyProvider,

  /**
   * Used to check if this {@link ProAct.ObjectPropertyProvider} is compliant with the field and meta data.
   *
   * @memberof ProAct.ObjectPropertyProvider
   * @instance
   * @method filter
   * @param {Object} object
   *      The object to which a new {@link ProAct.ObjectProperty} instance should be provided.
   * @param {String} property
   *      The field name of the <i>object</i> to turn into a {@link ProAct.ObjectProperty}.
   * @param {String|Array} meta
   *      Meta information to be used for filtering and configuration of the {@link ProAct.ObjectProperty} instance to be provided.
   * @return {Boolean}
   *      True if the value of <b>object[property]</b> an object, different from array or function.
   */
  filter: function (object, property, meta) {
    return P.U.isObject(object[property]);
  },

  /**
   * Provides an instance of {@link ProAct.ObjectProperty}.
   *
   * @memberof ProAct.ObjectPropertyProvider
   * @instance
   * @method provide
   * @param {String} queueName
   *      The name of the queue all the updates should be pushed to.
   *      <p>
   *        If this parameter is null/undefined the default queue of
   *        {@link ProAct.flow} is used.
   *      </p>
   * @param {Object} object
   *      The object to which a new {@link ProAct.ObjectProperty} instance should be provided.
   * @param {String} property
   *      The field of the <i>object</i> to turn into a {@link ProAct.ObjectProperty}.
   * @param {String|Array} meta
   *      Meta information to be used for filtering and configuration of the {@link ProAct.ObjectProperty} instance to be provided.
   * @return {ProAct.ObjectProperty}
   *      A {@link ProAct.ObjectProperty} instance provided by <i>this</i> provider.
   */
  provide: function (queueName, object, property, meta) {
    return new P.OP(queueName, object, property);
  }
});

/**
 * <p>
 *  Constructor for ProAct.ProxyPropertyProvider.
 * </p>
 * <p>
 *  Provides {@link ProAct.ProxyProperty} instances for fields that should point to properties.
 * </p>
 * <p>
 *  ProAct.ProxyPropertyProvider is part of the properties module of ProAct.js.
 * </p>
 *
 * @class ProAct.ProxyPropertyProvider
 * @extends ProAct.PropertyProvider
 * @see {@link ProAct.ProxyProperty}
 */
ProAct.ProxyPropertyProvider = P.PXPP = function () {
  P.PP.call(this);
};

ProAct.ProxyPropertyProvider.prototype = P.U.ex(Object.create(P.PP.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @memberof ProAct.ProxyPropertyProvider
   * @instance
   * @constant
   * @default ProAct.ProxyPropertyProvider
   */
  constructor: ProAct.ProxyPropertyProvider,

  /**
   * Used to check if this {@link ProAct.ProxyPropertyProvider} is compliant with the meta data.
   *
   * @memberof ProAct.ProxyPropertyProvider
   * @instance
   * @method filter
   * @param {Object} object
   *      The object to which a new {@link ProAct.ProxyProperty} instance should be provided.
   * @param {String} property
   *      The field name of the <i>object</i> to turn into a {@link ProAct.ProxyProperty}.
   * @param {ProAct.Property} meta
   *      If the meta is present and of type {@link ProAct.Property}, it becomes the target property of the
   *      {@link ProAct.ProxyProperty} that will be provided.
   * @return {Boolean}
   *      True if <i>meta</i> argument is present and is instance of {@link ProAct.Property}.
   */
  filter: function (object, property, meta) {
    if (!meta || !(meta instanceof ProAct.Property)) {
      return false;
    }

    return meta instanceof ProAct.Property;
  },

  /**
   * Provides an instance of {@link ProAct.ProxyProperty}.
   *
   * @memberof ProAct.ProxyPropertyProvider
   * @instance
   * @method provide
   * @param {String} queueName
   *      The name of the queue all the updates should be pushed to.
   *      <p>
   *        If this parameter is null/undefined the default queue of
   *        {@link ProAct.flow} is used.
   *      </p>
   * @param {Object} object
   *      The object to which a new {@link ProAct.ProxyProperty} instance should be provided.
   * @param {String} property
   *      The field of the <i>object</i> to turn into a {@link ProAct.ProxyProperty}.
   * @param {ProAct.Property} meta
   *      The target {@link ProAct.Property} of the {@link ProAct.ProxyProperty} to be created.
   * @return {ProAct.ProxyProperty}
   *      A {@link ProAct.ProxyProperty} instance provided by <i>this</i> provider.
   */
  provide: function (queueName, object, property, meta) {
    return new P.PXP(queueName, object, property, meta);
  }
});

P.PP.registerProvider(new P.ProxyPropertyProvider());
P.PP.registerProvider(new P.SimplePropertyProvider());
P.PP.registerProvider(new P.AutoPropertyProvider());
P.PP.registerProvider(new P.ArrayPropertyProvider());
P.PP.registerProvider(new P.ObjectPropertyProvider());
