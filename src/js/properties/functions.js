/**
 * @module proact-properties
 */

/**
 * The `ProAct.proxy` creates proxies or decorators to ProAct.js objects.
 * <p>
 *  The decorators extend the <i>target</i> and can add new properties which depend on the extended ones.
 * </p>
 *
 * @for ProAct
 * @method proxy
 * @static
 * @param {Object} object
 *      The object/value to make decorator to the <i>target</i>.
 * @param {Object} target
 *      The object to decorate.
 * @param {Object|String} meta
 *      Meta-data used to help in the reactive object creation for the proxy.
 * @param {Object|String} targetMeta
 *      Meta-data used to help in the reactive object creation for the target, if it is not reactive.
 * @return {Object}
 *      Reactive representation of the passed <i>object</i>, decorating the passed <i>target</i>.
 */
function proxy (object, target, meta, targetMeta) {
  if (!object || !target) {
    return null;
  }

  if (!P.U.isProObject(target)) {
    target = ProAct.prob(target, targetMeta);
  }

  if (!meta || !P.U.isObject(meta)) {
    meta = {};
  }

  var properties = target.__pro__.properties,
      property;

  for (property in properties) {
    if (!object.hasOwnProperty(property)) {
      object[property] = null;
      meta[property] = properties[property];
    }
  }

  object = ProAct.prob(object, meta);

  return object;
}
ProAct.proxy = proxy;

/**
 * Checks if the passed value is a valid ProAct.js object or not.
 * ProAct.js object have a special `__pro__` object that is hidden in them, which should be instance of {{#crossLink "ProAct.Core"}}{{/crossLink}}.
 *
 * @method isProObject
 * @param {Object} value The value to check.
 * @return {Boolean} True if the value is object containing {{#crossLink "ProAct.Property"}}{{/crossLink}} instances and has a `core`.
 */
function isProObject (value) {
  return value && ProAct.U.isObject(value) && value.__pro__ !== undefined && ProAct.U.isObject(value.__pro__.properties);
}

ProAct.Utils.isProObject = isProObject;

/**
 * <p>
 *  Represents the current caller of a method, the initiator of the current action.
 * </p>
 * <p>
 *  This property does the magic when for example an {{#crossLink "ProAct.AutoProperty"}}{{/crossLink}} is called
 *  for the first time and the dependencies to the other properties are created.
 *  The current caller expects to be used in a single threaded environment.
 * </p>
 * <p>
 *  Do not remove or modify this property manually.
 * </p>
 *
 * @property currentCaller
 * @type Object
 * @default null
 * @static
 * @for ProAct
 */
ProAct.currentCaller = null;
