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
        this.triggerErr(e);
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
   * @memberof ProAct.Stream
   * @instance
   * @constant
   * @type {Object}
   * @default ProAct.Stream
   */
  constructor: ProAct.Stream,

  /**
   * Creates the <i>event</i> to be send to the listeners on update.
   * <p>
   *  Streams don't create new events by default, the event is the source.
   * </p>
   *
   * @memberof ProAct.Stream
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
   * <p>
   *  The listener of the stream just calls the method {@link ProAct.Stream#trigger} with the incoming event/value.
   * </p>
   *
   * @memberof ProAct.Stream
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
   *  The listener just calls {@link ProAct.Stream#triggerErr} of <i>this</i> with the incoming error.
   * </p>
   *
   * @memberof ProAct.Stream
   * @instance
   * @method makeErrListener
   * @return {Object}
   *      The <i>error listener of this stream</i>.
   */
  makeErrListener: function () {
    if (!this.errListener) {
      var stream = this;
      this.errListener = function (error) {
        stream.triggerErr(error);
      };
    }

    return this.errListener;
  },

  /**
   * Creates the <i>closing listener</i> of this stream.
   * <p>
   *  The listener just calls {@link ProAct.Stream#triggerClose} of <i>this</i> with the incoming closing data.
   * </p>
   *
   * @memberof ProAct.Stream
   * @instance
   * @method makeCloseListener
   * @return {Object}
   *      The <i>closing listener of this stream</i>.
   */
  makeCloseListener: function () {
    if (!this.closeListener) {
      var stream = this;
      this.closeListener = function (error) {
        stream.triggerClose(error);
      };
    }

    return this.closeListener;
  },

  /**
   * Defers a ProAct.Actor listener.
   * <p>
   *  For streams this means pushing it to active flow using {@link ProAct.Flow#push}.
   *  If the listener is object with 'property' field, it is done using {@link ProAct.Actor#defer}.
   *  That way the reactive environment is updated only once, but the streams are not part of it.
   * </p>
   *
   * @memberof ProAct.Stream
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
   * <p>
   *  Triggers a new error to the stream. Anything that is listening for errors from
   *  this stream will get updated.
   * </p>
   * <p>
   *  ProAct.Stream.te is alias of this method.
   * </p>
   *
   * @memberof ProAct.Stream
   * @instance
   * @method triggerErr
   * @param {Error} err
   *      The error to trigger.
   * @return {ProAct.Stream}
   *      <i>this</i>
   * @see {@link ProAct.Actor#update}
   */
  triggerErr: function (err) {
    return ActorUtil.update.call(this, err, 'error');
  },

  /**
   * <p>
   *  Triggers a closing event to the stream. Anything that is listening for closing events from
   *  this stream will get updated.
   * </p>
   * <p>
   *  The stream will be closed and unusable.
   * </p>
   *
   * @memberof ProAct.Stream
   * @instance
   * @method triggerClose
   * @param {Object} data
   *      Data connected to the closing event.
   * @return {ProAct.Stream}
   *      <i>this</i>
   * @see {@link ProAct.Actor#update}
   */
  triggerClose: function (data) {
    return ActorUtil.update.call(this, data, 'close');
  },

  /**
   * Creates a new ProAct.Stream instance with source <i>this</i> and mapping
   * the passed <i>mapping function</i>.
   *
   * @memberof ProAct.Stream
   * @instance
   * @method map
   * @param {Object} mappingFunction
   *      Function or object with a <i>call method</i> to use as map function.
   * @return {ProAct.Stream}
   *      A new ProAct.Stream instance with the <i>mapping</i> applied.
   * @see {@link ProAct.Actor#mapping}
   */
  map: function (mappingFunction) {
    return new P.S(this).mapping(mappingFunction);
  },

  /**
   * Creates a new ProAct.Stream instance with source <i>this</i> and filtering
   * the passed <i>filtering function</i>.
   *
   * @memberof ProAct.Stream
   * @instance
   * @method filter
   * @param {Object} filteringFunction
   *      The filtering function or object with a call method, should return boolean.
   * @return {ProAct.Stream}
   *      A new ProAct.Stream instance with the <i>filtering</i> applied.
   * @see {@link ProAct.Actor#filtering}
   */
  filter: function (filteringFunction) {
    return new P.S(this).filtering(filteringFunction);
  },

  /**
   * Creates a new ProAct.Stream instance with source <i>this</i> and accumulation
   * the passed <i>accumulation function</i>.
   *
   * @memberof ProAct.Stream
   * @instance
   * @method accumulate
   * @param {Object} initVal
   *      Initial value for the accumulation. For example '0' for sum.
   * @param {Object} accumulationFunction
   *      The function to accumulate.
   * @return {ProAct.Stream}
   *      A new ProAct.Stream instance with the <i>accumulation</i> applied.
   * @see {@link ProAct.Actor#accumulation}
   */
  accumulate: function (initVal, accumulationFunction) {
    return new P.S(this).accumulation(initVal, accumulationFunction);
  },

  /**
   * Creates a new ProAct.Stream instance that merges this with other streams.
   * The new instance will have new value on value from any of the source streams.
   *
   * @memberof ProAct.Stream
   * @instance
   * @method merge
   * @param [...]
   *      A list of streams to be set as sources.
   * @return {ProAct.Stream}
   *      A new ProAct.Stream instance with the sources this and all the passed streams.
   */
  merge: function () {
    var sources = [this].concat(slice.call(arguments)),
        result = new P.S();

    return P.S.prototype.into.apply(result, sources);
  },

  into: function () {
    ProAct.Actor.prototype.into.apply(this, arguments);

    this.sourceNumber += arguments.length;

    return this;
  },

  canClose: function () {
    this.sourceNumber -= 1;

    return this.sourceNumber <= 0;
  }
});

P.U.ex(P.F.prototype, {

  /**
   * Retrieves the errStream for logging errors from this flow.
   * If there is no error stream, it is created.
   *
   * @memberof ProAct.Flow
   * @instance
   * @method errStream
   * @return {ProAct.Stream}
   *      The error stream of the flow.
   */
  errStream: function () {
    if (!this.errStreamVar) {
      this.errStreamVar = new P.S();
    }

    return this.errStreamVar;
  }
});

P.U.ex(P.Actor.prototype, {
  toStream: function () {
    return new P.S(this.queueName, this);
  },

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

  takeWhile: function (condition) {
    return this.fromLambda(function (stream, event) {
      if (condition.call(null, event)) {
        stream.trigger(event);
      } else {
        stream.close();
      }
    });
  },

  fromLambda: function (lambda) {
    var stream = new ProAct.Stream(this.queueName),
        listener = function (e) {
          stream.trigger = StreamUtil.trigger;
          lambda.call(null, stream, e);
          stream.trigger = undefined;
        };
    this.onAll(listener);
    stream.lambda = listener;

    return stream;
  },

  flatMap: function (mapper) {
    return this.fromLambda(function (stream, e) {
      if (e !== P.Actor.Close) {
        var actor = mapper ? mapper.call(null, e) : e;
        stream.into(actor);
      }
    });
  },

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
P.S.prototype.te = P.S.prototype.triggerErr;
