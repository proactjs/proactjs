'use strict';

describe('ProAct.Registry.ProObjectProvider', function () {
  var provider;
  beforeEach(function () {
    provider = new ProAct.Registry.ProObjectProvider();
  });

  describe('#make', function () {
    it ('creates and stores in the registry a ProAct.Value if called with simple value', function () {
      var val = provider.make('test', null, 5);

      expect(P.U.isProVal(val)).toBe(true);
      expect(val.v).toBe(5);
    });

    it ('creates and stores in the registry a ProAct.Array if called with array value', function () {
      var val = provider.make('test', null, [4, 5, 6]);

      expect(P.U.isProArray(val)).toBe(true);
      expect(val.valueOf()).toEqual([4, 5, 6]);
    });

    it ('creates and stores in the registry a pro object if called with object value', function () {
      var val = provider.make('test', null, {
        val: 5,
        valPow: function () {return this.val * this.val;}
      });

      expect(P.U.isProObject(val)).toBe(true);
      expect(val.val).toEqual(5);
      expect(val.valPow).toEqual(25);
    });

    it ('is able to pass meta-data while creating a ProAct object', function () {
      var res = [], val = provider.make('test', null, {
            x: 5,
            y: 4,
            pow: function () {return this.x * this.y;}
          },
          {
            pow: ['@($1)', function (val) {res.push(val);}]
          });

      val.pow;
      val.y = 5;

      expect(res.length).toBe(1);
      expect(res[0].type).toBe(ProAct.Event.Types.value);
    });

    describe('in the ProAct.Registry', function () {
      it ('creates and stores ProAct.Vals in the registry', function () {
        var reg = new ProAct.Registry().register('po', provider), res = [];

        reg.prob('test', 0, ['@($1)', function (v) {
          res.push(v);
        }]);

        expect(reg.get('po:test')).not.toBe(undefined);
        expect(P.U.isProVal(reg.get('po:test'))).toBe(true);
      });
    });
  });
});
