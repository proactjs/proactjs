Pro.ThrottlingStream = function (source, transforms, delay) {
  Pro.DelayedStream.call(this, source, transforms, delay);
};

Pro.ThrottlingStream.prototype = Pro.U.ex(Object.create(Pro.DelayedStream.prototype), {
  trigger: function (event, useTransformations) {
    this.buffer = [];
    this.buffer.push(event, useTransformations);
  }
});
Pro.ThrottlingStream.prototype.constructor = Pro.ThrottlingStream;

Pro.U.ex(Pro.Stream.prototype, {
  throttle: function (delay) {
    return new Pro.ThrottlingStream(this, delay);
  }
});
