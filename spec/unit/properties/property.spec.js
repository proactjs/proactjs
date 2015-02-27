'use strict';

describe('ProAct.Property', function () {
  var obj;
  beforeEach(function () {
    obj = {a: 'my val', b: 5};
  });

  describe('#constructor', function () {

    it('initializes the property', function () {
      var property = new ProAct.Property(obj, 'a');
      expect(property.type()).toEqual(ProAct.Property.Types.simple);
      expect(property.state).toEqual(ProAct.States.ready);
    });

    it('doesn\'t change the object structure.', function () {
      var property = new ProAct.Property(obj, 'a');
      expect(obj.a).toEqual('my val');
    });

    it('stores the property in the proObject', function () {
      var property = new ProAct.Property(obj, 'a');
      expect(property).toEqual(obj.__pro__.properties.a);
    });

    it('passing a getter can override a propertie value', function () {
      var property = new ProAct.Property(obj, 'a', function () {
        return 70;
      });
      expect(obj.a).toEqual(70);
    });

    it('can be called without arguments, creating property "v"', function () {
      var property = new ProAct.Property();

      expect(property.val).toBeNull();
    });

  });

  describe('.value', function () {
    it('creates independent property with simple value.', function () {
      var property = ProAct.Property.value(5);

      expect(property.val).toBe(5);
    });
  });

  describe('.constant', function () {
    it('creates independent property with simple value that can not be changed.', function () {
      var property = ProAct.Property.constant(5);

      expect(property.val).toBe(5);

      property.set(6);
      expect(property.val).toBe(5);
    });
  });

  describe('#destroy', function () {
    it('destroys the property', function () {
      var property = new ProAct.Property(obj, 'a');
      property.destroy();
      expect(property.state).toEqual(ProAct.States.destroyed);
    });

    it('doesn\'t change the object structure.', function () {
      var property = new ProAct.Property(obj, 'a');
      property.destroy();
      expect(obj.a).toEqual('my val');
    });
  });

  describe('#get', function () {
    it('is the same as getting the original value', function () {
      var property = new ProAct.Property(obj, 'a');
      expect(property.get()).toEqual(obj.a);
    });

    it('has the alias "g"', function () {
      var property = new ProAct.Property(obj, 'a');
      expect(property.g).toBe(property.get);
    });

    it('adds listener for the current caller', function () {
      var property = new ProAct.Property(obj, 'a'), func;
      obj.b = function () {
        return this.a + ' is cool';
      };
      func = obj.b;
      ProAct.currentCaller = {
        property: new ProAct.Property(obj, 'b'),
        call: function () {
          obj.b = func.call(obj);
        }
      };
      property.get();
      ProAct.currentCaller = null;
      expect(property.listeners.change.length).toBe(1);

      property.update();
      expect(obj.b).toEqual('my val is cool');
    });
  });

  describe('#set', function () {
    it('it changes the original value', function () {
      var property = new ProAct.Property(obj, 'a');
      property.set(5);
      expect(obj.a).toEqual(5);
    });

    it('has the alias "s"', function () {
      var property = new ProAct.Property(obj, 'a');
      expect(property.s).toBe(property.set);
    });

    it('notifies the listeners of the property', function () {
      var property = new ProAct.Property(obj, 'a');
      property.on('change', function () {});
      spyOn(ProAct.ActorUtil, 'doUpdate');
      property.set(3);

      expect(ProAct.ActorUtil.doUpdate).toHaveBeenCalled();
    });

    describe('transformators', function () {
      it('transformator added with #transform is always applied', function () {
        var property = new ProAct.Property(obj, 'a');
        property.transform(function (val) {
          return val * val;
        });

        property.set(5);
        expect(obj.a).toEqual(5 * 5);
      });

      it('chained transformations work', function () {
        var property = new ProAct.Property(obj, 'a');
        property.transform(function (val) {
          return val * val;
        });
        property.transform(function (val) {
          return val - 1;
        });
        property.transform(function (val) {
          return val / 3;
        });

        property.set(5);
        expect(obj.a).toEqual(8);
      });
    });
  });

  describe('ProAct.ActorUtil#doUpdate', function () {
    it('must be called in a flow', function () {
      var property = new ProAct.Property(obj, 'a'), go;
      property.on(function () {});
      go = function () {
        ProAct.ActorUtil.doUpdate.call(property);
      };

      expect(go).toThrow('Not in running flow!');
    });

    it('executes the listeners of a property and passes to them a value ProAct.Event', function () {
      var property = new ProAct.Property(obj, 'a'), called = false;
      property.on(function (event) {
        called = true;

        expect(event instanceof ProAct.Event).toBe(true);
        expect(event.source).toBeUndefined();
        expect(event.target).toBe(property.property);
        expect(event.type).toBe(ProAct.Event.Types.value);

        expect(event.args.length).toBe(3);
      });

      property.oldVal = property.val;
      property.val = 10;
      ProAct.flow.run(function () {
        ProAct.ActorUtil.doUpdate.call(property);
      });
      expect(called).toBe(true);
    });

    it('executes the listeners of a sub-property and passes to them a value ProAct.Event', function () {
      var propertyA = new ProAct.Property(obj, 'a'),
          propertyB = new ProAct.Property(obj, 'b'),
          called = false, ev;
      propertyA.on({
        call: function (event) {
          ev = event;
          propertyB.oldVal = 5;
          propertyB.val = 15;
        },
        property: propertyB
      });

      propertyB.on(function (event) {
        called = true;

        expect(event instanceof ProAct.Event).toBe(true);
        expect(event.source).not.toBeUndefined();
        expect(event.source).toBe(ev);
        expect(event.target).toBe(propertyB.property);
        expect(event.type).toBe(ProAct.Event.Types.value);

        expect(event.args.length).toBe(3);
      });

      propertyA.oldVal = propertyA.val;
      propertyA.val = 10;
      ProAct.flow.run(function () {
        ProAct.ActorUtil.doUpdate.call(propertyA);
      });
      expect(called).toBe(true);
    });
  });

  describe('dependent', function () {
    it('property can be bind to another one', function () {
      var propertyA = new ProAct.Property(obj, 'a'),
          propertyB = new ProAct.Property(obj, 'b');

      propertyB.into(propertyA);

      obj.a = 10;
      expect(obj.b).toBe(obj.a);
    });
  });

  describe('#accumulate', function () {
    it ('creates a new property accumulating data from the caller using the passed initial value and function', function () {
      var property = P.P.value(5),
          accumulation = property.accumulate([], function (array, v) {
            return array.concat(v);
          });

      expect(accumulation.get()).toEqual([5]);

      property.set(6);
      expect(accumulation.get()).toEqual([5, 6]);
    });
  });

  describe('#filter', function () {

    it ('creates a new property filtered from the caller with the passed function', function () {
      var property = P.P.value(5),
          filtered = property.filter(function (v) {
            return v % 2 === 1;
          });

      expect(filtered.get()).toEqual(5);

      property.set(6);
      expect(filtered.get()).toEqual(5);

      property.set(7);
      expect(filtered.get()).toEqual(7);
    });

    it ('creates a new property filtered from the caller with the passed predefined function', function () {
      var property = P.P.value(-5),
          mapped = property.filter('-');

      expect(mapped.get()).toEqual(-5);

      property.set(3);
      expect(mapped.get()).toEqual(-5);

      property.set(-3);
      expect(mapped.get()).toEqual(-3);
    });
  });

  describe('#map', function () {
    it ('creates a new property mapped to the caller with the passed function', function () {
      var property = P.P.value(5),
          mapped = property.map(function (v) {
            return v * v;
          });

      expect(mapped.get()).toEqual(25);
    });

    it ('creates a new property mapped to the caller with the passed predefined function', function () {
      var property = P.P.value(5),
          mapped = property.map('-');

      expect(mapped.get()).toEqual(-5);
    });

    it ('creates a new property mapped to the caller with the passed stored function', function () {
      ProAct.registry.store('l:test', function (v) {
        return v / 2;
      });
      var property = P.P.value(4),
          mapped = property.map('l:test');

      expect(mapped.get()).toEqual(2);
    });
  });
});
