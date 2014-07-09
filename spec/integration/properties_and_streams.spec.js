'use strict';

describe('Pro.Property & Pro.Stream', function () {

  it ('is possible to direct a steam into a property', function () {
    var stream = new Pro.Stream(),
        obj = Pro.prob({
          a: 4
        });

    obj.p('a').into(stream);

    stream.trigger(5);
    expect(obj.a).toEqual(5);
  });

  it ('is possible to direct a steam chain into a property', function () {
    var stream1 = new Pro.Stream(),
        stream2 = stream1.map(function (el) { return el * 3; }),
        stream3 = stream2.filter(function (el) { return el % 2 == 0; }),
        obj = Pro.prob({
          a: 4
        });

    obj.p('a').into(stream3);

    stream1.trigger(5);
    expect(obj.a).toEqual(4);

    stream1.trigger(8);
    expect(obj.a).toEqual(24);
  });

  it ('is posible to direct a stream out of property', function () {
    var stream = new Pro.Stream(),
        obj = Pro.prob({
          a: 4
        }), res = [];

    obj.p('a').out(stream);

    stream.on(function (event) {
      res.push(event.args[0][event.target]);
    });

    obj.a = 5;
    expect(res).toEqual([5]);
  });

  it ('diamond streams update properties only once', function () {
    var s1 = new Pro.Stream(),
        s2 = new Pro.Stream(s1),
        s3 = new Pro.Stream(s1),
        s4 = s3.merge(s2), res = [],
        p = new Pro.Property({}, 'a');

    p.makeListener = function () {
      return {
        call: function (val) {
          res.push(val)
        },
        property: p
      }
    };
    p.into(s4);

    s1.trigger('hey!');
    expect(res).toEqual(['hey!'])
  });

  it ('auto property updates from buffered event are applied only once', function () {
    var s = new Pro.Stream().delay(110),
        res = [],
        obj = Pro.prob({
          prop: 4,
          pp: function () {
            res.push(this.prop);
            return this.prop * 5;
          }
        });
    obj.p('prop').into(s);

    expect(obj.pp).toEqual(20)
    expect(res).toEqual([4])

    s.trigger(3);
    s.trigger(2);
    s.trigger(1);

    expect(obj.pp).toEqual(20)
    expect(res).toEqual([4])

    waits(120);
    runs(function () {
      expect(obj.pp).toEqual(5)
      expect(res).toEqual([4, 1])
    });

  });

});
