'use strict';

describe('ProAct.fromCallback', function () {

  beforeEach(function () {
    jasmine.Clock.useMock();
  });

  it ('creates a ProAct.Stream', function () {
    var stream = ProAct.fromCallback(function () {});

    expect(stream instanceof ProAct.Stream).toBe(true);
  });

});
