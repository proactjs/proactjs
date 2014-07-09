Pro.DebouncingStream = function (source, transforms, delay) {
  Pro.DelayedStream.call(this, source, transforms, delay);
};

Pro.DebouncingStream.prototype = Pro.U.ex(Object.create(Pro.DelayedStream.prototype), {
  trigger: function (event, useTransformations) {
    this.buffer = [];
    this.cancelDelay();
    this.setDelay(this.delay);
    this.buffer.push(event, useTransformations);
  }
});
Pro.DebouncingStream.prototype.constructor = Pro.DebouncingStream;

Pro.U.ex(Pro.Stream.prototype, {
  debounce: function (delay) {
    return new Pro.DebouncingStream(this, delay);
  }
});
