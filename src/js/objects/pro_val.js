Pro.Val = function (val) {
  this.v = val;

  Pro.prob(this);
};

Pro.Val.prototype = Pro.U.ex(Object.create(Pro.Observable.prototype), {
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
