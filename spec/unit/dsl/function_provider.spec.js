'use strict';

describe('ProAct.Registry.FunctionProvider', function () {
  var provider;
  beforeEach(function () {
    provider = new ProAct.Registry.FunctionProvider();
  });

  describe('#get', function () {
    it ('retrieves predefined lambdas using keys in the format: "map(-)"', function () {
      var result = provider.get('map(-)');

      expect(result).toNotBe(null);
      expect(result).toNotBe(undefined);
      expect(ProAct.Utils.isFunction(result)).toBe(true);

      expect(result.call(null, 5)).toBe(-5);
    });

    it ('reads the oposite functions, using the notation !<key>', function () {
      provider.store('zero', function (v) {
        return (v === 0);
      });

      var result = provider.get('!zero');

      expect(result).toNotBe(null);
      expect(result).toNotBe(undefined);
      expect(ProAct.Utils.isFunction(result)).toBe(true);

      expect(result(0)).toBe(false);
    });

    it ('reads the func1 OR func2 OR ..., using the notation <key1> OR <key2> OR ...', function () {
      provider.store('zero', function (v) {
        return (v === 0);
      });
      provider.store('one', function (v) {
        return (v === 1);
      });
      provider.store('two', function (v) {
        return (v === 2);
      });

      var result = provider.get('zero OR oneORtwo');

      expect(result).toNotBe(null);
      expect(result).toNotBe(undefined);
      expect(ProAct.Utils.isFunction(result)).toBe(true);

      expect(result(0)).toBe(true);
      expect(result(1)).toBe(true);
      expect(result(2)).toBe(true);
      expect(result(3)).toBe(false);
    });

    it ('reads the func1 AND func2 AND ..., using the notation <key1> AND <key2> AND ...', function () {
      provider.store('toOne', function (v) {
        return (v % 1) === 0;
      });
      provider.store('toTwo', function (v) {
        return (v % 2) === 0;
      });
      provider.store('toThree', function (v) {
        return (v % 3) === 0;
      });

      var result = provider.get('toOne AND toTwoANDtoThree');

      expect(result).toNotBe(null);
      expect(result).toNotBe(undefined);
      expect(ProAct.Utils.isFunction(result)).toBe(true);

      expect(result(1)).toBe(false);
      expect(result(2)).toBe(false);
      expect(result(3)).toBe(false);
      expect(result(6)).toBe(true);
    });
  });

});
