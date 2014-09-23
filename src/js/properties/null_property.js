/**
 * <p>
 *  Constructs a ProAct.NullProperty. The properties are simple {@link ProAct.ProActor}s with state. The null/nil property
 *  has a state of a null or undefined value.
 * </p>
 * <p>
 *  Null properties are automatically re-defined if their value is set to actual object or data.
 * </p>
 * <p>
 *  ProAct.NullProperty is part of the properties module of ProAct.js.
 * </p>
 *
 * @class ProAct.NullProperty
 * @extends ProAct.Property
 * @param {Object} proObject
 *      A plain JavaScript object, holding a null/undefined field, this property should represent.
 * @param {String} property
 *      The name of the field of the object, this property should represent.
 * @see {@link ProAct.ObjectCore}
 */
ProAct.NullProperty = P.NP = function (proObject, property) {
  var self = this,
      set = P.P.defaultSetter(this),
      setter = function (newVal) {
        var result = set.call(self.proObject, newVal),
            types = P.P.Types,
            type = types.type(result);

        if (type !== types.nil) {
          P.P.reProb(self);
        }

        return result;
      };

  P.P.call(this, proObject, property, P.P.defaultGetter(this), setter);
};

ProAct.NullProperty.prototype = P.U.ex(Object.create(P.P.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @memberof ProAct.NullProperty
   * @instance
   * @constant
   * @default ProAct.NullProperty
   */
  constructor: ProAct.NullProperty,

  /**
   * Retrieves the {@link ProAct.Property.Types} value of <i>this</i> property.
   * <p>
   *  For ProAct.NullProperty this is {@link ProAct.Property.Types.nil}
   * </p>
   *
   * @memberof ProAct.NullProperty
   * @instance
   * @method type
   * @return {Number}
   *      The right type of the property.
   */
  type: function () {
    return P.P.Types.nil;
  }
});
