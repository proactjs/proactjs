/**
 * The `proact-properties` module provides stateful reactive values attached to normal JavaScript
 * object's fields.
 *
 * @module proact-properties
 * @main proact-properties
 */

/**
 * <p>
 *  Constructs a `ProAct.Property`.
 *  The properties are simple {{#crossLink "ProAct.Actor"}}{{/crossLink}}s with state.
 *  The basic property has a state of a simple value - number/string/boolean.
 * </p>
 * <p>
 *  Every property could represent a field in a plain JavaScript object.
 *  It makes it reactive, on reading the property value,
 *  if {{#crossLink "ProAct/currentCaller:property"}}{{/crossLink}} is set,
 *  it is added as a listener to the property changes.
 * </p>
 * <p>
 *  Every property has a type the default property has a type of a simple value.
 * </p>
 * <p>
 *  All the properties of an object are managed by its {{#crossLink "ProAct.ObjectCore"}}{{/crossLink}},
 *  which is set to a hidden field of the object - '__pro__'.
 * </p>
 * <p>
 *  When created every property is in {{#crossLink "ProAct.States/init:property"}}{{/crossLink}}, state,
 *  when it is functional, the state is changed to {{#crossLink "ProAct.States/ready:property"}}{{/crossLink}}.
 *  If the property is not in {{#crossLink "ProAct.States/ready:property"}}{{/crossLink}} state, it is not useable.
 * </p>
 * <p>
 *  {{#crossLink "ProAct.Property/init:method"}}{{/crossLink}} is called by this constructor for the property initialization.
 *  It should initialize the property and set its state to {{#crossLink "ProAct.States/ready:property"}}{{/crossLink}}.
 * </p>
 * <p>
 *  ProAct.Property is part of the proact-properties module of ProAct.js.
 * </p>
 *
 * ```
 *  var property = new Property({v: 5}, 'v');
 *  property.get(); // This is 5
 *  property.set(4);
 *  property.get(); // This is 4
 * ```
 *
 * @class ProAct.Property
 * @extends ProAct.Actor
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
 * @param {Function} getter
 *      An optional getter to be used when the property is read.
 *      If this parameter is empty, a new {{#crossLink "ProAct.Property/defaultGetter:method"}}{{/crossLink}} is build for <i>this</i>.
 * @param {Function} setter
 *      An optional setter to be used when the property is written.
 *      If this parameter is empty, a new {{#crossLink "ProAct.Property/defaultSetter:method"}}{{/crossLink}} is build for <i>this</i>.
 */
function Property (queueName, proObject, property, getter, setter) {
  if (queueName && !P.U.isString(queueName)) {
    setter = getter;
    getter = property;
    property = proObject;
    proObject = queueName;
    queueName = null;
  }

  if (!(proObject || property)) {
    property = 'v';
    proObject = {v: null};
  }

  P.U.defValProp(this, 'proObject', false, false, true, proObject);
  this.property = property;

  if (!this.proObject.__pro__) {
    P.U.defValProp(proObject, '__pro__', false, false, true, new ProAct.ObjectCore(proObject));
  }

  this.proObject.__pro__.properties[property] = this;

  this.get = getter || P.P.defaultGetter(this);
  this.set = setter || P.P.defaultSetter(this);

  this.oldVal = null;
  this.val = proObject[property];

  this.g = this.get;
  this.s = this.set;

  P.Actor.call(this, queueName); // Super!
  this.parent = this.proObject.__pro__;

  var meta = this.parent.meta.p;
  this.isStaticTyped = meta && meta.statics && meta.statics.indexOf(this.property) !== -1;
}
ProAct.Property = P.P = Property;

P.U.ex(ProAct.Property, {

  /**
   * Defines the possible types of the `ProAct.Property`.
   *
   * @class Types
   * @namespace ProAct.Property
   * @static
   */
  Types: {

    /**
     * ProAct.Property for simple types - Numbers, Strings or Booleans.
     *
     * @property simple
     * @type Number
     * @final
     * @for ProAct.Property.Types
     */
    simple: 0, // strings, booleans and numbers

    /**
     * ProAct.Property for auto computed types - Functions.
     *
     * @property auto
     * @type Number
     * @final
     * @for ProAct.Property.Types
     */
    auto: 1, // functions - dependent

    /**
     * ProAct.Property for object types - fields containing objects.
     *
     * @property object
     * @type Number
     * @final
     * @for ProAct.Property.Types
     */
    object: 2, // references Pro objects

    /**
     * ProAct.Property for array types - fields containing arrays.
     *
     * @property array
     * @type Number
     * @final
     * @for ProAct.Property.Types
     */
    array: 3, // arrays

    /**
     * ProAct.Property for nil types - fields containing null or undefined.
     *
     * @property nil
     * @type Number
     * @final
     * @for ProAct.Property.Types
     */
    nil: 4, // nulls

    /**
     * Retrieves the right` ProAct.Property.Types` value from a value.
     *
     * @for ProAct.Property.Types
     * @method type
     * @param {Object} value
     *      The value to use to compute the `ProAct.Property.Types` member for.
     * @return {Number}
     *      The type of the passed value.
     */
    type: function (value) {
      if (value === null) {
        return P.P.Types.nil;
      } else if (P.U.isFunction(value)) {
        return P.P.Types.auto;
      } else if (P.U.isArray(value)) {
        return P.P.Types.array;
      } else if (P.U.isObject(value)) {
        return P.P.Types.object;
      } else {
        return P.P.Types.simple;
      }
    }
  },

  /**
   * Generates a default getter function for a `ProAct.Property` instance.
   * <p>
   *  Every `ProAct.Property` instance has a getter and a setter,
   *  they can be passed in the constructor, but if left blank,
   *  this method is used for creating the getter function.
   * </p>
   * <p>
   *  The default getter function uses {{#crossLink "ProAct.Property/addCaller:method"}}{{/crossLink}}
   *  method to track the {{#crossLink "ProAct/currentCaller:property"}}{{/crossLink}} listener if set.
   *  If it is set it is added as a listener to the passed <i>property</i>.
   * </p>
   *
   * @for ProAct.Property
   * @static
   * @private
   * @method defaultGetter
   * @param {ProAct.Property} property
   *      The `ProAct.Property` instance to generate a getter function for.
   * @return {Function}
   *      The generated getter function.
   */
  defaultGetter: function (property) {
    return function () {
      property.addCaller();

      return property.val;
    };
  },

  /**
   * Generates a default setter function for a ProAct.Property instance.
   * <p>
   *  Every `ProAct.Property` instance has a setter and a getter,
   *  they can be passed in the constructor, but if left blank,
   *  this method is used for creating the setter function.
   * </p>
   * <p>
   *  The default setter function uses the {{#crossLink "ProAct.ActorUtil/update:method"}}{{/crossLink}}
   *  method to update all the listeners for <i>change</i>s for the passed <i>property</i>.
   * </p>
   * <p>
   *  It updates the listeners only if the new value of the property
   *  is different from the old one (using <i>===</i> for the comparison).
   * </p>
   *
   * @for ProAct.Property
   * @private
   * @method defaultSetter
   * @static
   * @param {ProAct.Property} property
   *      The `ProAct.Property` instance to generate a setter function for.
   * @param {Function} setter
   *      A setter function for the way of setting the value.
   *      It can be skipped if the value should be set using <i>=</i>.
   * @return {Function}
   *      The generated setter function.
   */
  defaultSetter: function (property, setter) {
    return function (newVal) {
      if (property.state != P.States.ready) {
        return;
      }
      newVal = P.Actor.transform(property, newVal);
      if (newVal === P.Actor.BadValue || property.val === newVal) {
        return;
      }

      property.oldVal = property.val;
      if (setter) {
        property.val = setter.call(property.proObject, newVal);
      } else {
        property.val = newVal;
      }

      if (property.type() !== P.P.Types.auto && P.P.Types.type(property.val) !== property.type()) {
        P.P.reProb(property).update();
        return;
      }

      ActorUtil.update.call(property);
    };
  },

  /**
   * Used to define the managed by a `ProAct.Property` instance field of the passed <i>obj</i>.
   * <p>
   *  The field is writable, enumerable and configurable.
   * </p>
   *
   * @for ProAct.Property
   * @method defineProp
   * @private
   * @static
   * @param {Object} obj
   *      The object which field should be defined as a property.
   * @param {String} prop
   *      The name of the property field to define.
   * @param {Function} get
   *      The getter that should be used to read the new property to be defined.
   * @param {Function} set
   *      The setter that should be used to update the new property to be defined.
   */
  defineProp: function (obj, prop, get, set) {
    Object.defineProperty(obj, prop, {
      get: get,
      set: set,
      enumerable: true,
      configurable: true
    });
  },

  /**
   * Recreates a property, using its current value.
   * <p>
   *  The re-definition works by using {{#crossLink "ProAct.Property/destroy:method"}}{{/crossLink}}
   *  to destroy the passed <i>property</i> first, and then the
   *  {{#crossLink "ProAct.ObjectCore/makeProp:method"}}{{/crossLink}} method is called of the
   *  {{#crossLink "ProAct.ObjectCore"}}{{/crossLink}} of the object the <i>property</i> belongs to.
   * </p>
   * <p>
   *  This way a new `ProAct.Property` instance is created to replace the passed one.
   * </p>
   *
   * @for ProAct.Property
   * @private
   * @method reProb
   * @static
   * @param {ProAct.Property} property
   *      The ProAct.Property instance to re-define.
   * @return {ProAct.Property}
   *      The new re-defined property.
   */
  reProb: function (property) {
	    if (property.isStaticTyped || property.state !== P.States.ready) {
      return;
    }

    var po = property.proObject,
        p = property.property,
        l = property.listeners.change;

    property.destroy();
    return po.__pro__.makeProp(p, l);
  },

  /**
   * Creates a constant property. It's value can not be changed.
   *
   * ```
   *  var property = ProAct.Property.constant(5);
   *
   *  console.log(property.get()); // 5
   *
   *  property.set(4);
   *  console.log(property.get()); // 5
   * ```
   *
   * @for ProAct.Property
   * @static
   * @method constant
   * @param {Object} val The value of the property. Can not be changed.
   * @param {Object} meta Optional meta data for the property.
   * @param {String} queueName The name of the queue all the updates should be pushed to. By default the default queue is used.
   * @return {ProAct.Property} The new constant property.
   */
  constant: function (val, meta, queueName) {
    return P.P.value(val, meta, queueName).close();
  },

  /**
   * Creates a value property. It's value can be updated any time and other properties may depend on it.
   *
   * This propety is eager - this means that it is initialized automatically even if it's not used.
   *
   * ```
   *  var property = ProAct.Property.value(5);
   *
   *  console.log(property.get()); // 5
   *
   *  property.set(4);
   *  console.log(property.get()); // 4
   * ```
   *
   * @for ProAct.Property
   * @static
   * @method value
   * @param {Object} val The value of the property.
   * @param {Object} meta Optional meta data for the property.
   * @param {String} queueName The name of the queue all the updates should be pushed to. By default the default queue is used.
   * @return {ProAct.Property} The new value property.
   */
  value: function (val, meta, queueName) {
    var property = P.P.lazyValue(val, meta, queueName);
    property.get();

    return property;
  },

  /**
   * Creates a lazy initialized value property. It's value can be updated any time and other properties may depend on it.
   *
   * Being lazy means, that the property won't be initialized until it is read (it's get() method is called).
   *
   * ```
   *  var property = ProAct.Property.lazyValue(5);
   *
   *  console.log(property.get()); // 5
   *
   *  property.set(4);
   *  console.log(property.get()); // 4
   * ```
   *
   * @for ProAct.Property
   * @static
   * @method lazyValue
   * @param {Object} val The value of the property.
   * @param {Object} meta Optional meta data for the property.
   * @param {String} queueName The name of the queue all the updates should be pushed to. By default the default queue is used.
   * @return {ProAct.Property} The new lazily initialized value property.
   */
  lazyValue: function (val, meta, queueName) {
    if (meta && (P.U.isString(meta) || P.U.isArray(meta))) {
      meta = {
        v: meta
      };
    }

    meta = meta || {};
    meta.p = meta.p || {};
    meta.p.statics = meta.p.statics || ['v'];
    if (queueName) {
      meta.p.queueName = queueName;
    }

    var object = {v: val},
        core = new ObjectCore(object, meta);
    P.U.defValProp(object, '__pro__', false, false, false, core);
    core.prob();

    return core.properties.v;
  }
});

ProAct.Property.prototype = P.U.ex(Object.create(P.Actor.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @property constructor
   * @type ProAct.Property
   * @final
   * @for ProAct.Property
   */
  constructor: ProAct.Property,

  /**
   * Retrieves the {{#crossLink "ProAct.Property.Types"}}{{/crossLink}} value of <i>this</i> property.
   * <p>
   *  For instances of the base class - `ProAct.Property` it is
   *  {{#crossLink "ProAct.Property.Types/simple:property"}}{{/crossLink}}.
   * </p>
   *
   * @for ProAct.Property
   * @instance
   * @method type
   * @return {Number}
   *      The right type of the property.
   */
  type: function () {
    return P.P.Types.simple;
  },

  /**
   * Creates the <i>event</i> to be send to the listeners of this `ProAct.Property` on update.
   * <p>
   *  The <i>event</i> should be an instance of {{#crossLink "ProAct.Event"}}{{/crossLink}}.
   * </p>
   * <p>
   *  By default this method returns {{#crossLink "ProAct.Event.Types/value:property"}}{{/crossLink}} event with target the property name and arguments:
   *  <ul>
   *    <li>The object this `ProAct.Property` manages a field for.</li>
   *    <li>The old value of this property.</li>
   *    <li>The new value of this property.</li>
   *  </ul>
   * </p>
   *
   * @for ProAct.Property
   * @instance
   * @protected
   * @method makeEvent
   * @default {ProAct.Event} with type {{#crossLink "ProAct.Event.Types/value:property"}}{{/crossLink}}.
   * @param {ProAct.Event} source
   *      The source event of the event. It can be null
   * @return {ProAct.ValueEvent}
   *      The event, created.
   */
  makeEvent: function (source) {
    return new P.VE(source, this.property, this.proObject, this.oldVal, this.val);
  },

  /**
   * Creates the <i>listener</i> of this `ProAct.Property`.
   * <p>
   *  This listener turns the observable in a observer.
   * </p>
   * <p>
   *  The listener for ProAct.Property is an object defining the <i>call</i> method.
   * </p>
   * <p>
   *  It has a <i>property</i> field set to <i>this</i>.
   * </p>
   * <p>
   *  On value changes the <i><this</i> value is set to the new value using the {{#crossLink "ProAct.Actor/transform:method"}}{{/crossLink}} to transform it.
   * </p>
   *
   * @for ProAct.Property
   * @instance
   * @protected
   * @method makeListener
   * @return {Object}
   *      The <i>listener of this ProAct.Property</i>.
   */
  makeListener: function () {
    if (!this.listener) {
      var self = this;

      this.listener = {
        property: self,
        queueName: self.queueName,
        call: function (newVal) {
          if (newVal && newVal.type !== undefined && newVal.type === P.E.Types.value && newVal.args.length === 3 && newVal.target) {
            newVal = newVal.args[0][newVal.target];
          }

          self.set(newVal);
        }
      };
    }

    return this.listener;
  },

  /**
   * Initializes this property.
   * <p>
   *  First the property is defined as a field in its object,
   *  using {{#crossLink "ProAct.Property/defineProp:method"}}{{/crossLink}}.
   * </p>
   *
   * @for ProAct.Property
   * @instance
   * @protected
   * @method doInit
   */
  doInit: function () {
    P.P.defineProp(this.proObject, this.property, this.get, this.set);
    P.P.defineProp(this, 'v', this.get, this.set);
  },

  /**
   * Uses {{#crossLink "ProAct/currentCaller:property"}}{{/crossLink}} to
   * automatically add a new listener to this property if the caller is set.
   * <p>
   *  This method is used by the default getter to make every reader of the property a listener to it.
   * </p>
   *
   * @for ProAct.Property
   * @protected
   * @instance
   * @method addCaller
   */
  addCaller: function () {
    var caller = P.currentCaller;

    if (caller && caller.property !== this) {
      this.on(caller);
    }
  },

  /**
   * A hook that is called right before destruction, the extenders use it to clean up resources.
   *
   * The `ProAct.Property` deletes its state and is removed from its core container.
   *
   * Don't override it.
   *
   * @for ProAct.Property
   * @protected
   * @instance
   * @method beforeDestroy
   */
  beforeDestroy: function () {
    delete this.proObject.__pro__.properties[this.property];
    this.oldVal = undefined;

    P.U.defValProp(this.proObject, this.property, true, true, true, this.val);
    this.get = this.set = this.property = this.proObject = undefined;
    this.g = this.s = undefined;
    this.val = undefined;
    this.isStaticTyped = undefined;
    delete this.v;
  },

  /**
   * Creates a new `ProAct.Property` instance with source <i>this</i> and mapping
   * the passed <i>mapping function</i>.
   *
   * When the source is changed, the product of this operator is updated too.
   *
   * ```
   *  var val = ProAct.Property.value(5);
   *  var plusOne = val.map(function (v) {
   *    return v + 1;
   *  });
   *
   *  plusOne.get(); // 6
   *
   *  val.set(4);
   *  plusOne.get(); // 5
   * ```
   *
   * or
   *
   * ```
   *  var positive = val.map('+');
   *
   *  val.set(-4);
   *
   *  positive.get(); // 4
   * ```
   *
   * @for ProAct.Property
   * @instance
   * @method map
   * @param {Object|Function|Strin} mappingFunction
   *      Function or object with a <i>call method</i> to use as map function.
   *      Can be string for predefined mapping functions.
   * @return {ProAct.Property}
   *      A new `ProAct.Property` instance with the <i>mapping</i> applied.
   */
  map: function (mappingFunction) {
    var prop = P.P.value(this.val, {}, this.queueName).mapping(mappingFunction).into(this);
    ActorUtil.update.call(this);
    return prop;
  },

  /**
   * Creates a new `ProAct.Property` instance with source <i>this</i> and filtering
   * the passed <i>filtering function</i>.
   *
   * When the source changes, the product, may be updated.
   *
   * TODO On creation if the filter fails, the property keeps the original value.
   * What to do? Also these kinds of properties shouldn't be set manually.
   *
   * ```
   *  var prop = ProAct.Property.value(4);
   *  var even = sourceActor.filter(function (el) {
   *    return el % 2 == 0;
   *  });
   *
   *  even.get(); // 4
   *
   *  prop.set(5);
   *  even.get(); // 4
   *
   *  prop.set(6);
   *  even.get(); // 6
   * ```
   *
   * or
   *
   * ```
   *  var actor = sourceActor.filter('odd');
   *
   * ```
   *
   * @for ProAct.Actor
   * @instance
   * @method filter
   * @param {Object} filteringFunction
   *      The filtering function or object with a call method, should return boolean.
   * @return {ProAct.Property}
   *      A new ProAct.Actor instance with the <i>filtering</i> applied.
   */
  filter: function (filteringFunction) {
    var prop = P.P.value(this.val, {}, this.queueName).filtering(filteringFunction).into(this);

    ActorUtil.update.call(this);
    return prop;
  },

  /**
   * Creates a new `ProAct.Property` instance with source <i>this</i> and accumulation
   * the passed <i>accumulation function</i>.
   *
   * Some examples:
   *
   * ```
   *  var prop = ProAct.Property.value(3);
   *  var acc = prop.accumulate(0, function (current, el) {
   *    return current + el;
   *  });
   *
   *  acc.get(); // 3
   *
   *  prop.set(5);
   *
   *  acc.get(); // 8
   *
   *  prop.set(2);
   *
   *  acc.get(); // 10
   * ```
   *
   * or
   *
   * ```
   *  var acc = prop.accumulate('+'); // The same as the above if the DSL module is present.
   * ```
   *
   * @for ProAct.Property
   * @instance
   * @method accumulate
   * @param {Object} initVal
   *      Initial value for the accumulation. For example '0' for sum.
   * @param {Object} accumulationFunction
   *      The function to accumulate.
   * @return {ProAct.Property}
   *      A new `ProAct.Property` instance with the <i>accumulation</i> applied.
   */
  accumulate: function (initVal, accumulationFunction) {
    var prop = P.P.value(this.val, {}, this.queueName).accumulation(initVal, accumulationFunction).into(this);
    ActorUtil.update.call(this);
    return prop;
  },

  /**
   * The <b>toString()</b> method returns a string representing this `ProAct.Property`.
   * <p>
   *  The string representation is the value of <i>this</i> property.
   * </p>
   *
   * @for ProAct.Property
   * @instance
   * @method toString
   */
  toString: function () {
    return this.val + '';
  },

  valueOf: function () {
    return this.val;
  }
});

P.U.ex(P.Actor.prototype, {

  /**
   * Creates a {{{#crossLink "ProAct.Property"}}{{/crossLink}} instance,
   * dependent on this.
   * Comes from the `proact-properties` module.
   *
   * @for ProAct.Actor
   * @instance
   * @method toProperty
   */
  toProperty: function () {
    return P.P.value(this.val, {}, this.queueName).into(this);
  }
});
