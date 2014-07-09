'use strict';

describe('Pro.Array', function () {
  it('is array-like object', function () {
    var array = new Pro.Array(3, 4, 5, 4), ind,
        transformedArray, result;

    expect(array.length).toBe(4);
    expect(array.concat(6, 7).length).toBe(6);
    expect(array.every(function (el) { return typeof(el) === 'number';})).toBe(true);
    expect(array.every(function (el) { return el % 2 === 0;})).toBe(false);
    expect(array.some(function (el) { return typeof(el) === 'number';})).toBe(true);
    expect(array.some(function (el) { return el % 2 === 0;})).toBe(true);
    expect(array.filter(function (el) { return el % 2 === 0;}).length).toBe(2);
    expect(array.indexOf(4)).toBe(1);
    expect(array.indexOf(4, 2)).toBe(3);
    expect(array.indexOf(3, 2)).toBe(-1);
    expect(array.lastIndexOf(4)).toBe(3);
    expect(array.join(',')).toEqual('3,4,5,4');
    expect(array.toString()).toEqual(array._array.toString());

    ind = 0;
    array.forEach(function (el, i, arr) {
      expect(typeof(el)).toEqual('number');
      expect(el).toEqual(array._array[i]);
      expect(i).toEqual(ind);
      expect(arr).toBe(array._array);

      ind++;
    });

    ind = 0;
    transformedArray = array.map(function (el, i, arr) {
      expect(typeof(el)).toEqual('number');
      expect(el).toEqual(array._array[i]);
      expect(i).toEqual(ind);
      expect(arr).toBe(array._array);

      ind++;
      return el*el;
    });
    expect(transformedArray.length).toBe(4);
    expect(transformedArray.indexOf(9)).toBe(0);

    // Terminate relations...
    array.indexListeners = [];
    array.lengthListeners = [];

    ind = 1;
    result = array.reduce(function (curr, el, i, arr) {
      expect(typeof(el)).toEqual('number');
      expect(el).toEqual(array._array[i]);
      expect(i).toEqual(ind);
      expect(arr).toBe(array._array);

      ind++;
      return curr + el;
    });
    expect(result).toBe(16);

    ind = array.length - 1;
    result = array.reduceRight(function (curr, el, i, arr) {
      expect(typeof(el)).toEqual('number');
      expect(el).toEqual(array._array[i]);
      expect(i).toEqual(ind);
      expect(arr).toBe(array._array);

      ind--;
      return curr + el;
    }, 0);
    expect(result).toBe(16);

    expect(array.pop()).toBe(4);
    expect(array.length).toBe(3);
    expect(array.lastIndexOf(4)).toBe(1);

    array.push(4);
    expect(array.length).toBe(4);
    expect(array.lastIndexOf(4)).toBe(3);
    array.push(7, 8);
    expect(array.length).toBe(6);
    expect(array.indexOf(7)).toBe(4);
    expect(array.indexOf(8)).toBe(5);

    array.reverse();
    expect(array.indexOf(8)).toBe(0);
    expect(array.indexOf(3)).toBe(5);

    expect(array.shift()).toBe(8);
    expect(array.length).toBe(5);
    expect(array.lastIndexOf(8)).toBe(-1);

    transformedArray = array.slice(1, 3);
    expect(array.length).toBe(5);
    expect(transformedArray.length).toBe(2);
    transformedArray.push(9);
    expect(transformedArray.length).toBe(3);

    array.sort();
    expect(array.indexOf(7)).toBe(4);
    expect(array.indexOf(3)).toBe(0);

    result = array.splice(1, 2, 'four');
    expect(array.length).toBe(4);
    expect(array.indexOf('four')).toBe(1);
    expect(result.length).toBe(2);
    expect(result.indexOf(4)).toBe(0);
    expect(result.lastIndexOf(4)).toBe(1);

    expect(array instanceof Array).toBe(true);
    expect(Pro.Utils.isArrayObject(array)).toBe(true);
    expect(Pro.Utils.isProArray(array)).toBe(true);
    expect(Pro.Utils.isArray(array)).toBe(false);
  });

  it('is observable by index', function () {
    var array = new Pro.Array(1, 2, 3, 4, 5),
        op, i, ov, nv;

    array.on('indexChange', function (event) {
      op = event.args[0];
      i = event.args[1];
      ov = event.args[2];
      nv = event.args[3];
    });

    array[0] = 33;
    expect(array[0]).toBe(33);
    expect(op).toBe(Pro.Array.Operations.set);
    expect(i).toBe(0);
    expect(ov).toBe(1);
    expect(nv).toBe(33);

    array[2] = 35;
    expect(array[2]).toBe(35);
    expect(op).toBe(Pro.Array.Operations.set);
    expect(i).toBe(2);
    expect(ov).toBe(3);
    expect(nv).toBe(35);
  });

  it('it adds index listener on index get', function () {
    var array = new Pro.Array(1, 2, 3, 4, 5),
        op, i, ov, nv,
        callTimes = 0;

    Pro.currentCaller = function (event) {
      op = event.args[0];
      i = event.args[1];
      ov = event.args[2];
      nv = event.args[3];

      callTimes = callTimes + 1;
    };
    array[0];
    array[1];
    array[2];
    Pro.currentCaller = null;

    array[0] = 33;
    expect(array[0]).toBe(33);
    expect(op).toBe(Pro.Array.Operations.set);
    expect(i).toBe(0);
    expect(ov).toBe(1);
    expect(nv).toBe(33);

    array[1] = 43;
    expect(array[1]).toBe(43);
    expect(op).toBe(Pro.Array.Operations.set);
    expect(i).toBe(1);
    expect(ov).toBe(2);
    expect(nv).toBe(43);

    array[2] = 35;
    expect(array[2]).toBe(35);
    expect(op).toBe(Pro.Array.Operations.set);
    expect(i).toBe(2);
    expect(ov).toBe(3);
    expect(nv).toBe(35);

    expect(callTimes).toBe(3);
  });

  it('updates properties depending on it by index', function () {
    var array = new Pro.Array(1, 2, 3, 4, 5),
        obj = {
          prop: function () {
            return array[1] + array[2];
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toBe(array[1] + array[2]);

    array[1] = 0;
    expect(obj.prop).toBe(3);

    array[2] = 30;
    expect(obj.prop).toBe(30);
  });

  it('updates properties depending on it by length', function () {
    var array = new Pro.Array(1, 2, 3, 4, 5),
        obj = {
          prop: function () {
            return array.length;
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toBe(array.length);

    array.length = 10;
    expect(obj.prop).toBe(10);

    array.length = 0;
    expect(obj.prop).toBe(0);
  });

  describe('#concat', function () {
    it('returns a Pro.Array instance', function () {
      var array = new Pro.Array(1, 2, 3, 4, 5),
          res = array.concat(6, 7);

      expect(Pro.Utils.isProArray(res)).toBe(true);
      expect(res.valueOf()).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('updates properties depending on it', function () {
      var array = new Pro.Array(1, 2, 3, 4, 5),
          obj = {
            prop: function () {
              return array.concat(6, 7, 8, 9);
            }
          },
          property = new Pro.AutoProperty(obj, 'prop');

      expect(obj.prop.valueOf()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);

      array[0] = 10;
      expect(obj.prop.valueOf()).toEqual([10, 2, 3, 4, 5, 6, 7, 8, 9]);

      array.length = 1;
      expect(obj.prop).toEqual(array.concat(6, 7, 8, 9));

      array.push(200);
      expect(obj.prop.toArray()).toEqual(array.concat(6, 7, 8, 9).toArray());

      array.pop();
      expect(obj.prop).toEqual(array.concat(6, 7, 8, 9));
    });

    it('the returned Pro.Array depends on the original one', function () {
      var array = new Pro.Array(1, 2, 3, 4, 5),
          res = array.concat(6, 7);

      array[2] = -3;
      expect(res.toArray()).toEqual([1, 2, -3, 4, 5, 6, 7]);

      array.push(8);
      expect(res.toArray()).toEqual([1, 2, -3, 4, 5, 8, 6, 7]);

      array.unshift(-1, 0);
      expect(res.toArray()).toEqual([-1, 0, 1, 2, -3, 4, 5, 8, 6, 7]);

      array.pop();
      expect(res.toArray()).toEqual([-1, 0, 1, 2, -3, 4, 5, 6, 7]);

      array.shift();
      expect(res.toArray()).toEqual([0, 1, 2, -3, 4, 5, 6, 7]);

      array.length = 3;
      expect(res.toArray()).toEqual([0, 1, 2, 6, 7]);

      array.length = 6;
      expect(res.toArray()).toEqual([0, 1, 2, undefined, undefined, undefined, 6, 7]);

      array.splice(3, 3);
      expect(res.toArray()).toEqual([0, 1, 2, 6, 7]);

      array.reverse();
      expect(res.toArray()).toEqual([2, 1, 0, 6, 7]);

      array.sort();
      expect(res.toArray()).toEqual([0, 1, 2, 6, 7]);

      array.splice(2, 14, 4, 5);
      expect(res.toArray()).toEqual([0, 1, 4, 5, 6, 7]);
    });

    it('the returned result depends on the argument if the argument is a Pro.Array too', function () {
      var array1 = new Pro.Array(1, 2, 3, 4, 5),
          array2 = new Pro.Array(6, 7, 8, 9, 10),
          res = array1.concat(array2);

      expect(res.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

      array2[2] = 18;
      expect(res.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 18, 9, 10]);

      array2[4] = 1;
      array1[3] = 7;
      expect(res.toArray()).toEqual([1, 2, 3, 7, 5, 6, 7, 18, 9, 1]);

      array1.push(5.5);
      array2.push(2, 3);
      expect(res.toArray()).toEqual([1, 2, 3, 7, 5, 5.5, 6, 7, 18, 9, 1, 2, 3]);

      array1.unshift(0);
      array2.unshift(4, 5);
      expect(res.toArray()).toEqual([0, 1, 2, 3, 7, 5, 5.5, 4, 5, 6, 7, 18, 9, 1, 2, 3]);

      array2.pop();
      array1.pop();
      array2.pop();
      expect(res.toArray()).toEqual([0, 1, 2, 3, 7, 5, 4, 5, 6, 7, 18, 9, 1]);

      array2.shift();
      array1.pop();
      array1.pop();
      array2.shift();
      array1.shift();
      expect(res.toArray()).toEqual([1, 2, 3, 6, 7, 18, 9, 1]);

      array2.length = 2;
      array1.length = 2;
      expect(res.toArray()).toEqual([1, 2, 6, 7]);

      array2.reverse();
      array1.reverse();
      expect(res.toArray()).toEqual([2, 1, 7, 6]);

      array1.sort();
      array2.sort();
      expect(res.toArray()).toEqual([1, 2, 6, 7]);

      array2.splice(0, 1, 3, 4, 5, 6);
      array1.splice(2, 0, 3, 4);
      array2.splice(1, 1, 3);
      array2.splice(1, 2, 4);
      array2.splice(0, 2, 5);
      expect(res.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });
  });

  describe('#every & #pevery', function () {
    it('updates properties depending on #every', function () {
      var array = new Pro.Array(2, 4, 6, 8, 10),
          obj = {
            prop: function () {
              return array.every(function (el) {
                return el % 2 === 0;
              });
            }
          },
          property = new Pro.AutoProperty(obj, 'prop');

      expect(obj.prop).toEqual(true);

      array[0] = 1;
      expect(obj.prop).toEqual(false);
      array[0] = 12;
      expect(obj.prop).toEqual(true);

      array.unshift(13);
      expect(obj.prop).toEqual(false);

      array.shift();
      expect(obj.prop).toEqual(true);
    });

    describe('#pevery', function () {
      it('returns pro value', function () {
        var array = new Pro.Array(1, 2, 3, 4, 5),
            every = array.pevery(function (el) {
              return typeof(el) === 'number';
            });

        expect(Pro.Utils.isProVal(every)).toBe(true);
        expect(every.valueOf()).toBe(true);
      });

      it('on list changes the produced value is updated', function () {
        var array = new Pro.Array(1, 2, 3, 4, 5),
            every = array.pevery(function (el) {
              return typeof(el) === 'number';
            });

        expect(every.valueOf()).toBe(true);

        array[2] = '3';
        expect(every.valueOf()).toBe(false);

        array[0] = '1';
        expect(every.valueOf()).toBe(false);

        array[0] = 1;
        array[2] = 3;
        expect(every.valueOf()).toBe(true);

        array.push(6, 7, 8);
        expect(every.valueOf()).toBe(true);
        array.push('9', 10);
        expect(every.valueOf()).toBe(false);

        array.pop();
        expect(every.valueOf()).toBe(false);
        array.pop();
        expect(every.valueOf()).toBe(true);
        array.pop();
        expect(every.valueOf()).toBe(true);

        array[4] = 'wow';
        expect(every.valueOf()).toBe(false);
        array.length = 3;
        expect(every.valueOf()).toBe(true);

        array.splice(0, 1);
        expect(every.valueOf()).toBe(true);

        array.splice(1, 1, 2, '3', 4);
        expect(every.valueOf()).toBe(false);

        array.splice(2, 2, 2, 2, 2);
        expect(every.valueOf()).toBe(true);
      });
    });
  });

  describe('#some & #psome', function () {
    it('updates properties depending on #some', function () {
      var array = new Pro.Array(2, 4, 5, 9, 10),
          obj = {
            prop: function () {
              return array.some(function (el) {
                return el % 3 === 0;
              });
            }
          },
          property = new Pro.AutoProperty(obj, 'prop');

      expect(obj.prop).toEqual(true);

      array[3] = 10;
      expect(obj.prop).toEqual(false);

      array.unshift(12);
      expect(obj.prop).toEqual(true);
    });

    describe('#psome', function () {
      it('returns pro value', function () {
        var array = new Pro.Array(1, 2, 3, 4, '5'),
            every = array.psome(function (el) {
              return typeof(el) === 'number';
            });

        expect(Pro.Utils.isProVal(every)).toBe(true);
        expect(every.valueOf()).toBe(true);
      });

      it('on list changes the produced value is updated', function () {
        var array = new Pro.Array(1, '2', '3', '4', '5'),
            some = array.psome(function (el) {
              return typeof(el) === 'number';
            });

        expect(some.valueOf()).toBe(true);

        array[0] = '1';
        expect(some.valueOf()).toBe(false);
        array[3] = 4;
        expect(some.valueOf()).toBe(true);
        array[3] = '4';
        expect(some.valueOf()).toBe(false);

        array.push(6);
        expect(some.valueOf()).toBe(true);
        array[5] = '6';
        expect(some.valueOf()).toBe(false);
        array.unshift(0);
        expect(some.valueOf()).toBe(true);

        array.shift();
        expect(some.valueOf()).toBe(false);
        array[5] = 6;
        expect(some.valueOf()).toBe(true);
        array.pop();
        expect(some.valueOf()).toBe(false);

        array[4] = 5;
        expect(some.valueOf()).toBe(true);
        array.length = 2;
        expect(some.valueOf()).toBe(false);

        array.splice(1, 1, 2);
        expect(some.valueOf()).toBe(true);
        array.splice(0, 1, '0', '1');
        expect(some.valueOf()).toBe(true);
        array.splice(2, 1, '2', 3);
        expect(some.valueOf()).toBe(true);
        array.splice(3, 1, '3');
        expect(some.valueOf()).toBe(false);
      });
    });

  });

  it('updates properties depending on #forEach', function () {
    var array = new Pro.Array(3, 5, 4),
        obj = {
          prop: function () {
            var sum = 0;
            array.forEach(function (el) {
              sum += el * el;
            });
            return sum;
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toEqual(50);

    array[1] = 0;
    expect(obj.prop).toEqual(25);

    array.pop();
    expect(obj.prop).toEqual(9);

    array.length = 0;
    expect(obj.prop).toEqual(0);
  });

  describe('#filter', function () {
    it('creates a new Pro.Array dependable on the original', function () {
      var array = new Pro.Array(1, 2, 3, 4), filtered;

      filtered = array.filter(function (el) {
        return (el % 2) === 0;
      });

      expect(Pro.Utils.isProArray(filtered)).toBe(true);
      expect(filtered.toArray()).toEqual([2, 4]);

      array[0] = -2;
      expect(filtered.toArray()).toEqual([-2, 2, 4]);

      array[3] = 6;
      expect(filtered.toArray()).toEqual([-2, 2, 6]);

      array.unshift(-6, -5, -4, -3);
      expect(filtered.toArray()).toEqual([-6, -4, -2, 2, 6]);

      array.push(8, 9);
      expect(filtered.toArray()).toEqual([-6, -4, -2, 2, 6, 8]);

      array.shift();
      array.shift();
      expect(filtered.toArray()).toEqual([-4, -2, 2, 6, 8]);

      array.pop();
      array.pop();
      expect(filtered.toArray()).toEqual([-4, -2, 2, 6]);

      array.length = 2;
      expect(filtered.toArray()).toEqual([-4]);

      array.push(-1, 0, 1, 2, 3, 4, 5);
      expect(filtered.toArray()).toEqual([-4, 0, 2, 4]);

      array.reverse();
      expect(filtered.toArray()).toEqual([4, 2, 0, -4]);

      array.sort(function (el1, el2) {
        if (el1 < el2) {
          return -1;
        }
        if (el1 > el2) {
          return 1;
        }
        return 0;
      });
      expect(filtered.toArray()).toEqual([-4, 0, 2, 4]);

      array.splice(3, 2, 1, 2, 3);
      expect(filtered.toArray()).toEqual([-4, 2, 2, 4]);

      array.splice(0, 3);
      expect(filtered.toArray()).toEqual([2, 2, 4]);

      array.splice(3, 3);
      expect(filtered.toArray()).toEqual([2]);
    });

    it('updates depending properties', function () {
      var array = new Pro.Array(2, '4', 5, '9', 10),
          obj = {
            prop: function () {
              return array.filter(function (el) {
                return typeof(el) === 'string';
              });
            }
          },
          property = new Pro.AutoProperty(obj, 'prop');

      expect(obj.prop.toArray()).toEqual(['4', '9']);

      array[0] = '2';
      expect(obj.prop.toArray()).toEqual(['2', '4', '9']);

      array.shift();
      expect(obj.prop.toArray()).toEqual(['4', '9']);
    });

    it ('supports chain filtering', function () {
      var a1 = new Pro.Array('true', 'detective', 'yellow', 'king', 'Carcosa', 'death', 'scarred'),
          a2, a3, a4;

      a2 = a1.filter(function (el) {
        return el && (el.indexOf('e') !== -1 || el.indexOf('a') !== -1);
      });
      a3 = a2.filter(function (el) {
        return el && el.indexOf('a') !== -1;
      });
      a4 = a3.filter(function (el) {
        return el && el.indexOf('c') !== -1;
      });

      expect(a2.toArray()).toEqual(['true', 'detective', 'yellow', 'Carcosa', 'death', 'scarred']);
      expect(a3.toArray()).toEqual(['Carcosa', 'death', 'scarred']);
      expect(a4.toArray()).toEqual(['Carcosa', 'scarred']);

      a1[3] = 'black';
      expect(a2.toArray()).toEqual(['true', 'detective', 'yellow', 'black', 'Carcosa', 'death', 'scarred']);
      expect(a3.toArray()).toEqual(['black', 'Carcosa', 'death', 'scarred']);
      expect(a4.toArray()).toEqual(['black', 'Carcosa', 'scarred']);

      a1[0] = 'king';
      expect(a2.toArray()).toEqual(['detective', 'yellow', 'black', 'Carcosa', 'death', 'scarred']);
      expect(a3.toArray()).toEqual(['black', 'Carcosa', 'death', 'scarred']);
      expect(a4.toArray()).toEqual(['black', 'Carcosa', 'scarred']);

      a1[2] = 'yellow art';
      expect(a2.toArray()).toEqual(['detective', 'yellow art', 'black', 'Carcosa', 'death', 'scarred']);
      expect(a3.toArray()).toEqual(['yellow art', 'black', 'Carcosa', 'death', 'scarred']);
      expect(a4.toArray()).toEqual(['black', 'Carcosa', 'scarred']);

      a1.push('Marty', 'Rust', 'Hart & Cohle')
      expect(a2.toArray()).toEqual(['detective', 'yellow art', 'black', 'Carcosa', 'death', 'scarred', 'Marty', 'Hart & Cohle']);
      expect(a3.toArray()).toEqual(['yellow art', 'black', 'Carcosa', 'death', 'scarred', 'Marty', 'Hart & Cohle']);
      expect(a4.toArray()).toEqual(['black', 'Carcosa', 'scarred']);

      a1.unshift('poems', 'killer', 'Carcosa again');
      expect(a2.toArray()).toEqual(['poems', 'killer', 'Carcosa again', 'detective', 'yellow art', 'black', 'Carcosa', 'death', 'scarred', 'Marty', 'Hart & Cohle']);
      expect(a3.toArray()).toEqual(['Carcosa again', 'yellow art', 'black', 'Carcosa', 'death', 'scarred', 'Marty', 'Hart & Cohle']);
      expect(a4.toArray()).toEqual(['Carcosa again', 'black', 'Carcosa', 'scarred']);

      a1.pop();
      expect(a2.toArray()).toEqual(['poems', 'killer', 'Carcosa again', 'detective', 'yellow art', 'black', 'Carcosa', 'death', 'scarred', 'Marty']);
      expect(a3.toArray()).toEqual(['Carcosa again', 'yellow art', 'black', 'Carcosa', 'death', 'scarred', 'Marty']);
      expect(a4.toArray()).toEqual(['Carcosa again', 'black', 'Carcosa', 'scarred']);

      a1.shift();
      expect(a2.toArray()).toEqual(['killer', 'Carcosa again', 'detective', 'yellow art', 'black', 'Carcosa', 'death', 'scarred', 'Marty']);
      expect(a3.toArray()).toEqual(['Carcosa again', 'yellow art', 'black', 'Carcosa', 'death', 'scarred', 'Marty']);
      expect(a4.toArray()).toEqual(['Carcosa again', 'black', 'Carcosa', 'scarred']);

      a1.shift();
      expect(a2.toArray()).toEqual(['Carcosa again', 'detective', 'yellow art', 'black', 'Carcosa', 'death', 'scarred', 'Marty']);
      expect(a3.toArray()).toEqual(['Carcosa again', 'yellow art', 'black', 'Carcosa', 'death', 'scarred', 'Marty']);
      expect(a4.toArray()).toEqual(['Carcosa again', 'black', 'Carcosa', 'scarred']);

      a1.shift();
      expect(a2.toArray()).toEqual(['detective', 'yellow art', 'black', 'Carcosa', 'death', 'scarred', 'Marty']);
      expect(a3.toArray()).toEqual(['yellow art', 'black', 'Carcosa', 'death', 'scarred', 'Marty']);
      expect(a4.toArray()).toEqual(['black', 'Carcosa', 'scarred']);

      a1.length = 5;
      expect(a2.toArray()).toEqual(['detective', 'yellow art', 'black', 'Carcosa']);
      expect(a3.toArray()).toEqual(['yellow art', 'black', 'Carcosa']);
      expect(a4.toArray()).toEqual(['black', 'Carcosa']);

      a1.reverse();
      expect(a2.toArray()).toEqual(['detective', 'yellow art', 'black', 'Carcosa'].reverse());
      expect(a3.toArray()).toEqual(['yellow art', 'black', 'Carcosa'].reverse());
      expect(a4.toArray()).toEqual(['black', 'Carcosa'].reverse());

      a1.sort();
      expect(a2.toArray()).toEqual(['Carcosa', 'black', 'detective', 'yellow art']);
      expect(a3.toArray()).toEqual(['Carcosa', 'black', 'yellow art']);
      expect(a4.toArray()).toEqual(['Carcosa', 'black']);

      a1.splice(2, 2, 'meadow');
      expect(a2.toArray()).toEqual(['Carcosa', 'black', 'meadow', 'yellow art']);
      expect(a3.toArray()).toEqual(['Carcosa', 'black', 'meadow', 'yellow art']);
      expect(a4.toArray()).toEqual(['Carcosa', 'black']);
    });
  });

  describe('#map', function () {
    it('creates a new Pro.Array dependable on the original', function () {
      var array = new Pro.Array(1, 2, 3), mapped;

      mapped = array.map(function (el, i, arr) {
        return el + el;
      });

      expect(Pro.Utils.isProArray(mapped)).toBe(true);
      expect(mapped.toArray()).toEqual([2, 4, 6]);

      array[0] = 0;
      expect(mapped.toArray()).toEqual([0, 4, 6]);

      array.unshift(-2, -1);
      expect(mapped.toArray()).toEqual([-4, -2, 0, 4, 6]);

      array.push(4, 5);
      expect(mapped.toArray()).toEqual([-4, -2, 0, 4, 6, 8, 10]);

      array.shift();
      expect(mapped.toArray()).toEqual([-2, 0, 4, 6, 8, 10]);

      array.pop();
      expect(mapped.toArray()).toEqual([-2, 0, 4, 6, 8]);

      array.length = 1;
      expect(mapped.toArray()).toEqual([-2]);

      array.push(0, 1, 2, 3, 4, 5, 6);
      expect(mapped.toArray()).toEqual([-2, 0, 2, 4, 6, 8, 10, 12]);

      array.reverse();
      expect(mapped.toArray()).toEqual([12, 10, 8, 6, 4, 2, 0, -2]);

      array.sort(function (el1, el2) {
        if (el1 < el2) {
          return -1;
        }
        if (el1 > el2) {
          return 1;
        }
        return 0;
      });
      expect(mapped.toArray()).toEqual([-2, 0, 2, 4, 6, 8, 10, 12]);

      array.splice(3, 2, 1, 2, 3);
      expect(mapped.toArray()).toEqual([-2, 0, 2, 2, 4, 6, 8, 10, 12]);

      array.splice(0, 3);
      expect(mapped.toArray()).toEqual([2, 4, 6, 8, 10, 12]);

      array.splice(3, 3);
      expect(mapped.toArray()).toEqual([2, 4, 6]);
    });

    it('updates properties depending on #map', function () {
      var array = new Pro.Array(3, 5, 4),
          obj = {
            prop: function () {
              return array.map(function (el) {
                return el * el;
              });
            }
          },
          property = new Pro.AutoProperty(obj, 'prop');

      expect(obj.prop.valueOf()).toEqual([9, 25, 16].valueOf());

      array[1] = 2;
      expect(obj.prop.valueOf()).toEqual([9, 4, 16].valueOf());

      array.push(1);
      expect(obj.prop.valueOf()).toEqual([9, 4, 16, 1].valueOf());
    });

    it('chain mapping works', function () {
      var a1 = new Pro.Array(1, 2, 3, 4, 5),
          a2, a3, a4;

      a2 = a1.map(function (el) {
        return el * 2;
      });
      expect(a2.toArray()).toEqual([2, 4, 6, 8, 10]);

      a3 = a2.map(function (el) {
        return el - 2;
      });
      expect(a3.toArray()).toEqual([0, 2, 4, 6, 8]);

      a4 = a3.map(function (el) {
        return el * 3;
      });

      expect(a4.toArray()).toEqual([0, 6, 12, 18, 24]);

      a1[0] = 6;
      expect(a2.toArray()).toEqual([12, 4, 6, 8, 10]);
      expect(a3.toArray()).toEqual([10, 2, 4, 6, 8]);
      expect(a4.toArray()).toEqual([30, 6, 12, 18, 24]);

      a1.push(1);
      expect(a2.toArray()).toEqual([12, 4, 6, 8, 10, 2]);
      expect(a3.toArray()).toEqual([10, 2, 4, 6, 8, 0]);
      expect(a4.toArray()).toEqual([30, 6, 12, 18, 24, 0]);

      a1.shift();
      expect(a2.toArray()).toEqual([4, 6, 8, 10, 2]);
      expect(a3.toArray()).toEqual([2, 4, 6, 8, 0]);
      expect(a4.toArray()).toEqual([6, 12, 18, 24, 0]);

      a1.sort(function (el1, el2) {
        if (el1 < el2) {
          return -1;
        }
        if (el1 > el2) {
          return 1;
        }
        return 0;
      });
      expect(a2.toArray()).toEqual([2, 4, 6, 8, 10]);
      expect(a3.toArray()).toEqual([0, 2, 4, 6, 8]);
      expect(a4.toArray()).toEqual([0, 6, 12, 18, 24]);

      a1.splice(2, 3, 1, 0, -1);
      expect(a2.toArray()).toEqual([2, 4, 2, 0, -2]);
      expect(a3.toArray()).toEqual([0, 2, 0, -2, -4]);
      expect(a4.toArray()).toEqual([0, 6, 0, -6, -12]);

      a1.unshift(-1, 0);
      expect(a2.toArray()).toEqual([-2, 0, 2, 4, 2, 0, -2]);
      expect(a3.toArray()).toEqual([-4, -2, 0, 2, 0, -2, -4]);
      expect(a4.toArray()).toEqual([-12, -6, 0, 6, 0, -6, -12]);
    });
  });

  describe('#reduce & #preduce', function () {
    it('updates properties depending on #reduce', function () {
      var array = new Pro.Array(3, 5, 4),
          obj = {
            prop: function () {
              return array.reduce(function (sum, el2) {
                return (sum + (el2 * el2));
              }, 0);
            }
          },
          property = new Pro.AutoProperty(obj, 'prop');

      expect(obj.prop).toEqual(50);

      array[1] = 0;
      expect(obj.prop).toEqual(25);

      array.pop();
      expect(obj.prop).toEqual(9);

      array.length = 0;
      expect(obj.prop).toEqual(0);
    });

    describe('#preduce', function () {
      it('returns pro value', function () {
        var array = new Pro.Array(1, 2, 3, 4, 5),
            val = array.preduce(function (i, el) {
              return i + el;
            }, 0);

        expect(Pro.Utils.isProVal(val)).toBe(true);
        expect(val.valueOf()).toBe(15);
      });

      it('on list changes the produced value is updated', function () {
        var array = new Pro.Array('b', 'a', 'h', 'a', 'm', 'a'),
            val = array.preduce(function (pel, el) {
              return pel + '-' + el;
            });

        expect(val.valueOf()).toEqual('b-a-h-a-m-a');

        array[0] = 'm';
        expect(val.valueOf()).toEqual('m-a-h-a-m-a');

        array.push('i');
        expect(val.valueOf()).toEqual('m-a-h-a-m-a-i');

        array.unshift('h');
        expect(val.valueOf()).toEqual('h-m-a-h-a-m-a-i');

        array.pop();
        expect(val.valueOf()).toEqual('h-m-a-h-a-m-a');

        array.shift();
        expect(val.valueOf()).toEqual('m-a-h-a-m-a');

        array.length = 3;
        expect(val.valueOf()).toEqual('m-a-h');

        array.reverse();
        expect(val.valueOf()).toEqual('h-a-m');

        array.sort();
        expect(val.valueOf()).toEqual('a-h-m');

        array.splice(1, 1, 'l', 'a', 'b', 'a');
        expect(val.valueOf()).toEqual('a-l-a-b-a-m');

        array.splice(6, 0, 'a', 's');
        expect(val.valueOf()).toEqual('a-l-a-b-a-m-a-s');
      });
    });
  });

  describe('#reduceRight & #preduceRight', function () {
    it('updates properties depending on #reduceRight', function () {
      var array = new Pro.Array(3, 5, 4),
          obj = {
            prop: function () {
              return array.reduceRight(function (sum, el2) {
                return (sum + (el2 * el2));
              }, 0);
            }
          },
          property = new Pro.AutoProperty(obj, 'prop');

      expect(obj.prop).toEqual(50);

      array[1] = 0;
      expect(obj.prop).toEqual(25);

      array.pop();
      expect(obj.prop).toEqual(9);

      array.length = 0;
      expect(obj.prop).toEqual(0);
    });

    describe('#preduceRight', function () {
      it('returns pro value', function () {
        var array = new Pro.Array(1, 2, 3, 4, 5),
            val = array.preduceRight(function (i, el) {
              return i + el;
            }, 0);

        expect(Pro.Utils.isProVal(val)).toBe(true);
        expect(val.valueOf()).toBe(15);
      });

      it('on list changes the produced value is updated', function () {
        var array = new Pro.Array('b', 'a', 'h', 'a', 'm', 'a'),
            val = array.preduceRight(function (pel, el) {
              return pel + '-' + el;
            });

        expect(val.valueOf()).toEqual('a-m-a-h-a-b');

        array[0] = 'm';
        expect(val.valueOf()).toEqual('a-m-a-h-a-m');

        array.push('i');
        expect(val.valueOf()).toEqual('i-a-m-a-h-a-m');

        array.unshift('h');
        expect(val.valueOf()).toEqual('i-a-m-a-h-a-m-h');

        array.pop();
        expect(val.valueOf()).toEqual('a-m-a-h-a-m-h');

        array.shift();
        expect(val.valueOf()).toEqual('a-m-a-h-a-m');

        array.length = 3;
        expect(val.valueOf()).toEqual('h-a-m');

        array.reverse();
        expect(val.valueOf()).toEqual('m-a-h');

        array.sort();
        expect(val.valueOf()).toEqual('m-h-a');

        array.splice(1, 1, 'l', 'a', 'b', 'a');
        expect(val.valueOf()).toEqual('m-a-b-a-l-a');

        array.splice(0, 0, 'a', 's');
        expect(val.valueOf()).toEqual('m-a-b-a-l-a-s-a');
      });
    });
  });

  describe('#indexOf & #pindexof', function () {
    it('updates properties depending on #indexOf', function () {
      var array = new Pro.Array(3, 5, 4),
          obj = {
            prop: function () {
              return array.indexOf(3);
            }
          },
          property = new Pro.AutoProperty(obj, 'prop');

      expect(obj.prop).toEqual(0);

      array[0] = 0;
      expect(obj.prop).toEqual(-1);

      array.push(3);
      expect(obj.prop).toEqual(3);

      array.length = 0;
      expect(obj.prop).toEqual(-1);
    });

    describe('#pindexOf', function () {
      it('returns pro value', function () {
        var array = new Pro.Array(1, 2, 3, 4, 5),
            val = array.pindexOf(5);

        expect(Pro.Utils.isProVal(val)).toBe(true);
        expect(val.valueOf()).toBe(4);
      });

      it('on list changes the produced value is updated', function () {
        var array = new Pro.Array('a', 'b', 'c'),
            val = array.pindexOf('b'),
            fval = array.pindexOf('b', 2);

        expect(val.valueOf()).toBe(1);
        expect(fval.valueOf()).toBe(-1);

        array[1] = 'B';
        expect(val.valueOf()).toBe(-1);
        expect(fval.valueOf()).toBe(-1);

        array.push('d', 'b');
        expect(val.valueOf()).toBe(4);
        expect(fval.valueOf()).toBe(4);
        array[1] = 'b';
        expect(val.valueOf()).toBe(1);
        expect(fval.valueOf()).toBe(4);
        array[1] = 'B';
        expect(val.valueOf()).toBe(4);
        expect(fval.valueOf()).toBe(4);

        array.unshift('8', '9');
        expect(val.valueOf()).toBe(6);
        expect(fval.valueOf()).toBe(6);

        array.unshift('6', 'b', '7');
        expect(val.valueOf()).toBe(1);
        expect(fval.valueOf()).toBe(9);

        array.shift();
        expect(val.valueOf()).toBe(0);
        expect(fval.valueOf()).toBe(8);
        array.shift();
        expect(val.valueOf()).toBe(7);
        expect(fval.valueOf()).toBe(7);

        array.pop();
        expect(val.valueOf()).toBe(-1);
        expect(fval.valueOf()).toBe(-1);

        array[4] = 'b';
        expect(val.valueOf()).toBe(4);
        expect(fval.valueOf()).toBe(4);
        array.length = 5;
        expect(val.valueOf()).toBe(4);
        expect(fval.valueOf()).toBe(4);
        array.length = 4;
        expect(val.valueOf()).toBe(-1);
        expect(fval.valueOf()).toBe(-1);
        array[1] = 'b';
        expect(val.valueOf()).toBe(1);
        expect(fval.valueOf()).toBe(-1);

        array.reverse();
        expect(val.valueOf()).toBe(2);
        expect(fval.valueOf()).toBe(2);

        array.sort();
        expect(val.valueOf()).toBe(3);
        expect(fval.valueOf()).toBe(3);

        array.splice(3, 1, 'B', 'c');
        expect(val.valueOf()).toBe(-1);
        expect(fval.valueOf()).toBe(-1);

        array.splice(1, 3, 'a', 'b');
        expect(val.valueOf()).toBe(2);
        expect(fval.valueOf()).toBe(2);

        array.splice(1, 0, '8', '9');
        expect(val.valueOf()).toBe(4);
        expect(fval.valueOf()).toBe(4);

        array.splice(1, 1, 'b');
        expect(val.valueOf()).toBe(1);
        expect(fval.valueOf()).toBe(4);

        array.splice(0, 2);
        expect(val.valueOf()).toBe(2);
        expect(fval.valueOf()).toBe(2);
        array.splice(0, 1);
        expect(val.valueOf()).toBe(1);
        expect(fval.valueOf()).toBe(-1);
        array.splice(0, 2);
        expect(val.valueOf()).toBe(-1);
        expect(fval.valueOf()).toBe(-1);
      });
    });

  });

  describe('#lastIndexOf and plastindexOf', function () {
    it('updates properties depending on #lastIndexOf', function () {
      var array = new Pro.Array(3, 5, 4),
          obj = {
            prop: function () {
              return array.lastIndexOf(3);
            }
          },
          property = new Pro.AutoProperty(obj, 'prop');

      expect(obj.prop).toEqual(0);

      array[2] = 3;
      expect(obj.prop).toEqual(2);

      array.push(3);
      expect(obj.prop).toEqual(3);

      array.pop();
      expect(obj.prop).toEqual(2);
    });

    describe('#plastindexOf', function () {
      it('returns pro value', function () {
        var array = new Pro.Array(1, 2, 3, 2, 5),
            val = array.plastindexOf(2);

        expect(Pro.Utils.isProVal(val)).toBe(true);
        expect(val.valueOf()).toBe(3);
      });

      it('on list changes the produced value is updated', function () {
        var array = new Pro.Array('a', 'b', 'c', 'b', 'a'),
            val = array.plastindexOf('b');

        expect(val.valueOf()).toBe(3);

        array[4] = 'b';
        expect(val.valueOf()).toBe(4);
        array[4] = 'a';
        expect(val.valueOf()).toBe(3);
        array[3] = 'B';
        expect(val.valueOf()).toBe(1);
        array[1] = 'B';
        expect(val.valueOf()).toBe(-1);
        array.unshift('z', 'b');
        expect(val.valueOf()).toBe(1);
        array[3] = 'b';
        expect(val.valueOf()).toBe(3);
        array[1] = 'b';
        expect(val.valueOf()).toBe(3);

        array.unshift('z', 'x');
        expect(val.valueOf()).toBe(5);

        array.unshift('y', 'b')
        expect(val.valueOf()).toBe(7);

        array.push('d', 'e');
        expect(val.valueOf()).toBe(7);

        array.push('b', 'f');
        expect(val.valueOf()).toBe(14);

        array.pop();
        expect(val.valueOf()).toBe(14);
        array.pop();
        expect(val.valueOf()).toBe(7);
        array.pop();
        array.shift(); array.shift();
        array.shift(); array.shift();
        array.shift(); array.shift();
        expect(val.valueOf()).toBe(1);
        array[3] = 'b';
        expect(val.valueOf()).toBe(3);

        array.reverse();
        expect(val.valueOf()).toBe(4);
        array.sort();
        expect(val.valueOf()).toBe(3);
        array.length = 10;
        expect(val.valueOf()).toBe(3);
        array.length = 3;
        expect(val.valueOf()).toBe(2);

        array.splice(2, 1, 'x', 'b', 'z');
        expect(val.valueOf()).toBe(3);
        array.splice(1, 0, 'a', 'b', 'k');
        expect(val.valueOf()).toBe(6);
      });
    });
  });

  describe('#join and #pjoin', function () {
    it('updates properties depending on #join', function () {
      var array = new Pro.Array(3, 5, 4),
          obj = {
            prop: function () {
              return array.join('-');
            }
          },
          property = new Pro.AutoProperty(obj, 'prop');

      expect(obj.prop).toEqual('3-5-4');

      array[2] = 3;
      expect(obj.prop).toEqual('3-5-3');

      array.push(4);
      expect(obj.prop).toEqual('3-5-3-4');

      array.shift();
      expect(obj.prop).toEqual('5-3-4');
    });

    describe('#pjoin', function () {
      it('returns pro value', function () {
        var array = new Pro.Array(0, 8, 8, 8),
            val = array.pjoin('-');

        val.v;
        expect(Pro.Utils.isProVal(val)).toBe(true);
        expect(val.valueOf()).toBe('0-8-8-8');
      });

      it('on list changes the produced value is updated', function () {
        var array = new Pro.Array('', ''),
            val = array.pjoin('-');

        val.v;
        expect(val.valueOf()).toBe('-');

        array.push(0);
        expect(val.valueOf()).toBe('--0');
      });
    });
  });

  it('updates properties depending on #toString', function () {
    var array = new Pro.Array(3, 5, 4),
        obj = {
          prop: function () {
            return array.toString();
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toEqual(array.toString());

    array[2] = 5;
    expect(obj.prop).toEqual(array.toString());

    array.push(42);
    expect(obj.prop).toEqual(array.toString());
  });

  describe('#slice', function () {
    it('updates properties depending on it', function () {
      var array = new Pro.Array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10),
          obj = {
            prop: function () {
              return array.slice(1, 5);
            }
          },
          property = new Pro.AutoProperty(obj, 'prop');

      expect(obj.prop.valueOf()).toEqual([2, 3, 4, 5]);

      array[2] = 5;
      expect(obj.prop.valueOf()).toEqual([2, 5, 4, 5]);

      array.shift();
      expect(obj.prop.valueOf()).toEqual([5, 4, 5, 6]);
    });

    it('on list changes the produced value is updated', function () {
      var array = new Pro.Array(1, 2, 3, 4, 5, 6, 7),
          sliced = array.slice(2, 4);

      expect(sliced.valueOf()).toEqual([3, 4]);

      array[3] = 8;
      expect(sliced.valueOf()).toEqual([3, 8]);
      array[5] = 9;
      expect(sliced.valueOf()).toEqual([3, 8]);
      array[1] = 10;
      expect(sliced.valueOf()).toEqual([3, 8]);
      array[2] = 11;
      expect(sliced.valueOf()).toEqual([11, 8]);
    });
  });

  it('#reverse updates depending properties', function () {
    var array = new Pro.Array(1, 2, 3),
        obj = {
          prop: function () {
            return array[0] + array.length;
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toEqual(4);

    array.reverse();
    expect(obj.prop).toEqual(6);
  });

  it('#sort updates depending properties', function () {
    var array = new Pro.Array(4, 1, 2, 3),
        obj = {
          prop: function () {
            return '[' + array[0] + ', ' + array[3] + ']';
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toEqual('[4, 3]');

    array.sort();
    expect(obj.prop).toEqual('[1, 4]');

  });

  it('#push updates depending properties and adds new index dependencies', function () {
    var array = new Pro.Array(4, 1, 2, 3),
        obj = {
          prop: function () {
            if (array[5] === undefined) {
              array.length;
              return array[0];
            }
            return array[1] + array[5];
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toBe(4);

    array.push(4, 5, 6);
    expect(obj.prop).toBe(1 + 5);

    array[5] = 3;
    expect(obj.prop).toBe(1 + 3);
  });

  it('#pop updates depending properties and removes index dependencies', function () {
    var array = new Pro.Array(4, 1, 2, 3),
        obj = {
          prop: function () {
            if (array[3] === undefined) {
              return array[0];
            } else {
              array.length;
            }

            return array[2] + array[3];
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toBe(5);

    array.pop();
    expect(obj.prop).toBe(4);

    array[3] = 7;
    expect(obj.prop).toBe(4);
  });

  it('#unshift updates depending properties and adds new index dependencies', function () {
    var array = new Pro.Array(4, 1, 2, 3),
        obj = {
          prop: function () {
            if (array[5] === undefined) {
              array.length;
              return array[0];
            }
            return array[1] + array[5];
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toBe(4);

    array.unshift(4, 5, 6);
    expect(obj.prop).toBe(2 + 5);

    array[5] = 3;
    expect(obj.prop).toBe(3 + 5);
  });

  it('#shift updates depending properties and removes index dependencies', function () {
    var array = new Pro.Array(4, 1, 2, 3),
        obj = {
          prop: function () {
            if (array[3] === undefined) {
              return array[0];
            } else {
              array.length;
            }

            return array[2] + array[3];
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toBe(5);

    array.shift();
    expect(obj.prop).toBe(1);

    array[3] = 7;
    expect(obj.prop).toBe(1);
  });

  it('#splice updates the right listeners depending on the splice action', function () {
    var array = new Pro.Array(4, 1, 2, 3, 5),
        i, ov, nv, stack = [];

    array.on('indexChange', function (event) {
      expect(event.args[0]).toBe(Pro.Array.Operations.splice);
      i = event.args[1];
      ov = event.args[2];
      nv = event.args[3];
      stack.push('index');
    });

    array.on('lengthChange', function (event) {
      expect(event.args[0]).toBe(Pro.Array.Operations.splice);
      i = event.args[1];
      ov = event.args[2];
      nv = event.args[3];
      stack.push('length');
    });

    // only removing
    array.splice(1, 2);
    expect(i).toBe(1);
    expect(ov).toEqual([1, 2]);
    expect(nv).toEqual([]);
    expect(stack.length).toEqual(1);
    expect(stack[stack.length - 1]).toEqual('length');

    // [4, 3, 5] only adding
    array.splice(2, 0, 7, 8, 9);
    expect(i).toBe(2);
    expect(ov).toEqual([]);
    expect(nv).toEqual([7, 8, 9]);
    expect(stack.length).toEqual(2);
    expect(stack[stack.length - 1]).toEqual('length');

    // [4, 3, 7, 8, 9, 5] only changing elements
    array.splice(3, 2, 1, 2);
    expect(i).toBe(3);
    expect(ov).toEqual([8, 9]);
    expect(nv).toEqual([1, 2]);
    expect(stack.length).toEqual(3);
    expect(stack[stack.length - 1]).toEqual('index');

    // [4, 3, 7, 1, 2, 5] both removing and changing indexes
    array.splice(2, 4, 2, 1);
    expect(i).toBe(2);
    expect(ov).toEqual([7, 1, 2, 5]);
    expect(nv).toEqual([2, 1]);
    expect(stack.length).toEqual(5);
    expect(stack.slice(3)).toEqual(['length', 'index']);
  });

  it('#splice updates index propeties of the Pro.Array depending on removing and adding', function () {
    var array = new Pro.Array(1, 2, 3, 4, 5),
        o, i, ov, nv, stack = [];

    array.on('indexChange', function (event) {
      o = event.args[0];
      i = event.args[1];
      ov = event.args[2];
      nv = event.args[3];
      stack.push('index');
    });

    array.on('lengthChange', function (event) {
      o = event.args[0];
      i = event.args[1];
      ov = event.args[2];
      nv = event.args[3];
      stack.push('length');
    });

    // remove 2 elements
    array.splice(1, 2);
    expect(o).toBe(Pro.Array.Operations.splice);
    expect(i).toBe(1);
    expect(ov).toEqual([2, 3]);
    expect(nv).toEqual([]);
    expect(stack.length).toEqual(1);
    expect(stack[stack.length - 1]).toEqual('length');
    expect(array.length).toBe(3);

    array[3] = 10;
    array[4] = 12;
    expect(stack.length).toEqual(1);
    expect(stack[stack.length - 1]).toEqual('length');
    expect(array.length).toBe(3);

    // add 1 element
    array.splice(3, 0, 6);
    expect(o).toBe(Pro.Array.Operations.splice);
    expect(i).toBe(3);
    expect(ov).toEqual([]);
    expect(nv).toEqual([6]);
    expect(stack.length).toEqual(2);
    expect(stack[stack.length - 1]).toEqual('length');
    expect(array.length).toBe(4);

    array[3] = 12;
    expect(o).toBe(Pro.Array.Operations.set);
    expect(i).toBe(3);
    expect(ov).toEqual(6);
    expect(nv).toEqual(12);
    expect(stack.length).toEqual(3);
    expect(stack[stack.length - 1]).toEqual('index');
    expect(array.length).toBe(4);
  });

  it ('turns array memebers into Pro.Arrays.', function () {
    var array = new Pro.Array(1, [1, 2], [[1, 2, 3], [1, 2, 3, 4], [1, 2, 3, 4, 5]], [[[6], 7], 8]),
        isPA = Pro.Utils.isProArray;

    expect(isPA(array)).toBe(true);
    expect(isPA(array[0])).toBe(false);

    expect(isPA(array[1])).toBe(true);
    expect(isPA(array[1][0])).toBe(false);
    expect(isPA(array[1][1])).toBe(false);

    expect(isPA(array[2])).toBe(true);
    expect(isPA(array[2][0])).toBe(true);
    expect(isPA(array[2][0][0])).toBe(false);
    expect(isPA(array[2][0][1])).toBe(false);
    expect(isPA(array[2][0][2])).toBe(false);

    expect(isPA(array[2])).toBe(true);
    expect(isPA(array[2][1])).toBe(true);
    expect(isPA(array[2][1][0])).toBe(false);
    expect(isPA(array[2][1][1])).toBe(false);
    expect(isPA(array[2][1][2])).toBe(false);
    expect(isPA(array[2][1][3])).toBe(false);

    expect(isPA(array[2])).toBe(true);
    expect(isPA(array[2][2])).toBe(true);
    expect(isPA(array[2][2][0])).toBe(false);
    expect(isPA(array[2][2][1])).toBe(false);
    expect(isPA(array[2][2][2])).toBe(false);
    expect(isPA(array[2][2][3])).toBe(false);
    expect(isPA(array[2][2][4])).toBe(false);

    expect(isPA(array[3])).toBe(true);
    expect(isPA(array[3][0])).toBe(true);
    expect(isPA(array[3][0][0])).toBe(true);
    expect(isPA(array[3][0][0][0])).toBe(false);
    expect(isPA(array[3][0][1])).toBe(false);
    expect(isPA(array[3][1])).toBe(false);

    expect(array.valueOf()).toEqual([1, [1, 2], [[1, 2, 3], [1, 2, 3, 4], [1, 2, 3, 4, 5]], [[[6], 7], 8]]);
  });

  it ('turns object memebers into Pro.Objects.', function () {
    var array = new Pro.Array(1, [1, 2], {a:1, b: 2}, {c:3, d: {e: 4, f: [5, 6]}}, {g:7, h: function () {return this.g + 3;}}),
        isPO = Pro.Utils.isProObject,
        isPA = Pro.Utils.isProArray;

    expect(isPA(array)).toBe(true);
    expect(isPA(array[0])).toBe(false);

    expect(isPA(array[1])).toBe(true);
    expect(isPA(array[1][0])).toBe(false);
    expect(isPA(array[1][1])).toBe(false);

    expect(isPA(array[2])).toBe(false);
    expect(isPO(array[2])).toBe(true);

    expect(isPO(array[3])).toBe(true);
    expect(isPO(array[3].d)).toBe(true);
    expect(isPA(array[3].d.f)).toBe(true);

    expect(isPO(array[4])).toBe(true);
    expect(array[4].h).toEqual(10);
  });

  it ('turns new object memebers into Pro.Objects.', function () {
    var array = new Pro.Array(),
        isPO = Pro.Utils.isProObject,
        isPA = Pro.Utils.isProArray;

    array.push({
      a: 3,
      b: function () {return this.a;}
    });

    expect(isPA(array)).toBe(true);
    expect(isPA(array[0])).toBe(false);
    expect(isPO(array[0])).toBe(true);

    expect(array[0].a).toEqual(array[0].b);
  });

});
