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
});
