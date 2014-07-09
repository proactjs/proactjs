Pro.SizeBufferedStream = function (source, transforms, size) {
  if (arguments.length === 1 && typeof source === 'number') {
    size = source;
    source = null;
  } else if (arguments.length === 2 && typeof transforms === 'number') {
    size = transforms;
    transforms = null;
  }
  Pro.BufferedStream.call(this, source, transforms);

  if (!size) {
    throw new Error('SizeBufferedStream must contain size!');
  }

  this.size = size;
};

Pro.SizeBufferedStream.prototype = Pro.U.ex(Object.create(Pro.BufferedStream.prototype), {
  trigger: function (event, useTransformations) {
    this.buffer.push(event, useTransformations);

    if (this.size !== null && (this.buffer.length / 2) === this.size) {
      this.flush();
    }
  }
});
Pro.SizeBufferedStream.prototype.constructor = Pro.SizeBufferedStream;

Pro.U.ex(Pro.Stream.prototype, {
  bufferit: function (size) {
    return new Pro.SizeBufferedStream(this, size);
  }
});
