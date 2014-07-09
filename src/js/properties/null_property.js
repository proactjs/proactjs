Pro.NullProperty = function (proObject, property) {
  var _this = this,
      set = Pro.Property.DEFAULT_SETTER(this),
      setter = function (newVal) {
        var result = set.call(_this.proObject, newVal),
            types = Pro.Property.Types,
            type = types.type(result);

        if (type !== types.nil) {
          Pro.Property.reProb(_this);
        }

        return result;
      };

  Pro.Property.call(this, proObject, property, Pro.Property.DEFAULT_GETTER(this), setter);
};

Pro.NullProperty.prototype = Pro.U.ex(Object.create(Pro.Property.prototype), {
  constructor: Pro.NullProperty,

  type: function () {
    return Pro.Property.Types.nil;
  }
});
