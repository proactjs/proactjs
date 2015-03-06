/**
 * @module proact-properties
 */

/**
 * <p>
 *  Constructs a `ProAct.AutoProperty`.
 *  The properties are simple {{#crossLink "ProAct.Actor"}}{{/crossLink}}s with state.
 *  The auto-computed or functional property has a state of a function return value.
 * </p>
 * <p>
 *  Auto-computed properties are functions which are turned
 *  to {{#crossLink "ProAct.Property"}}{{/crossLink}}s by a {{#crossLink "ProAct.ObjectCore"}}{{/crossLink}}.
 * </p>
 * <p>
 *  If these functions are reading another fields of ProAct.js objects,
 *  they authomatically become dependent on them.
 * </p>
 * <p>
 *  For example:
 *  <pre>
 *    var obj = {
 *      a: 1,
 *      b: 2,
 *      c: function () {
 *        return this.a - this.b;
 *      }
 *    };
 *  </pre>
 *  If this object - <i>obj</i> is turned to a reactive ProAct.js object,
 *  it becomes a simple object with three fields:
 *  <pre>
 *    {
 *      a: 1,
 *      b: 2,
 *      c: -1
 *    }
 *  </pre>
 *  But now <i>c</i> is dependent on <i>a</i> and <i>b</i>,
 *  so if <i>a</i> is set to <b>4</b>, <i>obj</i> becomes:
 *  <pre>
 *    {
 *      a: 1,
 *      b: 2,
 *      c: 2
 *    }
 *  </pre>
 * </p>
 * <p>
 *  The logic is the following:
 *  <ul>
 *    <li>The property is initialized to be lazy, so its state is {{#crossLink "ProAct.States/init:property"}}{{/crossLink}}</li>
 *    <li>
 *      On its first read, the {{#crossLink "ProAct/currentCaller:property"}}{{/crossLink}} is set to the listener of the property,
 *      so all the properties read in the function body become observed by it.
 *      The value of the property is computed using the original function of the field.
 *    </li>
 *    <li>On this first read the state of the property is updated to {{#crossLink "ProAct.States/ready:property"}}{{/crossLink}}.</li>
 *    <li>On its following reads it is a simple value, computed from the first read. No re-computations on get.</li>
 *    <li>If a property, this auto-computed property depends changes, the value of <i>this</i> ProAct.AutoProperty is recomputed.</li>
 *    <li>Setting the property can be implemented easy, because on set, the original function of the property is called with the new value.</li>
 *  </ul>
 * </p>
 * <p>
 *  `ProAct.AutoProperty` can be dependant on another `ProAct.AutoProperty`.
 * </p>
 * <p>
 *  `ProAct.AutoProperty` is part of the proact-properties module of ProAct.js.
 * </p>
 *
 * @class ProAct.AutoProperty
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
function AutoProperty (queueName, proObject, property) {
  if (queueName && !P.U.isString(queueName)) {
    property = proObject;
    proObject = queueName;
    queueName = null;
  }

  this.func = proObject[property];

  var self = this,
      getter = function () {
        self.addCaller();
        var oldCaller = P.currentCaller,
            get = P.P.defaultGetter(self),
            set = P.P.defaultSetter(self, function (newVal) {
              return self.func.call(self.proObject, newVal);
            }),
            args = arguments,
            autoFunction;

        P.currentCaller = self.makeListener();

        autoFunction = function () {
          self.val = self.func.apply(self.proObject, args);
        };
        P.flow.run(function () {
          P.flow.pushOnce(autoFunction);
        });

        P.currentCaller = oldCaller;

        P.P.defineProp(self.proObject, self.property, get, set);

        self.state = P.States.ready;

        self.val = P.Actor.transform(self, self.val);
        return self.val;
      };

  P.P.call(this, queueName, proObject, property, getter, function () {});
}
ProAct.AutoProperty = P.FP = AutoProperty;

ProAct.AutoProperty.prototype = P.U.ex(Object.create(P.P.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @property constructor
   * @type ProAct.AutoProperty
   * @final
   * @for ProAct.AutoProperty
   */
  constructor: ProAct.AutoProperty,

  /**
   * Retrieves the {{#crossLink "ProAct.Property.Types"}}{{/crossLink}} value of <i>this</i> property.
   * <p>
   *  For instances of the `ProAct.AutoProperty` class, it is
   *  {{#crossLink "ProAct.Property.Types/auto:property"}}{{/crossLink}}.
   * </p>
   *
   * @for ProAct.AutoProperty
   * @instance
   * @method type
   * @return {Number}
   *      The right type of the property.
   */
  type: function () {
    return P.P.Types.auto;
  },

  /**
   * Creates the <i>listener</i> of this `ProAct.AutoProperty`.
   * <p>
   *  This listener turns the observable in a observer.
   * </p>
   * <p>
   *  The listener for `ProAct.AutoProperty` is an object defining the <i>call</i> method.
   * </p>
   * <p>
   *  It has a <i>property</i> field set to <i>this</i>.
   * </p>
   * <p>
   *  On value changes the <i><this</i> value is set to the value computed by the original function,
   *  using the {{#crossLink "ProAct.Actor/transform:method"}}{{/crossLink}} to transform it.
   * </p>
   *
   * @for ProAct.AutoProperty
   * @protected
   * @instance
   * @method makeListener
   * @return {Object}
   *      The <i>listener of this ProAct.AutoProperty</i>.
   */
  makeListener: function () {
    if (!this.listener) {
      var self = this;

      this.listener = {
        property: self,
        queueName: self.queueName,
        call: function () {
          self.oldVal = self.val;
          self.val = P.Actor.transform(self, self.func.call(self.proObject));
        }
      };
    }

    return this.listener;
  },

  /**
   * Called automatically after initialization of this property.
   * <p>
   *  For `ProAct.AutoProperty` it does nothing -
   *  the real initialization is lazy and is performed on the first read of <i>this</i>.
   * </p>
   *
   * @for ProAct.AutoProperty
   * @protected
   * @instance
   * @method afterInit
   */
  afterInit: function () {}
});
