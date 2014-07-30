'use strict';

describe('ProAct.Val', function () {

  describe('#constructor', function () {
    it ('constructs a ProAct.js object with only one property - v', function () {
      var val = new ProAct.Val(3);

      expect(ProAct.Utils.isProObject(val)).toBe(true);
      expect(val.v).toBe(3);
    });

    it ('the constructed val can be empty', function () {
      var val = new ProAct.Val();

      expect(ProAct.Utils.isProObject(val)).toBe(true);
      expect(val.v).toBe(undefined);
    });

    it ('meta can be passed to the constructor', function () {
      var val = new ProAct.Val(0, ['@($1)', function (v) {
            res.push(v);
          }]),
          res = [];

      val.v = 5;
      expect(res.length).toBe(1);
      expect(res[0].type).toBe(ProAct.Event.Types.value);
      expect(res[0].args[2]).toBe(5);
    });
  });

  describe('#type', function () {
    it('returns the right type, depending on the value', function () {
      var val = new ProAct.Val(3);

      expect(val.type()).toBe(ProAct.Property.Types.simple);
    });
  });

  it ('one value can depend on another', function () {
    var val = new ProAct.Val(5),
        vall = new ProAct.Val(function () {
          return val.v + 5;
        });
    expect(val.v).toBe(5);
    expect(vall.v).toBe(10);

    val.v = 10;
    expect(val.v).toBe(10);
    expect(vall.v).toBe(15);
  });

});
