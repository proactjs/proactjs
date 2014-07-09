Pro.ObjectProperty = function (proObject, property) {
  var _this = this, getter;

  getter = function () {
    _this.addCaller();
    if (!_this.val.__pro__) {
      Pro.prob(_this.val);
    }

    var get = Pro.Property.DEFAULT_GETTER(_this),
        set = function (newVal) {
          if (_this.val == newVal) {
            return;
          }

          _this.oldVal = _this.val;
          _this.val = newVal;

          if (_this.val === null || _this.val === undefined) {
            Pro.Property.reProb(_this).update();
            return _this;
          }

          if (_this.oldVal) {
            if (!_this.val.__pro__) {
              Pro.prob(_this.val);
            }

            var oldProps = _this.oldVal.__pro__.properties,
                newProps = _this.val.__pro__.properties,
                oldPropName, oldProp, newProp, oldListeners, newListeners,
                i, j, oldListenersLength, newListenersLength,
                toAdd, toRemove = [], toRemoveLength;

            for (oldPropName in oldProps) {
              if (oldProps.hasOwnProperty(oldPropName)) {
                newProp = newProps[oldPropName];
                if (!newProp) {
                  continue;
                }
                newListeners = newProp.listeners;

                oldProp = oldProps[oldPropName];
                oldListeners = oldProp.listeners;
                oldListenersLength = oldListeners.length;

                for (i = 0; i < oldListenersLength; i++) {
                  toAdd = true;
                  for (j = 0; j < newListenersLength; j++) {
                    if (oldListeners[i] == newListeners[j]) {
                      toAdd = false;
                    }
                  }
                  if (toAdd) {
                    newProp.on(oldListeners[i]);
                    toRemove.push(i);
                  }
                }

                toRemoveLength = toRemove.length;
                for (i = 0; i < toRemoveLength; i++) {
                  oldListeners.splice[toRemove[i], 1];
                }
                toRemove = [];
              }
            }
          }

          _this.update();
        };

    Pro.Property.defineProp(_this.proObject, _this.property, get, set);

    _this.state = Pro.States.ready;
    return _this.val;
  };

  Pro.Property.call(this, proObject, property, getter, function () {});
};

Pro.ObjectProperty.prototype = Pro.U.ex(Object.create(Pro.Property.prototype), {
  constructor: Pro.ObjectProperty,
  type: function () {
    return Pro.Property.Types.object;
  },
  afterInit: function () {}
});
