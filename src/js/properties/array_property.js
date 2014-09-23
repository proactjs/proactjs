/**
 * <p>
 *  Constructs a ProAct.ArrayProperty. The properties are simple {@link ProAct.Actor}s with state. The array property
 *  has a state of a JavaScript array value.
 * </p>
 * <p>
 *  The value of ProAct.ArrayProperty is array, turned to reactive ProAct.js array - {@link ProAct.Array}.
 * </p>
 * <p>
 *  On changing the array value to another array the listeners for indices/length are moved from the old value to the new value.
 * </p>
 * <p>
 *  If set to null or undefined, the property is re-defined, using {@link ProAct.Property.reProb}
 * </p>
 * <p>
 *  ProAct.ArrayProperty is lazy - its object is made reactive on the first read of the property. Its state is set to {@link ProAct.States.ready} on the first read too.
 * </p>
 * <p>
 *  ProAct.ArrayProperty is part of the properties module of ProAct.js.
 * </p>
 *
 * @class ProAct.ArrayProperty
 * @extends ProAct.Property
 * @param {Object} proObject
 *      A plain JavaScript object, holding a field, this property will represent.
 * @param {String} property
 *      The name of the field of the object, this property should represent.
 * @see {@link ProAct.ObjectCore}
 * @see {@link ProAct.States.init}
 * @see {@link ProAct.States.ready}
 */
ProAct.ArrayProperty = P.AP = function (proObject, property) {
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

          self.update();
        };

    P.P.defineProp(self.proObject, self.property, get, set);

    self.state = P.States.ready;
    return self.val;
  };

  P.P.call(this, proObject, property, getter, function () {});
};

ProAct.ArrayProperty.prototype = P.U.ex(Object.create(P.P.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @memberof ProAct.ArrayProperty
   * @instance
   * @constant
   * @default ProAct.ArrayProperty
   */
  constructor: ProAct.ArrayProperty,

  /**
   * Retrieves the {@link ProAct.Property.Types} value of <i>this</i> property.
   * <p>
   *  For ProAct.ArrayProperty this is {@link ProAct.Property.Types.array}
   * </p>
   *
   * @memberof ProAct.ArrayProperty
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
   *  For ProAct.ArrayProperty it does nothing - the real initialization is lazy and is performed on the first read of <i>this</i>.
   * </p>
   *
   * @memberof ProAct.ArrayProperty
   * @instance
   * @method afterInit
   */
  afterInit: function () {}
});
