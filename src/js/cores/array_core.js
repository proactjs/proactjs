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
    var array = this.shell,
        ln = array._array.length,
        i;

    for (i = 0; i < ln; i++) {
      array.defineIndexProp(i);
    }
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

