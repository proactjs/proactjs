ProAct.ObjectCore = function (object, meta) {
  this.object = object;
  this.properties = {};
  this.state = Pro.States.init;
  this.meta = meta || {};

  P.Observable.call(this); // Super!
};

ProAct.ObjectCore.prototype = P.U.ex(Object.create(P.Observable.prototype), {
  constructor: ProAct.ObjectCore,
  prob: function () {
    var _this = this, object = this.object,
        conf = P.Configuration,
        keyprops = conf.keyprops,
        keypropList = conf.keypropList;

    try {
      for (property in object) {
        this.makeProp(property, null, this.meta[property]);
      }

      if (keyprops && keypropList.indexOf('p') !== -1) {
        P.U.defValProp(object, 'p', false, false, false, function (p) {
          if (!p || p === '*') {
            return _this;
          }

          return _this.properties[p];
        });
      }

      this.state = P.States.ready;
    } catch (e) {
      this.state = P.States.error;
      throw e;
    }

    return this;
  },
  call: function (event) {
    this.update(event);
  },
  makeProp: function (property, listeners, meta) {
    var object = this.object,
        conf = P.Configuration,
        keyprops = conf.keyprops,
        keypropList = conf.keypropList,
        isF = P.U.isFunction,
        isA = P.U.isArrayObject,
        isO = P.U.isObject, result;

    if (meta && (meta === 'noprop' || (meta.indexOf && meta.indexOf('noprop') >= 0))) {
      return;
    }

    if (keyprops && keypropList.indexOf(property) !== -1) {
      throw Error('The property name ' + property + ' is a key word for pro objects! Objects passed to Pro.prob can not contain properties named as keyword properties.');
      return;
    }

    if (object.hasOwnProperty(property) && (object[property] === null || object[property] === undefined)) {
      result = new P.NullProperty(object, property);
    } else if (object.hasOwnProperty(property) && !isF(object[property]) && !isA(object[property]) && !isO(object[property])) {
      result = new P.Property(object, property);
    } else if (object.hasOwnProperty(property) && isF(object[property])) {
      result = new P.AutoProperty(object, property);
    } else if (object.hasOwnProperty(property) && isA(object[property])) {
      result = new P.ArrayProperty(object, property);
    } else if (object.hasOwnProperty(property) && isO(object[property])) {
      result = new P.ObjectProperty(object, property);
    }

    if (listeners) {
      this.properties[property].listeners.change = this.properties[property].listeners.change.concat(listeners);
    }

    if (meta && P.registry) {
      if (!P.U.isArray(meta)) {
        meta = [meta];
      }

      P.registry.setup.apply(P.registry, [result].concat(meta));
    }

    return result;
  },
  set: function (property, value) {
    var object = this.object;

    object[property] = value;
    if (this.properties[property]) {
      return;
    }

    this.makeProp(property);
  }
});
