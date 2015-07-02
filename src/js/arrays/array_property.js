/**
 * @module proact-arrays
 */

/**
 * <p>
 *  Constructs a `ProAct.ArrayProperty`.
 *  A property is a simple {{#crossLink "ProAct.Actor"}}{{/crossLink}} with state.
 * </p>
 * <p>
 *  The value of `ProAct.ArrayProperty` is an array, turned to reactive ProAct.js array -
 *  {{#crossLink "ProAct.Array"}}{{/crossLink}}.
 * </p>
 * <p>
 *  On changing the array value to another array the listeners for indices/length are moved from the old value to the new value.
 * </p>
 * <p>
 *  If set to null or undefined, the property is re-defined, using
 *  {{#crossLink "ProAct.Property/reProb:method"}}{{/crossLink}}.
 * </p>
 * <p>
 *  `ProAct.ArrayProperty` is lazy - its object is made reactive on the first read of the property.
 *  Its state is set to {{#crossLink "ProAct.States/ready:property"}}{{/crossLink}} on the first read too.
 * </p>
 * <p>
 *  `ProAct.ArrayProperty` is part of the proact-arrays module of ProAct.js.
 * </p>
 *
 * @class ProAct.ArrayProperty
 * @extends ProAct.Property
 * @constructor
 * @param {String} queueName
 *      The name of the queue all the updates should be pushed to.
 *      <p>
 *        If this parameter is null/undefined the default queue of
 *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
 *      </p>
 *      <p>
 *        If this parameter is not a string it is used as the
 *        <i>proObject</i>.
 *      </p>
 * @param {Object} proObject
 *      A plain JavaScript object, holding a field, this property will represent.
 * @param {String} property
 *      The name of the field of the object, this property should represent.
 */
function ArrayProperty (queueName, proObject, property) {
  if (queueName && !P.U.isString(queueName)) {
    property = proObject;
    proObject = queueName;
    queueName = null;
  }

  var self = this, getter;

  getter = function () {
    self.addCaller();
    if (!P.U.isProArray(self.val)) {
      self.val = new P.A(self.val);
    }

    var get = P.P.defaultGetter(self),
        set = function (newVal) {
          if (self.val == newVal || self.val.valueOf() == newVal) {
            return;
          }

          self.oldVal = self.val;
          self.val = newVal;

          if (self.val === null || self.val === undefined) {
            P.P.reProb(self).update();
            return self;
          }

          if (!P.U.isProArray(self.val)) {
            self.val = new P.A(self.val);
            if (queueName) {
              self.val.core.queueName = queueName;
            }
          }

          if (self.oldVal) {
            var i, listener,
                toRemove = [], toRemoveLength,
                oldIndListeners = self.oldVal.__pro__.listeners.index,
                oldIndListenersLn = oldIndListeners.length,
                newIndListeners = self.val.__pro__.listeners.index,
                oldLenListeners = self.oldVal.__pro__.listeners.length,
                oldLenListenersLn = oldLenListeners.length,
                newLenListeners = self.val.__pro__.listeners.length;

            for (i = 0; i < oldIndListenersLn; i++) {
              listener = oldIndListeners[i];
              if (listener.property && listener.property.proObject === self.proObject) {
                newIndListeners.push(listener);
                toRemove.push(i);
              }
            }
            toRemoveLength = toRemove.length;
            for (i = 0; i < toRemoveLength; i++) {
              oldIndListeners.splice[toRemove[i], 1];
            }
            toRemove = [];

            for (i = 0; i < oldLenListenersLn; i++) {
              listener = oldLenListeners[i];
              if (listener.property && listener.property.proObject === self.proObject) {
                newLenListeners.push(listener);
                toRemove.push(i);
              }
            }
            toRemoveLength = toRemove.length;
            for (i = 0; i < toRemoveLength; i++) {
              oldLenListeners.splice[toRemove[i], 1];
            }
            toRemove = [];
          }

          ActorUtil.update.call(self);
        };

    P.P.defineProp(self.proObject, self.property, get, set);

    self.state = P.States.ready;
    return self.val;
  };

  P.P.call(this, queueName, proObject, property, getter, function () {});
}
ProAct.ArrayProperty = P.AP = ArrayProperty;

ProAct.ArrayProperty.prototype = P.U.ex(Object.create(P.P.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @property constructor
   * @type ProAct.ArrayProperty
   * @final
   * @for ProAct.ArrayProperty
   */
  constructor: ProAct.ArrayProperty,

  /**
   * Retrieves the {{#crossLink "ProAct.Property.Types"}}{{/crossLink}} value of <i>this</i> property.
   * <p>
   *  For instances of the `ProAct.ArrayProperty` class, it is
   *  {{#crossLink "ProAct.Property.Types/array:property"}}{{/crossLink}}.
   * </p>
   *
   * @for ProAct.ArrayProperty
   * @instance
   * @method type
   * @return {Number}
   *      The right type of the property.
   */
  type: function () {
    return P.P.Types.array;
  },

  /**
   * Called automatically after initialization of this property.
   * <p>
   *  For `ProAct.ArrayProperty` it does nothing -
   *  the real initialization is lazy and is performed on the first read of <i>this</i>.
   * </p>
   *
   * @for ProAct.ArrayProperty
   * @protected
   * @instance
   * @method afterInit
   */
  afterInit: function () {}
});

/**
 * <p>
 *  Constructor for `ProAct.ArrayPropertyProvider`.
 * </p>
 * <p>
 *  Provides {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}} instances for fields pointing to arrays.
 * </p>
 * <p>
 *  `ProAct.ArrayPropertyProvider` is part of the proact-properties module of ProAct.js.
 * </p>
 *
 * @for ProAct.ArrayPropertyProvider
 * @extends ProAct.PropertyProvider
 * @constructor
 */
ProAct.ArrayPropertyProvider = P.APP = function () {
  P.PP.call(this);
};

ProAct.ArrayPropertyProvider.prototype = P.U.ex(Object.create(P.PP.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @property constructor
   * @type ProAct.ArrayPropertyProvider
   * @final
   * @for ProAct.ArrayPropertyProvider
   */
  constructor: ProAct.ArrayPropertyProvider,

  /**
   * Used to check if this `ProAct.ArrayPropertyProvider` is compliant with the field and meta data.
   *
   * @for ProAct.ArrayPropertyProvider
   * @instance
   * @method filter
   * @param {Object} object
   *      The object to which a new {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}} instance should be provided.
   * @param {String} property
   *      The field name of the <i>object</i> to turn into a {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}}.
   * @param {String|Array} meta
   *      Meta information to be used for filtering and configuration of the {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}} instance to be provided.
   * @return {Boolean}
   *      True if the value of <b>object[property]</b> an array.
   */
  filter: function (object, property, meta) {
    return P.U.isArrayObject(object[property]);
  },

  /**
   * Provides an instance of {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}}.
   *
   * @for ProAct.ArrayPropertyProvider
   * @instance
   * @method provide
   * @param {String} queueName
   *      The name of the queue all the updates should be pushed to.
   *      <p>
   *        If this parameter is null/undefined the default queue of
   *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
   *      </p>
   * @param {Object} object
   *      The object to which a new {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}} instance should be provided.
   * @param {String} property
   *      The field of the <i>object</i> to turn into a {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}}.
   * @param {String|Array} meta
   *      Meta information to be used for filtering and configuration of the {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}} instance to be provided.
   * @return {ProAct.ArrayProperty}
   *      A {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}} instance provided by <i>this</i> provider.
   */
  provide: function (queueName, object, property, meta) {
    return new P.AP(queueName, object, property);
  }
});

P.PP.registerProvider(new P.ArrayPropertyProvider());

var oldTypeFunction = P.P.Types.type;
P.U.ex(P.Property.Types, {

    /**
     * ProAct.Property for array types - fields containing arrays.
     *
     * @property array
     * @type Number
     * @final
     * @for ProAct.Property.Types
     */
    array: {}, // arrays

    type: function (value) {
      if (P.U.isArray(value)) {
        return P.P.Types.array;
      }

      return oldTypeFunction(value);
    }

});
