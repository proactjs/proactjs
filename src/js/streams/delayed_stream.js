/**
 * <p>
 *  Constructs a ProAct.DelayedStream. When a given time interval passes the buffer of the stream is flushed authomatically.
 * </p>
 * <p>
 *  ProAct.DelayedStream is part of the streams module of ProAct.js.
 * </p>
 *
 * @class ProAct.DelayedStream
 * @extends ProAct.BufferedStream
 * @param {ProAct.Observable} source
 *      A default source of the stream, can be null.
 *      <p>
 *        If this is the only one passed argument and it is a number - it becomes the delay of the stream.
 *      </p>
 * @param {Array} transforms
 *      A list of transformation to be used on all incoming chages.
 *      <p>
 *        If the arguments passed are two and this is a number - it becomes the delay of the stream.
 *      </p>
 * @param {Number} delay
 *      The time delay to be used to flush the stream.
 */
ProAct.DelayedStream = P.DBS = function (source, transforms, delay) {
  if (typeof source === 'number') {
    delay = source;
    source = null;
  } else if (P.U.isObject(source) && typeof transforms === 'number') {
    delay = transforms;
    transforms = null;
  }
  P.BS.call(this, source, transforms);

  this.delayId = null;
  this.setDelay(delay);
};

ProAct.DelayedStream.prototype = P.U.ex(Object.create(P.BS.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @memberof ProAct.DelayedStream
   * @instance
   * @constant
   * @type {Object}
   * @default ProAct.DelayedStream
   */
  constructor: ProAct.DelayedStream,

  /**
   * <p>
   *  Triggers a new event/value to the stream. It is stored in the buffer of thr stream and not emitted.
   * </p>
   * <p>
   *  ProAct.Stream.t is alias of this method.
   * </p>
   *
   * @memberof ProAct.DelayedStream
   * @instance
   * @method trigger
   * @param {Object} event
   *      The event/value to pass to trigger.
   * @param {Boolean} useTransformations
   *      If the stream should transform the triggered value. By default it is true (if not passed)
   * @return {ProAct.DelayedStream}
   *      <i>this</i>
   */
  trigger: function (event, useTransformations) {
    this.buffer.push(event, useTransformations);
  },

  /**
   * <p>
   *  Cancels the delay interval flushes. If this method is called the stream will stop emitting incoming values/event,
   *  until the {@link ProAct.DelayedStream#setDelay} method is called.
   * </p>
   *
   * @memberof ProAct.DelayedStream
   * @instance
   * @method cancelDelay
   * @return {ProAct.DelayedStream}
   *      <i>this</i>
   * @see {@link ProAct.DelayedStream#setDelay}
   */
  cancelDelay: function () {
    if (this.delayId !== null){
      clearInterval(this.delayId);
      this.delayId = null;
    }

    return this;
  },

  /**
   * <p>
   *  Modifies the delay of the stream. The current delay is canceled using the {@link ProAct.DelayedStream#cancelDelay} method.
   * </p>
   *
   * @memberof ProAct.DelayedStream
   * @instance
   * @method setDelay
   * @param {Number} delay
   *      The new delay of the stream.
   * @return {ProAct.DelayedStream}
   *      <i>this</i>
   */
  setDelay: function (delay) {
    this.delay = delay;
    this.cancelDelay();

    if (!this.delay) {
      return;
    }

    var self = this;
    this.delayId = setInterval(function () {
      self.flush();
    }, this.delay);

    return this;
  }
});

P.U.ex(P.S.prototype, {

  /**
   * Creates a new {@link ProAct.DelayedStream} instance having as source <i>this</i>.
   *
   * @memberof ProAct.Stream
   * @instance
   * @method delay
   * @param {Number} delay
   *      The time delay to be used for flushing the buffer of the new stream.
   * @return {ProAct.DelayedStream}
   *      A {@link ProAct.DelayedStream} instance.
   */
  delay: function (delay) {
    return new P.DBS(this, delay);
  }
});

P.DBS.prototype.t = P.DBS.prototype.trigger;
