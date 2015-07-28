'use strict';

describe('ProAct.closed', function () {

  it ('creates a closed ProAct.Stream', function () {
    var stream = ProAct.closed();

    expect(stream instanceof ProAct.Stream).toBe(true);
    expect(stream.state).toBe(ProAct.States.closed);
  });

});

