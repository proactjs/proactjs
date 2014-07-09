Pro.Property = function (proObject, property, getter, setter) {
  var _this = this;

  Object.defineProperty(this, 'proObject', {
    enumerable: false,
    configurable: true,
    writeble: true,
    value: proObject
  });
  this.property = property;

  if (!this.proObject['__pro__']) {
    this.proObject['__pro__'] = {};
  }
  this.proObject['__pro__'].properties = this.proObject['__pro__'].properties || {};
  this.proObject['__pro__'].properties[property] = this;

  this.get = getter || Pro.Property.DEFAULT_GETTER(this);
  this.set = setter || Pro.Property.DEFAULT_SETTER(this);

  this.oldVal = null;
  this.val = proObject[property];

  this.state = Pro.States.init;
  this.g = this.get;
  this.s = this.set;

  Pro.Observable.call(this); // Super!
  this.parent = this.proObject.__pro__;

  this.init();
};

Pro.U.ex(Pro.Property, {
  Types: {
    simple: 0, // strings, booleans and numbers
    auto: 1, // functions - dependent
    object: 2, // references Pro objects
    array: 3, // arrays
    nil: 4, // nulls

    type: function (value) {
      if (value === null) {
        return Pro.Property.Types.nil;
      } else if (Pro.U.isFunction(value)) {
        return Pro.Property.Types.auto;
      } else if (Pro.U.isArray(value)) {
        return Pro.Property.Types.array;
      } else if (Pro.U.isObject(value)) {
        return Pro.Property.Types.object;
      } else {
        return Pro.Property.Types.simple;
      }
    }
  },
  DEFAULT_GETTER: function (property) {
    return function () {
      property.addCaller();

      return property.val;
    };
  },
  DEFAULT_SETTER: function (property, setter) {
    return function (newVal) {
      if (property.val === newVal) {
        return;
      }

      property.oldVal = property.val;
      if (setter) {
        property.val = setter.call(property.proObject, newVal);
      } else {
        property.val = Pro.Observable.transform(property, newVal);
      }

      if (property.val === null || property.val === undefined) {
        Pro.Property.reProb(property).update();
        return;
      }

      property.update();
    };
  },
  defineProp: function (obj, prop, get, set) {
    Object.defineProperty(obj, prop, {
      get: get,
      set: set,
      enumerable: true,
      configurable: true
    });
  },
  reProb: function (property) {
    var po = property.proObject,
        p = property.property,
        l = property.listeners;

    property.destroy();
    return po.__pro__.makeProp(p, l);
  }
});

Pro.Property.prototype = Pro.U.ex(Object.create(Pro.Observable.prototype), {
  constructor: Pro.Property,
  type: function () {
    return Pro.Property.Types.simple;
  },
  makeEvent: function (source) {
    return new Pro.Event(source, this.property, Pro.Event.Types.value, this.proObject, this.oldVal, this.val);
  },
  makeListener: function () {
    if (!this.listener) {
      var _this = this;
      this.listener = {
        property: _this,
        call: function (newVal) {
          if (newVal && newVal.type !== undefined && newVal.type === Pro.Event.Types.value && newVal.args.length === 3 && newVal.target) {
            newVal = newVal.args[0][newVal.target];
          }

          _this.oldVal = _this.val;
          _this.val = Pro.Observable.transform(_this, newVal);
        }
      };
    }

    return this.listener;
  },
  init: function () {
    if (this.state !== Pro.States.init) {
      return;
    }

    Pro.Property.defineProp(this.proObject, this.property, this.get, this.set);

    this.afterInit();
  },
  afterInit: function () {
    this.state = Pro.States.ready;
  },
  addCaller: function () {
    var _this = this,
        caller = Pro.currentCaller;

    if (caller && caller.property !== this) {
      this.on(caller);
    }
  },
  destroy: function () {
    if (this.state === Pro.States.destroyed) {
      return;
    }

    delete this.proObject['__pro__'].properties[this.property];
    this.listeners = undefined;
    this.oldVal = undefined;
    this.parent = undefined;

    Object.defineProperty(this.proObject, this.property, {
      value: this.val,
      enumerable: true,
      configurable: true
    });
    this.get = this.set = this.property = this.proObject = undefined;
    this.g = this.s = undefined;
    this.val = undefined;
    this.state = Pro.States.destroyed;
  },
  toString: function () {
    return this.val;
  }
});
