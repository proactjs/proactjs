/**
 * @module proact
 * @submodule proact-core
 */

/**
 * ProAct.js turns plain JavaScript objects into holders of reactive properties.
 * You can define the dependencies between these objects and properties using the 'vanilla' js syntax.
 * For example if an object should have a property 'x', that depends on its two fields 'a' and 'b', the only thing that's needed
 * is to define a function 'x', that refers to 'this.a' and 'this.b'.
 *
 * So ProAct.js can turn every vanilla JavaScript value to a set of reactive properties, and this generates a dependency graph between them.
 * The data flow in this oriented graph is determined by its edges. So if we should receive data from the outside of this dependency system we'll need
 * a powerful but easy to use tool to turn every user or server generated action into a data event, common to the graph. Enter the ProAct.Stream - the functional
 * part of ProAct.js
 *
 * ProAct.js can be used to define bindings, to separate views from models (mv*), for performance optimizations... It is a tool.
 * A powerful tool for creating other, high level tools, or applications.
 * Everything should be defined in this namespace. It can be used as P or Pro.
 *
 * ProAct is powerful Functional Reactive Programming (FRP) lib too. Its streams and events
 *
 * are integrated with the reactive properties mentioned above.
 * Everything can be described using declarative expressions.
 * All ProAct classes and functions are defined in this namespace.
 * You can use `Pro` and `P` instead of `ProAct` too.
 *
 * The `proact-core` module provides base utilties and common functionality for all the other
 * modules of the lib.
 *
 * @class ProAct
 * @static
 */
var ProAct = Pro = P = {},

    arrayProto = Array.prototype,
    concat = arrayProto.concat,
    every = arrayProto.every,
    filter = arrayProto.filter,
    forEach = arrayProto.forEach,
    indexOf = arrayProto.indexOf,
    join = arrayProto.join,
    lastIndexOf = arrayProto.lastIndexOf,
    map = arrayProto.map,
    pop = arrayProto.pop,
    push = arrayProto.push,
    reduce = arrayProto.reduce,
    reduceRight = arrayProto.reduceRight,
    reverse = arrayProto.reverse,
    shift = arrayProto.shift,
    slice = arrayProto.slice,
    some = arrayProto.some,
    sort = arrayProto.sort,
    splice = arrayProto.splice,
    toLocaleString = arrayProto.toLocaleString,
    toString = arrayProto.toString,
    unshift = arrayProto.unshift,
    pArray, pArrayOps, pArrayProto, pArrayLs,
    rProto,
    dsl, dslOps,
    opStoreAll,
    streamProvider, functionProvider,
    attachers, attacherKeys,
    ActorUtil, StreamUtil;


/**
 * @property VERSION
 * @type String
 * @static
 * @for ProAct
 */
ProAct.VERSION = '1.2.1';

/**
 * Defines the possible states of the {{#crossLink "ProAct.Actor"}}{{/crossLink}} instances.
 *
 * @class States
 * @namespace ProAct
 * @static
 */
ProAct.States = {

  /**
   * Initialized : It is not usable yet.
   *
   * For example a computed property (property depending on other properties/actors) is
   * in `init` state when it's created and not read yet.
   * When something reads its value it computes it for the the first time and becomes in `ready`
   * state.
   *
   * @property init
   * @type Number
   * @final
   * @for ProAct.States
   */
  init: 1,

  /**
   * Ready for use.
   *
   * Active {{#crossLink "ProAct.Actor"}}Actors{{/crossLink}} have this state. It can be listened to, it
   * can be updated and notify all of its dependencies.
   *
   * @property ready
   * @type Number
   * @final
   * @for ProAct.States
   */
  ready: 2,

  /**
   * Ended it's lifecycle.
   *
   * Every {{#crossLink "ProAct.Actor"}}{{/crossLink}} can be `destroyed`. All the resources it uses are freed.
   * All the dependent objects don't depend on it anymore.
   *
   * For example if an application has states/routing, {{#crossLink "ProAct.Actor"}}Actors{{/crossLink}} that were active in one
   * of the states should be `destroyed` before going into other route/state.
   *
   * @property destroyed
   * @type Number
   * @final
   * @for ProAct.States
   */
  destroyed: 3,

  /**
   * Error has occured in the {{#crossLink "ProAct.Actor"}}{{/crossLink}}'s lifecycle.
   *
   * For example, if there was an exception in the object's initialization.
   *
   * @property error
   * @type Number
   * @final
   * @for ProAct.States
   */
  error: 4,

  /**
   * A closed ProAct object.
   *
   * Streams that can emmit events anymore are closed streams.
   *
   * Properties which value can not be updated are closed (constants).
   *
   * @property closed
   * @type Number
   * @final
   * @for ProAct.States
   */
  closed: 5
};


/**
 * Contains a set of utility functions to ease working with arrays and objects.
 * Can be reffered by using `ProAct.U` too.
 *
 * This class is part of the `proact-core` module of ProAct.js.
 *
 * @namespace ProAct
 * @class Utils
 * @static
 */
ProAct.Utils = Pro.U = {

  /**
   * Generates an universally unique identifier.
   *
   * @method uuid
   * @return {String} Unique string.
   */
  uuid: function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8);

      return v.toString(16);
    });
  },

  /**
   * Checks if the passed value is a Function or not.
   *
   * @method isFunction
   * @param {Object} value The object/value to check.
   * @return {Boolean} True if the passed value is a Function.
   */
  isFunction: function (value) {
    return typeof(value) === 'function';
  },

  /**
   * Checks if the passed value is a String instance or not.
   *
   * @method isString
   * @param {Object} value The object/value to check.
   * @return {Boolean} True if the passed value is a String.
   */
  isString: function (value) {
    return typeof(value) === 'string';
  },

  /**
   * Checks if the passed value is a JavaScript object or not.
   *
   * @method isObject
   * @param {Object} value The value to check.
   * @return {Boolean} True if the passed values is not primitive.
   */
  isObject: function (value) {
    return typeof(value) === 'object';
  },

  /**
   * Checks if the passed value is {} or not.
   *
   * @method isEmptyObject
   * @param {Object} value The value to check.
   * @return {Boolean} True if the value is object that has no own fields.
   */
  isEmptyObject: function (value) {
    var property;
    for (property in value) {
      if (value.hasOwnProperty(property)) {
        return false;
      }
    }
    return true;
  },

  /**
   * Checks if the passed value is a valid JavaScript Error instance or not.
   *
   * @method isError
   * @param {Object} value The value to check.
   * @return {Boolean} True if the passed `value` is instance of an Error.
   */
  isError: function (value) {
    return value !== null && value instanceof Error;
  },

  /**
   * Checks if the passed value is a valid JavaScript Array instance or not.
   *
   * @method isArray
   * @param {Object} value The value to check.
   * @return {Boolean} True if the passed `value` is Array.
   */
  isArray: function (value) {
    return P.U.isObject(value) && Object.prototype.toString.call(value) === '[object Array]';
  },

  /**
   * Checks if the passed value is instance of the {{#crossLink "ProAct.Array"}}{{/crossLink}} type or not.
   * TODO Move to the proact-arrays module.
   *
   * @method isProArray
   * @param {Object} value The value to check.
   * @return {Boolean} True if the passed `value` is a ProAct.Array instance.
   */
  isProArray: function (value) {
    return value !== null && P.U.isObject(value) && P.U.isArray(value._array) && value.length !== undefined;
  },

  /**
   * Checks if the passed value is a valid array-like object or not.
   * Array like objects in ProAct.js are plain JavaScript arrays and {{#crossLink "ProAct.Array"}}{{/crossLink}}s.
   * TODO Move to the proact-arrays module.
   *
   * @method isArrayObject
   * @param {Object} value The value to check.
   * @return {Boolean} True if the passed `value` is an Array or ProAct.Array instance.
   */
  isArrayObject: function (value) {
    return P.U.isArray(value) || P.U.isProArray(value);
  },

  /**
   * Checks if the passed value is a valid ProAct.js object or not.
   * ProAct.js object have a special `__pro__` object that is hidden in them, which should be instance of {{#crossLink "ProAct.Core"}}{{/crossLink}}.
   * TODO Move to the proact-properties module.
   *
   * @method isProObject
   * @param {Object} value The value to check.
   * @return {Boolean} True if the value is object containing {{#crossLink "ProAct.Property"}}{{/crossLink}} instances and has a `core`.
   */
  isProObject: function (value) {
    return value && ProAct.U.isObject(value) && value.__pro__ !== undefined && ProAct.U.isObject(value.__pro__.properties);
  },

  /**
   * Clones the passed object. It creates a deep copy of it.
   * For now it clones only arrays.
   *
   * TODO It is not fully implemented...
   *
   * @method clone
   * @beta
   * @param {Object} obj The object to clone.
   * @return {Object} Clone of the passed object.
   */
  clone: function (obj) {
    if (P.U.isArray(obj)) {
      var i, ln = obj.length, copy = [];
      for (i = 0; i < ln; i++) {
        copy.push(P.U.clone(obj[i]));
      }
      return copy;
    }
    return obj;
  },

  /**
   * Extends the destination object with the properties and methods of the source object.
   *
   * ```
   *  var obj1 = {a: 3};
   *  var obj2 = {b: 4;}
   *  ProAct.Utils.ex(obj2, obj1);
   *
   *  console.log(obj2);
   *  // This prints : {a: 3, b: 4}
   *
   * ```
   *
   * @method ex
   * @param {Object} destination The object to be extended - it will be modified.
   * @param {Object} source The source holding the properties and the functions to extend destination with.
   * @return {Object} The changed destination object.
   */
  ex: function(destination, source) {
    var p;

    for (p in source) {
      if (source.hasOwnProperty(p)) {
        destination[p] = P.U.clone(source[p]);
      }
    }
    return destination;
  },

  /**
   * Used for extending of classes.
   * Example is:
   * ```
   *
   *  var Bar = ProAct.Utils.extendClass.call(Foo, {
   *    a: 1,
   *    b: 2,
   *    c: function () {}
   *  });
   *
   * ```
   *
   * @method extendClass
   * @param {Object} data Data to add new properties to the new class or override old ones.
   * @return {Object} Child class.
   */
  extendClass: function (data) {
    var parent = this,
        child = function () {
          parent.apply(this, slice.call(arguments));
        };

    P.U.ex(child, parent);

    child.initData = {};
    P.U.ex(child.initData, parent.initData);

    P.U.ex(child.prototype, parent.prototype);
    P.U.ex(child.initData, data);

    child.uuid = P.U.uuid();
    child.prototype.constructor = child;

    return child;
  },

  /**
   * Binds a `function` to an `object context`.
   *
   * Every time the `function` is called, `this` will point to the passed `object`.
   *
   * ```
   *
   *  var context = {a: 3};
   *  var f = ProAct.Utils.bind(context, function () {
   *    return this;
   *  });
   *
   *  var result = f();
   *  console.log(result === context); // prints 'true'
   *
   * ```
   *
   * @method bind
   * @param {Object} ctx The `context` to bind the `this` of the function to.
   * @param {Function} func The `function` to bind.
   * @return {Function} The bound `function`.
   */
  bind: function (ctx, func) {
    return function () {
      return func.apply(ctx, arguments);
    };
  },

  /**
   * Checks if an <i>array</i> contains a <i>value</i>.
   *
   * @memberof ProAct.Utils
   * @function contains
   * @param {Array} array
   *      The <i>array</i> to check.
   * @param {Object} value
   *      The <i>value</i> to check for.
   * @return {Boolean}
   *      True if the <i>array</i> contains the <i>value</i>, False otherwise.
   */
  contains: function (array, value) {
    array.indexOf(value) !== -1;
  },

  /**
   * Removes the first appearance of the passed <i>value</i> in the passed <i>array</i>.
   * If the <i>value</i> is not present in the passed <i>array</i> does nothing.
   *
   * @memberof ProAct.Utils
   * @function remove
   * @param {Array} array
   *      The <i>array</i> to remove from.
   * @param {Object} value
   *      The <i>value</i> to be removed.
   */
  remove: function (array, value) {
    var i = array.indexOf(value);
    if (i > -1) {
      array.splice(i, 1);
    }
  },

  /**
   * A powerful function that creates a diff object containing the differences between two arrays.
   *
   * @memberof ProAct.Utils
   * @function diff
   * @param {Array} array1
   * @param {Array} array2
   * @return {Object}
   *      <p>The object returned contains a property for every index there is a difference between the passed arrays.</p>
   *      <p>The object set on the index has two array properties : 'o' and 'n'.</p>
   *      <p>The 'o' property represents the owned elemetns of the first array that are different from the other's.</p>
   *      <p>The 'n' property contains all the elements that are not owned by the first array, but present in the other.</p>
   *      <p>Example:</p>
   *      <pre>
   *        var array1 = [1, 3, 4, 5],
   *            array2 = [1, 2, 7, 5, 6]
   *            diff;
   *
   *        diff = ProAct.Utils.diff(array1, array2);
   *
   *        console.log(diff[0]); // undefined - the arrays are the same at he index 0
   *        console.log(diff[1]); // {o: [3, 4], n: [2, 7]}
   *        console.log(diff[2]); // undefined the change began from index 1, so it is stored there
   *        console.log(diff[3]); // undefined - the arrays are the same at index 3
   *        console.log(diff[4]); // {o: [], n: [6]}
   *      </pre>
   */
  diff: function (array1, array2) {
    var i, e1, e2,
        index = -1,
        l1 = array1.length,
        l2 = array2.length,
        diff = {};

    if (l1 >= l2) {
      for (i = 0; i < l2; i++) {
        e1 = array1[i];
        e2 = array2[i];

        if (e1 !== e2) {
          if (index === -1) {
            index = i;
          }
          diff[index] = diff[index] || {o: [], n: []};
          diff[index].o.push(e1);
          diff[index].n.push(e2);
        } else {
          index = -1;
        }
      }

      if (index === -1) {
        index = i;
      }
      diff[index] = diff[index] || {o: [], n: []};
      for (; i < l1; i++) {
        e1 = array1[i];
        diff[index].o.push(e1);
      }
    } else {
      diff = P.U.diff(array2, array1);
      for (i in diff) {
        el1 = diff[i];
        el2 = el1.n;
        el1.n = el1.o;
        el1.o = el2;
      }
    }

    return diff;
  },

  /**
   * Defines a property to an object that contains a initial value.
   * The property can be configured using the arguments passed if it is possible in the javascript implementation.
   *
   * @memberof ProAct.Utils
   * @function defValProp
   * @param {Object} obj
   *      The object to define a property in.
   * @param {String} prop
   *      The name of the property to define.
   * @param {Boolean} enumerable
   *      If the property should be enumerable.<br /> In other words visible when doing <pre>for (p in obj) {}</pre>
   * @param {Boolean} configurable
   *      If the property should be configurable.<br /> In other words if the parameters of the property for example enumerable or writable can be changed in the future.
   * @param {Boolean} writable
   *      If the property can be changed.
   * @param {Object} val
   *      The initial value of the property.
   */
  defValProp: function (obj, prop, enumerable, configurable, writable, val) {
    try {
      Object.defineProperty(obj, prop, {
        enumerable: enumerable,
        configurable: configurable,
        writable: writable,
        value: val
      });
    } catch (e) {
      obj[prop] = val;
    }
  }
};

/**
 * Contains various configurations for the ProAct.js library.
 *
 * @class Configuration
 * @namespace ProAct
 * @static
 */
ProAct.Configuration = {
  /**
   * If this option is set to true, when a ProAct.js object is created and has properties named
   * as one or more of the properties listed in <i>ProAct.Configuration.keypropList</i> an Error will be thrown.
   * In other words declares some of the properties of every ProAct objects as keyword properties.
   *
   * @type Boolean
   * @memberof ProAct.Configuration
   * @static
   * @see {@link ProAct.Configuration.keypropList}
   */
  keyprops: true,

  /**
   * Defines a list of the keyword properties that can not be used in ProAct.js objects.
   * The {@link ProAct.Configuration.keyprops} option must be set to true in order for this list to be used.
   *
   * @type Array
   * @memberof ProAct.Configuration
   * @static
   * @see {@link ProAct.Configuration.keyprops}
   */
  keypropList: ['p']
};

/**
 * No-action or emtpy function. Represent an action that does nothing.
 *
 * @function N
 * @memberof ProAct
 * @static
 */
ProAct.N = function () {};

/**
 * <p>
 *  Represents the current caller of a method, the initiator of the current action.
 * </p>
 * <p>
 *  This property does the magic when for example an {@link ProAct.AutoProperty} is called
 *  for the first time and the dependencies to the other properties are created.
 *  The current caller expects to be used in a single threaded environment.
 * </p>
 * <p>
 *  Do not remove or modify this property manually.
 * </p>
 *
 * @type Object
 * @memberof ProAct
 * @default null
 * @static
 */
ProAct.currentCaller = null;

ProAct.close = ProAct.stop = ProAct.end = {};
