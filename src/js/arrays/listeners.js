/**
 * Defines a set of special listeners used to trak {@link ProAct.Array} changes and updating dependent {@link ProAct.Array}s in an optimal way.
 *
 * @namespace ProAct.Array.Listeners
 */
ProAct.Array.Listeners = P.A.L = pArrayLs = {

  /**
   * Checks the validity of an event.
   *
   * @memberof ProAct.Array.Listeners
   * @static
   * @constant
   * @param {ProAct.Event} event
   *      The event to check.
   * @throws {Error}
   *      If the event is not {@link ProAct.Event.Types.array}
   */
  check: function(event) {
    if (event.type !== P.E.Types.array) {
      throw Error('Not implemented for non array events');
    }
  },

  /**
   * Generates a listener that can be attached to an {@link ProAct.Array} on which
   * the method {@link ProAct.Array#concat} is invoked.
   * <p>
   *  The result of the {@link ProAct.Array#concat} method is another {@link ProAct.Array}, dependent on the <i>original</i> one.
   * </p>
   * <p>
   *  For example if the original was:
   *  <pre>
   *    var a = new ProAct.Array([1, 3, 5]);
   *  </pre>
   *  and we invoked {@link ProAct.Array#concat} on it like this:
   *  <pre>
   *    var b = a.concat(7, 9); // b is [1, 3, 5, 7, 9]
   *  </pre>
   *  The new array - <b>b</b> is dependent on <b>a</b>, so if for example we push something to <b>a</b>, <b>b</b> should be updated:
   *  <pre>
   *    a.push(11); // b authomatically should become [1, 3, 5, 11, 7, 9]
   *  </pre>
   * </p>
   * <p>
   *  The generated listener by this method does this - updates the <i>transformed</i> {@link ProAct.Array}, when the <i>original</i> changes
   *  and it does it in an optimal way.
   * </p>
   *
   * @memberof ProAct.Array.Listeners
   * @static
   * @constant
   * @param {ProAct.Array} transformed
   *      The array created as a result of invoking {@link ProAct.Array#concat} on the <i>original</i> {@link ProAct.Array}.
   * @param {ProAct.Array} original
   *      The {@link ProAct.Array} on which {@link ProAct.Array#concat} was invoked.
   * @param {Array} args
   *      The arguments passed to {@link ProAct.Array#concat}, when it was invoked on the <i>original</i> {@link ProAct.Array}
   * @return {Function}
   *      A listener for events from the <i>original</i> {@link ProAct.Array}, updating the <i>transformed</i> {@link ProAct.Array} on
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
   * Generates a listener that can be attached to an {@link ProAct.Array} on which
   * the method {@link ProAct.Array#concat} is invoked with argument, another {@link ProAct.Array}.
   * <p>
   *  The result of the {@link ProAct.Array#concat} method is another {@link ProAct.Array},
   *  dependent on both the <i>original</i> and the passed as an argument one.
   * </p>
   * <p>
   *  For example if the original was:
   *  <pre>
   *    var a = new ProAct.Array([1, 3, 5]);
   *  </pre>
   *  and we invoked {@link ProAct.Array#concat} on it like this:
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
   *  The generated listener by this method does this - updates the <i>transformed</i> {@link ProAct.Array}, when the <i>original</i> changes
   *  and it does it in an optimal way.
   * </p>
   *
   * @memberof ProAct.Array.Listeners
   * @static
   * @constant
   * @param {ProAct.Array} transformed
   *      The array created as a result of invoking {@link ProAct.Array#concat} on the <i>original</i> {@link ProAct.Array}.
   * @param {ProAct.Array} original
   *      The {@link ProAct.Array} on which {@link ProAct.Array#concat} was invoked.
   * @param {ProAct.Array} right
   *      The {@link ProAct.Array} passed as an argument to {@link ProAct.Array#concat}.
   * @return {Function}
   *      A listener for events from the <i>right</i> {@link ProAct.Array}, updating the <i>transformed</i> {@link ProAct.Array} on
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
   * Generates a listener that can be attached to an {@link ProAct.Array} on which
   * the method {@link ProAct.Array#pevery} is invoked.
   * <p>
   *  The result of the {@link ProAct.Array#pevery} method is a {@link ProAct.Val}, dependent on the <i>original</i> array.
   * </p>
   * <p>
   *  For example if the original was:
   *  <pre>
   *    var a = new ProAct.Array([1, 3, 5]);
   *  </pre>
   *  and we invoked {@link ProAct.Array#pevery} on it like this:
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
   *  The generated listener by this method does this - updates the <i>val</i> {@link ProAct.Val}, when the <i>original</i> array changes
   *  and it does it in an optimal way.
   * </p>
   *
   * @memberof ProAct.Array.Listeners
   * @static
   * @constant
   * @param {ProAct.Val} val
   *      The result of invoking {@link ProAct.Array#pevery} on the <i>original</i> {@link ProAct.Array}.
   * @param {ProAct.Array} original
   *      The {@link ProAct.Array} on which {@link ProAct.Array#pevery} was invoked.
   * @param {Array} args
   *      The arguments passed to {@link ProAct.Array#pevery}, when it was invoked on the <i>original</i> {@link ProAct.Array}
   * @return {Function}
   *      A listener for events from the <i>original</i> {@link ProAct.Array}, updating the <i>val</i> {@link ProAct.Val} on
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
   * Generates a listener that can be attached to an {@link ProAct.Array} on which
   * the method {@link ProAct.Array#psome} is invoked.
   * <p>
   *  The result of the {@link ProAct.Array#psome} method is a {@link ProAct.Val}, dependent on the <i>original</i> array.
   * </p>
   * <p>
   *  For example if the original was:
   *  <pre>
   *    var a = new ProAct.Array([1, 3, 5]);
   *  </pre>
   *  and we invoked {@link ProAct.Array#psome} on it like this:
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
   *  The generated listener by this method does this - updates the <i>val</i> {@link ProAct.Val}, when the <i>original</i> array changes
   *  and it does it in an optimal way.
   * </p>
   *
   * @memberof ProAct.Array.Listeners
   * @static
   * @constant
   * @param {ProAct.Val} val
   *      The result of invoking {@link ProAct.Array#psome} on the <i>original</i> {@link ProAct.Array}.
   * @param {ProAct.Array} original
   *      The {@link ProAct.Array} on which {@link ProAct.Array#psome} was invoked.
   * @param {Array} args
   *      The arguments passed to {@link ProAct.Array#psome}, when it was invoked on the <i>original</i> {@link ProAct.Array}
   * @return {Function}
   *      A listener for events from the <i>original</i> {@link ProAct.Array}, updating the <i>val</i> {@link ProAct.Val} on
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
   * Generates a listener that can be attached to an {@link ProAct.Array} on which
   * the method {@link ProAct.Array#filter} is invoked.
   * <p>
   *  The result of the {@link ProAct.Array#filter} method is another {@link ProAct.Array}, dependent on the <i>original</i> one.
   * </p>
   * <p>
   *  For example if the original was:
   *  <pre>
   *    var a = new ProAct.Array([1, 3, 5]);
   *  </pre>
   *  and we invoked {@link ProAct.Array#filter} on it like this:
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
   *  The generated listener by this method does this - updates the <i>filtered</i> {@link ProAct.Array}, when the <i>original</i> changes
   *  and it does it in an optimal way.
   * </p>
   *
   * @memberof ProAct.Array.Listeners
   * @static
   * @constant
   * @param {ProAct.Array} filtered
   *      The array created as a result of invoking {@link ProAct.Array#filter} on the <i>original</i> {@link ProAct.Array}.
   * @param {ProAct.Array} original
   *      The {@link ProAct.Array} on which {@link ProAct.Array#filter} was invoked.
   * @param {Array} args
   *      The arguments passed to {@link ProAct.Array#filter}, when it was invoked on the <i>original</i> {@link ProAct.Array}
   * @return {Function}
   *      A listener for events from the <i>original</i> {@link ProAct.Array}, updating the <i>filtered</i> {@link ProAct.Array} on
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
   * Generates a listener that can be attached to an {@link ProAct.Array} on which
   * the method {@link ProAct.Array#map} is invoked.
   * <p>
   *  The result of the {@link ProAct.Array#map} method is another {@link ProAct.Array}, dependent on the <i>original</i> one.
   * </p>
   * <p>
   *  For example if the original was:
   *  <pre>
   *    var a = new ProAct.Array([1, 3, 5]);
   *  </pre>
   *  and we invoked {@link ProAct.Array#map} on it like this:
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
   *  The generated listener by this method does this - updates the <i>mapped</i> {@link ProAct.Array}, when the <i>original</i> changes
   *  and it does it in an optimal way.
   * </p>
   *
   * @memberof ProAct.Array.Listeners
   * @static
   * @constant
   * @param {ProAct.Array} mapped
   *      The array created as a result of invoking {@link ProAct.Array#map} on the <i>original</i> {@link ProAct.Array}.
   * @param {ProAct.Array} original
   *      The {@link ProAct.Array} on which {@link ProAct.Array#map} was invoked.
   * @param {Array} args
   *      The arguments passed to {@link ProAct.Array#map}, when it was invoked on the <i>original</i> {@link ProAct.Array}
   * @return {Function}
   *      A listener for events from the <i>original</i> {@link ProAct.Array}, updating the <i>mapped</i> {@link ProAct.Array} on
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
   * Generates a listener that can be attached to an {@link ProAct.Array} on which
   * the method {@link ProAct.Array#preduce} is invoked.
   * <p>
   *  The result of the {@link ProAct.Array#preduce} method is a {@link ProAct.Val}, dependent on the <i>original</i> array.
   * </p>
   * <p>
   *  For example if the original was:
   *  <pre>
   *    var a = new ProAct.Array([1, 3, 5]);
   *  </pre>
   *  and we invoked {@link ProAct.Array#preduce} on it like this:
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
   *  The generated listener by this method does this - updates the <i>val</i> {@link ProAct.Val}, when the <i>original</i> array changes
   *  and it does it in an optimal way.
   * </p>
   *
   * @memberof ProAct.Array.Listeners
   * @static
   * @constant
   * @param {ProAct.Val} val
   *      The result of invoking {@link ProAct.Array#preduce} on the <i>original</i> {@link ProAct.Array}.
   * @param {ProAct.Array} original
   *      The {@link ProAct.Array} on which {@link ProAct.Array#preduce} was invoked.
   * @param {Array} args
   *      The arguments passed to {@link ProAct.Array#preduce}, when it was invoked on the <i>original</i> {@link ProAct.Array}
   * @return {Function}
   *      A listener for events from the <i>original</i> {@link ProAct.Array}, updating the <i>val</i> {@link ProAct.Val} on
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
   * Generates a listener that can be attached to an {@link ProAct.Array} on which
   * the method {@link ProAct.Array#preduceRight} is invoked.
   * <p>
   *  The result of the {@link ProAct.Array#preduceRight} method is a {@link ProAct.Val}, dependent on the <i>original</i> array.
   * </p>
   * <p>
   *  For example if the original was:
   *  <pre>
   *    var a = new ProAct.Array([1, 3, 5]);
   *  </pre>
   *  and we invoked {@link ProAct.Array#preduceRight} on it like this:
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
   *  The generated listener by this method does this - updates the <i>val</i> {@link ProAct.Val}, when the <i>original</i> array changes
   *  and it does it in an optimal way.
   * </p>
   *
   * @memberof ProAct.Array.Listeners
   * @static
   * @constant
   * @param {ProAct.Val} val
   *      The result of invoking {@link ProAct.Array#preduceRight} on the <i>original</i> {@link ProAct.Array}.
   * @param {ProAct.Array} original
   *      The {@link ProAct.Array} on which {@link ProAct.Array#preduceRight} was invoked.
   * @param {Array} args
   *      The arguments passed to {@link ProAct.Array#preduceRight}, when it was invoked on the <i>original</i> {@link ProAct.Array}
   * @return {Function}
   *      A listener for events from the <i>original</i> {@link ProAct.Array}, updating the <i>val</i> {@link ProAct.Val} on
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
   * Generates a listener that can be attached to an {@link ProAct.Array} on which
   * the method {@link ProAct.Array#pindexOf} is invoked.
   * <p>
   *  The result of the {@link ProAct.Array#pindexOf} method is a {@link ProAct.Val}, dependent on the <i>original</i> array.
   * </p>
   * <p>
   *  For example if the original was:
   *  <pre>
   *    var a = new ProAct.Array([1, 3, 5]);
   *  </pre>
   *  and we invoked {@link ProAct.Array#pindexOf} on it like this:
   *  <pre>
   *    var val = a.pindexOf(5); // val.v is 2.
   *  </pre>
   *  The new value - <b>val</b> is dependent on <b>a</b>, so if for example we reverse <b>a</b>, <b>val</b> should be updated:
   *  <pre>
   *    a.reverse(); // val.v authomatically should become 0.
   *  </pre>
   * </p>
   * <p>
   *  The generated listener by this method does this - updates the <i>val</i> {@link ProAct.Val}, when the <i>original</i> array changes
   *  and it does it in an optimal way.
   * </p>
   *
   * @memberof ProAct.Array.Listeners
   * @static
   * @constant
   * @param {ProAct.Val} val
   *      The result of invoking {@link ProAct.Array#pindexOf} on the <i>original</i> {@link ProAct.Array}.
   * @param {ProAct.Array} original
   *      The {@link ProAct.Array} on which {@link ProAct.Array#pindexOf} was invoked.
   * @param {Array} args
   *      The arguments passed to {@link ProAct.Array#pindexOf}, when it was invoked on the <i>original</i> {@link ProAct.Array}
   * @return {Function}
   *      A listener for events from the <i>original</i> {@link ProAct.Array}, updating the <i>val</i> {@link ProAct.Val} on
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
   * Generates a listener that can be attached to an {@link ProAct.Array} on which
   * the method {@link ProAct.Array#plastIndexOf} is invoked.
   * <p>
   *  The result of the {@link ProAct.Array#plastIndexOf} method is a {@link ProAct.Val}, dependent on the <i>original</i> array.
   * </p>
   * <p>
   *  For example if the original was:
   *  <pre>
   *    var a = new ProAct.Array([5, 4, 5, 3]);
   *  </pre>
   *  and we invoked {@link ProAct.Array#plastIndexOf} on it like this:
   *  <pre>
   *    var val = a.plastIndexOf(5); // val.v is 2.
   *  </pre>
   *  The new value - <b>val</b> is dependent on <b>a</b>, so if for example we sort <b>a</b>, <b>val</b> should be updated:
   *  <pre>
   *    a.sort(); // val.v authomatically should become 3.
   *  </pre>
   * </p>
   * <p>
   *  The generated listener by this method does this - updates the <i>val</i> {@link ProAct.Val}, when the <i>original</i> array changes
   *  and it does it in an optimal way.
   * </p>
   *
   * @memberof ProAct.Array.Listeners
   * @static
   * @constant
   * @param {ProAct.Val} val
   *      The result of invoking {@link ProAct.Array#plastIndexOf} on the <i>original</i> {@link ProAct.Array}.
   * @param {ProAct.Array} original
   *      The {@link ProAct.Array} on which {@link ProAct.Array#plastIndexOf} was invoked.
   * @param {Array} args
   *      The arguments passed to {@link ProAct.Array#plastIndexOf}, when it was invoked on the <i>original</i> {@link ProAct.Array}
   * @return {Function}
   *      A listener for events from the <i>original</i> {@link ProAct.Array}, updating the <i>val</i> {@link ProAct.Val} on
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
   * Generates a listener that can be attached to an {@link ProAct.Array} on which
   * the method {@link ProAct.Array#slice} is invoked.
   * <p>
   *  The result of the {@link ProAct.Array#slice} method is another {@link ProAct.Array}, dependent on the <i>original</i> one.
   * </p>
   * <p>
   *  For example if the original was:
   *  <pre>
   *    var a = new ProAct.Array([1, 3, 5]);
   *  </pre>
   *  and we invoked {@link ProAct.Array#slice} on it like this:
   *  <pre>
   *    var b = a.slice(1); // b is [3, 5]
   *  </pre>
   *  The new array - <b>b</b> is dependent on <b>a</b>, so if for example we push to <b>a</b>, <b>b</b> should be updated:
   *  <pre>
   *    a.push(32); // b authomatically should become [3, 5, 32]
   *  </pre>
   * </p>
   * <p>
   *  The generated listener by this method does this - updates the <i>sliced</i> {@link ProAct.Array}, when the <i>original</i> changes
   *  and it does it in an optimal way.
   * </p>
   *
   * @memberof ProAct.Array.Listeners
   * @static
   * @constant
   * @param {ProAct.Array} sliced
   *      The array created as a result of invoking {@link ProAct.Array#slice} on the <i>original</i> {@link ProAct.Array}.
   * @param {ProAct.Array} original
   *      The {@link ProAct.Array} on which {@link ProAct.Array#slice} was invoked.
   * @param {Array} args
   *      The arguments passed to {@link ProAct.Array#slice}, when it was invoked on the <i>original</i> {@link ProAct.Array}
   * @return {Function}
   *      A listener for events from the <i>original</i> {@link ProAct.Array}, updating the <i>sliced</i> {@link ProAct.Array} on
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
