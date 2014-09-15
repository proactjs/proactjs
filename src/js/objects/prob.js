/**
 * The {@link ProAct.prob} method is the entry point for creating reactive values in ProAct.js
 * <p>
 *  If the value is Number/String/Boolean/null/undefined or Function a new {@link ProAct.Val} is created woth value, set
 *  to the passed <i>object</i> value. The <i>meta</i>-data passed is used in the creation process.
 * </p>
 * <p>
 *  If the passed <i>object</i> is an array, the result of this method is a new {@link ProAct.Array} with content,
 *  the passed array <i>object</i>
 * </p>
 * <p>
 *  If the <i>object</i> passed is a plain JavaScript object the result of this function is reactive version of the
 *  <i>object</i> with {@link ProAct.ObjectCore} holding its {@link ProAct.Property}s.
 * </p>
 *
 * @method prob
 * @memberof ProAct
 * @static
 * @param {Object} object
 *      The object/value to make reactive.
 * @param {Object|String} meta
 *      Meta-data used to help in the reactive object creation.
 * @return {Object}
 *      Reactive representation of the passed <i>object</i>.
 */
ProAct.prob = function (object, meta) {
  var core, property,
      isAr = P.U.isArray;

  if (object === null || (!P.U.isObject(object) && !isAr(object))) {
    return new P.V(object, meta);
  }

  if (P.U.isArray(object)) {
    return new P.A(object);
  }

  core = new P.OC(object, meta);
  P.U.defValProp(object, '__pro__', false, false, false, core);

  core.prob();

  return object;
};

/**
 * The {@link ProAct.proxy} creates proxies or decorators to ProAct.js objects.
 * <p>
 *  The decorators extend the <i>target</i> and can add new properties which depend on the extended ones.
 * </p>
 *
 * @method proxy
 * @memberof ProAct
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
ProAct.proxy = function (object, target, meta, targetMeta) {
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
};
