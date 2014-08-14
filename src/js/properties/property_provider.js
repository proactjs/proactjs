ProAct.PropertyProvider = P.PP = function () {};

P.U.ex(P.PP, {
  providers: [],

  registerProvider: function (propertyProvider) {
    P.PP.providers.push(propertyProvider);
  },

  unregisterProvider: function (propertyProvider) {
    P.U.remove(P.PP.providers, propertyProvider);
  },

  clearProviders: function () {
    P.PP.providers = [];
  },

  provide: function (object, property, meta) {
    var providers = P.PP.providers,
        ln = providers.length,
        prop = null,
        provider = null,
        i;

    for (i = 0; i < ln; i++) {
      provider = providers[i];
      if (provider.filter(object, property, meta)) {
        break;
      } else {
        provider = null;
      }
    }

    if (provider) {
      prop = provider.provide(object, property, meta);
    }

    return prop;
  }
});

ProAct.PropertyProvider.prototype = {
  constructor: ProAct.PropertyProvider,

  filter: function (object, property, meta) {
    throw new Error('Abstract! Implement!');
  },

  provide: function (object, property, meta) {
    throw new Error('Abstract! Implement!');
  }
};

ProAct.NullPropertyProvider = P.NPP = function () {
  P.PP.call(this);
};

ProAct.NullPropertyProvider.prototype = P.U.ex(Object.create(P.PP.prototype), {
  constructor: ProAct.NullPropertyProvider,

  filter: function (object, property, meta) {
    return object[property] === null || object[property] === undefined;
  },

  provide: function (object, property, meta) {
    return new P.NP(object, property);
  }
});

ProAct.SimplePropertyProvider = P.SPP = function () {
  P.PP.call(this);
};

ProAct.SimplePropertyProvider.prototype = P.U.ex(Object.create(P.PP.prototype), {
  constructor: ProAct.SimplePropertyProvider,

  filter: function (object, property, meta) {
    var v = object[property];
    return v !== null && v !== undefined && !P.U.isFunction(v) && !P.U.isArrayObject(v) && !P.U.isObject(v);
  },

  provide: function (object, property, meta) {
    return new P.P(object, property);
  }
});

ProAct.AutoPropertyProvider = P.FPP = function () {
  P.PP.call(this);
};

ProAct.AutoPropertyProvider.prototype = P.U.ex(Object.create(P.PP.prototype), {
  constructor: ProAct.AutoPropertyProvider,

  filter: function (object, property, meta) {
    return P.U.isFunction(object[property]);
  },

  provide: function (object, property, meta) {
    return new P.FP(object, property);
  }
});

ProAct.ArrayPropertyProvider = P.APP = function () {
  P.PP.call(this);
};

ProAct.ArrayPropertyProvider.prototype = P.U.ex(Object.create(P.PP.prototype), {
  constructor: ProAct.ArrayPropertyProvider,

  filter: function (object, property, meta) {
    return P.U.isArrayObject(object[property]);
  },

  provide: function (object, property, meta) {
    return new P.AP(object, property);
  }
});

ProAct.ObjectPropertyProvider = P.OPP = function () {
  P.PP.call(this);
};

ProAct.ObjectPropertyProvider.prototype = P.U.ex(Object.create(P.PP.prototype), {
  constructor: ProAct.ObjectPropertyProvider,

  filter: function (object, property, meta) {
    return P.U.isObject(object[property]);
  },

  provide: function (object, property, meta) {
    return new P.OP(object, property);
  }
});

P.PP.registerProvider(new P.NullPropertyProvider());
P.PP.registerProvider(new P.SimplePropertyProvider());
P.PP.registerProvider(new P.AutoPropertyProvider());
P.PP.registerProvider(new P.ArrayPropertyProvider());
P.PP.registerProvider(new P.ObjectPropertyProvider());
