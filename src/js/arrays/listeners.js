Pro.Array.Listeners = pArrayLs = Pro.Array.Listeners || {
  check: function(event) {
    if (event.type !== Pro.Event.Types.array) {
      throw Error('Not implemented for non array events');
    }
  },
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
        if (Pro.Utils.isProArray(args)) {
          toAdd = args._array;
        } else {
          toAdd = args;
        }
        transformed._array = concat.apply(original._array, toAdd);
        transformed.updateByDiff(nvs);
      } else if (op === pArrayOps.splice) {
        pArrayProto.splice.apply(transformed, [ind, ov.length].concat(nv));
      }
    };
  },
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
        transformed._array = concat.apply(original._array, right._array);
        transformed.updateByDiff(nvs);
      } else if (op === pArrayOps.splice) {
        pArrayProto.splice.apply(transformed, [ind + oln, ov.length].concat(nv));
      }
    };
  },
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
  filter: function (filtered, original, args) {
    var fun = args[0], thisArg = args[1];
    return function (event) {
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
        sliced._array = slice.apply(original._array, args);
        sliced.updateByDiff(osl);
      }
    };
  }
};
