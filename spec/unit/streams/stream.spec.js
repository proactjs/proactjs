'use strict';

describe('ProAct.Stream', function () {
  it ('is in ProAct.States.ready state after creation', function () {
    var stream = new ProAct.Stream();

    expect(stream.state).toBe(ProAct.States.ready);
  });

  describe('#trigger', function () {
    it ('updates the stream listeners', function () {
      var stream = new ProAct.Stream(), res = [];
      stream.on(function (number) {
        res.push(number);
      });

      expect(res).toEqual([]);

      stream.trigger(1);
      expect(res).toEqual([1]);

      stream.trigger(2);
      expect(res).toEqual([1, 2]);
    });
  });

  describe('#map', function () {
    it ('creates a new stream from the this stream, using the passed function as default transformation', function () {
      var stream1 = new ProAct.Stream(),
          stream2 = stream1.map(function (number) {return number * 2;}),
          res = [];
      stream2.on(function (number) {
        res.push(number);
      });

      expect(res).toEqual([]);

      stream1.trigger(1);
      expect(res).toEqual([2]);

      stream1.trigger(2);
      expect(res).toEqual([2, 4]);
    });

    it ('is transitive', function () {
      var stream1 = new ProAct.Stream(),
          stream2 = stream1.map(function (number) {return number * 2;}),
          stream3 = stream2.map(function (number) {return number * 3;}),
          stream4 = stream3.map(function (number) {return '(' + number + ')';}),
          res = [];

      stream4.on(function (number) {
        res.push(number);
      });

      expect(res).toEqual([]);

      stream1.trigger(1);
      expect(res).toEqual(['(6)']);

      stream1.trigger(2);
      expect(res).toEqual(['(6)', '(12)']);
    });

    it ('works with predefined mapping functions', function () {
      var stream1 = new ProAct.Stream(),
          stream2 = stream1.map('-'),
          res = [];

      stream2.on(function (number) {
        res.push(number);
      });

      stream1.trigger(1);
      expect(res).toEqual([-1]);
    });

    it ('works with stored mapping functions', function () {
      P.registry.store('l:test', function (v) {
        return '(' + v + ')';
      });
      var stream1 = new ProAct.Stream(),
          stream2 = stream1.map('l:test'),
          res = [];

      stream2.on(function (number) {
        res.push(number);
      });

      stream1.trigger(1);
      expect(res).toEqual(['(1)']);
    });
  });

  describe('#filter', function () {
    it ('filters only chosen values', function() {
      var stream1 = new ProAct.Stream(),
          stream2 = stream1.filter(function (number) {return number % 2 === 0;}),
          res = [];

      stream2.on(function (number) {
        res.push(number);
      });

      expect(res).toEqual([]);

      stream1.trigger(1);
      expect(res).toEqual([]);

      stream1.trigger(2);
      expect(res).toEqual([2]);

      stream1.trigger(3);
      expect(res).toEqual([2]);

      stream1.trigger(4);
      expect(res).toEqual([2, 4]);
    });

    it ('is chainable', function () {
      var stream1 = new ProAct.Stream(),
          stream2 = stream1.filter(function (number) {return number % 2 === 0;}),
          stream3 = stream2.filter(function (number) {return number % 3 === 0;}),
          res = [];

      stream3.on(function (number) {
        res.push(number);
      });

      expect(res).toEqual([]);

      stream1.trigger(2);
      expect(res).toEqual([]);

      stream1.trigger(6);
      expect(res).toEqual([6]);

      stream1.trigger(9);
      expect(res).toEqual([6]);

      stream1.trigger(24);
      expect(res).toEqual([6, 24]);
    });

    it ('works with predefined filtering functions', function () {
      var stream1 = new ProAct.Stream(),
          stream2 = stream1.filter('-'),
          res = [];

      stream2.on(function (number) {
        res.push(number);
      });

      stream1.trigger(1);
      expect(res).toEqual([]);

      stream1.trigger(-3);
      expect(res).toEqual([-3]);
    });

    it ('works with stored filtering functions', function () {
      ProAct.registry.store('l:test', function (v) {
        return v > 5;
      });

      var stream1 = new ProAct.Stream(),
          stream2 = stream1.filter('l:test'),
          res = [];

      stream2.on(function (number) {
        res.push(number);
      });

      stream1.trigger(1);
      expect(res).toEqual([]);

      stream1.trigger(13);
      expect(res).toEqual([13]);
    });
  });

  describe('#reduce', function () {
    it ('creates a ProAct.Property that listens to accumulations', function () {
      var stream = new ProAct.Stream(),
          reduced = stream.reduce(0, function (x, y) {return x + y;});
      expect(reduced.v).toEqual(0);

      stream.trigger(1);
      expect(reduced.v).toEqual(1);

      stream.trigger(2);
      expect(reduced.v).toEqual(3);
    });
  });

  describe('#accumulate', function () {
    it ('accumulates values using the passed function', function () {
      var stream1 = new ProAct.Stream(),
          stream2 = stream1.accumulate(0, function (x, y) {return x + y;}),
          res = [];

      stream2.on(function (number) {
        res.push(number);
      });

      expect(res).toEqual([]);

      stream1.trigger(1);
      expect(res).toEqual([1]);

      stream1.trigger(1);
      expect(res).toEqual([1, 2]);

      stream1.trigger(1);
      expect(res).toEqual([1, 2, 3]);

      stream1.trigger(2);
      expect(res).toEqual([1, 2, 3, 5]);
    });

    it ('can be chained', function () {
      var stream1 = new ProAct.Stream(),
          stream2 = stream1.accumulate(0, function (x, y) {return x + y;}),
          stream3 = stream2.accumulate(1, function (x, y) {return x * y;}),
          res = [];

      stream3.on(function (number) {
        res.push(number);
      });

      expect(res).toEqual([]);

      stream1.trigger(1);
      expect(res).toEqual([1]);

      stream1.trigger(2);
      expect(res).toEqual([1, 3]);

      stream1.trigger(5);
      expect(res).toEqual([1, 3, 24]);
    });

    it ('works with predefined accumulating functions', function () {
      var stream1 = new ProAct.Stream(),
          stream2 = stream1.accumulate('+'),
          res = [];

      stream2.on(function (number) {
        res.push(number);
      });

      stream1.trigger(1);
      expect(res).toEqual([1]);

      stream1.trigger(3);
      expect(res).toEqual([1, 4]);
    });

    it ('works with predefined stored functions', function () {
      ProAct.registry.store('l:test', [1, function (a, b) {
        return a * b;
      }]);

      var stream1 = new ProAct.Stream(),
          stream2 = stream1.accumulate('l:test'),
          res = [];

      stream2.on(function (number) {
        res.push(number);
      });

      stream1.trigger(1);
      expect(res).toEqual([1]);

      stream1.trigger(3);
      expect(res).toEqual([1, 3]);
    });
  });

  describe('#merge', function () {
    it ('merges two streams events into one stream of events', function () {
      var stream1 = new ProAct.Stream(),
          stream2 = new ProAct.Stream(),
          stream3 = stream1.merge(stream2),
          res = [];

      stream3.on(function (e) {
        res.push(e);
      });

      expect(res).toEqual([]);

      stream1.trigger(1);
      expect(res).toEqual([1]);

      stream2.trigger(1);
      expect(res).toEqual([1, 1]);
    });
  });

  describe('Errors', function () {
    it ('can be triggered with #triggerErr and listen for with #onErr', function () {
      var stream = new ProAct.Stream(), res = [], resErr = [];

      stream.onErr(function (error) {
        resErr.push(error);
      });
      stream.on(function (error) {
        res.push(error);
      });

      stream.triggerErr('error');
      expect(res).toEqual([]);
      expect(resErr).toEqual(['error']);

      stream.trigger(1);
      expect(res).toEqual([1]);
      expect(resErr).toEqual(['error']);
    });

    it ('can be chained through many streams', function () {
      var stream1 = new ProAct.Stream(),
          stream2 = new ProAct.Stream(stream1),
          resErr = [];

      stream2.onErr(function (error) {
        resErr.push(error);
      });

      stream1.triggerErr('error');
      expect(resErr).toEqual(['error']);
    });

    it ('can be generated from transformations', function () {
      var stream1 = new ProAct.Stream(),
          stream2 = stream1.map(function (v) {
            if (v < 0) {
              throw Error('no!');
            }

            return -v;
          }),
          res = [],
          resErr = [];

      stream2.onErr(function (error) {
        resErr.push(error);
      });
      stream2.on(function (v) {
        res.push(v);
      });

      stream1.trigger(5);
      expect(res).toEqual([-5]);
      expect(resErr).toEqual([]);

      stream1.trigger(-5);
      expect(res).toEqual([-5]);
      expect(resErr.length).toEqual(1);
      expect(resErr[0].message).toEqual('no!');
    });
  });

  describe('Close', function () {
    it ('triggering closing event destroys the stream, but the event is delivered to its listeners', function () {
      var stream = new ProAct.Stream(), res = [];

      stream.onClose(function (e) {
        res.push(e);
      });

      stream.triggerClose('last');

      expect(stream.state).toBe(ProAct.States.destroyed);
      expect(res.length).toBe(1);
      expect(res[0]).toEqual('last');
    });

    it ('triggering closing event destroys the stream and its source, but the event is delivered to its listeners', function () {
      var stream1 = new ProAct.Stream(),
          stream2 = stream1.map(function (e) {
            return e + ' time';
          }),
          res = [];

      stream2.onClose(function (e) {
        res.push(e);
      });

      stream1.triggerClose('last');

      expect(stream1.state).toBe(ProAct.States.destroyed);
      expect(stream2.state).toBe(ProAct.States.destroyed);
      expect(res.length).toBe(1);
      expect(res[0]).toEqual('last');
    });

    it ('if stream is a merge stream, it is not closed untill all of its sources are closed', function () {
      var source1 = new ProAct.Stream(),
          source2 = new ProAct.Stream(),
          source3 = new ProAct.Stream(),
          stream = new ProAct.Stream().into(source1, source2, source3),
          res = [];

      stream.onClose(function (e) {
        res.push(e);
      });

      source1.triggerClose('last');
      expect(source1.state).toBe(ProAct.States.destroyed);
      expect(stream.state).toBe(ProAct.States.ready);
      expect(res.length).toBe(0);

      source2.triggerClose('last');
      expect(source2.state).toBe(ProAct.States.destroyed);
      expect(stream.state).toBe(ProAct.States.ready);
      expect(res.length).toBe(0);

      source3.triggerClose('last');
      expect(source3.state).toBe(ProAct.States.destroyed);
      expect(stream.state).toBe(ProAct.States.destroyed);
      expect(res.length).toBe(1);
      expect(res[0]).toEqual('last');
    });
  });

});
