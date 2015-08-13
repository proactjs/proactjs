/**
 * @module proact-properties
 */

/**
 * <p>
 *  Constructs a `ProAct.ProxyProperty`. This is a property, pointing to another {{#crossLink "ProAct.Property"}}{{/crossLink}}.
 * </p>
 * <p>
 *  The value of `ProAct.ProxyProperty` is the value of its target, if the target is updated, the proxy is updated.
 * </p>
 * <p>
 *  By setting the value of the proxy, the value of the target is updated, the proxy doesn't have its own value, it uses
 *  the value of the target.
 * </p>
 * <p>
 *  `ProAct.ProxyProperty` is part of the proact-properties module of ProAct.js.
 * </p>
 *
 * @class ProAct.ProxyProperty
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
 * @param {ProAct.Property} target
 *      The target {{#crossLink "ProAct.Property"}}{{/crossLink}}, that will provide the value of the new `ProAct.ProxyProperty`.
 */
function ProxyProperty (queueName, proObject, property, target) {
  if (queueName && !P.U.isString(queueName)) {
    target = property;
    property = proObject;
    proObject = queueName;
    queueName = null;
  }
  var self = this, getter, setter;

  getter = function () {
    self.addCaller();
    return target.val;
  };

  setter = function (newVal) {
    if (target.val === newVal) {
      return;
    }

    target.oldVal = target.val;
    target.val = P.Actor.transform(self, newVal);

    if (target.val === null || target.val === undefined) {
      P.P.reProb(target).update();
      return;
    }

    ActorUtil.update.call(target);
  };

  P.P.call(this, queueName, proObject, property, getter, setter);

  this.target = target;
  this.target.on(this.makeListener());
}
ProAct.ProxyProperty = P.PXP = ProxyProperty;

ProAct.ProxyProperty.prototype = P.U.ex(Object.create(P.P.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @property constructor
   * @type ProAct.ProxyProperty
   * @final
   * @for ProAct.ProxyProperty
   */
  constructor: ProAct.ProxyProperty,

  /**
   * Retrieves the {{#crossLink "ProAct.Property.Types"}}{{/crossLink}} value of <i>this</i> property.
   * <p>
   *  For `ProAct.ProxyProperty` this is the type if its <i>target</i>.
   * </p>
   *
   * @for ProAct.ProxyProperty
   * @instance
   * @method type
   * @return {Number}
   *      The right type of the property.
   */
  type: function () {
    return this.target.type();
  },

  /**
   * Creates the <i>listener</i> of this `ProAct.ProxyProperty`.
   * <p>
   *  This listener turns the observable in a observer.
   * </p>
   * <p>
   *  The listener for ProAct.ProxyProperty is an object defining an empty <i>call</i> method.
   * </p>
   * <p>
   *  It has a <i>property</i> field set to <i>this</i>.
   * </p>
   *
   * @for ProAct.ProxyProperty
   * @protected
   * @instance
   * @method makeListener
   * @return {Object}
   *      The <i>listener of this `ProAct.ProxyProperty`</i>.
   */
  makeListener: function () {
    if (!this.listener) {
      var self = this;

      this.listener = {
        property: self,
        queueName: self.queueName,
        call: P.N
      };
    }

    return this.listener;
  }

});
