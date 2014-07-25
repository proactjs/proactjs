ProAct.ThrottlingStream = P.TDS = function (source, transforms, delay) {
  P.DBS.call(this, source, transforms, delay);
};

ProAct.ThrottlingStream.prototype = P.U.ex(Object.create(P.DBS.prototype), {
  constructor: ProAct.ThrottlingStream,
  trigger: function (event, useTransformations) {
    this.buffer = [];
    this.buffer.push(event, useTransformations);
  }
});

P.U.ex(P.Stream.prototype, {
  throttle: function (delay) {
    return new P.TDS(this, delay);
  }
});
