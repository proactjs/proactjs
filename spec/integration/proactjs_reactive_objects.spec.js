'use strict';

describe('ProAct', function () {
  it ('exists in the global object', function () {
    expect(ProAct).not.toBe(undefined);
    expect(ProAct).not.toBe(null);
    expect(typeof(ProAct)).toBe('object');
  });

  describe('#prob', function () {
    it ('exists in the namespace', function () {
      expect(ProAct.prob).not.toBe(undefined);
      expect(ProAct.prob).not.toBe(null);
      expect(typeof(ProAct.prob)).toBe('function');
    });

    it ('turns normal js object into ProAct Object (object with properties)', function () {
      var obj = {
        a: [1, 2, 3],
        b: function () {
          return a.length;
        }
      };

      ProAct.prob(obj);
      expect(obj.__pro__).not.toBe(undefined);
      expect(obj.__pro__).not.toBe(null);
      expect(typeof(obj.__pro__)).toBe('object');
    });

    it ('creates fully reactive ProAct.Arrays from simple arrays', function () {
      var array = ProAct.prob([1, 2, 3, 4, 5]),
          joined = array.pjoin('-');

      expect(ProAct.Utils.isProArray(array)).toBe(true);
      expect(joined.v).toEqual('1-2-3-4-5');

      array[2] = 30;
      expect(joined.v).toEqual('1-2-30-4-5');
    });

    describe('meta & dsl', function () {
      it ('uses property metadata to configure its properties', function () {
        var stream = ProAct.stream(),
            proObj = ProAct.prob({
              counter: 0,
              renderCounter: function () {
                return 'Hey, we have ' + this.counter + ' counts';
              },
              counterPow: function () {
                return this.counter * this.counter;
              }
            },
            {
              counter: ['<<($1)', stream],
              renderCounter: ['map($1)', function (v) {
                return v.replace('-', '');
              }],
              counterPow: 'noprop'
            });

        stream.trigger(-1);
        expect(proObj.counter).toEqual(-1);
        expect(proObj.renderCounter).toEqual('Hey, we have ' + 1 + ' counts');

        expect(typeof(proObj.counterPow)).toEqual('function');
        expect(proObj.counterPow()).toEqual(1);
      });
    });
  });

});
