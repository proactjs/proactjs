/**
 * The {@link ProAct.prob} method is the entry point for creating reactive values in ProAct.js
 * <p>
 *  If the value is Number/String/Boolean/null/undefined or Function a new {@link ProAct.Property} is created woth value, set
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

function stream () {
  return new ProAct.Stream();
}
ProAct.stream = stream;

function closed () {
  return stream().close();
}
ProAct.closed = P.never = closed;

function timeout (timeout, value) {
  var stream = stream();

  window.setTimeout(function () {
    stream.trigger(value);
    stream.close();
  }, timeout);

  return stream;
}
ProAct.timeout = ProAct.later = timeout;

function interval (interval, value) {
  var stream = stream();

  window.setInterval(function () {
    stream.trigger(value);
  }, interval);

  return stream;
}
ProAct.interval = interval;

function seq (interval, vals) {
  var stream = stream(),
      operation;

  if (vals.length > 0) {
    operation = function () {
      var value = vals.unshift();
      stream.trigger(value);

      if (vals.length === 0) {
        stream.close();
      } else {
        window.setTimeout(operation, timeout);
      }
    };
    window.setTimeout(operation, timeout);
  }

  return stream;
}
ProAct.seq = seq;

function repeat (interval, vals) {
  var stream = stream(), i = 0;

  if (vals.length > 0) {
    window.setInterval(function () {
      if (i === vals.length) {
        i = 0;
      }

      var value = vals[i++];
      stream.trigger(value);
    }, interval);
  }

  return stream;
}
