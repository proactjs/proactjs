/**
 * @module proact-arrays
 */

/**
 * Defines a set of special listeners used to trak {{#crossLink "ProAct.Array"}}{{/crossLink}} changes and updating dependent {{#crossLink "ProAct.Array"}}{{/crossLink}}s in an optimal way.
 *
 * @class Listeners
 * @namespace ProAct.Array
 * @static
 */
ProAct.Array.Listeners = P.A.L = pArrayLs = {

  /**
   * Checks the validity of an event.
   *
   * @for ProAct.Array.Listeners
   * @static
   * @param {ProAct.Event} event
   *      The event to check.
   * @throws {Error}
   *      If the event is not {{#crossLink "ProAct.Event.Types/array:property"}}{{/crossLink}}
   */
  check: function(event) {
    if (event.type !== P.E.Types.array) {
      throw Error('Not implemented for non array events');
    }
  },

  /**
   * Generates a listener that can be attached to an {{#crossLink "ProAct.Array"}}{{/crossLink}} on which
   * the method {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}} is invoked.
   * <p>
   *  The result of the {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}} method is another {{#crossLink "ProAct.Array"}}{{/crossLink}}, dependent on the <i>original</i> one.
   * </p>
   * <p>
   *  For example if the original was:
   *  <pre>
   *    var a = new ProAct.Array([1, 3, 5]);
   *  </pre>
   *  and we invoked {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}} on it like this:
   *  <pre>
   *    var b = a.concat(7, 9); // b is [1, 3, 5, 7, 9]
   *  </pre>
   *  The new array - <b>b</b> is dependent on <b>a</b>, so if for example we push something to <b>a</b>, <b>b</b> should be updated:
   *  <pre>
   *    a.push(11); // b authomatically should become [1, 3, 5, 11, 7, 9]
   *  </pre>
   * </p>
   * <p>
   *  The generated listener by this method does this - updates the <i>transformed</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, when the <i>original</i> changes
   *  and it does it in an optimal way.
   * </p>
   *
   * @for ProAct.Array.Listeners
   * @static
   * @param {ProAct.Array} transformed
   *      The array created as a result of invoking {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}} on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}.
   * @param {ProAct.Array} original
   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} on which {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}} was invoked.
   * @param {Array} args
   *      The arguments passed to {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}}, when it was invoked on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}
   * @return {Function}
   *      A listener for events from the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, updating the <i>transformed</i> {{#crossLink "ProAct.Array"}}{{/crossLink}} on
   *      every new event, if it is necessary.
   */
  leftConcat: function (transformed, original, args) {
    return function (event) {
      pArrayLs.check(event);
      var op    = event.args[0],
          ind   = event.args[1],
          ov    = event.args[2],
          nv    = event.args[3],
          argln = args.length,
          nvs, toAdd;
      if (op === pArrayOps.set) {
        transformed[ind] = nv;
      } else if (op === pArrayOps.add) {
        nvs = slice.call(nv, 0);
        if (ind === 0) {
          pArrayProto.unshift.apply(transformed, nvs);
        } else {
          pArrayProto.splice.apply(transformed, [transformed._array.length - argln, 0].concat(nvs));
        }
      } else if (op === pArrayOps.remove) {
        if (ind === 0) {
          pArrayProto.shift.call(transformed, ov);
        } else {
          pArrayProto.splice.apply(transformed, [transformed._array.length - argln - 1, 1]);
        }
      } else if (op === pArrayOps.setLength) {
        nvs = ov -nv;
        if (nvs > 0) {
          pArrayProto.splice.apply(transformed, [nv, nvs]);
        } else {
          toAdd = [ov, 0];
          toAdd.length = 2 - nvs;
          pArrayProto.splice.apply(transformed, toAdd);
        }
      } else if (op === pArrayOps.reverse || op === pArrayOps.sort) {
        nvs = transformed._array;
        if (P.U.isProArray(args)) {
          toAdd = args._array;
        } else {
          toAdd = args;
        }
        transformed._array.length = 0;
        push.apply(transformed._array, concat.apply(original._array, toAdd));
        transformed.core.updateByDiff(nvs);
      } else if (op === pArrayOps.splice) {
        pArrayProto.splice.apply(transformed, [ind, ov.length].concat(nv));
      }
    };
  },

  /**
   * Generates a listener that can be attached to an {{#crossLink "ProAct.Array"}}{{/crossLink}} on which
   * the method {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}} is invoked with argument, another {{#crossLink "ProAct.Array"}}{{/crossLink}}.
   * <p>
   *  The result of the {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}} method is another {{#crossLink "ProAct.Array"}}{{/crossLink}},
   *  dependent on both the <i>original</i> and the passed as an argument one.
   * </p>
   * <p>
   *  For example if the original was:
   *  <pre>
   *    var a = new ProAct.Array([1, 3, 5]);
   *  </pre>
   *  and we invoked {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}} on it like this:
   *  <pre>
   *    var x = new ProAct.Array(7, 9);
   *    var b = a.concat(x); // b is [1, 3, 5, 7, 9]
   *  </pre>
   *  The new array - <b>b</b> is dependent on <b>x</b>, so if for example we push something to <b>x</b>, <b>b</b> should be updated:
   *  <pre>
   *    x.push(13); // b authomatically should become [1, 3, 5, 7, 9, 13]
   *  </pre>
   * </p>
   * <p>
   *  The generated listener by this method does this - updates the <i>transformed</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, when the <i>original</i> changes
   *  and it does it in an optimal way.
   * </p>
   *
   * @for ProAct.Array.Listeners
   * @static
   * @param {ProAct.Array} transformed
   *      The array created as a result of invoking {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}} on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}.
   * @param {ProAct.Array} original
   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} on which {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}} was invoked.
   * @param {ProAct.Array} right
   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} passed as an argument to {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}}.
   * @return {Function}
   *      A listener for events from the <i>right</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, updating the <i>transformed</i> {{#crossLink "ProAct.Array"}}{{/crossLink}} on
   *      every new event, if it is necessary.
   */
  rightConcat: function (transformed, original, right) {
    return function (event) {
      pArrayLs.check(event);
      var op    = event.args[0],
          ind   = event.args[1],
          ov    = event.args[2],
          nv    = event.args[3],
          oln   = original._array.length,
          nvs;
      if (op === pArrayOps.set) {
        transformed[oln + ind] = nv;
      } else if (op === pArrayOps.add) {
        if (ind === 0) {
          pArrayProto.splice.apply(transformed, [oln, 0].concat(nv));
        } else {
          pArrayProto.push.apply(transformed, nv);
        }
      } else if (op === pArrayOps.remove) {
        if (ind === 0) {
          pArrayProto.splice.call(transformed, oln, 1);
        } else {
          pArrayProto.pop.call(transformed, ov);
        }
      } else if (op === pArrayOps.setLength) {
        transformed.length = oln + nv;
      } else if (op === pArrayOps.reverse || op === pArrayOps.sort) {
        nvs = transformed._array;
        transformed._array.length = 0;
        push.apply(transformed._array, concat.apply(original._array, right._array));
        transformed.core.updateByDiff(nvs);
      } else if (op === pArrayOps.splice) {
        pArrayProto.splice.apply(transformed, [ind + oln, ov.length].concat(nv));
      }
    };
  },

  /**
   * Generates a listener that can be attached to an {{#crossLink "ProAct.Array"}}{{/crossLink}} on which
   * the method {{#crossLink "ProAct.Array/pevery:method"}}{{/crossLink}} is invoked.
   * <p>
   *  The result of the {{#crossLink "ProAct.Array/pevery:method"}}{{/crossLink}} method is a {{#crossLink "ProAct.Property"}}{{/crossLink}}, dependent on the <i>original</i> array.
   * </p>
   * <p>
   *  For example if the original was:
   *  <pre>
   *    var a = new ProAct.Array([1, 3, 5]);
   *  </pre>
   *  and we invoked {{#crossLink "ProAct.Array/pevery:method"}}{{/crossLink}} on it like this:
   *  <pre>
   *    var val = a.pevery(function (el) {
   *      return el % 2 === 1;
   *    }); // val.v is true.
   *  </pre>
   *  The new value - <b>val</b> is dependent on <b>a</b>, so if for example we push something to <b>a</b>, <b>val</b> should be updated:
   *  <pre>
   *    a.push(2); // val.v authomatically should become false.
   *  </pre>
   * </p>
   * <p>
   *  The generated listener by this method does this - updates the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}}, when the <i>original</i> array changes
   *  and it does it in an optimal way.
   * </p>
   *
   * @for ProAct.Array.Listeners
   * @static
   * @param {ProAct.Property} val
   *      The result of invoking {{#crossLink "ProAct.Array/pevery:method"}}{{/crossLink}} on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}.
   * @param {ProAct.Array} original
   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} on which {{#crossLink "ProAct.Array/pevery:method"}}{{/crossLink}} was invoked.
   * @param {Array} args
   *      The arguments passed to {{#crossLink "ProAct.Array/pevery:method"}}{{/crossLink}}, when it was invoked on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}
   * @return {Function}
   *      A listener for events from the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, updating the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}} on
   *      every new event, if it is necessary.
   */
  every: function (val, original, args) {
    var fun = args[0], thisArg = args[1];
    return function (event) {
      pArrayLs.check(event);
      var op  = event.args[0],
          ind = event.args[1],
          ov  = event.args[2],
          nv  = event.args[3],
          ev;
      if (op === pArrayOps.set) {
        ev = fun.call(thisArg, nv);
        if (val.valueOf() === true && !ev) {
          val.v = false;
        } else if (val.valueOf() === false && ev) {
          val.v = every.apply(original._array, args);
        }
      } else if (op === pArrayOps.add) {
        if (val.valueOf() === true) {
          val.v = every.call(nv, fun, thisArg);
        }
      } else if (op === pArrayOps.remove) {
        if (val.valueOf() === false && !fun.call(thisArg, ov)) {
          val.v = every.apply(original._array, args);
        }
      } else if (op === pArrayOps.setLength) {
        if (val.valueOf() === false) {
          val.v = every.apply(original._array, args);
        }
      } else if (op === pArrayOps.splice) {
        if (val.valueOf() === true) {
          val.v = every.call(nv, fun, thisArg);
        } else if (every.call(nv, fun, thisArg) && !every.call(ov, fun, thisArg)) {
          val.v = every.apply(original._array, args);
        }
      }
    };
  },

  /**
   * Generates a listener that can be attached to an {{#crossLink "ProAct.Array"}}{{/crossLink}} on which
   * the method {{#crossLink "ProAct.Array/psome:method"}}{{/crossLink}} is invoked.
   * <p>
   *  The result of the {{#crossLink "ProAct.Array/psome:method"}}{{/crossLink}} method is a {{#crossLink "ProAct.Property"}}{{/crossLink}}, dependent on the <i>original</i> array.
   * </p>
   * <p>
   *  For example if the original was:
   *  <pre>
   *    var a = new ProAct.Array([1, 3, 5]);
   *  </pre>
   *  and we invoked {{#crossLink "ProAct.Array/psome:method"}}{{/crossLink}} on it like this:
   *  <pre>
   *    var val = a.psome(function (el) {
   *      return el % 2 === 0;
   *    }); // val.v is false.
   *  </pre>
   *  The new value - <b>val</b> is dependent on <b>a</b>, so if for example we push something to <b>a</b>, <b>val</b> should be updated:
   *  <pre>
   *    a.push(2); // val.v authomatically should become true
   *  </pre>
   * </p>
   * <p>
   *  The generated listener by this method does this - updates the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}}, when the <i>original</i> array changes
   *  and it does it in an optimal way.
   * </p>
   *
   * @for ProAct.Array.Listeners
   * @static
   * @param {ProAct.Property} val
   *      The result of invoking {{#crossLink "ProAct.Array/psome:method"}}{{/crossLink}} on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}.
   * @param {ProAct.Array} original
   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} on which {{#crossLink "ProAct.Array/psome:method"}}{{/crossLink}} was invoked.
   * @param {Array} args
   *      The arguments passed to {{#crossLink "ProAct.Array/psome:method"}}{{/crossLink}}, when it was invoked on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}
   * @return {Function}
   *      A listener for events from the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, updating the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}} on
   *      every new event, if it is necessary.
   */
  some: function (val, original, args) {
    var fun = args[0], thisArg = args[1];
    return function (event) {
      pArrayLs.check(event);
      var op  = event.args[0],
          ind = event.args[1],
          ov  = event.args[2],
          nv  = event.args[3],
          sv;
      if (op === pArrayOps.set) {
        sv = fun.call(thisArg, nv);
        if (val.valueOf() === false && sv) {
          val.v = true;
        } else if (val.valueOf() === true && !sv) {
          val.v = some.apply(original._array, args);
        }
      } else if (op === pArrayOps.add) {
        if (val.valueOf() === false) {
          val.v = some.call(nv, fun, thisArg);
        }
      } else if (op === pArrayOps.remove) {
        if (val.valueOf() === true && fun.call(thisArg, ov)) {
          val.v = some.apply(original._array, args);
        }
      } else if (op === pArrayOps.setLength) {
        if (val.valueOf() === true) {
          val.v = some.apply(original._array, args);
        }
      } else if (op === pArrayOps.splice) {
        if (val.valueOf() === false) {
          val.v = some.call(nv, fun, thisArg);
        } else if (some.call(ov, fun, thisArg) && !some.call(nv, fun, thisArg)) {
          val.v = some.apply(original._array, args);
        }
      }
    };
  },

  /**
   * Generates a listener that can be attached to an {{#crossLink "ProAct.Array"}}{{/crossLink}} on which
   * the method {{#crossLink "ProAct.Array/filter:method"}}{{/crossLink}} is invoked.
   * <p>
   *  The result of the {{#crossLink "ProAct.Array/filter:method"}}{{/crossLink}} method is another {{#crossLink "ProAct.Array"}}{{/crossLink}}, dependent on the <i>original</i> one.
   * </p>
   * <p>
   *  For example if the original was:
   *  <pre>
   *    var a = new ProAct.Array([1, 3, 5]);
   *  </pre>
   *  and we invoked {{#crossLink "ProAct.Array/filter:method"}}{{/crossLink}} on it like this:
   *  <pre>
   *    var b = a.filter(function (el) {
   *      return el % 2 === 0;
   *    }); // b is []
   *  </pre>
   *  The new array - <b>b</b> is dependent on <b>a</b>, so if for example we unshift something to <b>a</b>, <b>b</b> should be updated:
   *  <pre>
   *    a.unshift(4); // b authomatically should become [4]
   *  </pre>
   * </p>
   * <p>
   *  The generated listener by this method does this - updates the <i>filtered</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, when the <i>original</i> changes
   *  and it does it in an optimal way.
   * </p>
   *
   * @for ProAct.Array.Listeners
   * @static
   * @param {ProAct.Array} filtered
   *      The array created as a result of invoking {{#crossLink "ProAct.Array/filter:method"}}{{/crossLink}} on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}.
   * @param {ProAct.Array} original
   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} on which {{#crossLink "ProAct.Array/filter:method"}}{{/crossLink}} was invoked.
   * @param {Array} args
   *      The arguments passed to {{#crossLink "ProAct.Array/filter:method"}}{{/crossLink}}, when it was invoked on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}
   * @return {Function}
   *      A listener for events from the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, updating the <i>filtered</i> {{#crossLink "ProAct.Array"}}{{/crossLink}} on
   *      every new event, if it is necessary.
   */
  filter: function (filtered, original, args) {
    var fun = args[0], thisArg = args[1];
    return function (event) {
      if (P.U.isFunction(event)) {
        args[0] = fun = event;
        pArray.reFilter(original, filtered, args);
        return;
      }

      pArrayLs.check(event);
      var op  = event.args[0],
          ind = event.args[1],
          ov  = event.args[2],
          nv  = event.args[3],
          napply, oapply, oarr,
          nvs, fnvs, j, ln, diff;

      if (op === pArrayOps.set) {
        napply = fun.call(thisArg, nv);
        oapply = fun.call(thisArg, ov);

        if (oapply === true || napply === true) {
          pArray.reFilter(original, filtered, args);
        }
      } else if (op === pArrayOps.add) {
        fnvs = [];
        nvs = slice.call(nv, 0);
        ln = nvs.length;
        if (ind === 0) {
          j = ln - 1;
          while(j >= 0) {
            if (fun.apply(thisArg, [nvs[j], j, original._array])) {
              fnvs.unshift(nvs[j]);
            }
            j--;
          }

          if (fnvs.length) {
            pArrayProto.unshift.apply(filtered, fnvs);
          }
        } else {
          j = 0;
          while(j < ln) {
            if (fun.apply(thisArg, [nvs[j], original._array.length - (ln - j), original._array])) {
              fnvs.push(nvs[j]);
            }
            j++;
          }

          if (fnvs.length) {
            pArrayProto.push.apply(filtered, fnvs);
          }
        }
      } else if (op === pArrayOps.remove) {
        if (fun.apply(thisArg, [ov, ind, original._array])) {
          if (ind === 0) {
            filtered.shift();
          } else {
            filtered.pop();
          }
        }
      } else if (op === pArrayOps.setLength) {
        pArray.reFilter(original, filtered, args);
      } else if (op === pArrayOps.reverse) {
        filtered.reverse();
      } else if (op === pArrayOps.sort) {
        pArrayProto.sort.apply(filtered, nv);
      } else if (op === pArrayOps.splice) {
        pArray.reFilter(original, filtered, args);
      }
    };
  },

  /**
   * Generates a listener that can be attached to an {{#crossLink "ProAct.Array"}}{{/crossLink}} on which
   * the method {{#crossLink "ProAct.Array/map:method"}}{{/crossLink}} is invoked.
   * <p>
   *  The result of the {{#crossLink "ProAct.Array/map:method"}}{{/crossLink}} method is another {{#crossLink "ProAct.Array"}}{{/crossLink}}, dependent on the <i>original</i> one.
   * </p>
   * <p>
   *  For example if the original was:
   *  <pre>
   *    var a = new ProAct.Array([1, 3, 5]);
   *  </pre>
   *  and we invoked {{#crossLink "ProAct.Array/map:method"}}{{/crossLink}} on it like this:
   *  <pre>
   *    var b = a.map(function (el) {
   *      return el * el;
   *    }); // b is [1, 9, 25]
   *  </pre>
   *  The new array - <b>b</b> is dependent on <b>a</b>, so if for example we pop from <b>a</b>, <b>b</b> should be updated:
   *  <pre>
   *    a.pop(); // b authomatically should become [1, 9]
   *  </pre>
   * </p>
   * <p>
   *  The generated listener by this method does this - updates the <i>mapped</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, when the <i>original</i> changes
   *  and it does it in an optimal way.
   * </p>
   *
   * @for ProAct.Array.Listeners
   * @static
   * @param {ProAct.Array} mapped
   *      The array created as a result of invoking {{#crossLink "ProAct.Array/map:method"}}{{/crossLink}} on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}.
   * @param {ProAct.Array} original
   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} on which {{#crossLink "ProAct.Array/map:method"}}{{/crossLink}} was invoked.
   * @param {Array} args
   *      The arguments passed to {{#crossLink "ProAct.Array/map:method"}}{{/crossLink}}, when it was invoked on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}
   * @return {Function}
   *      A listener for events from the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, updating the <i>mapped</i> {{#crossLink "ProAct.Array"}}{{/crossLink}} on
   *      every new event, if it is necessary.
   */
  map: function (mapped, original, args) {
    var fun = args[0], thisArg = args[1];
    return function (event) {
      pArrayLs.check(event);
      var op  = event.args[0],
          ind = event.args[1],
          ov  = event.args[2],
          nv  = event.args[3],
          nvs, j, ln, mnvs;
      if (op === pArrayOps.set) {
        mapped[ind] = fun.call(thisArg, nv);
      } else if (op === pArrayOps.add) {
        mnvs = [];
        nvs = slice.call(nv, 0);
        ln = nvs.length;
        if (ind === 0) {
          j = ln - 1;
          while(j >= 0) {
            mnvs[j] = fun.apply(thisArg, [nvs[j], j, original._array]);
            j--;
          }

          pArrayProto.unshift.apply(mapped, mnvs);
        } else {
          j = 0;
          while(j < ln) {
            mnvs[j] = fun.apply(thisArg, [nvs[j], original._array.length - (ln - j), original._array]);
            j++;
          }

          pArrayProto.push.apply(mapped, mnvs);
        }
      } else if (op === pArrayOps.remove) {
        if (ind === 0) {
          mapped.shift();
        } else {
          mapped.pop();
        }
      } else if (op === pArrayOps.setLength) {
        mapped.length = nv;
      } else if (op === pArrayOps.reverse) {
        mapped.reverse();
      } else if (op === pArrayOps.sort) {
        pArrayProto.sort.apply(mapped, nv);
      } else if (op === pArrayOps.splice) {
        mnvs = [];
        j = 0;
        while (j < nv.length) {
          mnvs[j] = fun.apply(thisArg, [nv[j], (j + ind), original._array]);
          j++;
        }

        pArrayProto.splice.apply(mapped, [
          ind,
          ov.length
        ].concat(mnvs));
      }
    };
  },

  /**
   * Generates a listener that can be attached to an {{#crossLink "ProAct.Array"}}{{/crossLink}} on which
   * the method {{#crossLink "ProAct.Array/preduce:method"}}{{/crossLink}} is invoked.
   * <p>
   *  The result of the {{#crossLink "ProAct.Array/preduce:method"}}{{/crossLink}} method is a {{#crossLink "ProAct.Property"}}{{/crossLink}}, dependent on the <i>original</i> array.
   * </p>
   * <p>
   *  For example if the original was:
   *  <pre>
   *    var a = new ProAct.Array([1, 3, 5]);
   *  </pre>
   *  and we invoked {{#crossLink "ProAct.Array/preduce:method"}}{{/crossLink}} on it like this:
   *  <pre>
   *    var val = a.preduce(function (pel, el) {
   *      return pel + el;
   *    }, 0); // val.v is 0 + 1 + 3 + 5 = 9.
   *  </pre>
   *  The new value - <b>val</b> is dependent on <b>a</b>, so if for example we shift from <b>a</b>, <b>val</b> should be updated:
   *  <pre>
   *    a.shift(); // val.v authomatically should become 0 + 3 + 5 = 8.
   *  </pre>
   * </p>
   * <p>
   *  The generated listener by this method does this - updates the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}}, when the <i>original</i> array changes
   *  and it does it in an optimal way.
   * </p>
   *
   * @for ProAct.Array.Listeners
   * @static
   * @param {ProAct.Property} val
   *      The result of invoking {{#crossLink "ProAct.Array/preduce:method"}}{{/crossLink}} on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}.
   * @param {ProAct.Array} original
   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} on which {{#crossLink "ProAct.Array/preduce:method"}}{{/crossLink}} was invoked.
   * @param {Array} args
   *      The arguments passed to {{#crossLink "ProAct.Array/preduce:method"}}{{/crossLink}}, when it was invoked on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}
   * @return {Function}
   *      A listener for events from the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, updating the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}} on
   *      every new event, if it is necessary.
   */
  reduce: function (val, original, args) {
    var oldLn = original._array.length, fun = args[0];
    return function (event) {
      pArrayLs.check(event);
      var op  = event.args[0],
          ind = event.args[1],
          ov  = event.args[2],
          nv  = event.args[3];
      if ((op === pArrayOps.add && ind !== 0) ||
         (op === pArrayOps.splice && ind >= oldLn && ov.length === 0)) {
        val.v = reduce.apply(nv, [fun, val.valueOf()]);
      } else {
        val.v = reduce.apply(original._array, args);
      }
      oldLn = original._array.length;
    };
  },

  /**
   * Generates a listener that can be attached to an {{#crossLink "ProAct.Array"}}{{/crossLink}} on which
   * the method {{#crossLink "ProAct.Array/preduceRight:method"}}{{/crossLink}} is invoked.
   * <p>
   *  The result of the {{#crossLink "ProAct.Array/preduceRight:method"}}{{/crossLink}} method is a {{#crossLink "ProAct.Property"}}{{/crossLink}}, dependent on the <i>original</i> array.
   * </p>
   * <p>
   *  For example if the original was:
   *  <pre>
   *    var a = new ProAct.Array([1, 3, 5]);
   *  </pre>
   *  and we invoked {{#crossLink "ProAct.Array/preduceRight:method"}}{{/crossLink}} on it like this:
   *  <pre>
   *    var val = a.preduceRight(function (pel, el) {
   *      return pel + el;
   *    }, 0); // val.v is 0 + 5 + 3 + 1 = 9.
   *  </pre>
   *  The new value - <b>val</b> is dependent on <b>a</b>, so if for example we splice <b>a</b>, <b>val</b> should be updated:
   *  <pre>
   *    a.splice(1, 2, 4, 5); // val.v authomatically should become 0 + 5 + 4 + 1 = 10.
   *  </pre>
   * </p>
   * <p>
   *  The generated listener by this method does this - updates the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}}, when the <i>original</i> array changes
   *  and it does it in an optimal way.
   * </p>
   *
   * @for ProAct.Array.Listeners
   * @static
   * @param {ProAct.Property} val
   *      The result of invoking {{#crossLink "ProAct.Array/preduceRight:method"}}{{/crossLink}} on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}.
   * @param {ProAct.Array} original
   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} on which {{#crossLink "ProAct.Array/preduceRight:method"}}{{/crossLink}} was invoked.
   * @param {Array} args
   *      The arguments passed to {{#crossLink "ProAct.Array/preduceRight:method"}}{{/crossLink}}, when it was invoked on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}
   * @return {Function}
   *      A listener for events from the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, updating the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}} on
   *      every new event, if it is necessary.
   */
  reduceRight: function (val, original, args) {
    var fun = args[0];
    return function (event) {
      pArrayLs.check(event);
      var op  = event.args[0],
          ind = event.args[1],
          ov  = event.args[2],
          nv  = event.args[3];
      if ((op === pArrayOps.add && ind === 0) ||
         (op === pArrayOps.splice && ind === 0 && ov.length === 0)) {
        val.v = reduceRight.apply(nv, [fun, val.valueOf()]);
      } else {
        val.v = reduceRight.apply(original._array, args);
      }
    };
  },

  /**
   * Generates a listener that can be attached to an {{#crossLink "ProAct.Array"}}{{/crossLink}} on which
   * the method {{#crossLink "ProAct.Array/pindexOf:method"}}{{/crossLink}} is invoked.
   * <p>
   *  The result of the {{#crossLink "ProAct.Array/pindexOf:method"}}{{/crossLink}} method is a {{#crossLink "ProAct.Property"}}{{/crossLink}}, dependent on the <i>original</i> array.
   * </p>
   * <p>
   *  For example if the original was:
   *  <pre>
   *    var a = new ProAct.Array([1, 3, 5]);
   *  </pre>
   *  and we invoked {{#crossLink "ProAct.Array/pindexOf:method"}}{{/crossLink}} on it like this:
   *  <pre>
   *    var val = a.pindexOf(5); // val.v is 2.
   *  </pre>
   *  The new value - <b>val</b> is dependent on <b>a</b>, so if for example we reverse <b>a</b>, <b>val</b> should be updated:
   *  <pre>
   *    a.reverse(); // val.v authomatically should become 0.
   *  </pre>
   * </p>
   * <p>
   *  The generated listener by this method does this - updates the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}}, when the <i>original</i> array changes
   *  and it does it in an optimal way.
   * </p>
   *
   * @for ProAct.Array.Listeners
   * @static
   * @param {ProAct.Property} val
   *      The result of invoking {{#crossLink "ProAct.Array/pindexOf:method"}}{{/crossLink}} on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}.
   * @param {ProAct.Array} original
   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} on which {{#crossLink "ProAct.Array/pindexOf:method"}}{{/crossLink}} was invoked.
   * @param {Array} args
   *      The arguments passed to {{#crossLink "ProAct.Array/pindexOf:method"}}{{/crossLink}}, when it was invoked on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}
   * @return {Function}
   *      A listener for events from the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, updating the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}} on
   *      every new event, if it is necessary.
   */
  indexOf: function (val, original, args) {
    var what = args[0], fromIndex = args[1], hasFrom = !!fromIndex;
    return function (event) {
      pArrayLs.check(event);
      var op  = event.args[0],
          ind = event.args[1],
          ov  = event.args[2],
          nv  = event.args[3],
          v = val.valueOf(),
          nvi, i;

      if (op === pArrayOps.set) {
        if (ov === what) {
          val.v = indexOf.apply(original._array, args);
        } else if (nv === what && (ind < v || v === -1) && (!hasFrom || ind >= fromIndex)) {
          val.v = ind;
        }
      } else if (op === pArrayOps.add) {
        nvi = nv.indexOf(what);
        if (ind === 0) {
          if (nvi !== -1 && (!hasFrom || ind >= fromIndex)) {
            val.v = nvi;
          } else if (v !== -1) {
            val.v = v + nv.length;
          }
        } else if (v === -1 &&  (!hasFrom || ind >= fromIndex)) {
          if (nvi !== -1) {
            val.v = ind;
          }
        }
      } else if (op === pArrayOps.remove) {
        if (v !== -1) {
          if (ind === 0) {
            if (ov === what && !hasFrom) {
              val.v = indexOf.apply(original._array, args);
            } else {
              val.v = v - 1;
            }
          } else if (what === ov) {
            val.v = -1;
          }
        }
      } else if (op === pArrayOps.setLength && nv <= v) {
        val.v = -1;
      } else if (op === pArrayOps.reverse || op === pArrayOps.sort) {
        val.v = indexOf.apply(original._array, args);
      } else if (op === pArrayOps.splice) {
        nvi = nv.indexOf(what);
        i = nvi + ind;
        if (ind <= v) {
          if (nvi !== -1 && i < v && (!hasFrom || fromIndex <= i)) {
            val.v = i;
          } else if (nv.length !== ov.length && ov.indexOf(what) === -1) {
            v = v + (nv.length - ov.length);
            if (!hasFrom || v >= fromIndex) {
              val.v = v;
            } else {
              val.v = indexOf.apply(original._array, args);
            }
          } else {
            val.v = indexOf.apply(original._array, args);
          }
        } else if (v === -1 && nvi !== -1) {
          val.v = i;
        }
      }
    };
  },

  /**
   * Generates a listener that can be attached to an {{#crossLink "ProAct.Array"}}{{/crossLink}} on which
   * the method {{#crossLink "ProAct.Array/plastIndexOf:method"}}{{/crossLink}} is invoked.
   * <p>
   *  The result of the {{#crossLink "ProAct.Array/plastIndexOf:method"}}{{/crossLink}} method is a {{#crossLink "ProAct.Property"}}{{/crossLink}}, dependent on the <i>original</i> array.
   * </p>
   * <p>
   *  For example if the original was:
   *  <pre>
   *    var a = new ProAct.Array([5, 4, 5, 3]);
   *  </pre>
   *  and we invoked {{#crossLink "ProAct.Array/plastIndexOf:method"}}{{/crossLink}} on it like this:
   *  <pre>
   *    var val = a.plastIndexOf(5); // val.v is 2.
   *  </pre>
   *  The new value - <b>val</b> is dependent on <b>a</b>, so if for example we sort <b>a</b>, <b>val</b> should be updated:
   *  <pre>
   *    a.sort(); // val.v authomatically should become 3.
   *  </pre>
   * </p>
   * <p>
   *  The generated listener by this method does this - updates the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}}, when the <i>original</i> array changes
   *  and it does it in an optimal way.
   * </p>
   *
   * @for ProAct.Array.Listeners
   * @static
   * @param {ProAct.Property} val
   *      The result of invoking {{#crossLink "ProAct.Array/plastIndexOf:method"}}{{/crossLink}} on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}.
   * @param {ProAct.Array} original
   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} on which {{#crossLink "ProAct.Array/plastIndexOf:method"}}{{/crossLink}} was invoked.
   * @param {Array} args
   *      The arguments passed to {{#crossLink "ProAct.Array/plastIndexOf:method"}}{{/crossLink}}, when it was invoked on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}
   * @return {Function}
   *      A listener for events from the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, updating the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}} on
   *      every new event, if it is necessary.
   */
  lastIndexOf: function (val, original, args) {
    var what = args[0], fromIndex = args[1], hasFrom = !!fromIndex;
    return function (event) {
      pArrayLs.check(event);
      var op  = event.args[0],
          ind = event.args[1],
          ov  = event.args[2],
          nv  = event.args[3],
          v = val.valueOf(),
          nvi, i;

      if (op === pArrayOps.set) {
        if (ov === what) {
          val.v = lastIndexOf.apply(original._array, args);
        } else if (nv === what && (ind > v || v === -1) && (!hasFrom || ind <= fromIndex)) {
          val.v = ind;
        }
      } else if (op === pArrayOps.add) {
        nvi = nv.indexOf(what);
        if (ind === 0) {
          if (nvi !== -1 && v === -1 && (!hasFrom || ind <= fromIndex)) {
            val.v = nvi;
          } else if (v !== -1) {
            val.v = v + nv.length;
          }
        } else if (nvi !== -1 && (!hasFrom || (ind + nvi) <= fromIndex)) {
          val.v = ind + nvi;
        }
      } else if (op === pArrayOps.remove) {
        if (v !== -1) {
          if (ind === 0) {
            val.v = v - 1;
          } else if (what === ov) {
            val.v = lastIndexOf.apply(original._array, args);
          }
        }
      } else if (op === pArrayOps.splice || op === pArrayOps.reverse || op === pArrayOps.sort || (op === pArrayOps.setLength && nv < ov)) {
        val.v = lastIndexOf.apply(original._array, args);
      }
    };
  },

  /**
   * Generates a listener that can be attached to an {{#crossLink "ProAct.Array"}}{{/crossLink}} on which
   * the method {{#crossLink "ProAct.Array/slice:method"}}{{/crossLink}} is invoked.
   * <p>
   *  The result of the {{#crossLink "ProAct.Array/slice:method"}}{{/crossLink}} method is another {{#crossLink "ProAct.Array"}}{{/crossLink}}, dependent on the <i>original</i> one.
   * </p>
   * <p>
   *  For example if the original was:
   *  <pre>
   *    var a = new ProAct.Array([1, 3, 5]);
   *  </pre>
   *  and we invoked {{#crossLink "ProAct.Array/slice:method"}}{{/crossLink}} on it like this:
   *  <pre>
   *    var b = a.slice(1); // b is [3, 5]
   *  </pre>
   *  The new array - <b>b</b> is dependent on <b>a</b>, so if for example we push to <b>a</b>, <b>b</b> should be updated:
   *  <pre>
   *    a.push(32); // b authomatically should become [3, 5, 32]
   *  </pre>
   * </p>
   * <p>
   *  The generated listener by this method does this - updates the <i>sliced</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, when the <i>original</i> changes
   *  and it does it in an optimal way.
   * </p>
   *
   * @for ProAct.Array.Listeners
   * @static
   * @param {ProAct.Array} sliced
   *      The array created as a result of invoking {{#crossLink "ProAct.Array/slice:method"}}{{/crossLink}} on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}.
   * @param {ProAct.Array} original
   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} on which {{#crossLink "ProAct.Array/slice:method"}}{{/crossLink}} was invoked.
   * @param {Array} args
   *      The arguments passed to {{#crossLink "ProAct.Array/slice:method"}}{{/crossLink}}, when it was invoked on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}
   * @return {Function}
   *      A listener for events from the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, updating the <i>sliced</i> {{#crossLink "ProAct.Array"}}{{/crossLink}} on
   *      every new event, if it is necessary.
   */
  slice: function (sliced, original, args) {
    var s = args[0], e = args[1], hasEnd = !!e;
    return function (event) {
      pArrayLs.check(event);
      var op  = event.args[0],
          ind = event.args[1],
          ov  = event.args[2],
          nv  = event.args[3],
          osl;
      if (op === pArrayOps.set) {
        if (ind >= s && (!hasEnd || ind < e)) {
          sliced[ind - s] = nv;
        }
      } else {
        osl = sliced._array;
        sliced._array.length = 0;
        push.apply(sliced._array, slice.apply(original._array, args));
        sliced.core.updateByDiff(osl);
      }
    };
  }
};
