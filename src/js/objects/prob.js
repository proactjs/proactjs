ProAct.prob = function (object, meta) {
  var core, property,
      isAr = P.U.isArray;

  if (object === null || (!P.U.isObject(object) && !isAr(object))) {
    return new P.V(object, meta);
  }

  if (P.U.isArray(object)) {
    return new P.A(object);
  }

  core = new P.OC(object, meta);
  P.U.defValProp(object, '__pro__', false, false, false, core);

  core.prob();

  return object;
};
