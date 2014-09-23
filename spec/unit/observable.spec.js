'use strict';

describe('ProAct.Actor', function () {
  describe('#on', function () {
    it ('adds observer to the observable', function () {
      var observable = new ProAct.Actor(), res = [];

      observable.on(function (event) {
        res.push(event);
      });

      observable.update(null);

      expect(res.length).toEqual(1);
      expect(res[0].target).toEqual(observable);
    });
  });

  describe('#off', function () {
    it ('removes observer from the observable', function () {
      var observable = new ProAct.Actor(), res = [],
          observer = function (event) {
            res.push(event);
          };
      observable.on(observer);
      observable.off(observer);

      observable.update(null);
      expect(res.length).toBe(0);
    });
  });

  describe('#update', function () {
    it ('notifies only the passed types of actions', function () {
      var observable = new ProAct.Actor(), res = [];

      observable.on('one', function () {
        res.push('1');
      });

      observable.on('two', function () {
        res.push('2');
      });

      observable.on('three', function () {
        res.push('3');
      });

      observable.update(null, ['one', 'three']);

      expect(res.length).toBe(2);
      expect(res).toEqual(['1', '3']);
    });

    it ('it notifies only for defined actions', function () {
      var observable = new ProAct.Actor(), res = [];

      observable.on('one', function () {
        res.push('1');
      });

      observable.update(null, ['one', 'two']);

      expect(res.length).toBe(1);
      expect(res).toEqual(['1']);
    });
  });
});
