'use strict';

describe('ProAct.Event', function () {
  describe ('ProAct.Event.makeArray', function () {
    it ('subType "remove" creates a ProAct.Event.Types.array event with operation - remove', function () {
      var array = new ProAct.Array(1, 2, 3),
          event = ProAct.Event.makeArray(null, array, 'remove', [0, 2, null]);

      expect(event).toNotBe(null);
      expect(event.type).toBe(ProAct.Event.Types.array);
      expect(event.target).toBe(array);
      expect(event.source).toBe(null);
      expect(event.args).toEqual([ProAct.Array.Operations.remove, 0, 2, null]);
    });

    it ('subType ProAct.Array.Operations.remove creates a ProAct.Event.Types.array event with operation - remove', function () {
      var array = new ProAct.Array(1, 2, 3),
          event = ProAct.Event.makeArray(null, array,
                                         ProAct.Array.Operations.remove,
                                         [0, 2, null]);

      expect(event).toNotBe(null);
      expect(event.type).toBe(ProAct.Event.Types.array);
      expect(event.target).toBe(array);
      expect(event.source).toBe(null);
      expect(event.args).toEqual([ProAct.Array.Operations.remove, 0, 2, null]);
    });

    it ('subType "splice" creates a ProAct.Event.Types.array event with operation - splice', function () {
      var array = new ProAct.Array(1, 2, 3),
          event = ProAct.Event.makeArray(null, array, 'splice', [0, [2]]);

      expect(event).toNotBe(null);
      expect(event.type).toBe(ProAct.Event.Types.array);
      expect(event.target).toBe(array);
      expect(event.source).toBe(null);
      expect(event.args).toEqual([ProAct.Array.Operations.splice, 0, [2], undefined]);
    });

    it ('subType ProAct.Array.Operations.splice creates a ProAct.Event.Types.array event with operation - splice', function () {
      var array = new ProAct.Array(1, 2, 3),
          event = ProAct.Event.makeArray(null, array, 'splice', [0, [2], [4, 5]]);

      expect(event).toNotBe(null);
      expect(event.type).toBe(ProAct.Event.Types.array);
      expect(event.target).toBe(array);
      expect(event.source).toBe(null);
      expect(event.args).toEqual([ProAct.Array.Operations.splice, 0, [2], [4, 5]]);
    });
  });

  describe ('ProAct.Event.simple', function () {
    it ('for eventType === "array" or "a" and subType === "pop" creates ProAct.Event.Types.array event with operation remove from the end', function () {
      var event = ProAct.Event.simple('array', 'pop');

      expect(event).toNotBe(null);
      expect(event.type).toBe(ProAct.Event.Types.array);
      expect(event.target).toBe(undefined); // No target array passed
      expect(event.source).toBe(null); // Always null - this is triggering event
      expect(event.args).toEqual([ProAct.Array.Operations.remove, 1, undefined, undefined]);
    });

    it ('for eventType === "array" or "a" and subType === "shift" creates ProAct.Event.Types.array event with operation remove from the beginning', function () {
      var event = ProAct.Event.simple('array', 'shift');

      expect(event).toNotBe(null);
      expect(event.type).toBe(ProAct.Event.Types.array);
      expect(event.target).toBe(undefined); // No target array passed
      expect(event.source).toBe(null); // Always null - this is triggering event
      expect(event.args).toEqual([ProAct.Array.Operations.remove, 0, undefined, undefined]);
    });

    it ('for eventType === "array" or "a" and subType === "splice" creates ProAct.Event.Types.array event with operation splice deleting element on index value', function () {
      var event = ProAct.Event.simple('a', 'splice', 5);

      expect(event).toNotBe(null);
      expect(event.type).toBe(ProAct.Event.Types.array);
      expect(event.target).toBe(undefined); // No target array passed
      expect(event.source).toBe(null); // Always null - this is triggering event
      expect(event.args).toEqual([ProAct.Array.Operations.splice, 5, [undefined], undefined]);
    });

    it ('for eventType === "array" or "a" and subType === "deleteElement" or "del" creates ProAct.Event.Types.array event with operation splice deleting element passed as value, if no array argument passed.', function () {
      var event = ProAct.Event.simple('a', 'deleteElement', 5);

      expect(event).toNotBe(null);
      expect(event.type).toBe(ProAct.Event.Types.array);
      expect(event.target).toBe(undefined); // No target array passed
      expect(event.source).toBe(null); // Always null - this is triggering event
      expect(event.args).toEqual([ProAct.Array.Operations.splice, null, [5], undefined]);
    });

    it ('for eventType === "array" or "a" and subType === "deleteElement" or "del" creates ProAct.Event.Types.array event with operation splice deleting element passed as value from the passed array', function () {
      var event = ProAct.Event.simple('array', 'del', 1, [0, 1, 3, 5]);

      expect(event).toNotBe(null);
      expect(event.type).toBe(ProAct.Event.Types.array);
      expect(event.target).toEqual([0, 1, 3, 5]);
      expect(event.source).toBe(null); // Always null - this is triggering event
      expect(event.args).toEqual([ProAct.Array.Operations.splice, 1, [undefined], undefined]);
    });
  });
});

