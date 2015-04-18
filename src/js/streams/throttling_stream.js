/**
 * @module proact-streams
 */

/**
 * <p>
 *  Constructs a `ProAct.ThrottlingStream`. This is special kind of {{#crossLink "ProAct.DelayedStream"}}{{/crossLink}}.
 * </p>
 * <p>
 *  The main idea is the following : if <i>n</i> values/events are triggered to this stream before the time delay for
 *  flushing passes, only the last one, the <i>n</i>-th is emitted.
 * </p>
 * <p>
 *  `ProAct.ThrottlingStream` is part of the `proact-streams` module of ProAct.js.
 * </p>
 *
 * @class ProAct.ThrottlingStream
 * @constructor
 * @extends ProAct.DelayedStream
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
function ThrottlingStream (queueName, source, transforms, delay) {
  P.DBS.call(this, queueName, source, transforms, delay);
}
ProAct.ThrottlingStream = P.TDS = ThrottlingStream;

ProAct.ThrottlingStream.prototype = P.U.ex(Object.create(P.DBS.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @property constructor
   * @type ProAct.ThrottlingStream
   * @final
   * @for ProAct.ThrottlingStream
   */
  constructor: ProAct.ThrottlingStream,

  /**
   * <p>
   *  Triggers a new event/value to the stream. It is stored in the buffer of the stream and not emitted.
   *  But the buffer of `ProAct.ThrottlingStream` can store only one value/event, so when the delay passes only
   *  the last value/event triggered into the stream by this method is emitted.
   * </p>
   * <p>
   *  `ProAct.ThrottlingStream.t` is alias of this method.
   * </p>
   *
   * TODO - should be moved to StreamUtil.
   *
   * @for ProAct.ThrottlingStream
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
   * Creates a new {{#crossLink "ProAct.ThrottlingStream"}}{{/crossLink}} instance having as source <i>this</i>.
   *
   * @for ProAct.Stream
   * @instance
   * @method throttle
   * @param {Number} delay
   *      The time delay to be used for flushing the buffer of the new stream.
   * @return {ProAct.ThrottlingStream}
   *      A {{#crossLink "ProAct.ThrottlingStream"}}{{/crossLink}} instance.
   */
  throttle: function (delay) {
    return new P.TDS(this, delay);
  }
});

P.TDS.prototype.t = P.TDS.prototype.trigger;
