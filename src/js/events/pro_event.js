Pro.Event = function (source, target, type) {
  this.source = source;
  this.target = target;
  this.type = type;
  this.args = slice.call(arguments, 3);
};

Pro.Event.Types = {
  value: 0,
  array: 1,
  close: 2,
  error: 3
};
