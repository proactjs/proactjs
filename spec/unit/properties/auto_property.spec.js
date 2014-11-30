'use strict';

describe('ProAct.AutoProperty', function () {
  var obj;
  beforeEach(function () {
    obj = {
      a: 5,
      ap: function () {return this.a},
      app: function () {return this.ap + 1}
    };
  });

  it('is lazy', function () {
    var original = obj.ap,
        property = new ProAct.AutoProperty(obj, 'ap'),
        value = null;

    expect(typeof(property.val)).toBe('function');
    expect(property.val).toBe(original);
    expect(property.state).toBe(ProAct.States.init);

    value = obj.ap;
    expect(property.state).toBe(ProAct.States.ready);
    expect(typeof(property.val)).not.toBe('function');
    expect(property.type()).toBe(ProAct.Property.Types.auto);
    expect(property.val).toEqual(obj.a);
  });

  it('changes when a sub-prop changes', function () {
    var property = new ProAct.Property(obj, 'a'),
        autoProperty = new ProAct.AutoProperty(obj, 'ap');

    expect(obj.a).toEqual(obj.ap);

    obj.a = 10;
    expect(obj.a).toEqual(obj.ap);
  });

  it('changes when a sub-prop changes using the transformators added to it using #transform', function () {
    var property = new ProAct.Property(obj, 'a'),
        autoProperty = new ProAct.AutoProperty(obj, 'ap');
    autoProperty.transform(function (val) {
      return val + 5;
    });

    expect(obj.a + 5).toEqual(obj.ap);

    obj.a = 10;
    expect(obj.a + 5).toEqual(obj.ap);
  });

  it('changes when an auto sub-prop changes', function () {
    var property = new ProAct.Property(obj, 'a'),
        autoProperty = new ProAct.AutoProperty(obj, 'ap'),
        autoPProperty = new ProAct.AutoProperty(obj, 'app');

    expect(obj.a).toEqual(obj.ap);
    expect(obj.ap + 1).toEqual(obj.app);

    obj.a = 10;
    expect(obj.a).toEqual(obj.ap);
    expect(obj.ap + 1).toEqual(obj.app);
  });

  it('beats the diamond problem', function () {
    var counterHash = {},
        object = {
          a: 0,
          c: function (v) {
            if (v !== undefined) {
              return v;
            }
            counterHash['c'] = counterHash['c'] || 0;
            counterHash['c'] += 1;

            return this.b + this.a + this.d;
          },
          b: function (v) {
            if (v !== undefined) {
              return v;
            }
            counterHash['b'] = counterHash['b'] || 0;
            counterHash['b'] += 1;

            return this.a + 5;
          },
          d: 1

        },
        propertyA = new ProAct.Property(object, 'a'),
        propertyB = new ProAct.AutoProperty(object, 'b'),
        propertyC = new ProAct.AutoProperty(object, 'c'),
        propertyD = new ProAct.Property(object, 'd');

    expect(object.a).toEqual(0);
    expect(object.c).toEqual(6);
    expect(object.b).toEqual(5);
    expect(counterHash['b']).toBe(1);
    expect(counterHash['c']).toBe(1);

    object.a = 4;
    expect(object.c).toEqual(14);
    expect(object.b).toEqual(9);
    expect(counterHash['b']).toBe(2);
    expect(counterHash['c']).toBe(2);

    object.d = 2;
    expect(object.c).toEqual(15);
    expect(object.b).toEqual(9);
    expect(counterHash['b']).toBe(2);
    expect(counterHash['c']).toBe(3);

    object.b = 0;
    expect(object.c).toEqual(6);
    expect(object.b).toEqual(0);
    expect(counterHash['b']).toBe(2);
    expect(counterHash['c']).toBe(4);

    object.a = 0;
    expect(object.c).toEqual(7);
    expect(object.b).toEqual(5);
    expect(counterHash['b']).toBe(3);
    expect(counterHash['c']).toBe(5);
  });

  describe('errors', function () {
    it ('Errors does not break property flows after them', function () {
      var obj = {
            p: 3,
            ep: function () {
              if (this.p === 7) {
                throw Error('my!');
              }
              return this.p;
            },
            op: function () {
              return this.ep;
            }
          },
          p = new ProAct.Property(obj, 'p'),
          ep = new ProAct.AutoProperty(obj, 'ep'),
          op = new ProAct.AutoProperty(obj, 'op');

      expect(obj.op).toBe(3);

      obj.p = 7;
      expect(obj.op).toBe(3);
      expect(obj.ep).toBe(3);

      obj.p = 8;
      expect(obj.op).toBe(8);
      expect(obj.ep).toBe(8);
    });
  });

  describe('#set', function () {
    it ('can be set like a normal ProAct.Property', function () {
      var obj = {
            ap: function (v) {
              if (v !== undefined) {
                return v;
              }
              return 9;
            }
          };

      new ProAct.AutoProperty(obj, 'ap');
      expect(obj.ap).toEqual(9);

      obj.ap = 5;
      expect(obj.ap).toEqual(5);
    });
  });

  describe('.value', function () {
    it('can be created using Property dependencies', function () {
      var a = P.P.value(3),
          b = P.P.value(5),
          c = P.P.value(function () {
            return a.get() + b.get();
          });

      expect(c.get()).toEqual(a.get() + b.get());
      expect(c.type()).toBe(P.P.Types.auto);
      expect(c.proObject.v).toEqual(a.get() + b.get());
    });

    it('can be created using Property value dependencies', function () {
      var a = P.P.value(3).proObject,
          b = P.P.value(5).proObject,
          c = P.P.value(function () {
            return a.v + b.v;
          });

      expect(c.get()).toEqual(a.v + b.v);
      expect(c.type()).toBe(P.P.Types.auto);
    });
  });

});
