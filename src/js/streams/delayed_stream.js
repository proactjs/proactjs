Pro.DelayedStream = function (source, transforms, delay) {
  if (typeof source === 'number') {
    delay = source;
    source = null;
  } else if (Pro.U.isObject(source) && typeof transforms === 'number') {
    delay = transforms;
    transforms = null;
  }
  Pro.BufferedStream.call(this, source, transforms);

  this.delayId = null;
  this.setDelay(delay);
};

Pro.DelayedStream.prototype = Pro.U.ex(Object.create(Pro.BufferedStream.prototype), {
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

    var _this = this;
    this.delayId = setInterval(function () {
      _this.flush();
    }, this.delay);
  }
});
Pro.DelayedStream.prototype.constructor = Pro.DelayedStream;

Pro.U.ex(Pro.Stream.prototype, {
  delay: function (delay) {
    return new Pro.DelayedStream(this, delay);
  }
});
