'use strict';

describe('Pro.Core', function () {
  it ('is observable for all the properties it manages', function () {
      var obj = {
            a:1,
            b:2
          },
          count = 0,
          core = new Pro.Core(obj);

      obj.__pro__ = core;
      core.makeProp('a');
      core.makeProp('b');

      core.on(function () {
        count = count + 1;
      });

      expect(count).toEqual(0);

      obj.a = 10;
      expect(count).toEqual(1);

      obj.b = 20;
      expect(count).toEqual(2);
  });
  describe('#prob', function () {
    it ('is chainable', function () {
      var core = new Pro.Core({});
      expect(core.prob()).toBe(core);
    });
  });
  describe('#set', function () {
    it ('sets present properties to new values', function () {
      var obj = {
            a:1
          },
          core = new Pro.Core(obj);
      obj.__pro__ = core;
      core.makeProp('a');

      core.set('a', 7);
      expect(obj.a).toEqual(7);
    });

    it ('adds non-present properties to the main object of the Pro.Core', function () {
      var obj = {
            a:1
          },
          core = new Pro.Core(obj);
      obj.__pro__ = core;
      core.makeProp('a');

      core.set('b', 3);
      expect(core.properties.b).not.toBe(undefined);
      expect(core.properties.b.type()).toBe(Pro.Property.Types.simple);
      expect(obj.b).toEqual(3);

      core.set('c', function () {
        return this.a + this.b;
      });
      expect(core.properties.c).not.toBe(undefined);
      expect(core.properties.c.type()).toBe(Pro.Property.Types.auto);
      expect(obj.c).toEqual(4);

      obj.a = 6;
      expect(obj.c).toEqual(9);
    });
  });

  describe('#makeProp', function () {
    describe('meta', function () {
      it ('@noprop leaves a property as it is', function () {
        var obj = {
              a: 'boo',
              sayA: function () {
                return 'Saying ' + this.a;
              }
            },
            core = new Pro.Core(obj, {
              a: ['noprop'],
              sayA: 'noprop'
            }).prob();

        expect(core.properties.a).not.toBeDefined;
        expect(core.properties.sayA).not.toBeDefined;
        expect(core.properties).toEqual({});

        expect(typeof obj.sayA).toEqual('function');
        expect(obj.sayA()).toEqual('Saying ' + obj.a);
      });
    });
  });
});
