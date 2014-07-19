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
  constructor: ProAct.DelayedStream,
  trigger: function (event, useTransformations) {
    this.buffer.push(event, useTransformations);
  },
  cancelDelay: function () {
    if (this.delayId !== null){
      clearInterval(this.delayId);
      this.delayId = null;
    }
  },
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
  }
});

P.U.ex(P.S.prototype, {
  delay: function (delay) {
    return new P.DBS(this, delay);
  }
});
