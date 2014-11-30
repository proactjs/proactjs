'use strict';

describe('ProAct.Event, ProAct.ValueEvent, ProAct.Property, ProAct.AutoProperty, ProAct.ObjectProperty, ProAct.ArrayProperty and ProAct.NullProperty', function () {
  var obj;
  beforeEach(function () {
    obj = ProAct.prob({
      a: 1,
      b: 'one',
      c: null,
      d: undefined,
      e: {
        a: 1.1,
        b: true
      },
      f: [1, false, null, ['two', {a: 3}], function () {
        return 4;
      }],
      g: ProAct.prob(5),
      h: ProAct.prob([1, 2, ['one']]),
      i: ProAct.prob({a: 4, b: function () {
        return obj.a;
      }}),
      j: ProAct.prob(null),
      k: function () {
        if (this.c) {
          if (this.e) {
            return this.e.b;
          }

          return this.b;
        }

        if (this.f) {
          return this.f[1];
        } else {
          return this.h[0];
        }
      },
      l: ProAct.prob(function () {
        return obj.g.v;
      })
    });
  });

  it ('complex ProAct.Object containing all the types of properties is valid', function () {
    expect(obj.p('a').type()).toEqual(ProAct.Property.Types.simple);
    expect(obj.a).toEqual(1);

    expect(obj.p('b').type()).toEqual(ProAct.Property.Types.simple);
    expect(obj.b).toEqual('one');

    expect(obj.p('c').type()).toEqual(ProAct.Property.Types.nil);
    expect(obj.c).toBeNull;

    expect(obj.p('d').type()).toEqual(ProAct.Property.Types.nil);
    expect(obj.d).not.toBeDefined;

    expect(obj.p('e').type()).toEqual(ProAct.Property.Types.object);
    expect(ProAct.U.isProObject(obj.e)).toBe(true);
    expect(obj.e.p('a').type()).toEqual(ProAct.Property.Types.simple);
    expect(obj.e.a).toEqual(1.1);
    expect(obj.e.p('b').type()).toEqual(ProAct.Property.Types.simple);
    expect(obj.e.b).toBe(true);

    expect(obj.p('f').type()).toEqual(ProAct.Property.Types.array);
    expect(ProAct.U.isProArray(obj.f)).toBe(true);
    expect(obj.f[0]).toEqual(1);
    expect(obj.f[1]).toEqual(false);
    expect(obj.f[2]).toBeNull;
    expect(ProAct.U.isProArray(obj.f[3])).toBe(true);
    expect(obj.f[3][0]).toEqual('two');
    expect(ProAct.U.isProObject(obj.f[3][1])).toBe(true);
    expect(obj.f[3][1].p('a').type()).toEqual(ProAct.Property.Types.simple);
    expect(obj.f[3][1].a).toEqual(3);
    expect(ProAct.U.isFunction(obj.f[4])).toBe(true);
    expect(obj.f[4]()).toEqual(4);

    expect(obj.p('g').type()).toEqual(ProAct.Property.Types.object);
    expect(obj.g.v).toEqual(5);

    expect(obj.p('h').type()).toEqual(ProAct.Property.Types.array);
    expect(ProAct.U.isProArray(obj.h)).toBe(true);
    expect(obj.h[0]).toEqual(1);
    expect(obj.h[1]).toEqual(2);
    expect(ProAct.U.isProArray(obj.h[2])).toBe(true);
    expect(obj.h[2][0]).toEqual('one');

    expect(obj.p('i').type()).toEqual(ProAct.Property.Types.object);
    expect(ProAct.U.isProObject(obj.i)).toBe(true);
    expect(obj.i.p('a').type()).toEqual(ProAct.Property.Types.simple);
    expect(obj.i.a).toEqual(4);
    expect(obj.i.p('b').type()).toEqual(ProAct.Property.Types.auto);
    expect(obj.i.b).toEqual(obj.a);

    expect(obj.p('j').type()).toEqual(ProAct.Property.Types.object);
    expect(obj.j.v).toBeNull;

    expect(obj.p('k').type()).toEqual(ProAct.Property.Types.auto);
    expect(obj.k).toEqual(obj.f[1]);

    expect(obj.p('l').type()).toEqual(ProAct.Property.Types.object);
    expect(obj.l.v).toEqual(obj.g.v);
  });

  it ('null property can become simple property', function () {
    expect(obj.p('c').type()).toEqual(ProAct.Property.Types.nil);
    expect(obj.k).toEqual(false);
    expect(obj.p('c').listeners.change.length).toEqual(1);

    obj.c = 17;
    expect(obj.c).toEqual(17);
    expect(obj.p('c').type()).toEqual(ProAct.Property.Types.simple);
    expect(obj.p('c').listeners.change.length).toEqual(1);
    expect(obj.k).toEqual(true);

    obj.c = 0;
    expect(obj.k).toEqual(false);
  });

  it ('null property can become auto property', function () {
    expect(obj.k).toEqual(false);

    obj.c = function () {
      return this.a + this.e.a;
    };
    expect(obj.c).toEqual(2.1);
    expect(obj.p('c').type()).toEqual(ProAct.Property.Types.auto);
    expect(obj.p('c').listeners.change.length).toEqual(1);
    expect(obj.k).toEqual(true);

    obj.e.a = 1;
    expect(obj.c).toEqual(2);

    obj.a = -1;
    expect(obj.c).toEqual(0);
    expect(obj.k).toEqual(false);
  });

  it ('null property can become array property', function () {
    expect(obj.k).toEqual(false);

    obj.c = [4];
    expect(ProAct.U.isProArray(obj.c)).toBe(true);
    expect(obj.c.valueOf()).toEqual([4]);
    expect(obj.p('c').type()).toEqual(ProAct.Property.Types.array);
    expect(obj.p('c').listeners.change.length).toEqual(1);
    expect(obj.k).toEqual(true);
  });

  it ('null property can become object property', function () {
    expect(obj.k).toEqual(false);

    obj.c = {a: 'null'};
    expect(ProAct.U.isProObject(obj.c)).toBe(true);
    expect(obj.c.a).toEqual('null');
    expect(obj.p('c').type()).toEqual(ProAct.Property.Types.object);
    expect(obj.p('c').listeners.change.length).toEqual(1);
    expect(obj.k).toEqual(true);

    obj.c = {};
  });

  it ('undefined values are turned to null properties', function () {
    expect(obj.d).not.toBeDefined();
    expect(obj.p('d').type()).toEqual(ProAct.Property.Types.nil);
  });

  it ('simple property can be set to null and it will be turned to null property', function () {
    expect(obj.a).toEqual(1);
    expect(obj.i.b).toEqual(1);

    obj.a = null;
    expect(obj.a).toBeNull;
    expect(obj.p('a').type()).toEqual(ProAct.Property.Types.nil);
    expect(obj.i.b).toEqual(null);
  });

  it ('array property can be set to null and it will be turned to null property', function () {
    expect(obj.p('f').type()).toEqual(ProAct.Property.Types.array);
    expect(ProAct.U.isProArray(obj.f)).toBe(true);
    expect(obj.k).toBe(false);

    obj.f = null;
    expect(obj.f).toBeNull;
    expect(obj.p('f').type()).toEqual(ProAct.Property.Types.nil);
    expect(obj.k).toBe(1);
  });

  it ('object property can be set to null and it will be turned to null property', function () {
    obj.c = true;
    expect(obj.p('e').type()).toEqual(ProAct.Property.Types.object);
    expect(ProAct.U.isProObject(obj.e)).toBe(true);
    expect(obj.k).toBe(true);

    obj.e = null;
    expect(obj.e).toBeNull;
    expect(obj.p('e').type()).toEqual(ProAct.Property.Types.nil);
    expect(obj.k).toEqual('one');
  });

  describe('ProAct.ValueEvent', function () {
    var event, listener;
    beforeEach(function () {
      event = null;
      listener = function (e) {
        event = e;
      };
    });

    it ('is emitted on ProAct.Property change', function () {
      obj.p('a').on(listener);
      obj.a = 5;

      expect(event).toNotBe(undefined);
      expect(event.constructor).toBe(ProAct.ValueEvent);
    });

    describe('#fromVal', function () {
      it ('returns the value this event changes for simple ProAct.Property', function () {
        var oldVal = obj.a;

        obj.p('a').on(listener);
        obj.a = 5;

        expect(event.fromVal()).toNotBe(undefined);
        expect(event.fromVal()).toBe(oldVal);
      });

      it ('returns the value this event changes for ProAct.AutoProperty', function () {
        var oldVal = obj.i.b;

        obj.i.p('b').on(listener);
        obj.a = 5;

        expect(event.fromVal()).toNotBe(undefined);
        expect(event.fromVal()).toBe(oldVal);
      });
    });

    describe('#toVal', function () {
      it ('returns the value this event sets for simple ProAct.Property', function () {
        obj.p('a').on(listener);
        obj.a = 5;

        expect(event.toVal()).toNotBe(undefined);
        expect(event.toVal()).toBe(5);
      });

      it ('returns the value this event sets for ProAct.AutoProperty', function () {
        var oldVal = obj.i.b;

        obj.i.p('b').on(listener);
        obj.a = 5;

        expect(event.toVal()).toNotBe(undefined);
        expect(event.toVal()).toBe(5);
      });
    });
  });
});
