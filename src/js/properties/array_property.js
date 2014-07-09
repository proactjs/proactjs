Pro.ArrayProperty = function (proObject, property) {
  var _this = this, getter;

  getter = function () {
    _this.addCaller();
    if (!Pro.Utils.isProArray(_this.val)) {
      _this.val = new Pro.Array(_this.val);
    }

    var get = Pro.Property.DEFAULT_GETTER(_this),
        set = function (newVal) {
          if (_this.val == newVal || _this.val.valueOf() == newVal) {
            return;
          }

          _this.oldVal = _this.val;
          _this.val = newVal;

          if (_this.val === null || _this.val === undefined) {
            Pro.Property.reProb(_this).update();
            return _this;
          }

          if (!Pro.Utils.isProArray(_this.val)) {
            _this.val = new Pro.Array(_this.val);
          }

          if (_this.oldVal) {
            var i, listener,
                toRemove = [], toRemoveLength,
                oldIndListeners = _this.oldVal.indexListeners,
                oldIndListenersLn = oldIndListeners.length,
                newIndListeners = _this.val.indexListeners,
                oldLenListeners = _this.oldVal.lengthListeners,
                oldLenListenersLn = oldLenListeners.length,
                newLenListeners = _this.val.lengthListeners;

            for (i = 0; i < oldIndListenersLn; i++) {
              listener = oldIndListeners[i];
              if (listener.property && listener.property.proObject === _this.proObject) {
                newIndListeners.push(listener);
                toRemove.push(i);
              }
            }
            toRemoveLength = toRemove.length;
            for (i = 0; i < toRemoveLength; i++) {
              oldIndListeners.splice[toRemove[i], 1];
            }
            toRemove = [];

            for (i = 0; i < oldLenListenersLn; i++) {
              listener = oldLenListeners[i];
              if (listener.property && listener.property.proObject === _this.proObject) {
                newLenListeners.push(listener);
                toRemove.push(i);
              }
            }
            toRemoveLength = toRemove.length;
            for (i = 0; i < toRemoveLength; i++) {
              oldLenListeners.splice[toRemove[i], 1];
            }
            toRemove = [];
          }

          _this.update();
        };

    Pro.Property.defineProp(_this.proObject, _this.property, get, set);

    _this.state = Pro.States.ready;
    return _this.val;
  };

  Pro.Property.call(this, proObject, property, getter, function () {});
};

Pro.ArrayProperty.prototype = Pro.U.ex(Object.create(Pro.Property.prototype), {
  constructor: Pro.ArrayProperty,
  type: function () {
    return Pro.Property.Types.array;
  },
  afterInit: function () {}
});
