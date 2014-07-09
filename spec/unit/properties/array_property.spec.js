'use strict';

describe('Pro.ArrayProperty', function () {
  var obj;
  beforeEach(function () {
    obj = {
      a: [1, 2, 3, 4, 5],
      ap: function () {
        if (this.a.length > 1) {
          return this.a[0] + this.a[1];
        }

        return 'bad array';
      }
    };
  });

  it('is lazy', function () {
    var original = obj.a,
        property = new Pro.ArrayProperty(obj, 'a');

    expect(Pro.Utils.isArray(property.val)).toBe(true);
    expect(Pro.Utils.isProArray(property.val)).toBe(false);
    expect(property.state).toBe(Pro.States.init);
    expect(property.val).toBe(original);

    obj.a;
    expect(property.state).toBe(Pro.States.ready);
    expect(Pro.Utils.isArray(property.val)).toBe(false);
    expect(Pro.Utils.isProArray(property.val)).toBe(true);
    expect(property.val.valueOf()).toEqual(original);
  });

  it('updates depending properties when set', function () {
    var property = new Pro.ArrayProperty(obj, 'a'),
        autoProperty = new Pro.AutoProperty(obj, 'ap');

    expect(obj.ap).toEqual(obj.a[0] + obj.a[1]);

    obj.a = [2, 3, 4];
    expect(obj.ap).toEqual(obj.a[0] + obj.a[1]);
  });

  it('updates depending properties when value contents are changed', function () {
    var property = new Pro.ArrayProperty(obj, 'a'),
        autoProperty = new Pro.AutoProperty(obj, 'ap');

    expect(obj.ap).toEqual(obj.a[0] + obj.a[1]);

    obj.a[0] = 21;
    expect(obj.ap).toEqual(obj.a[0] + obj.a[1]);
  });

  it('when array value changed properties continue to listen for the same changes on the new value', function () {
    var property = new Pro.ArrayProperty(obj, 'a'),
        autoProperty = new Pro.AutoProperty(obj, 'ap');

    expect(obj.ap).toEqual(obj.a[0] + obj.a[1]);

    obj.a[0] = 21;
    expect(obj.ap).toEqual(obj.a[0] + obj.a[1]);

    obj.a = [2, 3, 4];
    expect(obj.ap).toEqual(obj.a[0] + obj.a[1]);

    obj.a[1] = 34;
    expect(obj.ap).toEqual(obj.a[0] + obj.a[1]);

    obj.a.length = 0;
    expect(obj.ap).toEqual('bad array');
  });

  it('when array value changed properties stop listening to changes to the old array value', function () {
    var property = new Pro.ArrayProperty(obj, 'a'),
        autoProperty = new Pro.AutoProperty(obj, 'ap'),
        oldArray;

    expect(obj.ap).toEqual(obj.a[0] + obj.a[1]);

    obj.a[0] = 21;
    expect(obj.ap).toEqual(obj.a[0] + obj.a[1]);

    oldArray = obj.a;
    obj.a = [2, 3, 4];
    expect(obj.ap).toEqual(obj.a[0] + obj.a[1]);

    oldArray[1] = 34;
    expect(obj.ap).toEqual(5);

    oldArray.length = 0;
    expect(obj.ap).toEqual(5);
  });

});
