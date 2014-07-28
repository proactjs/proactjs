ProAct.Property = P.P = function (proObject, property, getter, setter) {
  P.U.defValProp(this, 'proObject', false, false, true, proObject);
  this.property = property;

  if (!this.proObject.__pro__) {
    P.U.defValProp(proObject, '__pro__', false, false, true, new ProAct.Core(proObject));
  }

  this.proObject.__pro__.properties[property] = this;

  this.get = getter || P.P.DEFAULT_GETTER(this);
  this.set = setter || P.P.DEFAULT_SETTER(this);

  this.oldVal = null;
  this.val = proObject[property];

  this.state = P.States.init;
  this.g = this.get;
  this.s = this.set;

  P.Observable.call(this); // Super!
  this.parent = this.proObject.__pro__;

  this.init();
};

P.U.ex(ProAct.Property, {
  Types: {
    simple: 0, // strings, booleans and numbers
    auto: 1, // functions - dependent
    object: 2, // references Pro objects
    array: 3, // arrays
    nil: 4, // nulls

    type: function (value) {
      if (value === null) {
        return P.P.Types.nil;
      } else if (P.U.isFunction(value)) {
        return P.P.Types.auto;
      } else if (P.U.isArray(value)) {
        return P.P.Types.array;
      } else if (P.U.isObject(value)) {
        return P.P.Types.object;
      } else {
        return P.P.Types.simple;
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
        property.val = P.Observable.transform(property, newVal);
      }

      if (property.val === null || property.val === undefined) {
        P.P.reProb(property).update();
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
        l = property.listeners.change;

    property.destroy();
    return po.__pro__.makeProp(p, l);
  }
});

ProAct.Property.prototype = P.U.ex(Object.create(P.Observable.prototype), {
  constructor: ProAct.Property,
  type: function () {
    return P.P.Types.simple;
  },
  makeEvent: function (source) {
    return new P.E(source, this.property, P.E.Types.value, this.proObject, this.oldVal, this.val);
  },
  makeListener: function () {
    if (!this.listener) {
      var self = this;
      this.listener = {
        property: self,
        call: function (newVal) {
          if (newVal && newVal.type !== undefined && newVal.type === P.E.Types.value && newVal.args.length === 3 && newVal.target) {
            newVal = newVal.args[0][newVal.target];
          }

          self.oldVal = self.val;
          self.val = P.Observable.transform(self, newVal);
        }
      };
    }

    return this.listener;
  },
  init: function () {
    if (this.state !== P.States.init) {
      return;
    }

    P.P.defineProp(this.proObject, this.property, this.get, this.set);

    this.afterInit();
  },
  afterInit: function () {
    this.state = P.States.ready;
  },
  addCaller: function () {
    var caller = P.currentCaller;

    if (caller && caller.property !== this) {
      this.on(caller);
    }
  },
  destroy: function () {
    if (this.state === P.States.destroyed) {
      return;
    }

    delete this.proObject.__pro__.properties[this.property];
    this.listeners = undefined;
    this.oldVal = undefined;
    this.parent = undefined;

    P.U.defValProp(this.proObject, this.property, true, true, true, this.val);
    this.get = this.set = this.property = this.proObject = undefined;
    this.g = this.s = undefined;
    this.val = undefined;
    this.state = P.States.destroyed;
  },
  toString: function () {
    return this.val;
  }
});
