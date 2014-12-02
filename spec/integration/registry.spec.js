'use strict';

describe('ProAct.Registry', function () {
  describe('examples', function () {
    it ('Counter system', function () {
      ProAct.registry.make('s:plus'); // One stream to count.
      ProAct.registry.make('s:minus', 'map(-)'); // One stream to count with negative sign.
      ProAct.registry.make('s:counts', '<<(s:plus, s:minus)|acc(+)'); // One stream that depends on the above ones and sums.
      ProAct.registry.prob('counter', 0, '<<(s:counts)'); // One ProAct.Property to store the result.

      expect(ProAct.registry.get('po:counter').v).toEqual(0);

      ProAct.registry.s('plus').trigger(1);
      expect(ProAct.registry.get('po:counter').v).toEqual(1);

      ProAct.registry.s('minus').trigger(1);
      expect(ProAct.registry.get('po:counter').v).toEqual(0);

      ProAct.registry.s('plus').trigger(2);
      expect(ProAct.registry.get('po:counter').v).toEqual(2);
    });
  });
});
