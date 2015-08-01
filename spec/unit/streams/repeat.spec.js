'use strict';

describe('ProAct.repeat', function () {

  beforeEach(function () {
    jasmine.Clock.useMock();
  });

  it ('creates a ProAct.Stream', function () {
    var stream = ProAct.repeat(1000, []);

    expect(stream instanceof ProAct.Stream).toBe(true);
  });

  it ('creates a ProAct.Stream emitting the passed "vals" on the passed interval and when every value is emitted it starts to emit them from the beginning', function () {
    var stream = ProAct.repeat(1000, [4, 5]), res = [];
    stream.on(function (v) {
      res.push(v);
    });

    expect(res).toEqual([]);

    jasmine.Clock.tick(1000);
    expect(res).toEqual([4]);

    jasmine.Clock.tick(1000);
    expect(res).toEqual([4, 5]);

    jasmine.Clock.tick(1000);
    expect(res).toEqual([4, 5, 4]);
  });
});

