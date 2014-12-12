'use strict';

describe('ProAct.fromInvoke', function () {

  beforeEach(function () {
    jasmine.Clock.useMock();
  });
  it ('creates a ProAct.Stream', function () {
    var stream = ProAct.fromInvoke(1000, function () {});

    expect(stream instanceof ProAct.Stream).toBe(true);
  });

  it ('creates a ProAct.Stream emitting the result of the passed "func" argument on every "interval" milliseconds', function () {
    var stream = ProAct.fromInvoke(1000, function () {
      return 5;
    }), res = [];
    stream.on(function (v) {
      res.push(v);
    });

    expect(res).toEqual([]);

    jasmine.Clock.tick(1000);
    expect(res).toEqual([5]);

    jasmine.Clock.tick(1000);
    expect(res).toEqual([5, 5]);
  });

  it ('creates a ProAct.Stream emitting the result of the passed "func" argument on every "interval" milliseconds and if the result is ProAct.close, the stream is closed', function () {
    var i = 0, stream = ProAct.fromInvoke(1000, function () {
      if (i > 1) {
        return ProAct.close;
      }
      i++;

      return i;
    }), res = [], closed = false;
    stream.on(function (v) {
      res.push(v);
    });
    stream.onClose(function (v) {
      closed = true;
    });

    expect(res).toEqual([]);

    jasmine.Clock.tick(1000);
    expect(res).toEqual([1]);

    jasmine.Clock.tick(1000);
    expect(res).toEqual([1, 2]);

    jasmine.Clock.tick(1000);
    expect(res).toEqual([1, 2]);
    expect(closed).toEqual(true);
    expect(stream.state).toEqual(ProAct.States.closed);
  });
});
