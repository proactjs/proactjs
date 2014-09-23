/**
 * <p>
 *  Constructs a ProAct.ThrottlingStream. This is special kind of {@link ProAct.DelayedStream}.
 * </p>
 * <p>
 *  The main idea is the following : if <i>n</i> values/events are triggered to this stream before the time delay for
 *  flushing passes, only the last one, the <i>n</i>-th is emitted.
 * </p>
 * <p>
 *  ProAct.ThrottlingStream is part of the streams module of ProAct.js.
 * </p>
 *
 * @class ProAct.ThrottlingStream
 * @extends ProAct.DelayedStream
 * @param {ProAct.Actor} source
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
ProAct.ThrottlingStream = P.TDS = function (source, transforms, delay) {
  P.DBS.call(this, source, transforms, delay);
};

ProAct.ThrottlingStream.prototype = P.U.ex(Object.create(P.DBS.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @memberof ProAct.ThrottlingStream
   * @instance
   * @constant
   * @type {Object}
   * @default ProAct.ThrottlingStream
   */
  constructor: ProAct.ThrottlingStream,

  /**
   * <p>
   *  Triggers a new event/value to the stream. It is stored in the buffer of the stream and not emitted.
   *  But the buffer of ProAct.ThrottlingStream can store only one value/event, so when the delay passes only
   *  the last value/event triggered into the stream by this method is emitted.
   * </p>
   * <p>
   *  ProAct.ThrottlingStream.t is alias of this method.
   * </p>
   *
   * @memberof ProAct.ThrottlingStream
   * @instance
   * @method trigger
   * @param {Object} event
   *      The event/value to pass to trigger.
   * @param {Boolean} useTransformations
   *      If the stream should transform the triggered value. By default it is true (if not passed)
   * @return {ProAct.ThrottlingStream}
   *      <i>this</i>
   */
  trigger: function (event, useTransformations) {
    this.buffer[0] = event;
    this.buffer[1] = useTransformations;

    return this;
  }
});

P.U.ex(P.Stream.prototype, {

  /**
   * Creates a new {@link ProAct.ThrottlingStream} instance having as source <i>this</i>.
   *
   * @memberof ProAct.Stream
   * @instance
   * @method throttle
   * @param {Number} delay
   *      The time delay to be used for flushing the buffer of the new stream.
   * @return {ProAct.ThrottlingStream}
   *      A {@link ProAct.ThrottlingStream} instance.
   */
  throttle: function (delay) {
    return new P.TDS(this, delay);
  }
});

P.TDS.prototype.t = P.TDS.prototype.trigger;
