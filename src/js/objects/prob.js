Pro.prob = function (object, meta) {
  var core, property,
      isAr = Pro.Utils.isArray;

  if (object === null || (!Pro.U.isObject(object) && !isAr(object))) {
    return new Pro.Val(object);
  }

  if (isAr(object)) {
    return new Pro.Array(object);
  }

  core = new Pro.Core(object, meta);
  Object.defineProperty(object, '__pro__', {
    enumerable: false,
    configurable: false,
    writeble: false,
    value: core
  });

  core.prob();

  return object;
};
