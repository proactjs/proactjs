'use strict';

describe('Pro.Property', function () {
  var obj;
  beforeEach(function () {
    obj = {a: 'my val', b: 5};
  });

  describe('#constructor', function () {

    it('initializes the property', function () {
      var property = new Pro.Property(obj, 'a');
      expect(property.type()).toEqual(Pro.Property.Types.simple);
      expect(property.state).toEqual(Pro.States.ready);
    });

    it('doesn\'t change the object structure.', function () {
      var property = new Pro.Property(obj, 'a');
      expect(obj.a).toEqual('my val');
    });

    it('stores the property in the proObject', function () {
      var property = new Pro.Property(obj, 'a');
      expect(property).toEqual(obj.__pro__.properties.a);
    });

    it('passing a getter can override a propertie value', function () {
      var property = new Pro.Property(obj, 'a', function () {
        return 70;
      });
      expect(obj.a).toEqual(70);
    });

  });

  describe('#destroy', function () {
    it('destroys the property', function () {
      var property = new Pro.Property(obj, 'a');
      property.destroy();
      expect(property.state).toEqual(Pro.States.destroyed);
    });

    it('doesn\'t change the object structure.', function () {
      var property = new Pro.Property(obj, 'a');
      property.destroy();
      expect(obj.a).toEqual('my val');
    });
  });

  describe('#get', function () {
    it('is the same as getting the original value', function () {
      var property = new Pro.Property(obj, 'a');
      expect(property.get()).toEqual(obj.a);
    });

    it('has the alias "g"', function () {
      var property = new Pro.Property(obj, 'a');
      expect(property.g).toBe(property.get);
    });

    it('adds listener for the current caller', function () {
      var property = new Pro.Property(obj, 'a'), func;
      obj.b = function () {
        return this.a + ' is cool';
      };
      func = obj.b;
      Pro.currentCaller = {
        property: new Pro.Property(obj, 'b'),
        call: function () {
          obj.b = func.call(obj);
        }
      };
      property.get();
      Pro.currentCaller = null;
      expect(property.listeners.length).toBe(1);

      Pro.flow.run(function () {
        property.willUpdate();
      });
      expect(obj.b).toEqual('my val is cool');
    });
  });

  describe('#set', function () {
    it('it changes the original value', function () {
      var property = new Pro.Property(obj, 'a');
      property.set(5);
      expect(obj.a).toEqual(5);
    });

    it('has the alias "s"', function () {
      var property = new Pro.Property(obj, 'a');
      expect(property.s).toBe(property.set);
    });

    it('notifies the listeners of the property', function () {
      var property = new Pro.Property(obj, 'a');
      property.on('change', function () {});
      spyOn(property, 'willUpdate');
      property.set(3);

      expect(property.willUpdate).toHaveBeenCalled();
    });

    describe('transformators', function () {
      it('transformator added with #transform is always applied', function () {
        var property = new Pro.Property(obj, 'a');
        property.transform(function (val) {
          return val * val;
        });

        property.set(5);
        expect(obj.a).toEqual(5 * 5);
      });

      it('chained transformations work', function () {
        var property = new Pro.Property(obj, 'a');
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

  describe('#willUpdate', function () {
    it('must be called in a flow', function () {
      var property = new Pro.Property(obj, 'a'), go;
      property.on(function () {});
      go = function () {
        property.willUpdate();
      };

      expect(go).toThrow('Not in running flow!');
    });

    it('executes the listeners of a property and passes to them a value Pro.Event', function () {
      var property = new Pro.Property(obj, 'a'), called = false;
      property.on(function (event) {
        called = true;

        expect(event instanceof Pro.Event).toBe(true);
        expect(event.source).toBeUndefined();
        expect(event.target).toBe(property.property);
        expect(event.type).toBe(Pro.Event.Types.value);

        expect(event.args.length).toBe(3);
      });

      property.oldVal = property.val;
      property.val = 10;
      Pro.flow.run(function () {
        property.willUpdate();
      });
      expect(called).toBe(true);
    });

    it('executes the listeners of a sub-property and passes to them a value Pro.Event', function () {
      var propertyA = new Pro.Property(obj, 'a'),
          propertyB = new Pro.Property(obj, 'b'),
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

        expect(event instanceof Pro.Event).toBe(true);
        expect(event.source).not.toBeUndefined();
        expect(event.source).toBe(ev);
        expect(event.target).toBe(propertyB.property);
        expect(event.type).toBe(Pro.Event.Types.value);

        expect(event.args.length).toBe(3);
      });

      propertyA.oldVal = propertyA.val;
      propertyA.val = 10;
      Pro.flow.run(function () {
        propertyA.willUpdate();
      });
      expect(called).toBe(true);
    });
  });
});
