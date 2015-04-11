/**
 * @module proact-streams
 */

/**
 * <p>
 *  Constructs a `ProAct.DebouncingStream`. It is a {{#crossLink "ProAct.DelayedStream"}}{{/crossLink}} that resets its flushing interval on every new value/event.
 *  Only the last event/value triggered in given interval will be emitted.
 * </p>
 * <p>
 *  `ProAct.DebouncingStream` is part of the proact-streams module of ProAct.js.
 * </p>
 *
 * @class ProAct.DebouncingStream
 * @extends ProAct.DelayedStream
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
function DebouncingStream (queueName, source, transforms, delay) {
  P.DBS.call(this, queueName, source, transforms, delay);
}
ProAct.DebouncingStream = P.DDS = DebouncingStream;

ProAct.DebouncingStream.prototype = P.U.ex(Object.create(P.DBS.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @property constructor
   * @type ProAct.DebouncingStream
   * @final
   * @for ProAct.DebouncingStream
   */
  constructor: ProAct.DebouncingStream,

  /**
   * <p>
   *  Triggers a new event/value to the stream. It is stored in the buffer of the stream and not emitted.
   *  But the buffer of `ProAct.DebouncingStream` can store only one value/event, so when the delay passes only
   *  the last value/event triggered into the stream by this method is emitted.
   *  On every call of this method the delay is reset.
   *  So for example if you have mouse move as source, it will emit only the last mouse move event, that was send <i>delay</i> milliseconds ago.
   * </p>
   * <p>
   *  ProAct.DebouncingStream.t is alias of this method.
   * </p>
   *
   * @for ProAct.DebouncingStream
   * @instance
   * @method trigger
   * @param {Object} event
   *      The event/value to pass to trigger.
   * @param {Boolean} useTransformations
   *      If the stream should transform the triggered value. By default it is true (if not passed)
   * @return {ProAct.DebouncingStream}
   *      <i>this</i>
   */
  trigger: function (event, useTransformations) {
    this.buffer = [];
    this.cancelDelay();
    this.setDelay(this.delay);
    this.buffer.push(event, useTransformations);
  }
});

P.U.ex(P.Stream.prototype, {

  /**
   * Creates a new {{#crossLink "ProAct.DebouncingStream"}}{{/crossLink}} instance having as source <i>this</i>.
   *
   * @memberof ProAct.Stream
   * @instance
   * @method debounce
   * @param {Number} delay
   *      The time delay to be used for flushing the buffer of the new stream.
   * @return {ProAct.DebouncingStream}
   *      A {{#crossLink "ProAct.DebouncingStream"}}{{/crossLink}} instance.
   */
  debounce: function (delay) {
    return new P.DDS(this, this.queueName, delay);
  }
});

P.DDS.prototype.t = P.DDS.prototype.trigger;
