ProAct.DebouncingStream = P.DDS = function (source, transforms, delay) {
  P.DBS.call(this, source, transforms, delay);
};

ProAct.DebouncingStream.prototype = P.U.ex(Object.create(P.DBS.prototype), {
  constructor: ProAct.DebouncingStream,
  trigger: function (event, useTransformations) {
    this.buffer = [];
    this.cancelDelay();
    this.setDelay(this.delay);
    this.buffer.push(event, useTransformations);
  }
});

P.U.ex(P.Stream.prototype, {
  debounce: function (delay) {
    return new P.DDS(this, delay);
  }
});
