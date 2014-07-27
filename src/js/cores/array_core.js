ProAct.ArrayCore = P.AC = function (array, meta) {
  P.C.call(this, array, meta); // Super!

  this.listeners.index = [];
  this.listeners.length = [];
  this.lastIndexCaller = null;
  this.lastLengthCaller = null;
};

ProAct.ArrayCore.prototype = P.U.ex(Object.create(P.C.prototype), {
  constructor: ProAct.ArrayCore,
  setup: function () {
    var self = this,
        array = this.shell,
        ln = array._array.length,
        getLength, setLength, oldLength, i;

    for (i = 0; i < ln; i++) {
      array.defineIndexProp(i);
    }

    getLength = function () {
      self.addCaller('length');

      return array._array.length;
    };

    setLength = function (newLength) {
      if (array._array.length === newLength) {
        return;
      }

      oldLength = array._array.length;
      array._array.length = newLength;

      array.update(pArrayOps.setLength, -1, oldLength, newLength);

      return newLength;
    };

    Object.defineProperty(array, 'length', {
      configurable: false,
      enumerable: true,
      get: getLength,
      set: setLength
    });

  },
  on: function (action, listener) {
    if (!P.U.isString(action)) {
      this.on('index', action);
      this.on('length', action);
      return;
    }
    P.Observable.prototype.on.call(this, action, listener);
  },
  off: function (action, listener) {
    if (!P.U.isString(action)) {
      this.off('index', action);
      this.off('length', action);
      return;
    }
    P.Observable.prototype.off.call(this, action, listener);
  },
  addCaller: function (type) {
    if (!type) {
      this.addCaller('index');
      this.addCaller('length');
      return;
    }

    var caller = P.currentCaller,
        capType = type.charAt(0).toUpperCase() + type.slice(1),
        lastCallerField = 'last' + capType + 'Caller',
        lastCaller = this[lastCallerField];

    if (caller && lastCaller !== caller) {
      this.on(type, caller);
      this[lastCallerField] = caller;
    }
  }
});

