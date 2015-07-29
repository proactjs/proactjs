'use strict';

describe('ProAct.interval', function () {

  beforeEach(function () {
    jasmine.Clock.useMock();
  });

  it ('creates a ProAct.Stream', function () {
    var stream = ProAct.interval(1000, 5);

    expect(stream instanceof ProAct.Stream).toBe(true);
  });

  it ('creates a ProAct.Stream emitting the passed "value" over and over again at given time interval', function () {
    var stream = ProAct.interval(1000, 7), res = [];
    stream.on(function (v) {
      res.push(v);
    });

    expect(res).toEqual([]);

    jasmine.Clock.tick(1000);
    expect(res).toEqual([7]);

    jasmine.Clock.tick(1000);
    expect(res).toEqual([7, 7]);

    jasmine.Clock.tick(1000);
    expect(res).toEqual([7, 7, 7]);
  });
});
