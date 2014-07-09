'use strict';

describe('Pro.Queues', function () {
  describe('Handles one queue like a normal queue.', function () {
    var queue, testFunc, resArray, obj, fnOrder;

    beforeEach(function () {
      queue = new Pro.Queues(['pro']);
      resArray = [];
      fnOrder = []
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
          queue.pushOnce('pro', testFunc);
          fnOrder.push(obj.f3);
        }
      };
    });

    describe('#constructor', function () {
      it('Initializes an empty queue', function () {
        expect(queue.isEmpty()).toBe(true);
        expect(queue.queueNames).not.toBe(undefined);
        expect(queue.queueNames.length).toBe(1);
        expect(queue.queueNames[0]).toEqual('pro');
        expect(queue.options).toEqual({});
      });
    });

    describe('#push', function () {
      it('stores global functions without arguments in the queue correctly', function () {
        queue.push('pro', testFunc);
        expect(queue.isEmpty()).toBe(false);

        queue.push('pro', null, testFunc);
        expect(queue._queues['pro'].length()).toBe(2);
      });

      it('stores object functions in the queue correctly', function () {
        queue.push('pro', obj, obj.f1);
        expect(queue.isEmpty()).toBe(false);

        queue.push('pro', obj, obj.f2);
        expect(queue._queues.pro.length()).toBe(2);

        queue.push('pro', obj, obj.f2, [12, 43]);
        expect(queue._queues.pro.length()).toBe(3);
      });
    });

    describe('#pushOnce', function () {
      it('stores global functions without arguments in the queue correctly and only once', function () {
        queue.pushOnce('pro', testFunc);
        expect(queue.isEmpty()).toBe(false);

        queue.pushOnce('pro', testFunc);
        expect(queue._queues.pro.length()).toBe(1);

        queue.pushOnce('pro', null, testFunc);
        expect(queue._queues.pro.length()).toBe(1);
      });

      it('stores object functions in the queue correctly and only once', function () {
        queue.pushOnce('pro', obj, obj.f1);
        expect(queue.isEmpty()).toBe(false);

        queue.pushOnce('pro', obj, obj.f2);
        expect(queue._queues.pro.length()).toBe(2);

        queue.pushOnce('pro', obj, obj.f2, [12, 43]);
        expect(queue._queues.pro.length()).toBe(2);
      });
    });

    describe('#go', function () {
      it('does nothing on empty queue', function () {
        queue.go();
        expect(queue.isEmpty()).toBe(true);
      });

      it('empties the queue', function () {
        queue.push('pro', obj, obj.f1);
        expect(queue.isEmpty()).toBe(false);

        queue.push('pro', obj, obj.f2);
        expect(queue._queues.pro.length()).toBe(2);

        queue.go();
        expect(queue.isEmpty()).toBe(true);
      });

      it('executes the functions in the queue', function () {
        queue.push('pro', obj, obj.f1);
        expect(queue.isEmpty()).toBe(false);
        expect(resArray[1]).toBe(undefined);

        queue.go();
        expect(resArray[1]).not.toBe(undefined);
        expect(resArray[1]).toBe(5);
        expect(fnOrder[0]).toBe(obj.f1);
      });

      it('executes the functions pushed with #pushOnce in the queue only once', function () {
        queue.pushOnce('pro', obj, obj.f2, [12, 23]);
        expect(queue.isEmpty()).toBe(false);
        expect(resArray[2]).toBe(undefined);

        queue.pushOnce('pro', obj, obj.f2, [2, 5]);
        expect(queue._queues.pro.length()).toBe(1);
        expect(resArray[2]).toBe(undefined);

        queue.pushOnce('pro', obj, obj.f2, [2, 3]);
        expect(queue._queues.pro.length()).toBe(1);
        expect(resArray[2]).toBe(undefined);

        queue.go();

        expect(resArray[2]).not.toBe(undefined);
        expect(resArray[2].length).toBe(1);
        expect(resArray[2][0]).toBe(5);
        expect(fnOrder.length).toBe(1);
        expect(fnOrder[0]).toBe(obj.f2);
      });

      it('executes the functions in the queue in the right order', function () {
        queue.push('pro', obj, obj.f1);
        expect(queue.isEmpty()).toBe(false);
        expect(resArray[1]).toBe(undefined);

        queue.pushOnce('pro', testFunc);
        expect(queue._queues.pro.length()).toBe(2);
        expect(resArray[0]).toBe(undefined);

        queue.push('pro', obj, obj.f2, [12, 23]);
        expect(queue._queues.pro.length()).toBe(3);
        expect(resArray[2]).toBe(undefined);

        queue.pushOnce('pro', testFunc);
        expect(queue._queues.pro.length()).toBe(3);

        queue.push('pro', obj, obj.f2, [2, 3]);
        expect(queue._queues.pro.length()).toBe(4);

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
        queue.push('pro', obj, obj.f3);
        expect(queue.isEmpty()).toBe(false);

        queue.go();

        expect(resArray[0]).not.toBe(undefined);
        expect(resArray[0]).toEqual('5');
        expect(fnOrder[0]).toBe(obj.f3);
        expect(fnOrder[1]).toBe(testFunc);
      });
    });
  });

  describe('Handles multiple queues.', function () {
    var queues, testFunc, resArray, obj, fnOrder;

    beforeEach(function () {
      queues = new Pro.Queues(['pro', 'model', 'controller', 'view']);
      resArray = [];
      fnOrder = []
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
          queues.pushOnce('pro', testFunc);
          fnOrder.push(obj.f3);
        }
      };
    });

    describe('#go', function () {
      it('runs the stored methods in order of queues', function () {
        queues.pushOnce('controller', obj, obj.f3);
        queues.pushOnce('model', testFunc);
        queues.pushOnce('controller', obj, obj.f1);
        queues.pushOnce('view', obj, obj.f2, [2, 3]);

        expect(fnOrder[0]).toBe(undefined);
        expect(resArray[0]).toBe(undefined);
        expect(fnOrder[1]).toBe(undefined);
        expect(fnOrder[2]).toBe(undefined);
        expect(resArray[1]).toBe(undefined);
        expect(fnOrder[3]).toBe(undefined);
        expect(fnOrder[4]).toBe(undefined);
        expect(resArray[2]).toBe(undefined);

        queues.go();

        expect(fnOrder[0]).toBe(testFunc);
        expect(resArray[0]).toEqual('5');
        expect(fnOrder[1]).toBe(obj.f3);
        expect(fnOrder[2]).toBe(obj.f1);
        expect(resArray[1]).toBe(5);
        expect(fnOrder[3]).toBe(testFunc);
        expect(fnOrder[4]).toBe(obj.f2);
        expect(resArray[2]).not.toBe(undefined);
        expect(resArray[2][0]).toBe(5);
      });
    });

  });
});
