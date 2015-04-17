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

  /**
   * Reference to the constructor of this object.
   *
   * @property constructor
   * @type ProAct.SubscribableStream
   * @final
   * @for ProAct.SubscribableStream
   */
  constructor: ProAct.SubscribableStream,

  /**
   * Attaches a new listener to this `ProAct.SubscribableStream`.
   *
   * The listener may be function or object that defines a <i>call</i> method.
   * On the first attached listener the `subscribe` function passed to the constructor will be called.
   * That way the stream will be subscribed to custom data source.
   *
   * ```
   *   stream.on(function (v) {
   *    console.log(v);
   *   });
   *
   *   stream.on('error', function (v) {
   *    console.error(v);
   *   });
   *
   *   stream.on({
   *    call: function (v) {
   *      console.log(v);
   *    }
   *   });
   * ```
   *
   * @for ProAct.SubscribableStream
   * @instance
   * @method on
   * @param {Array|String} actions
   *      The action/actions to listen for. If this parameter is skipped or null/undefined,
   *      the actions from {{#crossLink "ProAct.Actor/defaultActions:method"}}{{/crossLink}} are used.
   *      <p>
   *        The actions can be skipped and on their place as first parameter to be passed the <i>listener</i>.
   *      </p>
   * @param {Object} listener
   *      The listener to attach. It must be instance of Function or object with a <i>call</i> method.
   * @return {ProAct.SubscribableStream}
   *      <b>this</b>
   */
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
