'use strict';

describe('ProAct.timeout', function () {

  beforeEach(function () {
    jasmine.Clock.useMock();
  });

  it ('creates a ProAct.Stream', function () {
    var stream = ProAct.timeout(1000, 5);

    expect(stream instanceof ProAct.Stream).toBe(true);
  });

  it ('creates a ProAct.Stream emitting the passed "value" once and then closing', function () {
    var stream = ProAct.timeout(1000, 7), res = [], closed = false;
    stream.on(function (v) {
      res.push(v);
    });
    stream.onClose(function (v) {
      closed = true;
    });

    expect(res).toEqual([]);

    jasmine.Clock.tick(1000);
    expect(res).toEqual([7]);

    expect(closed).toBe(true);
    expect(stream.state).toBe(ProAct.States.closed);

    jasmine.Clock.tick(1000);
    expect(res).toEqual([7]);

  });
});

