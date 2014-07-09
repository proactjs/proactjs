'use strict';

describe('Pro.BufferedStream', function () {
    describe('#delay', function () {
      it ('fires all the buffered events', function () {
        var stream = new Pro.Stream().delay(100), res = [];

        stream.on(function (el) {
          res.push(el);
        });

        stream.trigger('a');
        stream.trigger('b');
        stream.trigger('c');
        stream.trigger('d');

        expect(res).toEqual([]);
        waits(110);
        runs(function () {
          expect(res).toEqual(['a', 'b', 'c', 'd']);
        });
      });
    });

    describe('#throttle', function () {
      it ('can trigger the same event in a given time tunnel only once', function () {
        var stream = new Pro.Stream().throttle(100), res = [];

        stream.on(function (el) {
          res.push(el);
        });

        stream.trigger('a');
        stream.trigger('b');
        stream.trigger('c');
        stream.trigger('a');
        stream.trigger('f');

        expect(res).toEqual([]);
        waits(110);
        runs(function () {
          expect(res).toEqual(['f']);

          stream.trigger('m');
          stream.trigger('a');
        });

        waits(100);
        runs(function () {
          expect(res).toEqual(['f', 'a']);
        });
      });
    });

    describe('#debounce', function () {
      it ('an event should be triggered only onle in the passed time period, or the period will grow', function () {
        var stream = new Pro.Stream().debounce(50), res = [];

        stream.on(function (el) {
          res.push(el);
        });

        waits(15);
        runs(function () {
          stream.trigger('a');
          stream.trigger('b');
        });

        waits(25);
        runs(function () {
          stream.trigger('c');
          stream.trigger('a');
        });

        waits(45);
        runs(function () {
          stream.trigger('g');
        });

        waits(45);
        runs(function () {
          stream.trigger('f');
        });

        expect(res).toEqual([]);
        waits(55);
        runs(function () {
          expect(res).toEqual(['f']);

          stream.trigger('m');
          stream.trigger('a');
        });

        waits(45);
        runs(function () {
          stream.trigger('p');
        });

        waits(50);
        runs(function () {
          expect(res).toEqual(['f', 'p']);
        });
      });
    });

    describe('#buffer', function () {
      it ('fires all the buffered events', function () {
        var stream = new Pro.Stream().bufferit(5), res = [];

        stream.on(function (el) {
          res.push(el);
        });

        stream.trigger('a');
        stream.trigger('b');
        stream.trigger('c');
        stream.trigger('d');

        expect(res).toEqual([]);

        stream.trigger('e');
        expect(res).toEqual(['a', 'b', 'c', 'd', 'e']);
      });
  });
});
