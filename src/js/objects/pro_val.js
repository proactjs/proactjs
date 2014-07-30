/**
 * <p>
 *  Constructs a ProAct.Val. The ProAct.Vals are the simplest ProAct.js reactive objects, they have only one property - 'v' and all their methods,
 *  extended from {@link ProAct.Observable} delegate to it.
 * </p>
 * <p>
 *  Like every object turned to ProAct.js reactive one, the ProAct.Val has a {@link ProAct.ObjectCore} managing its single {@link ProAct.Property}.
 * </p>
 * <p>
 *  The core can be accessed via:
 *  <pre>
 *    var core = v.p();
 *  </pre>
 * </p>
 * <p>
 *  ProAct.Val is part of the properties module of ProAct.js.
 * </p>
 *
 * @class ProAct.Val
 * @extends ProAct.Observable
 * @param {Object} val
 *      The value that will be wrapped and tracked by the ProAct.Val being created.
 * @param {String} meta
 *      Meta-data passed to the {@link ProAct.Property} construction logic.
 * @see {@link ProAct.ObjectCore}
 * @see {@link ProAct.Property}
 */
ProAct.Val = P.V = function (val, meta) {
  this.v = val;

  if (meta && (P.U.isString(meta) || P.U.isArray(meta))) {
    meta = {
      v: meta
    };
  }

  P.prob(this, meta);
};

ProAct.Val.prototype = P.U.ex(Object.create(P.Observable.prototype), {
  constructor: ProAct.Val,
  type: function () {
    return this.__pro__.properties.v.type();
  },
  on: function (action, listener) {
    this.__pro__.properties.v.on(action, listener);
    return this;
  },
  off: function (action, listener) {
    this.__pro__.properties.v.off(action, listener);
    return this;
  },
  onErr: function (action, listener) {
    this.__pro__.properties.v.onErr(action, listener);
    return this;
  },
  offErr: function (action, listener) {
    this.__pro__.properties.v.offErr(action, listener);
    return this;
  },
  transform: function (transformation) {
    this.__pro__.properties.v.transform(transformation);
    return this;
  },
  into: function (observable) {
    this.__pro__.properties.v.into(observable);
    return this;
  },
  out: function (observable) {
    this.__pro__.properties.v.out(observable);
    return this;
  },
  update: function (source) {
    this.__pro__.properties.v.update(source);
    return this;
  },
  willUpdate: function (source) {
    this.__pro__.properties.v.willUpdate(source);
    return this;
  },
  valueOf: function () {
    return this.__pro__.properties.v.val;
  },
  toString: function () {
    return this.valueOf().toString();
  }
});
