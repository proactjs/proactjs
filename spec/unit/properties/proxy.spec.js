'use strict';

describe('ProAct.proxy', function () {
  var proxy, target;

  beforeEach(function () {
    ProAct.Configuration = {
      keyprops: true,
      keypropList: ['p']
    };

    target = {
      a: 1,
      b: 2,
      c: '3'
    };

    proxy = {
      d: function () {
        return this.a + this.b;
      }
    };
  });

  it ('creates a proxy ProAct.js object to a target ProAct.js object', function () {
    target = ProAct.prob(target);

    proxy = ProAct.proxy(proxy, target);

    expect(proxy.a).toEqual(1);
    expect(proxy.b).toEqual(2);
    expect(proxy.c).toEqual('3');
    expect(proxy.d).toEqual(3);

    target.a = 38;
    expect(proxy.d).toEqual(40);
  });
});

