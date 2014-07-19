ProAct.SizeBufferedStream = P.SBS = function (source, transforms, size) {
  if (arguments.length === 1 && typeof source === 'number') {
    size = source;
    source = null;
  } else if (arguments.length === 2 && typeof transforms === 'number') {
    size = transforms;
    transforms = null;
  }
  P.BS.call(this, source, transforms);

  if (!size) {
    throw new Error('SizeBufferedStream must contain size!');
  }

  this.size = size;
};

ProAct.SizeBufferedStream.prototype = P.U.ex(Object.create(P.BS.prototype), {
  constructor: ProAct.SizeBufferedStream,
  trigger: function (event, useTransformations) {
    this.buffer.push(event, useTransformations);

    if (this.size !== null && (this.buffer.length / 2) === this.size) {
      this.flush();
    }
  }
});

P.U.ex(P.S.prototype, {
  bufferit: function (size) {
    return new P.SBS(this, size);
  }
});
