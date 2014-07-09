'use strict';

describe('Pro.Val', function () {

  describe('#constructor', function () {
    it ('constructs a Pro object with only one property - v', function () {
      var val = new Pro.Val(3);

      expect(Pro.Utils.isProObject(val)).toBe(true);
      expect(val.v).toBe(3);
    });

    it ('the constructed val can be empty', function () {
      var val = new Pro.Val();

      expect(Pro.Utils.isProObject(val)).toBe(true);
      expect(val.v).toBe(undefined);
    });
  });

  describe('#type', function () {
    it('returns the right type, depending on the value', function () {
      var val = new Pro.Val(3);

      expect(val.type()).toBe(Pro.Property.Types.simple);
    });
  });

  it ('one value can depend on another', function () {
    var val = new Pro.Val(5),
        vall = new Pro.Val(function () {
          return val.v + 5;
        });
    expect(val.v).toBe(5);
    expect(vall.v).toBe(10);

    val.v = 10;
    expect(val.v).toBe(10);
    expect(vall.v).toBe(15);
  });

});
