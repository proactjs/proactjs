'use strict';

describe('Pro', function () {
  it ('exists in the global object', function () {
    expect(Pro).not.toBe(undefined);
    expect(Pro).not.toBe(null);
    expect(typeof(Pro)).toBe('object');
  });

  describe('#prob', function () {
    it ('exists in the namespace', function () {
      expect(Pro.prob).not.toBe(undefined);
      expect(Pro.prob).not.toBe(null);
      expect(typeof(Pro.prob)).toBe('function');
    });

    it ('turns normal js object into Pro Object (object with properties)', function () {
      var obj = {
        a: [1, 2, 3],
        b: function () {
          return a.length;
        }
      };

      Pro.prob(obj);
      expect(obj.__pro__).not.toBe(undefined);
      expect(obj.__pro__).not.toBe(null);
      expect(typeof(obj.__pro__)).toBe('object');
    });

    it ('creates fully reactive Pro.Arrays from simple arrays', function () {
      var array = Pro.prob([1, 2, 3, 4, 5]),
          joined = array.pjoin('-');

      expect(Pro.Utils.isProArray(array)).toBe(true);
      expect(joined.v).toEqual('1-2-3-4-5');

      array[2] = 30;
      expect(joined.v).toEqual('1-2-30-4-5');
    });

    describe('meta & dsl', function () {
      it ('uses property metadata to configure its properties', function () {
        var stream = new Pro.Stream(),
            proObj = Pro.prob({
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
