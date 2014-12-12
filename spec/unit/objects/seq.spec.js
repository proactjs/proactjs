'use strict';

describe('ProAct.seq', function () {

  beforeEach(function () {
    jasmine.Clock.useMock();
  });

  it ('creates a ProAct.Stream', function () {
    var stream = ProAct.seq(1000, []);

    expect(stream instanceof ProAct.Stream).toBe(true);
  });

  it ('creates a ProAct.Stream emitting the passed "vals" on the passed timeout and when every value is emitted the stream closes', function () {
    var stream = ProAct.seq(1000, [4, 5]), res = [], closed = false;
    stream.on(function (v) {
      res.push(v);
    });

    stream.onClose(function (v) {
      closed = true;
    });

    expect(res).toEqual([]);

    jasmine.Clock.tick(1000);
    expect(res).toEqual([4]);

    jasmine.Clock.tick(1000);
    expect(res).toEqual([4, 5]);

    expect(closed).toBe(true);
    expect(stream.state).toBe(P.States.closed);

    jasmine.Clock.tick(1000);
    expect(res).toEqual([4, 5]);
  });
});
