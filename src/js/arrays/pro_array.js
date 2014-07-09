Pro.Array = pArray = function () {
  if (arguments.length === 0) {
    this._array = [];
  } else if (arguments.length === 1 && Pro.U.isArray(arguments[0])) {
    this._array = arguments[0];
  } else {
    this._array = slice.call(arguments);
  }

  this.indexListeners = [];
  this.lastIndexCaller = null;
  this.lengthListeners = [];
  this.lastLengthCaller = null;

  var _this = this, getLength, setLength, i, oldLength;

  getLength = function () {
    _this.addCaller('length');

    return _this._array.length;
  };

  setLength = function (newLength) {
    if (_this._array.length === newLength) {
      return;
    }

    oldLength = _this._array.length;
    _this._array.length = newLength;

    _this.update(pArrayOps.setLength, -1, oldLength, newLength);

    return newLength;
  };

  Object.defineProperty(this, 'length', {
    configurable: false,
    enumerable: true,
    get: getLength,
    set: setLength
  });
  Object.defineProperty(this, '__pro__', {
    enumerable: false,
    configurable: false,
    writeble: false,
    value: {}
  });
  this.__pro__.state = Pro.States.init;

  try {
    for (i = 0; i < this._array.length; i++) {
      this.defineIndexProp(i);
    }

    this.__pro__.state = Pro.States.ready;
  } catch (e) {
    this.__pro__.state = Pro.States.error;
    throw e;
  }
};

Pro.U.ex(pArray, {
  Operations: {
    set: 0,
    add: 1,
    remove: 2,
    setLength: 3,
    reverse: 4,
    sort: 5,
    splice: 6,

    isIndexOp: function (op) {
      return op === this.set || op === this.reverse || op === this.sort;
    }
  },
  reFilter: function (original, filtered, filterArgs) {
    var oarr = filtered._array;

    filtered._array = filter.apply(original._array, filterArgs);
    filtered.updateByDiff(oarr);
  }
});
pArrayOps = pArray.Operations;

Pro.Array.prototype = pArrayProto = Pro.U.ex(Object.create(arrayProto), {
  constructor: Pro.Array,
  on: function (action, listener) {
    if (!Pro.U.isString(action)) {
      listener = action;
      action = 'change';
    }

    if (action === 'change') {
      this.lengthListeners.push(listener);
      this.indexListeners.push(listener);
    } else if (action === 'lengthChange') {
      this.lengthListeners.push(listener);
    } else if (action === 'indexChange') {
      this.indexListeners.push(listener);
    }
  },
  off: function (action, listener) {
    if (!Pro.U.isString(action)) {
      listener = action;
      action = 'change';
    }

    if (action === 'change') {
      Pro.U.remove(listener, this.lengthListeners);
      Pro.U.remove(listener, this.indexListeners);
    } else if (action === 'lengthChange') {
      Pro.U.remove(listener, this.lengthListeners);
    } else if (action === 'indexChange') {
      Pro.U.remove(listener, this.indexListeners);
    }
  },
  addCaller: function (type) {
    if (!type) {
      this.addCaller('index');
      this.addCaller('length');
      return;
    }
    var caller = Pro.currentCaller,
        capType = type.charAt(0).toUpperCase() + type.slice(1),
        lastCallerField = 'last' + capType + 'Caller',
        lastCaller = this[lastCallerField],
        listeners = this[type + 'Listeners'];

    if (caller && lastCaller !== caller && !Pro.U.contains(listeners, caller)) {
      this.on(type + 'Change', caller);
      this[lastCallerField] = caller;
    }
  },
  defineIndexProp: function (i) {
    var proArray = this,
        array = proArray._array,
        oldVal,
        isA = Pro.U.isArray,
        isO = Pro.U.isObject,
        isF = Pro.U.isFunction;

    if (isA(array[i])) {
      new Pro.ArrayProperty(array, i);
    } else if (isF(array[i])) {
    } else if (array[i] === null) {
    } else if (isO(array[i])) {
      new Pro.ObjectProperty(array, i);
    }

    Object.defineProperty(this, i, {
      enumerable: true,
      configurable: true,
      get: function () {
        proArray.addCaller('index');

        return array[i];
      },
      set: function (newVal) {
        if (array[i] === newVal) {
          return;
        }

        oldVal = array[i];
        array[i] = newVal;

        proArray.update(pArrayOps.set, i, oldVal, newVal);
      }
    });
  },
  makeEvent: function (op, ind, oldVal, newVal, source) {
    return new Pro.Event(source, this,
                         Pro.Event.Types.array, op, ind, oldVal, newVal);
  },
  willUpdate: function (op, ind, oldVal, newVal) {
    var listeners = pArrayOps.isIndexOp(op) ? this.indexListeners : this.lengthListeners;

    this.willUpdateListeners(listeners, op, ind, oldVal, newVal);
  },
  update: function (op, ind, oldVal, newVal) {
    var _this = this;
    if (Pro.flow.isRunning()) {
      this.willUpdate(op, ind, oldVal, newVal);
    } else {
      Pro.flow.run(function () {
        _this.willUpdate(op, ind, oldVal, newVal);
      });
    }
  },
  willUpdateSplice: function (index, spliced, newItems) {
    var listeners, op = pArrayOps.splice;

    if (!spliced || !newItems || (spliced.length === 0 && newItems.length === 0)) {
      return;
    }

    if (spliced.length === newItems.length) {
      listeners = this.indexListeners;
    } else if (!newItems.length || !spliced.length) {
      listeners = this.lengthListeners;
    } else {
      listeners = this.lengthListeners.concat(this.indexListeners);
    }

    this.willUpdateListeners(listeners, op, index, spliced, newItems);
  },
  updateSplice: function (index, sliced, newItems) {
    var _this = this;
    if (Pro.flow.isRunning()) {
      this.willUpdateSplice(index, sliced, newItems);
    } else {
      Pro.flow.run(function () {
        _this.willUpdateSplice(index, sliced, newItems);
      });
    }
  },
  willUpdateListeners: function (listeners, op, ind, oldVal, newVal) {
    var length = listeners.length, i, listener,
        event = this.makeEvent(op, ind, oldVal, newVal);

    for (i = 0; i < length; i++) {
      listener = listeners[i];

      if (Pro.U.isFunction(listener)) {
        Pro.flow.pushOnce(listener, [event]);
      } else {
        Pro.flow.pushOnce(listener, listener.call, [event]);
      }

      if (listener.property) {
        listener.property.update(event);
      }
    }
  },
  updateByDiff: function (array) {
    var _this = this,
        j, diff = Pro.U.diff(array, this._array), cdiff;

    for (j in diff) {
      cdiff = diff[j];
      if (cdiff) {
        _this.updateSplice(j, cdiff.o, cdiff.n);
      }
    }
  },
  concat: function () {
    var res, rightProArray;

    if (arguments.length === 1 && Pro.U.isProArray(arguments[0])) {
      rightProArray = arguments[0];
      arguments[0] = rightProArray._array;
    }

    res = new Pro.Array(concat.apply(this._array, arguments));
    if (rightProArray) {
      this.on(pArrayLs.leftConcat(res, this, rightProArray));
      rightProArray.on(pArrayLs.rightConcat(res, this, rightProArray));
    } else {
      this.on(pArrayLs.leftConcat(res, this, slice.call(arguments, 0)));
    }

    return res;
  },
  every: function () {
    this.addCaller();

    return every.apply(this._array, arguments);
  },
  pevery: function (fun, thisArg) {
    var val = new Pro.Val(every.apply(this._array, arguments));

    this.on(pArrayLs.every(val, this, arguments));

    return val;
  },
  some: function () {
    this.addCaller();

    return some.apply(this._array, arguments);
  },
  psome: function (fun, thisArg) {
    var val = new Pro.Val(some.apply(this._array, arguments));

    this.on(pArrayLs.some(val, this, arguments));

    return val;
  },
  forEach: function (fun /*, thisArg */) {
    this.addCaller();

    return forEach.apply(this._array, arguments);
  },
  filter: function (fun, thisArg) {
    var filtered = new Pro.Array(filter.apply(this._array, arguments));
    this.on(pArrayLs.filter(filtered, this, arguments));

    return filtered;
  },
  map: function (fun, thisArg) {
    var mapped = new Pro.Array(map.apply(this._array, arguments));
    this.on(pArrayLs.map(mapped, this, arguments));

    return mapped;
  },
  reduce: function (fun /*, initialValue */) {
    this.addCaller();

    return reduce.apply(this._array, arguments);
  },
  preduce: function (fun /*, initialValue */) {
    var val = new Pro.Val(reduce.apply(this._array, arguments));
    this.on(pArrayLs.reduce(val, this, arguments));

    return val;
  },
  reduceRight: function (fun /*, initialValue */) {
    this.addCaller();

    return reduceRight.apply(this._array, arguments);
  },
  preduceRight: function (fun /*, initialValue */) {
    var val = new Pro.Val(reduceRight.apply(this._array, arguments));
    this.on(pArrayLs.reduceRight(val, this, arguments));

    return val;
  },
  indexOf: function () {
    this.addCaller();

    return indexOf.apply(this._array, arguments);
  },
  pindexOf: function () {
    var val = new Pro.Val(indexOf.apply(this._array, arguments));
    this.on(pArrayLs.indexOf(val, this, arguments));

    return val;
  },
  lastIndexOf: function () {
    this.addCaller();

    return lastIndexOf.apply(this._array, arguments);
  },
  plastindexOf: function () {
    var val = new Pro.Val(lastIndexOf.apply(this._array, arguments));
    this.on(pArrayLs.lastIndexOf(val, this, arguments));

    return val;
  },
  join: function () {
    this.addCaller();

    return join.apply(this._array, arguments);
  },
  pjoin: function (separator) {
    var reduced = this.preduce(function (i, el) {
      return i + separator + el;
    }, ''), res = new Pro.Val(function () {
      if (!reduced.v) {
        return '';
      }
      return reduced.v.substring(1);
    });
    return res;
  },
  toLocaleString: function () {
    this.addCaller();

    return toLocaleString.apply(this._array, arguments);
  },
  toString: function () {
    this.addCaller();

    return toString.apply(this._array, arguments);
  },
  valueOf: function () {
    return this.toArray();
  },
  slice: function () {
    var sliced = new Pro.Array(slice.apply(this._array, arguments));
    this.on(pArrayLs.slice(sliced, this, arguments));

    return sliced;
  },
  reverse: function () {
    if (this._array.length === 0) {
      return;
    }
    var reversed = reverse.apply(this._array, arguments), _this = this;

    _this.update(pArrayOps.reverse, -1, null, null);
    return reversed;
  },
  sort: function () {
    if (this._array.length === 0) {
      return;
    }
    var sorted = sort.apply(this._array, arguments), _this = this,
        args = arguments;

    _this.update(pArrayOps.sort, -1, null, args);
    return sorted;
  },
  splice: function (index, howMany) {
    var oldLn = this._array.length,
        spliced = splice.apply(this._array, arguments),
        ln = this._array.length, delta,
        _this = this, newItems = slice.call(arguments, 2);

    index = !~index ? ln - index : index
    howMany = (howMany == null ? ln - index : howMany) || 0;

    if (newItems.length > howMany) {
      delta = newItems.length - howMany;
      while (delta--) {
        this.defineIndexProp(oldLn++);
      }
    } else if (howMany > newItems.length) {
      delta = howMany - newItems.length;
      while (delta--) {
        delete this[--oldLn];
      }
    }

    _this.updateSplice(index, spliced, newItems);
    return new Pro.Array(spliced);
  },
  pop: function () {
    if (this._array.length === 0) {
      return;
    }
    var popped = pop.apply(this._array, arguments),
        _this = this, index = this._array.length;

    delete this[index];
    _this.update(pArrayOps.remove, _this._array.length, popped, null);

    return popped;
  },
  push: function () {
    var vals = arguments, i, ln = arguments.length, index,
        _this = this;

    for (i = 0; i < ln; i++) {
      index = this._array.length;
      push.call(this._array, arguments[i]);
      this.defineIndexProp(index);
    }

    _this.update(pArrayOps.add, _this._array.length - 1, null, slice.call(vals, 0));

    return this._array.length;
  },
  shift: function () {
    if (this._array.length === 0) {
      return;
    }
    var shifted = shift.apply(this._array, arguments),
        _this = this, index = this._array.length;

    delete this[index];
    _this.update(pArrayOps.remove, 0, shifted, null);

    return shifted;
  },
  unshift: function () {
    var vals = slice.call(arguments, 0), i, ln = arguments.length,
        array = this._array,
        _this = this;
    for (var i = 0; i < ln; i++) {
      array.splice(i, 0, arguments[i]);
      this.defineIndexProp(array.length - 1);
    }

    _this.update(pArrayOps.add, 0, null, vals);

    return array.length;
  },
  toArray: function () {
    var result = [], i, ar = this._array, ln = ar.length, el,
        isPA = Pro.U.isProArray;

    for (i = 0; i < ln; i++) {
      el = ar[i];
      if (isPA(el)) {
        el = el.toArray();
      }

      result.push(el);
    }

    return result;
  },
  toJSON: function () {
    return JSON.stringify(this._array);
  }
});
