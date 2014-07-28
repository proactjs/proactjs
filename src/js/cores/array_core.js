ProAct.ArrayCore = P.AC = function (array, meta) {
  P.C.call(this, array, meta); // Super!

  this.lastIndexCaller = null;
  this.lastLengthCaller = null;
};

ProAct.ArrayCore.prototype = P.U.ex(Object.create(P.C.prototype), {
  constructor: ProAct.ArrayCore,

  defaultListeners: function () {
    return {
      index: [],
      length: []
    };
  },

  defaultActions: function () {
    return ['length', 'index'];
  },

  makeEvent: function (source, eventData) {
    var op = eventData[0],
        ind = eventData[1],
        oldVal = eventData[2],
        newVal = eventData[3];

    return new P.E(source, this.shell, P.E.Types.array, op, ind, oldVal, newVal);
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
  },

  updateSplice: function (index, spliced, newItems) {
    var actions, op = pArrayOps.splice;

    if (!spliced || !newItems || (spliced.length === 0 && newItems.length === 0)) {
      return;
    }

    if (spliced.length === newItems.length) {
      actions = 'index';
    } else if (!newItems.length || !spliced.length) {
      actions = 'length';
    }

    this.update(null, actions, [op, index, spliced, newItems]);
  },

  updateByDiff: function (array) {
    var j, diff = P.U.diff(array, this.shell._array), cdiff;

    for (j in diff) {
      cdiff = diff[j];
      if (cdiff) {
        this.updateSplice(j, cdiff.o, cdiff.n);
      }
    }
  },

  setup: function () {
    var self = this,
        array = this.shell,
        ln = array._array.length,
        getLength, setLength, oldLength, i;

    for (i = 0; i < ln; i++) {
      this.defineIndexProp(i);
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

      self.update(null, 'length', [pArrayOps.setLength, -1, oldLength, newLength]);

      return newLength;
    };

    Object.defineProperty(array, 'length', {
      configurable: false,
      enumerable: true,
      get: getLength,
      set: setLength
    });
  },

  defineIndexProp: function (i) {
    var self = this,
        proArray = this.shell,
        array = proArray._array,
        oldVal,
        isA = P.U.isArray,
        isO = P.U.isObject,
        isF = P.U.isFunction;

    if (isA(array[i])) {
      new P.ArrayProperty(array, i);
    } else if (isF(array[i])) {
    } else if (array[i] === null) {
    } else if (isO(array[i])) {
      new P.ObjectProperty(array, i);
    }

    Object.defineProperty(proArray, i, {
      enumerable: true,
      configurable: true,
      get: function () {
        self.addCaller('index');

        return array[i];
      },
      set: function (newVal) {
        if (array[i] === newVal) {
          return;
        }

        oldVal = array[i];
        array[i] = newVal;

        self.update(null, 'index', [pArrayOps.set, i, oldVal, newVal]);
      }
    });
  }
});
