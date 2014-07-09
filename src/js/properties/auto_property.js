Pro.AutoProperty = function (proObject, property) {
  this.func = proObject[property];

  var _this = this,
      getter = function () {
        _this.addCaller();
        var oldCaller = Pro.currentCaller,
            get = Pro.Property.DEFAULT_GETTER(_this),
            set = Pro.Property.DEFAULT_SETTER(_this, function (newVal) {
              return _this.func.call(_this.proObject, newVal);
            }),
            args = arguments,
            autoFunction;

        Pro.currentCaller = _this.makeListener();

        autoFunction = function () {
          _this.val = _this.func.apply(_this.proObject, args);
        };
        Pro.flow.run(function () {
          Pro.flow.pushOnce(autoFunction);
        });

        Pro.currentCaller = oldCaller;

        Pro.Property.defineProp(_this.proObject, _this.property, get, set);

        _this.state = Pro.States.ready;

        _this.val = Pro.Observable.transform(_this, _this.val);
        return _this.val;
      };

  Pro.Property.call(this, proObject, property, getter, function () {});
};

Pro.AutoProperty.prototype = Pro.U.ex(Object.create(Pro.Property.prototype), {
  constructor: Pro.AutoProperty,
  type: function () {
    return Pro.Property.Types.auto;
  },
  makeListener: function () {
    if (!this.listener) {
      var _this = this;
      this.listener = {
        property: _this,
        call: function () {
          _this.oldVal = _this.val;
          _this.val = Pro.Observable.transform(_this, _this.func.call(_this.proObject));
        }
      };
    }

    return this.listener;
  },
  afterInit: function () {}
});
