'use strict';

describe('Pro.Queue', function () {
  var queue, testFunc, resArray, obj, fnOrder;

  beforeEach(function () {
    queue = new Pro.Queue('pro');
    resArray = [];
    fnOrder = [];
    testFunc = function () {
      resArray[0] = '5';
      fnOrder.push(testFunc);
    };

    obj = {
      f1: function () {
        resArray[1] = 5;
        fnOrder.push(obj.f1);
      },
      f2: function (ar1, ar2) {
        resArray[2] = resArray[2] || [];
        resArray[2].push(ar1 + ar2);
        fnOrder.push(obj.f2);
      },
      f3: function () {
        queue.pushOnce(testFunc);
        fnOrder.push(obj.f3);
      }
    };
  });

  describe('#constructor', function () {
    it('Initializes an empty queue', function () {
      expect(queue.length()).toBe(0);
      expect(queue.isEmpty()).toBe(true);
      expect(queue.name).toEqual('pro');
      expect(queue.options).toEqual({});
    });
  });

  describe('#push', function () {
    it('stores global functions without arguments in the queue correctly', function () {
      queue.push(testFunc);
      expect(queue.length()).toBe(1);

      queue.push(testFunc);
      expect(queue.length()).toBe(2);

      queue.push(null, testFunc);
      expect(queue.length()).toBe(3);
    });

    it('stores object functions in the queue correctly', function () {
      queue.push(obj, obj.f1);
      expect(queue.length()).toBe(1);

      queue.push(obj, obj.f2);
      expect(queue.length()).toBe(2);

      queue.push(obj, obj.f2, [12, 43]);
      expect(queue.length()).toBe(3);
    });
  });

  describe('#pushOnce', function () {
    it('stores global functions without arguments in the queue correctly and only once', function () {
      queue.pushOnce(testFunc);
      expect(queue.length()).toBe(1);

      queue.pushOnce(testFunc);
      expect(queue.length()).toBe(1);

      queue.pushOnce(null, testFunc);
      expect(queue.length()).toBe(1);
    });

    it('stores object functions in the queue correctly and only once', function () {
      queue.pushOnce(obj, obj.f1);
      expect(queue.length()).toBe(1);

      queue.pushOnce(obj, obj.f2);
      expect(queue.length()).toBe(2);

      queue.pushOnce(obj, obj.f2, [12, 43]);
      expect(queue.length()).toBe(2);
    });
  });

  describe('#go', function () {
    it('does nothing on empty queue', function () {
      queue.go();
      expect(queue.length()).toBe(0);
    });

    it('empties the queue', function () {
      queue.push(obj, obj.f1);
      expect(queue.length()).toBe(1);

      queue.push(obj, obj.f2);
      expect(queue.length()).toBe(2);

      queue.go();
      expect(queue.length()).toBe(0);
    });

    it('executes the functions the queue', function () {
      queue.push(obj, obj.f1);
      expect(queue.length()).toBe(1);
      expect(resArray[1]).toBe(undefined);

      queue.go();
      expect(resArray[1]).not.toBe(undefined);
      expect(resArray[1]).toBe(5);
      expect(fnOrder[0]).toBe(obj.f1);
    });

    it('executes the functions pushed with #pushOnce in the queue only once', function () {
      queue.pushOnce(obj, obj.f2, [12, 23]);
      expect(queue.length()).toBe(1);
      expect(resArray[2]).toBe(undefined);

      queue.pushOnce(obj, obj.f2, [2, 5]);
      expect(queue.length()).toBe(1);
      expect(resArray[2]).toBe(undefined);

      queue.pushOnce(obj, obj.f2, [2, 3]);
      expect(queue.length()).toBe(1);
      expect(resArray[2]).toBe(undefined);

      queue.go();

      expect(resArray[2]).not.toBe(undefined);
      expect(resArray[2].length).toBe(1);
      expect(resArray[2][0]).toBe(5);
      expect(fnOrder.length).toBe(1);
      expect(fnOrder[0]).toBe(obj.f2);
    });

    it('executes the functions in the queue in the right order', function () {
      queue.push(obj, obj.f1);
      expect(queue.length()).toBe(1);
      expect(resArray[1]).toBe(undefined);

      queue.pushOnce(testFunc);
      expect(queue.length()).toBe(2);
      expect(resArray[0]).toBe(undefined);

      queue.push(obj, obj.f2, [12, 23]);
      expect(queue.length()).toBe(3);
      expect(resArray[2]).toBe(undefined);

      queue.pushOnce(testFunc);
      expect(queue.length()).toBe(3);

      queue.push(obj, obj.f2, [2, 3]);
      expect(queue.length()).toBe(4);

      queue.go();

      expect(resArray[1]).not.toBe(undefined);
      expect(resArray[1]).toBe(5);
      expect(fnOrder[0]).toBe(obj.f1);

      expect(resArray[2]).not.toBe(undefined);
      expect(resArray[2][0]).toBe(12 + 23);
      expect(resArray[2][1]).toBe(2 + 3);
      expect(fnOrder[1]).toBe(obj.f2);
      expect(fnOrder[2]).toBe(obj.f2);

      expect(resArray[0]).not.toBe(undefined);
      expect(resArray[0]).toEqual('5');
      expect(fnOrder[3]).toBe(testFunc);
    });

    it('executes functions added to the queue by other functions.', function () {
      queue.push(obj, obj.f3);
      expect(queue.length()).toBe(1);

      queue.go();

      expect(resArray[0]).not.toBe(undefined);
      expect(resArray[0]).toEqual('5');
      expect(fnOrder[0]).toBe(obj.f3);
      expect(fnOrder[1]).toBe(testFunc);
    });
  });
});
