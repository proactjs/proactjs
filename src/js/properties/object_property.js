/**
 * @module proact-properties
 */

/**
 * <p>
 *  Constructs a `ProAct.ObjectProperty`.
 *  The properties are simple {{#crossLink "ProAct.Actor"}}{{/crossLink}}s with state. The object property
 *  has a state of a JavaScript object value.
 * </p>
 * <p>
 *  The value of `ProAct.ObjectProperty` is object, turned to reactive ProAct.js object recursively.
 * </p>
 * <p>
 *  On changing the object value to another object the listeners for fields with the same name in the objects,
 *  are moved from the old value's fields to the new value's fields.
 * </p>
 * <p>
 *  If set to null or undefined, the property is re-defined, using {{#crossLink "ProAct.Property/reProb:method"}}{{/crossLink}}
 * </p>
 * <p>
 *  `ProAct.ObjectProperty` is lazy - its object is made reactive on the first read of the property.
 *  Its state is set to {{#crossLink "ProAct.States/ready:property"}}{{/crossLink}} on the first read too.
 * </p>
 * <p>
 *  `ProAct.ObjectProperty` is part of the proact-properties module of ProAct.js.
 * </p>
 *
 * @class ProAct.ObjectProperty
 * @extends ProAct.Property
 * @constructor
 * @param {String} queueName
 *      The name of the queue all the updates should be pushed to.
 *      <p>
 *        If this parameter is null/undefined the default queue of
 *        {@link ProAct.flow} is used.
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
function ObjectProperty (queueName, proObject, property) {
  if (queueName && !P.U.isString(queueName)) {
    property = proObject;
    proObject = queueName;
    queueName = null;
  }
  var self = this, getter;

  getter = function () {
    self.addCaller();
    if (!self.val.__pro__) {
      P.prob(self.val);
    }

    var get = P.P.defaultGetter(self),
        set = function (newVal) {
          if (self.val == newVal) {
            return;
          }

          self.oldVal = self.val;
          self.val = newVal;

          if (self.val === null || self.val === undefined) {
            P.P.reProb(self).update();
            return self;
          }

          if (self.oldVal) {
            if (!self.val.__pro__) {
              P.prob(self.val);
            }

            if (P.U.isArray(this)) {
              self.update();
              return;
            }

            var oldProps = self.oldVal.__pro__.properties,
                newProps = self.val.__pro__.properties,
                oldPropName, oldProp, newProp, oldListeners, newListeners,
                i, j, oldListenersLength, newListenersLength,
                toAdd, toRemove = [], toRemoveLength;

            for (oldPropName in oldProps) {
              if (oldProps.hasOwnProperty(oldPropName)) {
                newProp = newProps[oldPropName];
                if (!newProp) {
                  continue;
                }
                newListeners = newProp.listeners.change;

                oldProp = oldProps[oldPropName];
                oldListeners = oldProp.listeners.change;
                oldListenersLength = oldListeners.length;

                for (i = 0; i < oldListenersLength; i++) {
                  toAdd = true;
                  for (j = 0; j < newListenersLength; j++) {
                    if (oldListeners[i] == newListeners[j]) {
                      toAdd = false;
                    }
                  }
                  if (toAdd) {
                    newProp.on(oldListeners[i]);
                    toRemove.push(i);
                  }
                }

                toRemoveLength = toRemove.length;
                for (i = 0; i < toRemoveLength; i++) {
                  oldListeners.splice[toRemove[i], 1];
                }
                toRemove = [];
              }
            }
          }

          ActorUtil.update.call(self);
        };

    P.P.defineProp(self.proObject, self.property, get, set);

    self.state = P.States.ready;
    return self.val;
  };

  P.P.call(this, queueName, proObject, property, getter, function () {});
}
ProAct.ObjectProperty = P.OP = ObjectProperty;

ProAct.ObjectProperty.prototype = P.U.ex(Object.create(P.P.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @memberof ProAct.ObjectProperty
   * @instance
   * @constant
   * @default ProAct.ObjectProperty
   */
  constructor: ProAct.ObjectProperty,

  /**
   * Retrieves the {@link ProAct.Property.Types} value of <i>this</i> property.
   * <p>
   *  For ProAct.ObjectProperty this is {@link ProAct.Property.Types.object}
   * </p>
   *
   * @memberof ProAct.ObjectProperty
   * @instance
   * @method type
   * @return {Number}
   *      The right type of the property.
   */
  type: function () {
    return P.P.Types.object;
  },

  /**
   * Called automatically after initialization of this property.
   * <p>
   *  For ProAct.ObjectProperty it does nothing - the real initialization is lazy and is performed on the first read of <i>this</i>.
   * </p>
   *
   * @memberof ProAct.ObjectProperty
   * @instance
   * @method afterInit
   */
  afterInit: function () {}
});
