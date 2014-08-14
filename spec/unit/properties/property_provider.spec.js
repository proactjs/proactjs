'use strict';

describe('ProAct.PropertyProvider', function () {
  it ('#filter is abstract method for filtering logic', function () {
    var provider = new ProAct.PropertyProvider();

    expect(function () {
      provider.filter();
    }).toThrow(new Error("Abstract! Implement!"));
  });

  it ('#provide is abstract method for providing properties', function () {
    var provider = new ProAct.PropertyProvider();

    expect(function () {
      provider.provide();
    }).toThrow(new Error("Abstract! Implement!"));
  });

  describe('.provide', function () {

    var obj, TestProvider;
    beforeEach(function () {
      ProAct.PropertyProvider.clearProviders();
      obj = {
        a: null,
        b: 5,
        c: '5',
        d: true,
        e: function () {
          return 'e';
        },
        f: ['a', 'b', 'c', 'd', 'e', 'f'],
        g: {
          a: undefined
        }
      };

      TestProvider = function () {
        ProAct.PropertyProvider.call(this);
      };

      TestProvider.prototype = P.U.ex(ProAct.PropertyProvider.prototype, {
        constructor: TestProvider,
        filter: function (object, property, meta) {
          return object[property] === '5';
        },

        provide: function (object, property, meta) {
          return new ProAct.Property(object, property);
        }
      });
    });

    it ('provides null if nothing is registered', function () {
      expect(ProAct.PropertyProvider.provide(obj, 'b')).toBe(null);
    });

    it ('provides null if providers are registered but there is no hit', function () {
      ProAct.PropertyProvider.registerProvider(new TestProvider());

      expect(ProAct.PropertyProvider.provide(obj, 'b')).toBe(null);
    });

    it ('provides the right property if providers are registered and there is hit', function () {
      ProAct.PropertyProvider.registerProvider(new TestProvider());

      expect(ProAct.PropertyProvider.provide(obj, 'c')).toNotBe(null);
    });

    describe('ProAct.NullPropertyProvider', function () {
      it ('provides a ProAct.NullProperty instance for object field with null value.', function () {
        ProAct.PropertyProvider.registerProvider(new ProAct.NullPropertyProvider());

        var property = ProAct.PropertyProvider.provide(obj, 'a');

        expect(property).toNotBe(null);
        expect(property instanceof ProAct.NullProperty).toBe(true);
        expect(property.property).toBe('a');
        expect(property.proObject).toBe(obj);
      });

      it ('provides a ProAct.NullProperty instance for object field with undefined value.', function () {
        ProAct.PropertyProvider.registerProvider(new ProAct.NullPropertyProvider());

        var property = ProAct.PropertyProvider.provide(obj, 'foo');

        expect(property).toNotBe(null);
        expect(property instanceof ProAct.NullProperty).toBe(true);
        expect(property.property).toBe('foo');
        expect(property.proObject).toBe(obj);
      });
    });

    describe('ProAct.SimplePropertyProvider', function () {
      it ('provides a ProAct.Property instance for object field with integer value.', function () {
        ProAct.PropertyProvider.registerProvider(new ProAct.SimplePropertyProvider());

        var property = ProAct.PropertyProvider.provide(obj, 'b');

        expect(property).toNotBe(null);
        expect(property instanceof ProAct.Property).toBe(true);
        expect(property.property).toBe('b');
        expect(property.proObject).toBe(obj);
      });

      it ('provides a ProAct.Property instance for object field with string value.', function () {
        ProAct.PropertyProvider.registerProvider(new ProAct.SimplePropertyProvider());

        var property = ProAct.PropertyProvider.provide(obj, 'c');

        expect(property).toNotBe(null);
        expect(property instanceof ProAct.Property).toBe(true);
        expect(property.property).toBe('c');
        expect(property.proObject).toBe(obj);
      });

      it ('provides a ProAct.Property instance for object field with boolean value.', function () {
        ProAct.PropertyProvider.registerProvider(new ProAct.SimplePropertyProvider());

        var property = ProAct.PropertyProvider.provide(obj, 'd');

        expect(property).toNotBe(null);
        expect(property instanceof ProAct.Property).toBe(true);
        expect(property.property).toBe('d');
        expect(property.proObject).toBe(obj);
      });

      it ('provides null if the field has value of something else', function () {
        ProAct.PropertyProvider.registerProvider(new ProAct.SimplePropertyProvider());

        expect(ProAct.PropertyProvider.provide(obj, 'a')).toBe(null);
      });
    });

    describe('ProAct.AutoPropertyProvider', function () {
      it ('provides a ProAct.AutoProperty instance for object field with function value.', function () {
        ProAct.PropertyProvider.registerProvider(new ProAct.AutoPropertyProvider());

        var property = ProAct.PropertyProvider.provide(obj, 'e');

        expect(property).toNotBe(null);
        expect(property instanceof ProAct.AutoProperty).toBe(true);
        expect(property.property).toBe('e');
        expect(property.proObject).toBe(obj);
      });
    });

    describe('ProAct.ArrayPropertyProvider', function () {
      it ('provides a ProAct.ArrayProperty instance for object field with array value.', function () {
        ProAct.PropertyProvider.registerProvider(new ProAct.ArrayPropertyProvider());

        var property = ProAct.PropertyProvider.provide(obj, 'f');

        expect(property).toNotBe(null);
        expect(property instanceof ProAct.ArrayProperty).toBe(true);
        expect(property.property).toBe('f');
        expect(property.proObject).toBe(obj);
      });
    });

    describe('ProAct.ObjectPropertyProvider', function () {
      it ('provides a ProAct.ObjectProperty instance for object field with object value.', function () {
        ProAct.PropertyProvider.registerProvider(new ProAct.ObjectPropertyProvider());

        var property = ProAct.PropertyProvider.provide(obj, 'g');

        expect(property).toNotBe(null);
        expect(property instanceof ProAct.ObjectProperty).toBe(true);
        expect(property.property).toBe('g');
        expect(property.proObject).toBe(obj);
      });
    });
  });
});
