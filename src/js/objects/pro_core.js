Pro.Core = function (object, meta) {
  this.object = object;
  this.properties = {};
  this.state = Pro.States.init;
  this.meta = meta || {};

  Pro.Observable.call(this); // Super!
};

Pro.Core.prototype = Pro.U.ex(Object.create(Pro.Observable.prototype), {
  constructor: Pro.Core,
  prob: function () {
    var _this = this, object = this.object,
        conf = Pro.Configuration,
        keyprops = conf.keyprops,
        keypropList = conf.keypropList;

    try {
      for (property in object) {
        this.makeProp(property, null, this.meta[property]);
      }

      if (keyprops && keypropList.indexOf('p') !== -1) {
        Pro.U.defValProp(object, 'p', false, false, false, function (p) {
          if (!p || p === '*') {
            return _this;
          }

          return _this.properties[p];
        });
      }

      this.state = Pro.States.ready;
    } catch (e) {
      this.state = Pro.States.error;
      throw e;
    }

    return this;
  },
  call: function (event) {
    this.update(event);
  },
  makeProp: function (property, listeners, meta) {
    var object = this.object,
        conf = Pro.Configuration,
        keyprops = conf.keyprops,
        keypropList = conf.keypropList,
        isF = Pro.Utils.isFunction,
        isA = Pro.Utils.isArrayObject,
        isO = Pro.Utils.isObject, result;

    if (meta && (meta === 'noprop' || (meta.indexOf && meta.indexOf('noprop') >= 0))) {
      return;
    }

    if (keyprops && keypropList.indexOf(property) !== -1) {
      throw Error('The property name ' + property + ' is a key word for pro objects! Objects passed to Pro.prob can not contain properties named as keyword properties.');
      return;
    }

    if (object.hasOwnProperty(property) && (object[property] === null || object[property] === undefined)) {
      result = new Pro.NullProperty(object, property);
    } else if (object.hasOwnProperty(property) && !isF(object[property]) && !isA(object[property]) && !isO(object[property])) {
      result = new Pro.Property(object, property);
    } else if (object.hasOwnProperty(property) && isF(object[property])) {
      result = new Pro.AutoProperty(object, property);
    } else if (object.hasOwnProperty(property) && isA(object[property])) {
      result = new Pro.ArrayProperty(object, property);
    } else if (object.hasOwnProperty(property) && isO(object[property])) {
      result = new Pro.ObjectProperty(object, property);
    }

    if (listeners) {
      this.properties[property].listeners = this.properties[property].listeners.concat(listeners);
    }

    if (meta && Pro.registry) {
      if (!Pro.U.isArray(meta)) {
        meta = [meta];
      }

      Pro.registry.setup.apply(Pro.registry, [result].concat(meta));
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
