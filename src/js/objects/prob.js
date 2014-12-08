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
  return P.stream().close();
}
ProAct.closed = P.never = closed;

/**
 * Creates a {@link ProAct.Stream}, which emits the passed "value" once and then closes.
 * <p>Example:</p>
 * <pre>
    var stream = ProAct.timeout(1000, 7);
    stream.on(function (v) {
      console.log(v);
    });

   // This will print '7' after 1s and will close.

 * </pre>
 *
 * @method timeout
 * @memberof ProAct
 * @static
 * @param {Number} timeout
 *      The time to wait (in milliseconds) before emitting the <i>value</i> and close.
 * @param {Object} value
 *      The value to emit.
 * @return {ProAct.Stream}
 *      A {@link ProAct.Stream} instance.
 */
function timeout (timeout, value) {
  var stream = P.stream();

  window.setTimeout(function () {
    stream.trigger(value);
    stream.close();
  }, timeout);

  return stream;
}
ProAct.timeout = ProAct.later = timeout;

/**
 * Creates a {@link ProAct.Stream}, which emits the passed "value" over and over again at given time interval.
 * <p>Example:</p>
 * <pre>
    var stream = ProAct.interval(1000, 7);
    stream.on(function (v) {
      console.log(v);
    });

   // This will print one number on every 1s and the numbers will be 7,7,7,7,7....

 * </pre>
 *
 * @method interval
 * @memberof ProAct
 * @static
 * @param {Number} interval
 *      The time in milliseconds on which the <i>value</i> will be emitted.
 * @param {Object} value
 *      The value to emit.
 * @return {ProAct.Stream}
 *      A {@link ProAct.Stream} instance.
 */
function interval (interval, value) {
  var stream = P.stream();

  window.setInterval(function () {
    stream.trigger(value);
  }, interval);

  return stream;
}
ProAct.interval = interval;

/**
 * Creates a {@link ProAct.Stream}, which emits values of the passed <i>vals</i> array on the passed <i>interval</i> milliseconds.
 * <p>
 *  When every value is emitted through the stream it is closed.
 * <p>
 * <p>Example:</p>
 * <pre>
    var stream = ProAct.seq(1000, [4, 5]);
    stream.on(function (v) {
      console.log(v);
    });

   // This will print one number on every 1s and the numbers will be 4 5 and the stream will be closed.

 * </pre>
 *
 * @method seq
 * @memberof ProAct
 * @static
 * @param {Number} interval
 *      The time in milliseconds on which a value of the passed <i>vals</i> array will be emitted.
 * @param {Array} vals
 *      The array containing the values to be emitted on the passed <i>interval</i>.
 * @return {ProAct.Stream}
 *      A {@link ProAct.Stream} instance.
 */
function seq (interval, vals) {
  var stream = P.stream(),
      operation;

  if (vals.length > 0) {
    operation = function () {
      var value = vals.shift();
      stream.trigger(value);

      if (vals.length === 0) {
        stream.close();
      } else {
        window.setTimeout(operation, interval);
      }
    };
    window.setTimeout(operation, interval);
  }

  return stream;
}
ProAct.seq = seq;

/**
 * Creates a {@link ProAct.Stream}, which emits values of the passed <i>vals</i> array on the passed interval.
 * <p>
 *  When every value is emitted through the stream they are emitted again and again and so on...
 * <p>
 * <p>Example:</p>
 * <pre>
    var stream = ProAct.repeat(1000, [4, 5]);
    stream.on(function (v) {
      console.log(v);
    });

   // This will print one number on every 1s and the numbers will be 4 5 4 5 4 5 4 5 4 5 .. and so on

 * </pre>
 *
 * @method interval
 * @memberof ProAct
 * @static
 * @param {Number} interval
 *      The time in milliseconds on which a value of the passed <i>vals</i> array will be emitted.
 * @param {Array} vals
 *      The array containing the values to be emitted on the passed <i>interval</i>.
 * @return {ProAct.Stream}
 *      A {@link ProAct.Stream} instance.
 */
function repeat (interval, vals) {
  var stream = P.stream(), i = 0;

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
ProAct.repeat = repeat;

/**
 * The {@link ProAct.fromInvoke} creates a {@link ProAct.Stream}, which emits the result of the passed
 * <i>func</i> argument on every <i>interval</i> milliseconds.
 * <p>Example:</p>
 * <pre>
    var stream = ProAct.fromInvoke(1000, function () {
      return 5;
    });
    stream.on(function (v) {
      console.log(v);
    });

    // After 1s we'll see '5' in the log, after 2s we'll see a second '5' in the log and so on...

 * </pre>
 *
 * @method fromInvoke
 * @memberof ProAct
 * @static
 * @param {Number} interval
 *      The interval on which <i>func</i> will be called and its returned value will
 *      be triggered into the stream.
 * @param {Function} func
 *      The function to invoke in order to get the value to trigger into the stream.
 * @return {ProAct.Stream}
 *      A {@link ProAct.Stream} instance.
 */
function fromInvoke (interval, func) {
  var stream = P.stream(), id;

  id = window.setInterval(function () {
    var value = func.call();

    if (value !== ProAct.close) {
      stream.trigger(value);
    } else {
      stream.close();
      window.clearInterval(id);
    }

  }, interval);

  return stream;
}
ProAct.fromInvoke = fromInvoke;
