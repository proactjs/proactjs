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

  describe('special queue support', function () {
    beforeEach(function () {
      ProAct.flow.addQueue('test');
    });

    it ('executes all updates in the special queue of the actor', function () {
      var actor1 = new ProAct.Actor(),
          actor2 = new ProAct.Actor('test'),
          res = [],
          up = function (val) {
            res.push(val.source);
          };

      actor1.on(up);
      actor2.on(up);

      actor2.on(function () {
        actor1.update(3);
      });

      ProAct.flow.run(function () {
        actor2.update(2);
        actor1.update(1);
      });

      expect(res).toEqual([1, 2, 3]);
    });
  });

  describe('destroying', function () {
    it ('cleans up all the resources', function () {
      var actor1 = new ProAct.Actor(),
          actor2 = new ProAct.Actor(),
          res = [],
          listener = function (val) {
            res.push(val);
          };
      actor1.makeListener = function () {
        return listener;
      };

      actor1.into(actor2);

      expect(actor2.listeners.change[0]).toBe(listener);

      actor2.destroy();

      expect(actor2.state).toBe(ProAct.States.destroyed);
      expect(actor2.listeners).toBe(undefined);
      expect(actor2.listener).toBe(undefined);
      expect(actor2.errListener).toBe(undefined);
      expect(actor2.closeListener).toBe(undefined);
      expect(actor2.parent).toBe(undefined);
      expect(actor2.queueName).toBe(undefined);
      expect(actor2.transforms).toBe(undefined);
    });

    it ('lazily cleans listeners of destoyed actors', function () {
      var actor1 = new ProAct.Actor(),
          actor2 = new ProAct.Actor(),
          res = [],
          listener = function (val) {
            res.push(val);
          };
      actor1.makeListener = function () {
        if (!this.listener) {
          this.listener = listener;
        }
        return this.listener;
      };

      actor1.into(actor2);
      expect(actor2.listeners.change).toEqual([listener]);

      actor1.destroy();
      actor2.update();

      expect(actor2.listeners.change).toEqual([]);
    });

  });

  describe('closing', function () {
    it ('Close event closes the actor on it was triggered', function () {
      var actor = new ProAct.Actor();
      actor.close();

      expect(actor.state).toBe(ProAct.States.closed);
    });
  });
});
