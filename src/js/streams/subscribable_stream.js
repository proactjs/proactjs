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
