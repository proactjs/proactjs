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
 */

/**
 * The main namespace that contains all the ProAct classes and methods.
 * Everything should be defined in this namespace. It can be used as P or Pro.
 *
 * @namespace ProAct
 * @license MIT
 * @version 1.2.1
 * @author meddle0x53
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
 * The current version of the library.
 *
 * @type String
 * @static
 * @constant
 */
ProAct.VERSION = '1.2.1';

/**
 * Defines the possible states of the ProAct objects.
 * <ul>
 *  <li>init - Initialized : It is not usable yet, but is market as ProAct object.</li>
 *  <li>ready - Ready for use.</li>
 *  <li>destroyed - Destroyed : An object that is ProAct dependent no more. All the ProAct logic should be cleaned up from it.</li>
 *  <li>error - There was some runtime error while creating or working with the object.</li>
 *  <li>closed - The object is closed. It can not emit new changes.</li>
 * </ul>
 *
 * @namespace ProAct.States
 */
ProAct.States = {
  init: 1,
  ready: 2,
  destroyed: 3,
  error: 4,
  closed: 5
};


/**
 * Contains a set of utility functions to ease working with arrays and objects.
 * Can be reffered by using 'ProAct.U' too.
 *
 * @namespace ProAct.Utils
 */
ProAct.Utils = Pro.U = {

  /**
   * Generates an unique id.
   * The idea is to be used as keynames in the {@link ProAct.Registry}.
   *
   * @memberof ProAct.Utils
   * @function uuid
   * @return {String}
   *      Unique string.
   */
  uuid: function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8);

      return v.toString(16);
    });
  },

  /**
   * Checks if the passed value is a function or not.
   *
   * @memberof ProAct.Utils
   * @function isFunction
   * @param {Object} value
   * @return {Boolean}
   */
  isFunction: function (value) {
    return typeof(value) === 'function';
  },

  /**
   * Checks if the passed value is a string or not.
   *
   * @memberof ProAct.Utils
   * @function isString
   * @param {Object} value
   * @return {Boolean}
   */
  isString: function (value) {
    return typeof(value) === 'string';
  },

  /**
   * Checks if the passed value is a JavaScript object or not.
   *
   * @memberof ProAct.Utils
   * @function isObject
   * @param {Object} value
   * @return {Boolean}
   */
  isObject: function (value) {
    return typeof(value) === 'object';
  },

  /**
   * Checks if the passed value is {} or not.
   *
   * @memberof ProAct.Utils
   * @function isEmptyObject
   * @param {Object} value
   * @return {Boolean}
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
   * Checks if the passed value is a valid JavaScript error or not.
   *
   * @memberof ProAct.Utils
   * @function isError
   * @param {Object} value
   * @return {Boolean}
   */
  isError: function (value) {
    return value !== null && value instanceof Error;
  },

  /**
   * Checks if the passed value is a valid JavaScript array or not.
   *
   * @memberof ProAct.Utils
   * @function isArray
   * @param {Object} value
   * @return {Boolean}
   */
  isArray: function (value) {
    return P.U.isObject(value) && Object.prototype.toString.call(value) === '[object Array]';
  },

  /**
   * Checks if the passed value is instance of the {@link ProAct.Array} type or not.
   *
   * @memberof ProAct.Utils
   * @function isProArray
   * @param {Object} value
   * @return {Boolean}
   * @see {@link ProAct.Array}
   */
  isProArray: function (value) {
    return value !== null && P.U.isObject(value) && P.U.isArray(value._array) && value.length !== undefined;
  },

  /**
   * Checks if the passed value is a valid array-like object or not.
   * Array like objects in ProAct.js are plain JavaScript arrays and {@link ProAct.Array}s.
   *
   * @memberof ProAct.Utils
   * @function isArrayObject
   * @param {Object} value
   * @return {Boolean}
   * @see {@link ProAct.Array}
   */
  isArrayObject: function (value) {
    return P.U.isArray(value) || P.U.isProArray(value);
  },

  /**
   * Checks if the passed value is a valid ProAct.js object or not.
   * ProAct.js object have a special '__pro__' object that is hidden in them, which should be instance of {@link ProAct.Core}.
   *
   * @memberof ProAct.Utils
   * @function isProObject
   * @param {Object} value
   * @return {Boolean}
   * @see {@link ProAct.Array}
   * @see {@link ProAct.Core}
   */
  isProObject: function (value) {
    return value && ProAct.U.isObject(value) && value.__pro__ !== undefined && ProAct.U.isObject(value.__pro__.properties);
  },

  /**
   * Clones the passed object. It creates a deep copy of it.
   * For now it clones only arrays.
   *
   * @memberof ProAct.Utils
   * @function clone
   * @param {Object} obj
   *      The object to clone.
   * @return {Object}
   *      Clone of the passed object.
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
   * @memberof ProAct.Utils
   * @function ex
   * @param {Object} destination
   *      The object to be extended - it will be modified.
   * @param {Object} source
   *      The source holding the properties and the functions to extend destination with.
   * @return {Object}
   *      The changed destination object.
   * @see {@link ProAct.Utils.clone}
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
   * <pre>
   *  var Bar = ProAct.Utils.extendClass.call(Foo, {
   *    a: 1,
   *    b: 2,
   *    c: function () {}
   *  });
   * </pre>
   *
   * @memberof ProAct.Utils
   * @function extendClass
   * @param {Object} data
   *      Data to add new properties to the new class or override old ones.
   * @return {Object}
   *      Child class.
   * @see {@link ProAct.Utils.ex}
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
   * Binds a <i>function</i> to an object <i>context</i>.
   * Every time the <i>function</i> is called the value <i>this</i> of this will be the object.
   *
   * @memberof ProAct.Utils
   * @function bind
   * @param {Object} ctx
   *      The <i>context</i> to bind the <i>this</i> of the function to.
   * @param {Function} func
   *      The <i>function</i> to bind.
   * @return {Function}
   *      The bound <i>function</i>.
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
 * @namespace ProAct.Configuration
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
