ProAct.prob = function (object, meta) {
  var core, property,
      isAr = P.U.isArray;

  if (object === null || (!P.U.isObject(object) && !isAr(object))) {
    return new Pro.Val(object, meta);
  }

  if (isAr(object)) {
    return new P.A(object);
  }

  core = new P.ObjectCore(object, meta);
  Object.defineProperty(object, '__pro__', {
    enumerable: false,
    configurable: false,
    writeble: false,
    value: core
  });

  core.prob();

  return object;
};
