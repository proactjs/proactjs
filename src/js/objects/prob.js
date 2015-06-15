
/**
 * Creates a {@link ProAct.Stream} instance.
 *
 * @method stream
 * @memberof ProAct
 * @static
 * @return {ProAct.Stream}
 *      A {@link ProAct.Stream} instance.
 */
function stream (subscribe, transformations, source, queueName) {
  var stream;
  if (!subscribe) {
    stream = new ProAct.Stream(queueName, source, transformations);
  } else if (P.U.isFunction(subscribe)) {
    stream = new ProAct.SubscribableStream(subscribe, queueName, source, transformations);
  } else if (P.U.isString(subscribe) && P.registry) {
    stream = P.registry.setup(
      new ProAct.Stream(), subscribe, slice.call(arguments, 1)
    );
  }

  stream.trigger = StreamUtil.trigger;
  stream.triggerErr = StreamUtil.triggerErr;
  stream.triggerClose= StreamUtil.triggerClose;

  return stream;
}
ProAct.stream = stream;

/**
 * Creates a closed {@link ProAct.Stream}.
 *
 * @method closed
 * @memberof ProAct
 * @static
 * @return {ProAct.Stream}
 *      A closed {@link ProAct.Stream} instance.
 */
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
 * <p>
 *  If <i>func</i> returns {@link ProAct.closed} the stream is closed.
 * </p>
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

function fromCallback (callbackCaller) {
  var stream = P.stream();

  callbackCaller(function (result) {
    stream.trigger(result);
    stream.close();
  });

  return stream;
}

ProAct.fromCallback = fromCallback;

attachers = {
  addEventListener: 'removeEventListener',
  addListener: 'removeListener',
  on: 'off'
};
attacherKeys = Object.keys(attachers);

function fromEventDispatcher (target, eventType) {
  var i, ln = attacherKeys.length,
      on, off,
      attacher, current;

  for (i = 0; i < ln; i++) {
    attacher = attacherKeys[i];
    current = target[attacher];

    if (current && P.U.isFunction(current)) {
      on = attacher;
      off = attachers[attacher];
      break;
    }
  }

  if (on === undefined) {
    return null;
  }

  return new ProAct.SubscribableStream(function (stream) {
    target[on](eventType, stream.trigger);

    return function (stream) {
      target[off](eventType, stream.trigger);
    };
  });
}

ProAct.fromEventDispatcher = fromEventDispatcher;
