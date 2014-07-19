ProAct.BufferedStream = function (source, transforms, size, delay) {
  P.S.call(this, source, transforms);
  this.buffer = [];
};

ProAct.BufferedStream.prototype = Pro.U.ex(Object.create(P.S.prototype), {
  constructor: ProAct.BufferedStream,
  flush: function () {
    var _this = this, i, b = this.buffer, ln = b.length;
    P.flow.run(function () {
      for (i = 0; i < ln; i+= 2) {
        _this.go(b[i], b[i+1]);
      }
      _this.buffer = [];
    });
  }
});
