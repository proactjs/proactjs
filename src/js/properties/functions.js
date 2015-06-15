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
