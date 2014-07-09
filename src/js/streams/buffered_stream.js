Pro.BufferedStream = function (source, transforms, size, delay) {
  Pro.Stream.call(this, source, transforms);
  this.buffer = [];
};

Pro.BufferedStream.prototype = Pro.U.ex(Object.create(Pro.Stream.prototype), {
  flush: function () {
    var _this = this, i, b = this.buffer, ln = b.length;
    Pro.flow.run(function () {
      for (i = 0; i < ln; i+= 2) {
        _this.go(b[i], b[i+1]);
      }
      _this.buffer = [];
    });
  }
});
Pro.BufferedStream.prototype.constructor = Pro.BufferedStream;
