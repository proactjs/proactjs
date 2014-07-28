ProAct.Array = P.A = pArray = function () {
  var self = this,
      getLength, setLength, oldLength,
      arr, core;

  // Setup _array:
  if (arguments.length === 0) {
    arr = [];
  } else if (arguments.length === 1 && P.U.isArray(arguments[0])) {
    arr = arguments[0];
  } else {
    arr = slice.call(arguments);
  }

  P.U.defValProp(this, '_array', false, false, true, arr);

  // Setup core:
  core = new P.AC(this);
  P.U.defValProp(this, '__pro__', false, false, false, core);
  P.U.defValProp(this, 'core', false, false, false, core);
  core.prob();
};

P.U.ex(P.A, {
  Operations: {
    set: 0,
    add: 1,
    remove: 2,
    setLength: 3,
    reverse: 4,
    sort: 5,
    splice: 6,
  },
  reFilter: function (original, filtered, filterArgs) {
    var oarr = filtered._array;

    filtered._array = filter.apply(original._array, filterArgs);
    filtered.core.updateByDiff(oarr);
  }
});
pArrayOps = pArray.Operations;

ProAct.Array.prototype = pArrayProto = P.U.ex(Object.create(arrayProto), {
  constructor: ProAct.Array,
  concat: function () {
    var res, rightProArray;

    if (arguments.length === 1 && P.U.isProArray(arguments[0])) {
      rightProArray = arguments[0];
      arguments[0] = rightProArray._array;
    }

    res = new P.A(concat.apply(this._array, arguments));
    if (rightProArray) {
      this.core.on(pArrayLs.leftConcat(res, this, rightProArray));
      rightProArray.core.on(pArrayLs.rightConcat(res, this, rightProArray));
    } else {
      this.core.on(pArrayLs.leftConcat(res, this, slice.call(arguments, 0)));
    }

    return res;
  },
  every: function () {
    this.core.addCaller();

    return every.apply(this._array, arguments);
  },
  pevery: function (fun, thisArg) {
    var val = new P.Val(every.apply(this._array, arguments));

    this.core.on(pArrayLs.every(val, this, arguments));

    return val;
  },
  some: function () {
    this.core.addCaller();

    return some.apply(this._array, arguments);
  },
  psome: function (fun, thisArg) {
    var val = new P.Val(some.apply(this._array, arguments));

    this.core.on(pArrayLs.some(val, this, arguments));

    return val;
  },
  forEach: function (fun /*, thisArg */) {
    this.core.addCaller();

    return forEach.apply(this._array, arguments);
  },
  filter: function (fun, thisArg) {
    var filtered = new P.A(filter.apply(this._array, arguments));
    this.core.on(pArrayLs.filter(filtered, this, arguments));

    return filtered;
  },
  map: function (fun, thisArg) {
    var mapped = new P.A(map.apply(this._array, arguments));
    this.core.on(pArrayLs.map(mapped, this, arguments));

    return mapped;
  },
  reduce: function (fun /*, initialValue */) {
    this.core.addCaller();

    return reduce.apply(this._array, arguments);
  },
  preduce: function (fun /*, initialValue */) {
    var val = new P.Val(reduce.apply(this._array, arguments));
    this.core.on(pArrayLs.reduce(val, this, arguments));

    return val;
  },
  reduceRight: function (fun /*, initialValue */) {
    this.core.addCaller();

    return reduceRight.apply(this._array, arguments);
  },
  preduceRight: function (fun /*, initialValue */) {
    var val = new P.Val(reduceRight.apply(this._array, arguments));
    this.core.on(pArrayLs.reduceRight(val, this, arguments));

    return val;
  },
  indexOf: function () {
    this.core.addCaller();

    return indexOf.apply(this._array, arguments);
  },
  pindexOf: function () {
    var val = new P.Val(indexOf.apply(this._array, arguments));
    this.core.on(pArrayLs.indexOf(val, this, arguments));

    return val;
  },
  lastIndexOf: function () {
    this.core.addCaller();

    return lastIndexOf.apply(this._array, arguments);
  },
  plastindexOf: function () {
    var val = new P.Val(lastIndexOf.apply(this._array, arguments));
    this.core.on(pArrayLs.lastIndexOf(val, this, arguments));

    return val;
  },
  join: function () {
    this.core.addCaller();

    return join.apply(this._array, arguments);
  },
  pjoin: function (separator) {
    var reduced = this.preduce(function (i, el) {
      return i + separator + el;
    }, ''), res = new P.Val(function () {
      if (!reduced.v) {
        return '';
      }
      return reduced.v.substring(1);
    });
    return res;
  },
  toLocaleString: function () {
    this.core.addCaller();

    return toLocaleString.apply(this._array, arguments);
  },
  toString: function () {
    this.core.addCaller();

    return toString.apply(this._array, arguments);
  },
  valueOf: function () {
    return this.toArray();
  },
  slice: function () {
    var sliced = new P.A(slice.apply(this._array, arguments));
    this.core.on(pArrayLs.slice(sliced, this, arguments));

    return sliced;
  },
  reverse: function () {
    if (this._array.length === 0) {
      return;
    }
    var reversed = reverse.apply(this._array, arguments);

    this.core.update(null, 'index', [pArrayOps.reverse, -1, null, null]);
    return reversed;
  },
  sort: function () {
    if (this._array.length === 0) {
      return;
    }
    var sorted = sort.apply(this._array, arguments),
        args = arguments;

    this.core.update(null, 'index', [pArrayOps.sort, -1, null, args]);
    return sorted;
  },
  splice: function (index, howMany) {
    var oldLn = this._array.length,
        spliced = splice.apply(this._array, arguments),
        ln = this._array.length, delta,
        newItems = slice.call(arguments, 2);

    index = !~index ? ln - index : index
    howMany = (howMany == null ? ln - index : howMany) || 0;

    if (newItems.length > howMany) {
      delta = newItems.length - howMany;
      while (delta--) {
        this.core.defineIndexProp(oldLn++);
      }
    } else if (howMany > newItems.length) {
      delta = howMany - newItems.length;
      while (delta--) {
        delete this[--oldLn];
      }
    }

    this.core.updateSplice(index, spliced, newItems);
    return new P.A(spliced);
  },
  pop: function () {
    if (this._array.length === 0) {
      return;
    }
    var popped = pop.apply(this._array, arguments),
        index = this._array.length;

    delete this[index];
    this.core.update(null, 'length', [pArrayOps.remove, this._array.length, popped, null]);

    return popped;
  },
  push: function () {
    var vals = arguments, i, ln = arguments.length, index;

    for (i = 0; i < ln; i++) {
      index = this._array.length;
      push.call(this._array, arguments[i]);
      this.core.defineIndexProp(index);
    }

    this.core.update(null, 'length', [pArrayOps.add, this._array.length - 1, null, slice.call(vals, 0)]);

    return this._array.length;
  },
  shift: function () {
    if (this._array.length === 0) {
      return;
    }
    var shifted = shift.apply(this._array, arguments),
        index = this._array.length;

    delete this[index];
    this.core.update(null, 'length', [pArrayOps.remove, 0, shifted, null]);

    return shifted;
  },
  unshift: function () {
    var vals = slice.call(arguments, 0), i, ln = arguments.length,
        array = this._array;

    for (var i = 0; i < ln; i++) {
      array.splice(i, 0, arguments[i]);
      this.core.defineIndexProp(array.length - 1);
    }

    this.core.update(null, 'length', [pArrayOps.add, 0, null, vals]);

    return array.length;
  },
  toArray: function () {
    var result = [], i, ar = this._array, ln = ar.length, el,
        isPA = P.U.isProArray;

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
