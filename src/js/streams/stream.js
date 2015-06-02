/**
 * The `proact-streams` module provides stateless streams to the ProAct.js API.
 * FRP reactive streams.
 *
 * @module proact-streams
 * @main proact-streams
 */

// PRIVATE
StreamUtil = {
  go: function (event, useTransformations) {
    if (this.listeners.change.length === 0) {
      return this;
    }
    if (useTransformations) {
      try {
        event = P.Actor.transform(this, event);
      } catch (e) {
        StreamUtil.triggerErr.call(this, e);
        return this;
      }
    }

    if (event === P.Actor.BadValue) {
      return this;
    }

    return ActorUtil.update.call(this, event);
  },

  triggerMany: function () {
    var i, args = slice.call(arguments), ln = args.length;

    for (i = 0; i < ln; i++) {
      this.trigger(args[i], true);
    }

    return this;
  },

  trigger: function (event, useTransformations) {
    if (useTransformations === undefined) {
      useTransformations = true;
    }

    return StreamUtil.go.call(this, event, useTransformations);
  },

  triggerErr: function (err) {
    return ActorUtil.update.call(this, err, 'error');
  },

  triggerClose: function (data) {
    return ActorUtil.update.call(this, data, 'close');
  }

};

/**
 * <p>
 *  Constructs a `ProAct.Stream`.
 *  The stream is a simple {{#crossLink "ProAct.Actor"}}{{/crossLink}}, without state.
 * </p>
 * <p>
 *  The streams are ment to emit values, events, changes and can be plugged into other `Actors`.
 *  For example it is possible to connect multiple streams, to merge them and to separate them,
 *  to plug them into properties.
 * </p>
 * <p>
 *  The reactive environment consists of the properties and the objects containing them, but
 *  the outside world is not reactive. It is possible to use the `ProAct.Streams` as connections from the
 *  outside world to the reactive environment.
 * </p>
 * <p>
 *    The transformations can be used to change the events or values emitetted.
 * </p>
 * <p>
 *  `ProAct.Stream` is part of the proact-streams module of ProAct.js.
 * </p>
 *
 * @class ProAct.Stream
 * @extends ProAct.Actor
 * @constructor
 * @param {String} queueName
 *      The name of the queue all the updates should be pushed to.
 *      <p>
 *        If this parameter is null/undefined the default queue of
 *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
 *      </p>
 *      <p>
 *        If this parameter is not a string it is used as the
 *        <i>source</i>.
 *      </p>
 * @param {ProAct.Actor} source
 *      A default source of the stream, can be null.
 * @param {Array} transforms
 *      A list of transformation to be used on all incoming chages.
 */
function Stream (queueName, source, transforms) {
  if (queueName && !P.U.isString(queueName)) {
    transforms = source;
    source = queueName;
    queueName = null;
  }
  P.Actor.call(this, queueName, transforms);

  this.sourceNumber = 0;

  if (source) {
    this.into(source);
  }
}
ProAct.Stream = ProAct.S = Stream;

ProAct.Stream.prototype = P.U.ex(Object.create(P.Actor.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @property constructor
   * @type ProAct.Stream
   * @final
   * @for ProAct.Stream
   */
  constructor: ProAct.Stream,

  /**
   * Creates the <i>event</i> to be send to the listeners on update.
   * <p>
   *  Streams don't create new events by default, the event is the source.
   * </p>
   *
   * @for ProAct.Stream
   * @protected
   * @instance
   * @method makeEvent
   * @param {ProAct.Event} source
   *      The source event of the event. It can be null
   * @return {ProAct.Event}
   *      The event.
   */
  makeEvent: function (source) {
    return source;
  },

  /**
   * Creates the <i>listener</i> of this stream.
   *
   * @for ProAct.Stream
   * @protected
   * @instance
   * @method makeListener
   * @return {Object}
   *      The <i>listener of this stream</i>.
   */
  makeListener: function () {
    if (!this.listener) {
      var stream = this;
      this.listener = function (event) {
        if (stream.trigger) {
          stream.trigger(event, true);
        } else {
          StreamUtil.trigger.call(stream, event, true);
        }
      };
    }

    return this.listener;
  },

  /**
   * Creates the <i>error listener</i> of this stream.
   * <p>
   *  The listener pushes the incoming event into `this Stream` by default.
   * </p>
   *
   * @for ProAct.Stream
   * @protected
   * @instance
   * @method makeErrListener
   * @return {Object}
   *      The <i>error listener of this stream</i>.
   */
  makeErrListener: function () {
    if (!this.errListener) {
      var stream = this;
      this.errListener = function (error) {
        if (stream.triggerErr) {
          stream.triggerErr(event);
        } else {
          StreamUtil.triggerErr.call(stream, error);
        }
      };
    }

    return this.errListener;
  },

  /**
   * Creates the <i>closing listener</i> of this stream.
   *
   * Pushes a closing notification into the stream by default.
   *
   * @for ProAct.Stream
   * @instance
   * @protected
   * @method makeCloseListener
   * @return {Object}
   *      The <i>closing listener of this stream</i>.
   */
  makeCloseListener: function () {
    if (!this.closeListener) {
      var stream = this;
      this.closeListener = function (data) {
        if (stream.triggerClose) {
          stream.triggerClose(data);
        } else {
          StreamUtil.triggerClose.call(stream, data);
        }
      };
    }

    return this.closeListener;
  },

  /**
   * Defers a `ProAct.Actor` listener.
   * <p>
   *  For streams this means pushing it to active flow using {{#crossLink "ProAct.Flow/push:method"}}{{/crossLink}}.
   *  If the listener is object with 'property' field, it is done using {{#crossLink "ProAct.Actor/defer:method"}}{{/crossLink}}.
   *  That way the reactive environment is updated only once, but the streams are not part of it.
   * </p>
   *
   * @for ProAct.Stream
   * @protected
   * @instance
   * @method defer
   * @param {Object} event
   *      The event/value to pass to the listener.
   * @param {Object} listener
   *      The listener to defer. It should be a function or object defining the <i>call</i> method.
   * @return {ProAct.Actor}
   *      <i>this</i>
   */
  defer: function (event, listener) {
    if (!listener) {
      return;
    }

    if (listener.property) {
      P.Actor.prototype.defer.call(this, event, listener);
      return;
    }
    var queueName = (listener.queueName) ? listener.queueName : this.queueName;

    if (P.U.isFunction(listener)) {
      P.flow.push(queueName, listener, [event]);
    } else {
      P.flow.push(queueName, listener, listener.call, [event]);
    }
  },

  /**
   * Creates a new `ProAct.Stream` instance with source <i>this</i> and mapping
   * the passed <i>mapping function</i>.
   *
   * ```
   *   var mapped = stream.map(function (v) {
   *     return v * v;
   *   });
   *
   *   mapped.on(function (v) {
   *     console.log(v); // squares
   *   });
   * ```
   *
   * @for ProAct.Stream
   * @instance
   * @method map
   * @param {Object} mappingFunction
   *      Function or object with a <i>call method</i> to use as map function.
   * @return {ProAct.Stream}
   *      A new `ProAct.Stream` instance with the <i>mapping</i> applied.
   */
  map: function (mappingFunction) {
    return new P.S(this).mapping(mappingFunction);
  },

  /**
   * Creates a new `ProAct.Stream` instance with source <i>this</i> and filtering
   * the passed <i>filtering function</i>.
   *
   * ```
   *   var filtered = stream.filter(function (v) {
   *     return v % 2 === 1;
   *   });
   *
   *   filtered.on(function (v) {
   *     console.log(v); // odds
   *   });
   * ```
   *
   * @for ProAct.Stream
   * @instance
   * @method filter
   * @param {Object} filteringFunction
   *      The filtering function or object with a call method, should return boolean.
   * @return {ProAct.Stream}
   *      A new `ProAct.Stream` instance with the <i>filtering</i> applied.
   */
  filter: function (filteringFunction) {
    return new P.S(this).filtering(filteringFunction);
  },

  /**
   * Creates a new `ProAct.Stream` instance with source <i>this</i> and accumulation
   * the passed <i>accumulation function</i>.
   *
   * ```
   *  var acc = stream.accumulate(0, function (p, v) {
   *    return p + v;
   *  });
   *
   *  acc.on(console.log); // sums
   * ```
   *
   * @for ProAct.Stream
   * @instance
   * @method accumulate
   * @param {Object} initVal
   *      Initial value for the accumulation. For example '0' for sum.
   * @param {Object} accumulationFunction
   *      The function to accumulate.
   * @return {ProAct.Stream}
   *      A new `ProAct.Stream` instance with the <i>accumulation</i> applied.
   */
  accumulate: function (initVal, accumulationFunction) {
    return new P.S(this).accumulation(initVal, accumulationFunction);
  },

  /**
   * Creates a new `ProAct.Stream` instance that merges this with other streams.
   * The new instance will have new value on value from any of the source streams.
   *
   * ```
   *  var merged = stream1.merge(stream2);
   * ```
   *
   * Here if `stream1` emits:
   * 1--2---3----5-----X
   *
   * and `steam2` emits:
   * ----A-----B-----C-----D--X
   *
   * `merged` will emit:
   * 1--2A--3--B-5---C-----D--X
   *
   * @for ProAct.Stream
   * @instance
   * @method merge
   * @param [...]
   *      A list of streams to be set as sources.
   * @return {ProAct.Stream}
   *      A new `ProAct.Stream` instance with the sources this and all the passed streams.
   */
  merge: function () {
    var sources = [this].concat(slice.call(arguments)),
        result = new P.S();

    return P.S.prototype.into.apply(result, sources);
  },

  /**
   * Links source actors into this `ProAct.Stream`. This means that <i>this stream</i>
   * is listening for changes from the <i>sources</i>.
   *
   * The streams count their sources and when the sources are zero, they become inactive.
   *
   * ```
   *  var stream1 = ProAct.stream();
   *  var stream2 = ProAct.stream();
   *  var stream = ProAct.stream();
   *
   *  stream.into(stream1, stream2);
   *  stream.on(function (v) {
   *    console.log(v);
   *  });
   *
   * ```
   *
   * Now if the any of the source streams is emits,
   * the notification will be printed on the output.
   *
   * @for ProAct.Stream
   * @instance
   * @method into
   * @param [...]
   *      Zero or more source {{#crossLink "ProAct.Actor"}}{{/crossLink}}s to set as sources.
   * @return {ProAct.Stream}
   *      <b>this</b>
   */
  into: function () {
    ProAct.Actor.prototype.into.apply(this, arguments);

    this.sourceNumber += arguments.length;

    return this;
  },

  /**
   * Checks if <i>this</i> can be closed.
   *
   * Uses the number of the active sources to decide if `this stream` is ready to be closed.
   * If the active sources are zero - it can.
   *
   * @for ProAct.Stream
   * @protected
   * @instance
   * @method canClose
   */
  canClose: function () {
    this.sourceNumber -= 1;

    return this.sourceNumber <= 0;
  }
});

// Methods added to the ProAct.Actor from the proact-streams module.
P.U.ex(P.Actor.prototype, {

  /**
   * Turns this `ProAct.Actor` to a {{#crossLink "ProAct.Stream"}}{{/crossLink}}.
   *
   * In reality this method creates a new `Stream` with source this.
   *
   * @for ProAct.Actor
   * @instance
   * @method toStream
   */
  toStream: function () {
    return new P.S(this.queueName, this);
  },

  /**
   * Creates a new {{#crossLink "ProAct.Stream"}}{{/crossLink}} with source - `this`.
   * It skips the first `n` updates incoming from `this`.
   *
   * source : --3---4---5--4---3---4---5--|->
   * skip(3): -------------4---3---4---5--|->
   *
   * @for ProAct.Actor
   * @instance
   * @method skip
   * @param {Number} n The number of notifications to skip.
   */
  skip: function (n) {
    var i = n, self = this;
    return this.fromLambda(function (stream, event) {
      if (event === ProAct.Actor.Close) {
        stream.close();
        return;
      }

      i--;
      if (i < 0) {
        self.offAll(stream.lambda);
        stream.into(self);
        stream.trigger(event);
      }
    });
  },

  /**
   * Creates a new {{#crossLink "ProAct.Stream"}}{{/crossLink}} with source - `this`.
   * It skips notifications from its source, while a condition is true.
   *
   * ```
   *
   *  source.skipWhile(function (v) {
   *      return v % 2 === 1;
   *  });
   *
   *  // source :
   *  // --3---5---2--4---3---4---5--|->
   *  // skipWhile:
   *  // ----------2--4---3---4---5--|->
   *
   * ```
   *
   * @for ProAct.Actor
   * @instance
   * @method skipWhile
   * @param {Function} condition
   *        A condition function, which is called for each of the incoming values
   *        While it returns true, the elements are skipped,
   *        after it returns false for the first time, the current and all the following values are emitted.
   */
  skipWhile: function (condition) {
    var self = this,
        cond = condition ? condition : function (e) {
          return e;
        };
    return this.fromLambda(function (stream, event) {
      if (event === ProAct.Actor.close) {
        stream.close();
        return;
      }

      if (!cond(event)) {
        self.offAll(stream.lambda);
        stream.into(self);
        stream.trigger(event);
      }
    });
  },

  /**
   * Creates a new {{#crossLink "ProAct.Stream"}}{{/crossLink}} with source - `this`.
   * It skips dublicating elements, comming one after another.
   *
   * ```
   *
   *  source.skipDuplicates();
   *
   *  // source :
   *  // --3---5---5--4---3---3---5--|->
   *  // skipDuplicates:
   *  // --3---5------4---3-------5--|->
   *
   * ```
   *
   * @for ProAct.Actor
   * @instance
   * @method skipDuplicates
   * @param {Function} comparator
   *      A function used to compare the elements.
   *      If nothing is passed it defaults to comparing using `===`.
   */
  skipDuplicates: function (comparator) {
    var last = undefined,
        cmp = comparator ? comparator : function (a, b) {
          return a === b;
        };
    return this.fromLambda(function (stream, event) {
      if (!cmp(last, event)) {
        stream.trigger(event);
        last = event;
      }
    });
  },

  /**
   * Creates a new {{#crossLink "ProAct.Stream"}}{{/crossLink}} with source - `this`.
   * It emits the difference between the last update and the current incomming update from the source.
   *
   * ```
   *
   *  source.diff(0, function(prev, v) {
   *      return v - prev;
   *  });
   *
   *  // source :
   *  // --3---5------6---|->
   *  // diff:
   *  // --3---2------1---|->
   *
   * ```
   *
   * @for ProAct.Actor
   * @instance
   * @method diff
   * @param {Object} seed
   *      A value to pass the `differ` function as previous on the inital notification from the source.
   * @param {Function} differ
   *      Creates the difference, receives two params - the previous update and the current.
   *      It can be skipped - the default `differ` function returns array with two elements - the previous and the curren updates.
   */
  diff: function(seed, differ) {
    var last = seed,
        fn = differ ? differ : function (last, next) {
          return [last, next];
        };
    return this.fromLambda(function (stream, event) {
      if (event === ProAct.Actor.close) {
        stream.close();
        return;
      }

      if (last === undefined) {
        last = event;
        return;
      }

      stream.trigger(differ(last, event));
      last = event;
    });
  },

  /**
   * Creates a new {{#crossLink "ProAct.Stream"}}{{/crossLink}} with source - `this`.
   * It takes the first `limit` updates incoming from `this`.
   *
   * source : --3---4---5--4---3---4---5--|->
   * skip(3): --3---4---5--|->
   *
   * @for ProAct.Actor
   * @instance
   * @method take
   * @param {Number} limit The number of notifications to emit.
   */
  take: function (limit) {
    var left = limit;
    return this.fromLambda(function (stream, event) {
      left--;
      if (left >= 0) {
        stream.trigger(event, true);
      }
      if (left <= 0 && stream.state === ProAct.States.ready) {
        stream.close();
      }
    });
  },

  /**
   * Creates a new {{#crossLink "ProAct.Stream"}}{{/crossLink}} with source - `this`.
   * It emits notifications from its source, while a condition is true.
   *
   * ```
   *
   *  source.takeWhile(function (v) {
   *      return v % 2 === 1;
   *  });
   *
   *  // source :
   *  // --3---5---2--4---3---4---5--|->
   *  // takeWhile:
   *  // --3---5--|->
   *
   * ```
   *
   * @for ProAct.Actor
   * @instance
   * @method takeWhile
   * @param {Function} condition
   *        A condition function, which is called for each of the incoming values
   *        While it returns true, the elements are emitted,
   *        after it returns false for the first time, the stream created by takeWhile closes.
   */
  takeWhile: function (condition) {
    return this.fromLambda(function (stream, event) {
      if (condition.call(null, event)) {
        stream.trigger(event);
      } else {
        stream.close();
      }
    });
  },

  /**
   * Creates a new {{#crossLink "ProAct.Stream"}}{{/crossLink}} with source - `this`.
   * The logic of the stream is implemented through the passed `lambda` parameter.
   *
   * TODO The first parameter of the lambda should be called something else and not stream.
   *
   * ```
   *  source.fromLambda(function (stream, notification) {
   *    stream.trigger(notification);
   *  });
   *
   *  // Just forwards notifications..
   *
   * ```
   *
   * @for ProAct.Actor
   * @instance
   * @method fromLambda
   * @param {Function} lambda
   *      A function, with two arguments - the returned by this function stream and notification.
   *      For every update comming from `this`, the lambda is called with the update and the stream in it.
   *      Has the `trigger`, `triggerErr` and `triggerClose` methods.
   */
  fromLambda: function (lambda) {
    var stream = new ProAct.Stream(this.queueName),
        listener = function (e) {
          stream.trigger = StreamUtil.trigger;
          stream.triggerErr = StreamUtil.triggerErr;
          stream.triggerClose = StreamUtil.triggerClose;

          lambda.call(null, stream, e);

          stream.trigger = undefined;
          stream.triggerErr = undefined;
          stream.triggerClose = undefined;
        };
    this.onAll(listener);
    stream.lambda = listener;

    return stream;
  },

  /**
   * Creates a new {{#crossLink "ProAct.Stream"}}{{/crossLink}} with source - `this`.
   * For every update incomming from the source, a new `Actor` is created using the `mapper`
   * function. All the updates, emitted by the streams, returned by the `mapper` are emitted by the
   * `Actor` created by `flatMap`
   *
   *
   * ```
   *  source.flatMap(function (v) {
   *    return ProAct.seq(100, [v, v +1 ]);
   *  });
   *
   *  // source:
   *  // -1---2----4-----3-----2-----1---->
   *  // flatMap
   *  // -1-2-2-3--4-5---3-4---2-3---1-2-->
   *
   * ```
   *
   * @for ProAct.Actor
   * @instance
   * @method flatMap
   * @param {Function} mapper
   *      A function that returns an `ProAct.Actor` using the incomming notification.
   */
  flatMap: function (mapper) {
    return this.fromLambda(function (stream, e) {
      if (e !== P.Actor.Close) {
        var actor = mapper ? mapper.call(null, e) : e;
        stream.into(actor);
      }
    });
  },

  /**
   * Creates a new {{#crossLink "ProAct.Stream"}}{{/crossLink}} with source - `this`.
   * For every update incomming from the source, a new `Actor` is created using the `mapper`
   * function. ALl the updates, emitted by the streams, returned by the `mapper` are emitted by the
   * `Actor` created by `flatMap`. The number of the currently active sources is limited by the
   * passed `limit`. All the sources created after the limit is reached are queued and reused as sources later.
   *
   *
   * @for ProAct.Actor
   * @instance
   * @method flatMapLimited
   * @param {Function} mapper
   *      A function that returns an `ProAct.Actor` using the incomming notification.
   * @param {Number} limit
   *      The number of the currently active sources.
   */
  flatMapLimited: function (mapper, limit) {
    var queue = [], current = 0, addActor = function (stream, actor) {
      if (!actor) {
        return;
      }
      if (current < limit) {
        current++;
        stream.into(actor);

        actor.onClose(function () {
          current--;
          actor.offAll(stream.makeListener());

          addActor(stream, queue.shift());
        });
      } else {
        queue.push(actor);
      }
    };

    return this.fromLambda(function (stream, e) {
      var actor = mapper ? mapper.call(null, e) : e;

      addActor(stream, actor);
    });
  },

  /**
   * Creates a new {{#crossLink "ProAct.Stream"}}{{/crossLink}} with source - `this`.
   * For every update comming from `this`, a new `ProAct.Actor` is created using the logic
   * passed through `mapper`. This new `Actor` becomes the current source of the `ProAct.Stream`,
   * returned by this method. The next update will create a new source, which will become
   * the current one and replace the old one. This is the same as {{#crossLink "ProAct.Actor/flatMapLimited:method"}}{{/crossLink}},
   * with `limit` of `1`.
   *
   * ```
   *  source.flatMapLast(function (v) {
   *    return ProAct.seq(100, [v, v + 1, v + 2, v + 3]);
   *  });
   *
   *  // source:
   *  // -1---2----4-----3-----2-----1----|->
   *  // flatMapLast
   *  // -1-2-2-3-44-5-6-3-4-5-2-3-4-1-2-3-4-|->
   *
   * ```
   *
   * @for ProAct.Actor
   * @instance
   * @method flatMapLast
   * @param {Function} mapper
   *      A function that returns an `ProAct.Actor` using the incomming notification.
   */
  flatMapLast: function (mapper) {
    var oldActor;
    return this.fromLambda(function (stream, e) {
      var actor = mapper ? mapper.call(null, e) : e;
      if (oldActor) {
        oldActor.offAll(stream.makeListener());
      }
      oldActor = actor;
      stream.into(actor);
    });
  },

  /**
   * Creates a new {{#crossLink "ProAct.Stream"}}{{/crossLink}} with source - `this`.
   * For every update comming from `this`, a new `ProAct.Actor` is created using the logic
   * passed through `mapper`. The first such `Actor` becomes the source of the `Actor`, returned by this
   * method. When it finishes, if a new `Actor` is emitted, it becomes the source.
   *
   * ```
   *  source.flatMapLast(function (v) {
   *    return ProAct.seq(100, [v, v + 1, v + 2, v + 3]);
   *  });
   *
   *  // source:
   *  // -1---2----4-----3-----2-----1----|->
   *  // flatMapFirst
   *  // -1-2-3-4--4-5-6-7-----2-3-4-5-|->
   *
   * ```
   *
   * @for ProAct.Actor
   * @instance
   * @method flatMapFirst
   * @param {Function} mapper
   *      A function that returns an `ProAct.Actor` using the incomming notification.
   */
  flatMapFirst: function (mapper) {
    var oldActor;
    return this.fromLambda(function (stream, e) {
      if (oldActor && oldActor.state !== ProAct.States.closed) {
        return;
      }

      var actor = mapper ? mapper.call(null, e) : e;
      if (oldActor) {
        oldActor.offAll(stream.makeListener());
      }
      oldActor = actor;
      stream.into(actor);
    });
  }
});

P.S.prototype.t = P.S.prototype.trigger;
P.S.prototype.tt = P.S.prototype.triggerMany;
