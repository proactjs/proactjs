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
