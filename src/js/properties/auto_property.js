/**
 * <p>
 *  Constructs a ProAct.AutoProperty. The properties are simple {@link ProAct.Actor}s with state. The auto-computed or functional property
 *  has a state of a Function value.
 * </p>
 * <p>
 *  Auto-computed properties are functions which are turned to {@link ProAct.Property}s by a {@link ProAct.ObjectCore}.
 * </p>
 * <p>
 *  If these functions are reading another fields of ProAct.js objects, they authomatically become dependent on them.
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
 *  If this object - <i>obj</i> is turned to a reactive ProAct.js object, it becomes a simple object with three fields:
 *  <pre>
 *    {
 *      a: 1,
 *      b: 2,
 *      c: -1
 *    }
 *  </pre>
 *  But now <i>c</i> is dependent on <i>a</i> and <i>b</i>, so if <i>a</i> is set to <b>4</b>, <i>obj</i> becomes:
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
 *    <li>The property is initialized to be lazy, so its state is {@link ProAct.States.init}</li>
 *    <li>On its first read, the {@link ProAct.currentCaller} is set to the listener of the property, so all the properties read in the function body became observed by it. The value of the property is computed using the original function of the field.</li>
 *    <li>On this first read the state of the property is updated to {@link ProAct.States.ready}.</li>
 *    <li>On its following reads it is a simple value, computed from the first read. No re-computations on get.</li>
 *    <li>If a property, this auto-computed property depends changes, the value of <i>this</i> ProAct.AutoProperty is recomputed.</li>
 *    <li>Setting the property can be implemented easy, because on set, the original function of the property is called with the new value.</li>
 *  </ul>
 * </p>
 * <p>
 *  ProAct.AutoProperty can be depend on another ProAct.AutoProperty.
 * </p>
 * <p>
 *  ProAct.AutoProperty is part of the properties module of ProAct.js.
 * </p>
 *
 * @class ProAct.AutoProperty
 * @extends ProAct.Property
 * @param {Object} proObject
 *      A plain JavaScript object, holding a field, this property will represent.
 * @param {String} property
 *      The name of the field of the object, this property should represent.
 * @see {@link ProAct.ObjectCore}
 * @see {@link ProAct.States.init}
 * @see {@link ProAct.States.ready}
 */
ProAct.AutoProperty = P.FP = function (proObject, property) {
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

  P.P.call(this, proObject, property, getter, function () {});
};

ProAct.AutoProperty.prototype = P.U.ex(Object.create(P.P.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @memberof ProAct.AutoProperty
   * @instance
   * @constant
   * @default ProAct.AutoProperty
   */
  constructor: ProAct.AutoProperty,

  /**
   * Retrieves the {@link ProAct.Property.Types} value of <i>this</i> property.
   * <p>
   *  For ProAct.AutoProperty this is {@link ProAct.Property.Types.auto}
   * </p>
   *
   * @memberof ProAct.AutoProperty
   * @instance
   * @method type
   * @return {Number}
   *      The right type of the property.
   */
  type: function () {
    return P.P.Types.auto;
  },

  /**
   * Creates the <i>listener</i> of this ProAct.AutoProperty.
   * <p>
   *  This listener turns the observable in a observer.
   * </p>
   * <p>
   *  The listener for ProAct.AutoProperty is an object defining the <i>call</i> method.
   * </p>
   * <p>
   *  It has a <i>property</i> field set to <i>this</i>.
   * </p>
   * <p>
   *  On value changes the <i><this</i> value is set to the value computed by the original function,
   *  using the {@link ProAct.Actor#transform} to transform it.
   * </p>
   *
   * @memberof ProAct.AutoProperty
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
   *  For ProAct.AutoProperty it does nothing - the real initialization is lazy and is performed on the first read of <i>this</i>.
   * </p>
   *
   * @memberof ProAct.AutoProperty
   * @instance
   * @method afterInit
   */
  afterInit: function () {}
});
