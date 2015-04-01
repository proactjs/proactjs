/**
 * @module proact-streams
 */

/**
 * <p>
 *  Constructs a `ProAct.BufferedStream`. This is a {{#crossLink "ProAct.Stream"}}{{/crossLink}} with a buffer.
 * </p>
 * <p>
 *  On new value/event the listeners are not updated, but the value/event is stored in the buffer.
 * </p>
 * <p>
 *  When the buffer is flushed every value/event is emitted to the listeners. In case with property listeners
 *  they are updated only once with the last event/value. Good for performance optimizations.
 * </p>
 * <p>
 *  For example if it is set to stream mouse move events, we don't care for each of the event but for a portion of them.
 * </p>
 * <p>
 *  ProAct.BufferedStream is part of the streams module of ProAct.js.
 * </p>
 *
 * @class ProAct.BufferedStream
 * @extends ProAct.Stream
 * @constructor
 * @param {String} queueName
 *      The name of the queue all the updates should be pushed to.
 *      <p>
 *        If this parameter is null/undefined the default queue of
 *        {@link ProAct.flow} is used.
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
function BufferedStream (queueName, source, transforms) {
  if (queueName && !P.U.isString(queueName)) {
    transforms = source;
    source = queueName;
    queueName = null;
  }

  P.S.call(this, queueName, source, transforms);
  this.buffer = [];
}
ProAct.BufferedStream = P.BS = BufferedStream;

ProAct.BufferedStream.prototype = P.U.ex(Object.create(P.S.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @memberof ProAct.BufferedStream
   * @instance
   * @constant
   * @type {Object}
   * @default ProAct.BufferedStream
   */
  constructor: ProAct.BufferedStream,

  /**
   * Flushes the stream by emitting all the events/values stored in its buffer.
   * The buffer becomes empty.
   *
   * @memberof ProAct.BufferedStream
   * @instance
   * @method flush
   * @return {ProAct.BufferedStream}
   *      <i>this</i>
   */
  flush: function () {
    var self = this, i, b = this.buffer, ln = b.length;

    P.flow.run(function () {
      for (i = 0; i < ln; i+= 2) {
        StreamUtil.go.call(self, b[i], b[i+1]);
      }
      self.buffer = [];
    });

    return this;
  }
});
