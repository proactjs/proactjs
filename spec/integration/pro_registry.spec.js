'use strict';

describe('ProAct.Registry', function () {
  describe('examples', function () {
    it ('Counter system', function () {
      ProAct.registry.make('s:plus');
      ProAct.registry.make('s:minus', 'map(-)');
      ProAct.registry.make('s:counts', '<<(s:plus)|<<(s:minus)|acc(+)');
      ProAct.registry.prob('counter', 0, '<<(s:counts)');

      expect(ProAct.registry.get('po:counter').v).toEqual(0);
    });
  });
});
