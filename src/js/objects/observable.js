Pro.Observable = function (transforms) {
  this.listeners = [];
  this.errListeners = [];
  this.sources = [];

  this.listener = null;
  this.errListener = null;

  this.transforms = transforms ? transforms : [];

  this.parent = null;
};

Pro.U.ex(Pro.Observable, {
  BadValue: {},
  transform: function (observable, val) {
    var i, t = observable.transforms, ln = t.length;
    for (i = 0; i < ln; i++) {
      val = t[i].call(observable, val);
      if (val === Pro.Observable.BadValue) {
        break;
      }
    }

    return val;
  }
});

Pro.Observable.prototype = {
  constructor: Pro.Observable,

  makeListener: function () {
    return null;
  },

  makeErrListener: function () {
    return null;
  },

  makeEvent: function (source) {
    return new Pro.Event(source, this, Pro.Event.Types.value);
  },

  on: function (action, callback, callbacks) {
    if (!Pro.U.isString(action)) {
      callback = action;
    }

    if (Pro.U.isArray(callbacks)) {
      callbacks.push(callback);
    } else {
      this.listeners.push(callback);
    }

    return this;
  },

  off: function (action, callback, callbacks) {
    if (!action && !callback) {
      if (Pro.U.isArray(callbacks)) {
        callbacks.length = 0;
      } else {
        this.listeners = [];
      }
      return;
    }
    if (!Pro.U.isString(action)) {
      callback = action;
    }

    if (Pro.U.isArray(callbacks)) {
      Pro.U.remove(callbacks, callback);
    } else {
      Pro.U.remove(this.listeners, callback);
    }

    return this;
  },

  onErr: function (action, callback) {
    return this.on(action, callback, this.errListeners);
  },

  offErr: function (action, callback) {
    return this.off(action, callback, this.errListeners);
  },

  into: function () {
    var args = slice.call(arguments),
        ln = args.length, i, source;
    for (i = 0; i < ln; i++) {
      source = args[i];
      this.sources.push(source);
      source.on(this.makeListener());
      source.onErr(this.makeErrListener());
    }

    return this;
  },

  out: function (destination) {
    destination.into(this);

    return this;
  },

  offSource: function (source) {
    Pro.U.remove(this.sources, source);
    source.off(this.listener);
    source.offErr(this.errListener);

    return this;
  },

  transform: function (transformation) {
    this.transforms.push(transformation);
    return this;
  },

  mapping: function (f) {
    return this.transform(f)
  },

  filtering: function(f) {
    var _this = this;
    return this.transform(function (val) {
      if (f.call(_this, val)) {
        return val;
      }
      return Pro.Observable.BadValue;
    });
  },

  accumulation: function (initVal, f) {
    var _this = this, val = initVal;
    return this.transform(function (newVal) {
      val = f.call(_this, val, newVal)
      return val;
    });
  },

  map: Pro.N,
  filter: Pro.N,
  accumulate: Pro.N,

  reduce: function (initVal, f) {
    return new Pro.Val(initVal).into(this.accumulate(initVal, f));
  },

  update: function (source, callbacks) {
    if (this.listeners.length === 0 && this.errListeners.length === 0 && this.parent === null) {
      return this;
    }

    var observable = this;
    if (!Pro.flow.isRunning()) {
      Pro.flow.run(function () {
        observable.willUpdate(source, callbacks);
      });
    } else {
      observable.willUpdate(source, callbacks);
    }
    return this;
  },

  willUpdate: function (source, callbacks) {
    var i, listener,
        listeners = Pro.U.isArray(callbacks) ? callbacks : this.listeners,
        length = listeners.length,
        event = this.makeEvent(source);

    for (i = 0; i < length; i++) {
      listener = listeners[i];

      this.defer(event, listener);

      if (listener.property) {
        listener.property.willUpdate(event);
      }
    }

    if (this.parent && this.parent.call) {
      this.defer(event, this.parent);
    }

    return this;
  },

  defer: function (event, callback) {
    if (Pro.U.isFunction(callback)) {
      Pro.flow.pushOnce(callback, [event]);
    } else {
      Pro.flow.pushOnce(callback, callback.call, [event]);
    }
    return this;
  }
};
