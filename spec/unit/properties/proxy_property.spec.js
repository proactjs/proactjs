'use strict';

describe('ProAct.ProxyProperty', function () {
  var obj, property, proxyProperty;
  beforeEach(function () {
    obj = {a: 'my val', b: null};

    property = new ProAct.Property(obj, 'a');
    proxyProperty = new ProAct.ProxyProperty(obj, 'b', property);
  });

  it ('has the value of its target', function () {
    expect(proxyProperty.get()).toBe(property.get());
    expect(obj.a).toBe(obj.b);
  });

  it ('updates the value of its target on update', function () {
    obj.b = 'your target';

    expect(obj.a).toEqual('your target');
    expect(proxyProperty.get()).toBe(property.get());
    expect(obj.a).toBe(obj.b);
  });

  it ('is updated on change of a', function () {
    obj.a = 'your target';

    expect(obj.b).toEqual('your target');
    expect(proxyProperty.get()).toBe(property.get());
    expect(obj.a).toBe(obj.b);
  });

  it ('notifies its listener on update of the target', function () {
    var notified = false;

    proxyProperty.on(function () {
      notified = true;
    });

    obj.a = 'your target';

    expect(notified).toBe(true);
  });
});

