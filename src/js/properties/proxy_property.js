ProAct.ProxyProperty = P.PXP = function (proObject, property, target) {
  var self = this, getter, setter;

  getter = function () {
    self.addCaller();
    return target.val;
  };

  setter = function (newVal) {
    if (target.val === newVal) {
      return;
    }

    target.oldVal = target.val;
    target.val = P.Observable.transform(self, newVal);

    if (target.val === null || target.val === undefined) {
      P.P.reProb(target).update();
      return;
    }

    self.update();
  };

  P.P.call(this, proObject, property, getter, setter);

  this.target = target;
  this.target.on(this.makeListener());
};

ProAct.ProxyProperty.prototype = P.U.ex(Object.create(P.P.prototype), {
  constructor: ProAct.ProxyProperty,
  type: function () {
    return this.target.type();
  },

  makeListener: function () {
    if (!this.listener) {
      var self = this;

      this.listener = {
        property: self,
        call: function () {}
      };
    }

    return this.listener;
  },

});
