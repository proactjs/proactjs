'use strict';

describe('ProAct.Actor', function () {
  describe('#on', function () {
    it ('adds observer to the actor', function () {
      var actor = new ProAct.Actor(), res = [];

      actor.on(function (event) {
        res.push(event);
      });

      actor.update(null);

      expect(res.length).toEqual(1);
      expect(res[0].target).toEqual(actor);
    });
  });

  describe('#off', function () {
    it ('removes observer from the actor', function () {
      var actor = new ProAct.Actor(), res = [],
          observer = function (event) {
            res.push(event);
          };
      actor.on(observer);
      actor.off(observer);

      actor.update(null);
      expect(res.length).toBe(0);
    });
  });

  describe('#update', function () {
    it ('notifies only the passed types of actions', function () {
      var actor = new ProAct.Actor(), res = [];

      actor.on('one', function () {
        res.push('1');
      });

      actor.on('two', function () {
        res.push('2');
      });

      actor.on('three', function () {
        res.push('3');
      });

      actor.update(null, ['one', 'three']);

      expect(res.length).toBe(2);
      expect(res).toEqual(['1', '3']);
    });

    it ('it notifies only for defined actions', function () {
      var actor = new ProAct.Actor(), res = [];

      actor.on('one', function () {
        res.push('1');
      });

      actor.update(null, ['one', 'two']);

      expect(res.length).toBe(1);
      expect(res).toEqual(['1']);
    });
  });
});
