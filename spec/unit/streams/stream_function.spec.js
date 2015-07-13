'use strict';

describe('ProAct.stream', function () {

  it ('creates a ProAct.Stream', function () {
    var stream = ProAct.stream();

    expect(stream instanceof ProAct.Stream).toBe(true);
    expect(stream.state).toBe(ProAct.States.ready);
  });

  it ('Creates a ProAct.Stream using the DSL', function () {
    var res = [],
        stream = ProAct.stream('@($1)', function (v) {
          res.push(v);
        });

    expect(stream instanceof ProAct.Stream).toBe(true);
    expect(stream.state).toBe(ProAct.States.ready);

    stream.trigger(5);
    expect(res).toEqual([5]);
  });

});

