/**
 * @module proact-core
 */

/**
 * The `ProAct.prob` method is the entry point for creating reactive values in ProAct.js
 *
 * TODO More docs
 *
 * @for ProAct
 * @method prob
 * @static
 * @param {Object} object
 *      The object/value to make reactive.
 * @param {Object|String} meta
 *      Meta-data used to help in the reactive object creation.
 * @return {Object}
 *      Reactive representation of the passed <i>object</i>.
 */
function prob (object, meta) {
  var core, property,
      isAr = P.U.isArray,
      array;

  if (object === null || (!P.U.isObject(object) && !isAr(object))) {
    return P.P.lazyValue(object, meta);
  }

  if (P.U.isArray(object)) {
    array = new P.A(object);
    if (meta && meta.p && meta.p.queueName && P.U.isString(meta.p.queueName)) {
      array.core.queueName = meta.p.queueName;
    }
    return array;
  }

  core = new P.OC(object, meta);
  P.U.defValProp(object, '__pro__', false, false, false, core);

  core.prob();

  return object;
}
ProAct.prob = prob;

