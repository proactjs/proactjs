'use strict';

describe('Pro.Observable', function () {
  describe('#on', function () {
    it ('adds observer to the observable', function () {
      var observable = new Pro.Observable(), res = [];

      observable.on(function (event) {
        res.push(event);
      });

      observable.update(null);

      expect(res.length).toEqual(1);
      expect(res[0].target).toEqual(observable);
    });
  });

  describe('#off', function () {
    it ('removes observer from the observable', function () {
      var observable = new Pro.Observable(), res = [],
          observer = function (event) {
            res.push(event);
          };
      observable.on(observer);
      observable.off(observer);

      observable.update(null);
      expect(res.length).toBe(0);

    });
  });
});
