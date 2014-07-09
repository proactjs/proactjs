'use strict';

describe('Pro.ObjectProperty', function () {
  var obj;
  beforeEach(function () {
    obj = {
      a: 5,
      ap: function () {
        return this.a + this.op.b;
      },
      op: {
        b: 4
      }
    };
  });

  it('is lazy', function () {
    var original = obj.op,
        property = new Pro.ObjectProperty(obj, 'op');

    expect(property.val.__pro__).toBe(undefined);
    expect(property.type()).toBe(Pro.Property.Types.object);
    expect(property.state).toBe(Pro.States.init);
    expect(property.val).toBe(original);

    obj.op;
    expect(property.state).toBe(Pro.States.ready);
    expect(property.val.__pro__).not.toBe(undefined);
    expect(property.val).toEqual(obj.op);
  });

  it('auto properties of object container are updated by object properties they depend on.', function () {
    var property = new Pro.Property(obj, 'a'),
        autoProperty = new Pro.AutoProperty(obj, 'ap'),
        objectProperty = new Pro.ObjectProperty(obj, 'op');

    expect(obj.ap).toEqual(obj.a + obj.op.b);

    obj.op.b = 3;
    expect(obj.ap).toEqual(obj.a + obj.op.b);

    obj.a = 2;
    expect(obj.ap).toEqual(obj.a + obj.op.b);
  });

  it('setting an object property updates the properties dependent on it sub-properties', function () {
    var property = new Pro.Property(obj, 'a'),
        autoProperty = new Pro.AutoProperty(obj, 'ap'),
        objectProperty = new Pro.ObjectProperty(obj, 'op');

    expect(obj.ap).toEqual(obj.a + obj.op.b);

    obj.op = {
      b: 3
    };
    expect(obj.ap).toEqual(obj.a + obj.op.b);

    obj.op.b = 5;
    expect(obj.ap).toEqual(obj.a + obj.op.b);

    obj.a = 2;
    expect(obj.ap).toEqual(obj.a + obj.op.b);
  });

  it('old values\' subprop changes doesn\'t affect pro object auto properties', function () {
    var property = new Pro.Property(obj, 'a'),
        autoProperty = new Pro.AutoProperty(obj, 'ap'),
        objectProperty = new Pro.ObjectProperty(obj, 'op'),
        oldValue;

    expect(obj.ap).toEqual(obj.a + obj.op.b);

    oldValue = obj.op;
    obj.op = {
      b: 3
    };
    expect(obj.ap).toEqual(obj.a + obj.op.b);

    obj.op.b = 5;
    expect(obj.ap).toEqual(obj.a + obj.op.b);

    oldValue.b = 10;
    expect(obj.op.b).not.toEqual(oldValue.b);
    expect(obj.ap).toEqual(obj.a + obj.op.b);
  });

  it ('it can be set to an empty object', function () {
    var objectProperty = new Pro.ObjectProperty(obj, 'op')
    obj.op;

    obj.op = {};
    expect(obj.op.b).not.toBeDefined();
  });

});
