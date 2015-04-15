/**
 * @module proact-streams
 */

/**
 * <p>
 *  Constructs a `ProAct.SubscribableStream`. This is a `Stream` that has a custom `subscribe` function, used to subscribe to a source.
 * </p>
 *
 * This can be used to stream sources like browser events. The stream is lazy, when there are no listeners to it,
 * it is not subscribed to the source, on the first listener it is subscribed, when every listener is unsubscibed, it is unsubscribed.
 *
 * <p>
 *  `ProAct.SubscribableStream` is part of the `proact-streams` module of ProAct.js.
 * </p>
 *
 * @class ProAct.SubscribableStream
 * @constructor
 * @extends ProAct.SubscribableStream
 * @param {Function} subscribe
 *      A function used to subscribe to a source, when the first listener to this stream is attached.
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
 *        If this is the only one passed argument and it is a number - it becomes the size of the buffer.
 *      </p>
 * @param {Array} transforms
 *      A list of transformation to be used on all incoming chages.
 *      <p>
 *        If the arguments passed are two and this is a number - it becomes the size of the buffer.
 *      </p>
 */
function SubscribableStream (subscribe, queueName, source, transforms) {
  P.S.call(this, queueName, source, transforms);

  this.subscribe = subscribe;
  this.unsubscribe = null;
  this.subscribtions = 0;
}
ProAct.SubscribableStream = P.SUS = SubscribableStream;

ProAct.SubscribableStream.prototype = P.U.ex(Object.create(P.S.prototype), {
  constructor: ProAct.SubscribableStream,

  on: function (actions, listener) {
    if (this.subscribtions === 0) {
      this.unsubscribe = this.subscribe(this);
    }
    this.subscribtions++;

    return P.S.prototype.on.call(this, actions, listener);
  },

  off: function (actions, listener) {
    this.subscribtions--;

    if (!actions && !listener) {
      this.subscribtions = 0;
    }
    if (this.subscribtions < 0) {
      this.subscribtions = 0;
    }

    if (this.subscribtions === 0 && this.unsubscribe) {
      this.unsubscribe(this);
    }

    return P.S.prototype.off.call(this, actions, listener);
  }
});
