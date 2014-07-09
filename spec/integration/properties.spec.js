'use strict';

describe('Pro.Property, Pro.AutoProperty, Pro.ObjectProperty, Pro.ArrayProperty and Pro.NullProperty', function () {
  var obj;
  beforeEach(function () {
    obj = Pro.prob({
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
      g: Pro.prob(5),
      h: Pro.prob([1, 2, ['one']]),
      i: Pro.prob({a: 4, b: function () {
        return obj.a;
      }}),
      j: Pro.prob(null),
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
      l: Pro.prob(function () {
        return obj.g.v;
      })
    });
  });

  it ('complex Pro.Object containing all the types of properties is valid', function () {
    expect(obj.p('a').type()).toEqual(Pro.Property.Types.simple);
    expect(obj.a).toEqual(1);

    expect(obj.p('b').type()).toEqual(Pro.Property.Types.simple);
    expect(obj.b).toEqual('one');

    expect(obj.p('c').type()).toEqual(Pro.Property.Types.nil);
    expect(obj.c).toBeNull;

    expect(obj.p('d').type()).toEqual(Pro.Property.Types.nil);
    expect(obj.d).not.toBeDefined;

    expect(obj.p('e').type()).toEqual(Pro.Property.Types.object);
    expect(Pro.U.isProObject(obj.e)).toBe(true);
    expect(obj.e.p('a').type()).toEqual(Pro.Property.Types.simple);
    expect(obj.e.a).toEqual(1.1);
    expect(obj.e.p('b').type()).toEqual(Pro.Property.Types.simple);
    expect(obj.e.b).toBe(true);

    expect(obj.p('f').type()).toEqual(Pro.Property.Types.array);
    expect(Pro.U.isProArray(obj.f)).toBe(true);
    expect(obj.f[0]).toEqual(1);
    expect(obj.f[1]).toEqual(false);
    expect(obj.f[2]).toBeNull;
    expect(Pro.U.isProArray(obj.f[3])).toBe(true);
    expect(obj.f[3][0]).toEqual('two');
    expect(Pro.U.isProObject(obj.f[3][1])).toBe(true);
    expect(obj.f[3][1].p('a').type()).toEqual(Pro.Property.Types.simple);
    expect(obj.f[3][1].a).toEqual(3);
    expect(Pro.U.isFunction(obj.f[4])).toBe(true);
    expect(obj.f[4]()).toEqual(4);

    expect(obj.p('g').type()).toEqual(Pro.Property.Types.object);
    expect(Pro.U.isProVal(obj.g)).toBe(true);
    expect(obj.g.v).toEqual(5);

    expect(obj.p('h').type()).toEqual(Pro.Property.Types.array);
    expect(Pro.U.isProArray(obj.h)).toBe(true);
    expect(obj.h[0]).toEqual(1);
    expect(obj.h[1]).toEqual(2);
    expect(Pro.U.isProArray(obj.h[2])).toBe(true);
    expect(obj.h[2][0]).toEqual('one');

    expect(obj.p('i').type()).toEqual(Pro.Property.Types.object);
    expect(Pro.U.isProObject(obj.i)).toBe(true);
    expect(obj.i.p('a').type()).toEqual(Pro.Property.Types.simple);
    expect(obj.i.a).toEqual(4);
    expect(obj.i.p('b').type()).toEqual(Pro.Property.Types.auto);
    expect(obj.i.b).toEqual(obj.a);

    expect(obj.p('j').type()).toEqual(Pro.Property.Types.object);
    expect(Pro.U.isProVal(obj.j)).toBe(true);
    expect(obj.j.v).toBeNull;

    expect(obj.p('k').type()).toEqual(Pro.Property.Types.auto);
    expect(obj.k).toEqual(obj.f[1]);

    expect(obj.p('l').type()).toEqual(Pro.Property.Types.object);
    expect(Pro.U.isProVal(obj.l)).toBe(true);
    expect(obj.l.v).toEqual(obj.g.v);
  });

  it ('null property can become simple property', function () {
    expect(obj.p('c').type()).toEqual(Pro.Property.Types.nil);
    expect(obj.k).toEqual(false);
    expect(obj.p('c').listeners.length).toEqual(1);

    obj.c = 17;
    expect(obj.c).toEqual(17);
    expect(obj.p('c').type()).toEqual(Pro.Property.Types.simple);
    expect(obj.p('c').listeners.length).toEqual(1);
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
    expect(obj.p('c').type()).toEqual(Pro.Property.Types.auto);
    expect(obj.p('c').listeners.length).toEqual(1);
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
    expect(Pro.U.isProArray(obj.c)).toBe(true);
    expect(obj.c.valueOf()).toEqual([4]);
    expect(obj.p('c').type()).toEqual(Pro.Property.Types.array);
    expect(obj.p('c').listeners.length).toEqual(1);
    expect(obj.k).toEqual(true);
  });

  it ('null property can become object property', function () {
    expect(obj.k).toEqual(false);

    obj.c = {a: 'null'};
    expect(Pro.U.isProObject(obj.c)).toBe(true);
    expect(obj.c.a).toEqual('null');
    expect(obj.p('c').type()).toEqual(Pro.Property.Types.object);
    expect(obj.p('c').listeners.length).toEqual(1);
    expect(obj.k).toEqual(true);

    obj.c = {};
  });

  it ('undefined values are turned to null properties', function () {
    expect(obj.d).not.toBeDefined();
    expect(obj.p('d').type()).toEqual(Pro.Property.Types.nil);
  });

  it ('simple property can be set to null and it will be turned to null property', function () {
    expect(obj.a).toEqual(1);
    expect(obj.i.b).toEqual(1);

    obj.a = null;
    expect(obj.a).toBeNull;
    expect(obj.p('a').type()).toEqual(Pro.Property.Types.nil);
    expect(obj.i.b).toEqual(null);
  });

  it ('array property can be set to null and it will be turned to null property', function () {
    expect(obj.p('f').type()).toEqual(Pro.Property.Types.array);
    expect(Pro.U.isProArray(obj.f)).toBe(true);
    expect(obj.k).toBe(false);

    obj.f = null;
    expect(obj.f).toBeNull;
    expect(obj.p('f').type()).toEqual(Pro.Property.Types.nil);
    expect(obj.k).toBe(1);
  });

  it ('object property can be set to null and it will be turned to null property', function () {
    obj.c = true;
    expect(obj.p('e').type()).toEqual(Pro.Property.Types.object);
    expect(Pro.U.isProObject(obj.e)).toBe(true);
    expect(obj.k).toBe(true);

    obj.e = null;
    expect(obj.e).toBeNull;
    expect(obj.p('e').type()).toEqual(Pro.Property.Types.nil);
    expect(obj.k).toEqual('one');
  });
});
