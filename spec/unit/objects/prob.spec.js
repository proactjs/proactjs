'use strict';

describe('Pro.prob', function () {

  beforeEach(function () {
    Pro.Configuration = {
      keyprops: true,
      keypropList: ['p']
    };
  });

  it ('turns number to a Pro.Val with value the number', function () {
    var val = Pro.prob(5);

    expect(Pro.Utils.isProVal(val)).toBe(true);
    expect(val.v).toBe(5);
  });

  it ('turns string to a Pro.Val with value the string', function () {
    var val = Pro.prob('5');

    expect(Pro.Utils.isProVal(val)).toBe(true);
    expect(val.v).toBe('5');
  });

  it ('turns boolean to a Pro.Val with value the boolean', function () {
    var val = Pro.prob(false);

    expect(Pro.Utils.isProVal(val)).toBe(true);
    expect(val.v).toBe(false);
  });

  it ('turns null to a Pro.Val with value null', function () {
    var val = Pro.prob(null);

    expect(Pro.Utils.isProVal(val)).toBe(true);
    expect(val.v).toBe(null);
  });

  it ('turns undefined to a Pro.Val with value undefined', function () {
    var val = Pro.prob(undefined);

    expect(Pro.Utils.isProVal(val)).toBe(true);
    expect(val.v).toBe(undefined);
  });

  it('makes normal object with simple properties a Pro object.', function () {
    var obj = {
      a: 1,
      b: '2',
      c: true,
      d: 2.3,
    }, proObject;

    proObject = Pro.prob(obj);

    expect(proObject).toBe(obj);
    expect(proObject.__pro__).not.toBe(undefined);
    expect(proObject.__pro__.state).toBe(Pro.States.ready);

    expect(proObject.__pro__.properties.a.get()).toBe(obj.a);
    expect(proObject.__pro__.properties.b.get()).toBe(obj.b);
    expect(proObject.__pro__.properties.c.get()).toBe(obj.c);
    expect(proObject.__pro__.properties.d.get()).toBe(obj.d);

    expect(proObject.__pro__.properties.a.state).toBe(Pro.States.ready);
    expect(proObject.__pro__.properties.b.state).toBe(Pro.States.ready);
    expect(proObject.__pro__.properties.c.state).toBe(Pro.States.ready);
    expect(proObject.__pro__.properties.d.state).toBe(Pro.States.ready);

    if (Pro.Configuration.keyprops && Pro.Configuration.keypropList.indexOf('p') !== -1) {
      expect(proObject.__pro__.properties.a).toBe(obj.p('a'));
      expect(proObject.__pro__.properties.b).toBe(obj.p('b'));
      expect(proObject.__pro__.properties.c).toBe(obj.p('c'))
      expect(proObject.__pro__.properties.d).toBe(obj.p('d'))
    }
  });

  it('throws an error if there is object with keywprop property', function () {
    Pro.Configuration = {
      keyprops: true,
      keypropList: ['c']
    };

    var obj = {
      a: 1,
      b: '2',
      c: true,
      d: 2.3
    }, proObject;

    expect(function () {
      Pro.prob(obj);
    }).toThrow(new Error('The property name c is a key word for pro objects! Objects passed to Pro.prob can not contain properties named as keyword properties.'));

    expect(obj.__pro__).not.toBe(undefined);
    expect(obj.__pro__.state).toBe(Pro.States.error);
  });

  it('creates pro objects with auto and normal properties from object with simple values and functions', function () {
    var obj = {
      x: 0,
      y: 0,
      sum: function () {
        return this.x + this.y;
      },
      product: function () {
        return this.x * this.y;
      },
      rational: function () {
        return this.x + "/" + this.y;
      }
    }, proObject;

    proObject = Pro.prob(obj);

    expect(proObject).toBe(obj);
    expect(proObject.__pro__).not.toBe(undefined);
    expect(proObject.__pro__.state).toBe(Pro.States.ready);

    expect(proObject.__pro__.properties.x.get()).toBe(obj.x);
    expect(proObject.__pro__.properties.y.get()).toBe(obj.y);
    expect(proObject.__pro__.properties.sum.get()).toBe(obj.sum);
    expect(proObject.__pro__.properties.product.get()).toBe(obj.product);
    expect(proObject.__pro__.properties.rational.get()).toBe(obj.rational);

    expect(proObject.__pro__.properties.x.state).toBe(Pro.States.ready);
    expect(proObject.__pro__.properties.y.state).toBe(Pro.States.ready);
    expect(proObject.__pro__.properties.sum.state).toBe(Pro.States.ready);
    expect(proObject.__pro__.properties.product.state).toBe(Pro.States.ready);
    expect(proObject.__pro__.properties.rational.state).toBe(Pro.States.ready);

    if (Pro.Configuration.keyprops && Pro.Configuration.keypropList.indexOf('p') !== -1) {
      expect(proObject.__pro__.properties.x).toBe(obj.p('x'));
      expect(proObject.__pro__.properties.y).toBe(obj.p('y'));
      expect(proObject.__pro__.properties.sum).toBe(obj.p('sum'))
      expect(proObject.__pro__.properties.product).toBe(obj.p('product'))
      expect(proObject.__pro__.properties.rational).toBe(obj.p('rational'))
    }

    expect(obj.x).toBe(0);
    expect(obj.y).toBe(0);
    expect(obj.sum).toBe(0);
    expect(obj.product).toBe(0);
    expect(obj.rational).toEqual('0/0');

    obj.y = 4;
    obj.x = 5;
    expect(obj.x).toBe(5);
    expect(obj.y).toBe(4);
    expect(obj.sum).toBe(9);
    expect(obj.product).toBe(20);
    expect(obj.rational).toEqual('5/4');
  });

  it('connections between properties of two or more Pro objects work', function () {
    var objA, objB, objC;

    objA = {
      a: 1,
      foo: function () {
        return this.a + objB.b + objC.c;
      }
    };

    objB = {
      b: '1',
      bar: function () {
        return objA.a * this.b * objC.c;
      }
    };

    objC = {
      c: true,
      baz: function () {
        return '(' + objA.a + ', ' + objB.b + ', ' + this.c + ')';
      }
    };

    Pro.prob(objA);
    Pro.prob(objB);
    Pro.prob(objC);

    expect(objA.a).toEqual(1);
    expect(objA.foo).toEqual('11true');
    expect(objB.b).toEqual('1');
    expect(objB.bar).toEqual(1);
    expect(objC.c).toEqual(true);
    expect(objC.baz).toEqual('(1, 1, true)');

    objA.a = 5;
    objB.b = '5';
    objC.c = false;
    expect(objA.a).toEqual(5);
    expect(objA.foo).toEqual('55false');
  });

  it('makes subobjects pro objects too.', function () {
    var f = function () {return 5;}, obj = {
      num: 5,
      str: 'some stuff',
      bool: true,
      obj1: {
        fl: 3.4,
        nl: null,
        obj12: {
          f1: function () {
            if (obj.obj1.nl) {
              return obj.obj1.nl;
            }

            return obj.obj1.fl;
          },
          f2: function () {
            return obj.str + ' ' + obj.f3;
          }
        }
      },
      obj2: {
        ar: [1, '2', true, f],
        f2: function () {
          return this.ar[1];
        }
      },
      f3: function () {
        return this.obj2.ar[1] + this.obj1.obj12.f1 + this.num + this.obj2.ar[3]();
      }
    };

    obj = Pro.prob(obj);

    expect(Pro.Utils.isProObject(obj)).toBe(true);
    expect(obj.__pro__.state).toBe(Pro.States.ready);
    expect(obj.num).toBe(5);
    expect(obj.str).toBe('some stuff');
    expect(obj.bool).toBe(true);

    expect(Pro.Utils.isProObject(obj.obj1)).toBe(true);
    expect(obj.obj1.__pro__.state).toBe(Pro.States.ready);
    expect(obj.obj1.fl).toEqual(3.4);
    expect(obj.obj1.nl).toBe(null);
    expect(Pro.Utils.isProObject(obj.obj1.obj12)).toBe(true);
    expect(obj.obj1.obj12.__pro__.state).toBe(Pro.States.ready);
    expect(obj.obj1.obj12.__pro__.properties.f1.state).toBe(Pro.States.init);
    expect(obj.obj1.obj12.f1).toEqual(3.4);
    expect(obj.obj1.obj12.__pro__.properties.f1.state).toBe(Pro.States.ready);

    expect(Pro.Utils.isProObject(obj.obj2)).toBe(true);
    expect(obj.obj2.__pro__.state).toBe(Pro.States.ready);
    expect(obj.obj2.ar.valueOf()).toEqual([1, '2', true, f]);
    expect(obj.obj2.f2).toEqual('2');

    expect(obj.f3).toEqual('23.455');
    expect(obj.obj1.obj12.f2).toEqual('some stuff 23.455');

    obj.obj2.ar[1] = 2;
    expect(obj.f3).toEqual(15.4);
    expect(obj.obj2.f2).toEqual(2);
    expect(obj.obj1.obj12.f2).toEqual('some stuff 15.4');
  });

  it ('Creates arrays from Pro.Arrays.', function () {
    var array = [1, '2', 3.0, true, null], proArray;

    proArray = Pro.prob(array);
    expect(Pro.Utils.isProArray(proArray)).toBe(true);
    expect(proArray.valueOf()).toEqual([1, '2', 3.0, true, null]);
  });

  it ('the Pro.Core of property objects created by it can be retrieved through object#p()', function () {
    var obj = Pro.prob({
      a: 1,
      b: 3
    });

    expect(obj.p()).toBe(obj.__pro__)
  });

  it ('the Pro.Core of property objects created by it can be retrieved through object#p("*")', function () {
    var obj = Pro.prob({
      a: 1,
      b: 3
    });

    expect(obj.p('*')).toBe(obj.__pro__)
  });

  it ('can use the meta to set sources of properties using the <<($n) syntax', function () {
    var source = Pro.prob({a: 1}),
        obj = Pro.prob({
          a:1
        }, {
          a: ['<<($1)', source.p('a')]
        });

    expect(obj.a).toEqual(1);

    source.a = 2;
    expect(obj.a).toEqual(2);
  });

  it ('can use the meta to set mapping using map(?) syntax', function () {
    var obj = Pro.prob({
          b: 0,
          a: function () {
            return '(' + this.b + ')';
          }
        }, {
          b: ['map(-)']
        });

    obj.b = 1;

    expect(obj.a).toEqual('(-1)');
  });

});
