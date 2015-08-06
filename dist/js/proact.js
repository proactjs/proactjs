;(function (pro) {
	if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = pro();
	} else {
		window.Pro = window.ProAct = window.P = pro();
	}
}(function() {
	/**
	 * The `proact-core` module provides base utilties and common functionality for all the other
	 * modules of the lib.
	 *
	 * @module proact-core
	 * @main proact-core
	 */
	
	/**
	 * ProAct.js turns plain JavaScript objects into holders of reactive properties.
	 * You can define the dependencies between these objects and properties using the 'vanilla' js syntax.
	 * For example if an object should have a property 'x', that depends on its two fields 'a' and 'b', the only thing that's needed
	 * is to define a function 'x', that refers to 'this.a' and 'this.b'.
	 *
	 * So ProAct.js can turn every vanilla JavaScript value to a set of reactive properties, and this generates a dependency graph between them.
	 * The data flow in this oriented graph is determined by its edges. So if we should receive data from the outside of this dependency system we'll need
	 * a powerful but easy to use tool to turn every user or server generated action into a data event, common to the graph.
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
	    ActorUtil;
	
	
	/**
	 * @property VERSION
	 * @type String
	 * @static
	 * @for ProAct
	 */
	ProAct.VERSION = '1.3.0';
	
	
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
	   * For example Streams that can emmit events anymore are closed streams.
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
	   * Removes the first appearance of the passed `value` in the passed `array`.
	   * If the `value` is not present in the passed `array` does nothing.
	   *
	   * ```
	   *
	   *  var array = [1, 2, 3];
	   *  ProAct.Utils.remove(array, 2);
	   *
	   *  console.log(array); // prints [1, 3]
	   *
	   * ```
	   *
	   * @method remove
	   * @param {Array} array The `array` to remove from.
	   * @param {Object} value The `value` to be removed.
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
	   * @method diff
	   * @param {Array} array1
	   * @param {Array} array2
	   * @return {Object}
	   *      <p>The object returned contains a property for every index there is a difference between the passed arrays.</p>
	   *      <p>The object set on the index has two array properties : 'o' and 'n'.</p>
	   *      <p>The 'o' property represents the owned elemetns of the first array that are different from the other's.</p>
	   *      <p>The 'n' property contains all the elements that are not owned by the first array, but present in the other.</p>
	   *      <p>Example:</p>
	   * ```
	   *   var array1 = [1, 3, 4, 5],
	   *       array2 = [1, 2, 7, 5, 6]
	   *       diff;
	   *
	   *   diff = ProAct.Utils.diff(array1, array2);
	   *
	   *   console.log(diff[0]); // undefined - the arrays are the same at he index 0
	   *   console.log(diff[1]); // {o: [3, 4], n: [2, 7]}
	   *   console.log(diff[2]); // undefined the change began from index 1, so it is stored there
	   *   console.log(diff[3]); // undefined - the arrays are the same at index 3
	   *   console.log(diff[4]); // {o: [], n: [6]}
	   * ```
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
	   *
	   * The property can be configured using the arguments passed if it is possible in the javascript implementation.
	   *
	   * @method defValProp
	   * @param {Object} obj The object to define a property in.
	   * @param {String} prop The name of the property to define.
	   * @param {Boolean} enumerable If the property should be enumerable.<br /> In other words visible when doing <pre>for (p in obj) {}</pre>
	   * @param {Boolean} configurable If the property should be configurable.<br /> In other words if the parameters of the property for example enumerable or writable can be changed in the future.
	   * @param {Boolean} writable If the property can be changed.
	   * @param {Object} val The initial value of the property.
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
	 * Contains various configuration settings for the ProAct.js library.
	 *
	 * @namespace ProAct
	 * @class Configuration
	 * @static
	 */
	ProAct.Configuration = {
	
	  /**
	   * If this option is set to true, when a ProAct.js object is created and has properties named
	   * as one or more of the properties listed in
	   * {{#crossLink "ProAct.Configuration.keypropList"}}{{/crossLink}} an `Error` will be thrown.
	   *
	   * In other words declares some of the properties of every ProAct objects as keyword properties.
	   *
	   * @property keyprops
	   * @type Boolean
	   * @static
	   * @for ProAct.Configuration
	   */
	  keyprops: true,
	
	  /**
	   * Defines a list of the keyword properties that can not be used in ProAct.js objects.
	   * The {{#crossLink "ProAct.Configuration.keyprops"}}{{/crossLink}} option must be set to true in order for this list to be used.
	   *
	   * @property keypropList
	   * @type Array
	   * @static
	   * @for ProAct.Configuration
	   */
	  keypropList: ['p']
	};
	
	/**
	 * No-action or emtpy function. Represent an action that does nothing.
	 *
	 * @method N
	 * @for ProAct
	 */
	ProAct.N = function () {};
	
	/**
	 * @module proact-flow
	 */
	
	/**
	 * <p>
	 *   Creates a queue of actions or action queue.
	 * </p>
	 * <p>
	 *  The idea of the action queues is to decide the order of the actions pushed into them.
	 *  For example if an action should be executed only once, but is pushed for a second time,
	 *  it is moved in the end of the queue and its parameters are updated.
	 * </p>
	 * <p>
	 *  The ProAct.Queue is a priority queue, meaning every action has a numeric priority.
	 *  The actions with the numerically lowest priority are with highes prority when executed.
	 * </p>
	 * <p>
	 *  The {{#crossLink "ProAct.Queue/go:method"}}{{/crossLink}} method deques all the actions from the queue and executes them in the right
	 *  order, using their priorities.
	 * </p>
	 * <p>
	 *  A ProAct.Queue can be used to setup the action flow - the order of the actions must be executed.
	 *  ProAct.js uses it to create an action flow if something changes.
	 * </p>
	 *
	 * TODO Default name should be extracted to a constant. ~meddle@2014-07-10
	 *
	 * @class ProAct.Queue
	 * @constructor
	 * @param {String} name
	 *    The name of the queue, every ProAct.Queue must have a name.
	 *    The default value of the name is 'proq'. {{#crossLink "ProAct.Queues"}}{{/crossLink}} uses the names to manage its queues.
	 * @param {Object} options
	 *    Various options for the queue.
	 *    <p>Available options:</p>
	 *    <ul>
	 *      <li>before - A callback called before each call of {{#crossLink "ProAct.Queue/go:method"}}{{/crossLink}}.</li>
	 *      <li>after - A callback called after each call of {{#crossLink "ProAct.Queue/go:method"}}{{/crossLink}}.</li>
	 *      <li>err - A callback called every time an error is thrown.</li>
	 *    </ul>
	 */
	ProAct.Queue = P.Q = function (name, options) {
	  this.name = name || 'proq';
	  this.options = options || {};
	
	  this._queue = [];
	};
	
	/**
	 * Executes the passed <i>action</i>.
	 *
	 * @for ProAct.Queue
	 * @method runAction
	 * @static
	 * @param {ProAct.Queue} queue
	 *      The queue managing the action to execute.
	 * @param {Object} context
	 *      The context in which the action should be executed.
	 *      <p>
	 *        The action is a normal JavaScript function and the context is the object
	 *        that should be bound to <i>this</i> when calling it.
	 *      </p>
	 *      <p>
	 *        It can be null or undefined.
	 *      </p>
	 * @param {Function} action
	 *      The action to execute.
	 * @param {Array} args
	 *      The parameters to be passed to the action.
	 * @param {Function} errHandler
	 *      It is called if an error is thrown when executing the action.
	 *      <p>
	 *        It can be null if the error should be catched from the outside.
	 *      </p>
	 */
	ProAct.Queue.runAction = function (queue, context, action, args, errHandler) {
	  if (args && args.length > 0) {
	    if (errHandler) {
	      try {
	        action.apply(context, args);
	      } catch (e) {
	        if (!e.fromFlow) {
	          e.fromFlow = true;
	          errHandler(queue, e);
	        } else {
	          throw e;
	        }
	      }
	    } else {
	      action.apply(context, args);
	    }
	  } else {
	    if (errHandler) {
	      try {
	        action.call(context);
	      } catch(e) {
	        if (!e.fromFlow) {
	          e.fromFlow = true;
	          errHandler(queue, e);
	        } else {
	          throw e;
	        }
	      }
	    } else {
	      action.call(context);
	    }
	  }
	};
	
	P.Q.prototype = {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.Queue
	   * @final
	   * @for ProAct.Queue
	   */
	  constructor: ProAct.Queue,
	
	  /**
	   * Retrieves the lenght of this `ProAct.Queue`.
	   *
	   * @for ProAct.Queue
	   * @instance
	   * @method length
	   * @return {Number}
	   *      The number of actions queued in this queue.
	   */
	  length: function () {
	    return this._queue.length / 4;
	  },
	
	  /**
	   * Checks if this `ProAct.Queue` is empty.
	   *
	   * @for ProAct.Queue
	   * @instance
	   * @method isEmpty
	   * @return {Boolean}
	   *      True if there are no actions in this queue.
	   */
	  isEmpty: function () {
	    return this.length() === 0;
	  },
	
	  /**
	   * Pushes an action to this queue.
	   * This method can enque the same action multiple times and always with priority of '1'.
	   * <p>
	   *  `defer`, `enque` and `add` are aliases of this method.
	   * </p>
	   *
	   * @for ProAct.Queue
	   * @instance
	   * @method push
	   * @param {Object} context
	   *      The context of the action.
	   *      It can be null.
	   *      <p>
	   *        If the method is called with a Function context, the context becomes the action.
	   *        This way the method can be called with only one parameter for actions without context.
	   *      </p>
	   * @param {Function} action
	   *      The action to enque.
	   *      <p>
	   *        If there is no context and the action is passed in place of the context,
	   *        this parameter can hold the arguments of the action.
	   *      </p>
	   * @param {Array} args
	   *      Arguments to be passed to the action when it is executed.
	   */
	  push: function (context, action, args) {
	    if (context && (typeof(context) === 'function')) {
	      args = action;
	      action = context;
	      context = null;
	    }
	
	    this._queue.push(context, action, args, 1);
	  },
	
	  /**
	   * Pushes an action to this queue only once.
	   * <p>
	   *  If the action is pushed for the second time using this method, instead of
	   *  adding it to the queue, its priority goes up and its arguments are updated.
	   *  This means that this action will be executed after all the other actions, pushed only once.
	   * </p>
	   * <p>
	   *  `deferOnce`, `enqueOnce` and `addOnce` are aliases of this method.
	   * </p>
	   *
	   * @for ProAct.Queue
	   * @instance
	   * @method pushOnce
	   * @param {Object} context
	   *      The context of the action.
	   *      It can be null.
	   *      <p>
	   *        If the method is called with a Function context, the context becomes the action.
	   *        This way the method can be called with only one parameter for actions without context.
	   *      </p>
	   * @param {Function} action
	   *      The action to enque.
	   *      <p>
	   *        If there is no context and the action is passed in place of the context,
	   *        this parameter can hold the arguments of the action.
	   *      </p>
	   * @param {Array} args
	   *      Arguments to be passed to the action when it is executed.
	   */
	  pushOnce: function (context, action, args) {
	    if (context && (typeof(context) === 'function')) {
	      args = action;
	      action = context;
	      context = null;
	    }
	
	    var queue = this._queue, current, currentMethod,
	        i, length = queue.length;
	
	    for (i = 0; i < length; i += 4) {
	      current = queue[i];
	      currentMethod = queue[i + 1];
	
	      if (current === context && currentMethod === action) {
	        queue[i + 2] = args;
	        queue[i + 3] = queue[i + 3] + 1;
	        return;
	      }
	    }
	
	    this.push(context, action, args);
	  },
	
	  /**
	   * Starts the action flow.
	   * <p>
	   *  Executes the actions in this queue in the order they were enqued, but also uses the priorities
	   *  to execute these with numerically higher priority after these with numerically lower priority.
	   * </p>
	   * <p>
	   *  If some of the actions enques new actions in this queue and the parameter <i>once</i> is set to false
	   *  this method is recursively called executing the new actions.
	   * </p>
	   * <p>
	   *  `run` is alias of this method.
	   * </p>
	   *
	   * @for ProAct.Queue
	   * @instance
	   * @method go
	   * @param {Boolean} once
	   *      True if 'go' should not be called for actions generated by the executed ones.
	   */
	  go: function (once) {
	    var queue = this._queue,
	        options = this.options,
	        runs = this.runs,
	        length = queue.length,
	        before = options && options.before,
	        after = options && options.after,
	        err = options && options.err,
	        i, l = length, going = true, priority = 1,
	        tl = l,
	        obj, method, args, prio;
	
	    if (length && before) {
	      before(this);
	    }
	
	    while (going) {
	      going = false;
	      l = tl;
	      for (i = 0; i < l; i += 4) {
	        obj = queue[i];
	        method = queue[i + 1];
	        args = queue[i + 2];
	        prio = queue[i + 3];
	
	        if (prio === priority) {
	          P.Q.runAction(this, obj, method, args, err);
	        } else if (prio > priority) {
	          going = true;
	          tl = i + 4;
	        }
	      }
	      priority = priority + 1;
	    }
	
	    if (length && after) {
	      after(this);
	    }
	
	    if (queue.length > length) {
	      this._queue = queue.slice(length);
	
	      if (!once) {
	        this.go();
	      }
	    } else {
	      this._queue.length = 0;
	    }
	  }
	};
	
	P.Q.prototype.defer = P.Q.prototype.enque = P.Q.prototype.add = P.Q.prototype.push;
	P.Q.prototype.deferOnce = P.Q.prototype.enqueOnce = P.Q.prototype.addOnce = P.Q.prototype.pushOnce;
	P.Q.prototype.run = P.Q.prototype.go;
	
	/**
	 * @module proact-flow
	 */
	
	/**
	 * <p>
	 *  Creates a queue of {{#crossLink "ProAct.Queue"}}{{/crossLink}}s. The order of these sub-queues is used
	 *  to determine the order in which they will be dequed.
	 * </p>
	 * <p>
	 *  The idea of this class is to have different queues for the different layers
	 *  of an application. That way lower level actions will always execuded before higher level.
	 * </p>
	 * <p>
	 *  If a higher level queue enques actions in lower level one, the action flow returns stops and returns
	 *  from the lower level one.
	 * </p>
	 * <p>
	 *  The {{#crossLink "ProAct.Queues/go:method"}}{{/crossLink}} method deques all the actions from all the queues and executes them in the right
	 *  order, using their priorities and queue order.
	 * </p>
	 * <p>
	 *  A `ProAct.Queues` can be used to setup very complex the action flow.
	 *  ProAct.js uses it with only one queue - 'proq' to create an action flow if something changes.
	 * </p>
	 *
	 * TODO We need to pass before, after and error callbacks here too. ~meddle@2014-07-10
	 *
	 * @class ProAct.Queues
	 * @constructor
	 * @param {Array} queueNames
	 *      Array with the names of the sub-queues. The size of this array determines
	 *      the number of the sub-queues.
	 * @param {Object} options
	 *    Various options for the ProAct.Queues.
	 *    <p>Available options:</p>
	 *    <ul>
	 *      <li>queue - An options object containing options to be passed to all the sub-queues. For more information see {{#crossLink "ProAct.Queue"}}{{/crossLink}}.</li>
	 *    </ul>
	 */
	ProAct.Queues = P.QQ = function (queueNames, options) {
	  if (!queueNames) {
	    queueNames = ['proq'];
	  }
	
	  this.queueNames = queueNames;
	  this.options = options || {};
	
	  this._queues = {};
	
	  var i, ln = this.queueNames.length;
	  for (i = 0; i < ln; i++) {
	    this._queues[this.queueNames[i]] = new P.Q(this.queueNames[i], this.options.queue);
	  }
	};
	
	P.QQ.prototype = {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.Queues
	   * @final
	   * @for ProAct.Queues
	   */
	  constructor: ProAct.Queues,
	
	  /**
	   * Checks if this `ProAct.Queues` is empty.
	   *
	   * @for ProAct.Queues
	   * @instance
	   * @method isEmpty
	   * @return {Boolean}
	   *      True if there are no actions in any of the sub-queues.
	   */
	  isEmpty: function () {
	    var queues = this._queues,
	        names = this.queueNames,
	        length = names.length,
	        i, currentQueueName, currentQueue;
	
	    for (i = 0; i < length; i++) {
	      currentQueueName = names[i];
	      currentQueue = queues[currentQueueName];
	
	      if (!currentQueue.isEmpty()) {
	        return false;
	      }
	    }
	
	    return true;
	  },
	
	  /**
	   * Pushes an action to a sub-queue.
	   * This method can enque the same action multiple times and always with priority of '1'.
	   * <p>
	   *  `defer`, `enque` and `add` are aliases of this method.
	   * </p>
	   *
	   * @for ProAct.Queues
	   * @instance
	   * @method push
	   * @param {String} queueName
	   *      The name of the queue to enque the action in.
	   *      <p>
	   *        On the place of this argument the context can be passed and the queue to push in
	   *        becomes the first queue of the sub-queues.
	   *      </p>
	   * @param {Object} context
	   *      The context of the action.
	   *      It can be null.
	   *      <p>
	   *        If the method is called with a Function context, the context becomes the action.
	   *        This way the method can be called with only one parameter for actions without context.
	   *      </p>
	   * @param {Function} action
	   *      The action to enque.
	   *      <p>
	   *        If there is no context and the action is passed in place of the context,
	   *        this parameter can hold the arguments of the action.
	   *      </p>
	   * @param {Array} args
	   *      Arguments to be passed to the action when it is executed.
	   */
	  push: function (queueName, context, action, args) {
	    if (queueName && !(typeof(queueName) === 'string')) {
	      args = action;
	      action = context;
	      context = queueName;
	      queueName = this.queueNames[0];
	    }
	    if (!queueName) {
	      queueName = this.queueNames[0];
	    }
	
	    var queue = this._queues[queueName];
	    if (queue) {
	      queue.push(context, action, args);
	    }
	  },
	
	  /**
	   * Pushes an action to a sub-queue only once.
	   * <p>
	   *  If the action is pushed for the second time using this method, instead of
	   *  adding it to the sub-queue, its priority goes up and its arguments are updated.
	   *  This means that this action will be executed after all the other actions, pushed only once.
	   * </p>
	   * <p>
	   *  `deferOnce`, `enqueOnce` and `addOnce` are aliases of this method.
	   * </p>
	   *
	   * @for ProAct.Queues
	   * @instance
	   * @method pushOnce
	   * @param {String} queueName
	   *      The name of the queue to enque the action in.
	   *      <p>
	   *        On the place of this argument the context can be passed and the queue to push in
	   *        becomes the first queue of the sub-queues.
	   *      </p>
	   * @param {Object} context
	   *      The context of the action.
	   *      It can be null.
	   *      <p>
	   *        If the method is called with a Function context, the context becomes the action.
	   *        This way the method can be called with only one parameter for actions without context.
	   *      </p>
	   * @param {Function} action
	   *      The action to enque.
	   *      <p>
	   *        If there is no context and the action is passed in place of the context,
	   *        this parameter can hold the arguments of the action.
	   *      </p>
	   * @param {Array} args
	   *      Arguments to be passed to the action when it is executed.
	   */
	  pushOnce: function (queueName, context, action, args) {
	    if (queueName && !(typeof(queueName) === 'string')) {
	      args = action;
	      action = context;
	      context = queueName;
	      queueName = this.queueNames[0];
	    }
	    if (!queueName) {
	      queueName = this.queueNames[0];
	    }
	
	    var queue = this._queues[queueName];
	    if (queue) {
	      queue.pushOnce(context, action, args);
	    }
	  },
	
	  /**
	   * Starts the action flow.
	   * <p>
	   *  Executes the actions in all the  sub-queues in the order they were enqued, but also uses the priorities
	   *  to execute these with numerically higher priority after these with numerically lower priority.
	   * </p>
	   * <p>
	   *  If some of the actions in the third queue pushes new actions to the second queue, the action flow returns
	   *  to the second queue again and then continues through all the queues.
	   * </p>
	   * <p>
	   *  `run` and `flush` are aliases of this method.
	   * </p>
	   *
	   * @for ProAct.Queues
	   * @instance
	   * @method go
	   * @param {String} queueName
	   *      The name of the queue to begin from. Can be null and defaults to the first sub-queue.
	   */
	  go: function (queueName) {
	    var currentQueueIndex = 0,
	        queues = this._queues,
	        names = this.queueNames,
	        i, length = this.queueNames.length,
	        currentQueueName, currentQueue,
	        prevQueueIndex;
	
	    if (queueName) {
	      for (i = 0; i < length; i++) {
	        if (names[i] === queueName) {
	          currentQueueIndex = i;
	        }
	      }
	    }
	
	    goloop:
	    while (currentQueueIndex < length) {
	      currentQueueName = names[currentQueueIndex];
	      currentQueue = queues[currentQueueName];
	
	      currentQueue.go(true);
	
	      if ((prevQueueIndex = this._probePrevIndex(currentQueueIndex)) !== -1) {
	        currentQueueIndex = prevQueueIndex;
	        continue goloop;
	      }
	
	      currentQueueIndex = currentQueueIndex + 1;
	    }
	  },
	  _probePrevIndex: function (startIndex) {
	    var queues = this._queues,
	        names = this.queueNames,
	        i, currentQueueName, currentQueue;
	
	    for (i = 0; i <= startIndex; i++) {
	      currentQueueName = names[i];
	      currentQueue = queues[currentQueueName];
	
	      if (!currentQueue.isEmpty()) {
	        return i;
	      }
	    }
	
	    return -1;
	  }
	};
	
	P.QQ.prototype.defer = P.QQ.prototype.enque = P.QQ.prototype.add = P.QQ.prototype.push;
	P.QQ.prototype.deferOnce = P.QQ.prototype.enqueOnce = P.QQ.prototype.addOnce = P.QQ.prototype.pushOnce;
	P.QQ.prototype.flush = P.QQ.prototype.run = P.QQ.prototype.go;
	
	/**
	 * The `proact-flow` provides executing functions in the right order in time.
	 * Function execution can be deferred, there are priorities and turns.
	 *
	 * @module proact-flow
	 * @main proact-flow
	 */
	
	/**
	 * <p>
	 *  Constructs the action flow of the ProAct.js; An action flow is a set of actions
	 *  executed in the reactive environment, which order is determined by the dependencies
	 *  between the reactive properties. The action flow puts on motion the data flow in the reactive
	 *  ecosystem. Every change on a property triggers an action flow, which triggers the data flow.
	 * </p>
	 *  ProAct.Flow is inspired by the Ember's Backburner.js (https://github.com/ebryn/backburner.js).
	 *  The defferences are the priority queues and some other optimizations like the the 'once' argument of the {{#crossLink "ProAct.Queue/go:method"}}{{/crossLink}} method.
	 *  It doesn't include debouncing and timed defer of actions for now.
	 * <p>
	 *  ProAct.Flow is used to solve many of the problems in the reactive programming, for example the diamond problem.
	 * </p>
	 * <p>
	 *  It can be used for other purposes too, for example to run rendering in a rendering queue, after all of the property updates.
	 * </p>
	 * <p>
	 *  `ProAct.Flow`, {{#crossLink "ProAct.Queues"}}{{/crossLink}} and {{#crossLink "ProAct.Queue"}}{{/crossLink}} together form the `proact-flow` module of ProAct.
	 * </p>
	 *
	 * TODO ProAct.Flow#start and ProAct.Flow#stop are confusing names - should be renamed to something like 'init' and 'exec'.
	 *
	 * @constructor
	 * @class ProAct.Flow
	 * @param {Array} queueNames
	 *      Array with the names of the sub-queues of the {{#crossLink "ProAct.Queues"}}{{/crossLink}}es of the flow. The size of this array determines
	 *      the number of the sub-queues.
	 * @param {Object} options
	 *    Various options for the ProAct.Flow.
	 *    <p>Available options:</p>
	 *    <ul>
	 *      <li>start - A callback that will be called every time when the action flow starts.</li>
	 *      <li>stop - A callback that will be called every time when the action flow ends.</li>
	 *      <li>err - A callback that will be called if an error is thrown in the action flow.</li>
	 *      <li>flowInstance - Options object for the current flow instance. The flow instances are of the class {{#crossLink "ProAct.Queues"}}{{/crossLink}}.</li>
	 *    </ul>
	 */
	ProAct.Flow = P.F = function (queueNames, options) {
	  this.setQueues(queueNames);
	
	  this.options = options || {};
	
	  this.flowInstance = null;
	  this.flowInstances = [];
	
	  this.pauseMode = false;
	
	  try {
	    Object.defineProperty(this, 'closingQueue', {
	      enumerable: false,
	      configurable: false,
	      writable: false,
	      value: new ProAct.Queue('closing')
	    });
	  } catch (e) {
	    this.closingQueue = new ProAct.Queue('closing');
	  }
	};
	
	P.F.prototype = {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.Flow
	   * @final
	   * @for ProAct.Flow
	   */
	  constructor: ProAct.Flow,
	
	  /**
	   * Puts the `ProAct.Flow` in running mode, meaning actions can be defered in it.
	   * <p>
	   *  It creates a new flow instance - instance of {{#crossLink "ProAct.Queues"}}{{/crossLink}} and
	   *  if there was a running instance, it is set to be the previous inctance.
	   * </p>
	   * <p>
	   *  If a <i>start</i> callback was passed when this `ProAct.Flow` was being created,
	   *  it is called with the new flow instance.
	   * </p>
	   * <p>
	   *  `begin` is alias of this method.
	   * </p>
	   *
	   * @for ProAct.Flow
	   * @instance
	   * @method start
	   */
	  start: function () {
	    var queues = this.flowInstance,
	        options = this.options,
	        start = options && options.start,
	        queueNames = this.queueNames;
	
	    if (queues) {
	      this.flowInstances.push(queues);
	    }
	
	    this.flowInstance = new P.Queues(queueNames, options.flowInstance);
	
	    if (start) {
	      start(this.flowInstance);
	    }
	  },
	
	  /**
	   * Appends a new queue name to the list of <i>this</i>' queues.
	   * <p>
	   *  When a new <i>flowInstance</i> is created the updated list will be used.
	   * </p>
	   *
	   * @for ProAct.Flow
	   * @instance
	   * @method addQueue
	   * @param {String} queueName
	   *      The queue name to add.
	   */
	  addQueue: function (queueName) {
	    this.queueNames.push(queueName);
	  },
	
	  /**
	   * Sets the queue names of <i>this</i> flow.
	   * <p>
	   *  When a new <i>flowInstance</i> is created the new list will be used.
	   * </p>
	   *
	   * @for ProAct.Flow
	   * @instance
	   * @method setQueues
	   * @param {Array} queueNames
	   *      Array with the names of the sub-queues of the {{#crossLink "ProAct.Queues"}}{{/crossLink}}es of the flow.
	   *      The size of this array determines the number of the sub-queues.
	   */
	  setQueues: function (queueNames) {
	    if (!queueNames) {
	      queueNames = ['proq'];
	    }
	    this.queueNames = queueNames;
	  },
	
	  /**
	   * Starts an action flow consisting of all the actions defered after the
	   * last call of {{#crossLink "ProAct.Flow/start:method"}}{{/crossLink}} and then stops the `ProAct.Flow`.
	   *
	   * <p>
	   *  If there is a current action flow instance, it is flushed, using the
	   *  {{#crossLink "ProAct.Queues/go:method"}}{{/crossLink}} method.
	   * </p>
	   * <p>
	   *  If there was aprevious flow instance, it is set to be the current one.
	   * </p>
	   * <p>
	   *  If a callback for 'stop' was specified in the <i>options</i> on creation,
	   *  it is called with the flushed instance.
	   * </p>
	   * <p>
	   *  When the flow is started you put actions in order or with priority,
	   *  and if you want to execute them and stop it, you call this method.
	   * </p>
	   * <p>
	   *  `end` is an alias for this method.
	   * </p>
	   *
	   * @for ProAct.Flow
	   * @instance
	   * @method stop
	   */
	  stop: function () {
	    var queues = this.flowInstance,
	        options = this.options,
	        stop = options && options.stop,
	        nextQueues;
	
	    if (queues) {
	      try {
	        queues.go();
	      } finally {
	        this.flowInstance = null;
	
	        if (this.flowInstances.length) {
	          nextQueues = this.flowInstances.pop();
	          this.flowInstance = nextQueues;
	        }
	
	        if (stop) {
	          stop(queues);
	        }
	        this.closingQueue.go();
	      }
	    }
	  },
	
	  /**
	   * Puts the flow in <i>pause mode</i>.
	   * When the flow is paused actions that should be defered to be run in it
	   * are skipped.
	   *
	   * @for ProAct.Flow
	   * @instance
	   * @method pause
	   */
	  pause: function () {
	    this.pauseMode = true;
	  },
	
	  /**
	   * Resumes the action flow if it is paused.
	   * The flow becomes active again and actions can be pushed into it.
	   *
	   * @for ProAct.Flow
	   * @instance
	   * @method resume
	   */
	  resume: function () {
	    this.pauseMode = false;
	  },
	
	  /**
	   * Starts the action flow, executes the passed callback, in the passed context,
	   * and then stops the action flow, executing all the pushed by the <i>callback</i> actions.
	   * <p>
	   *  This means that you are guaranteed that you have a running action flow for the actions
	   *  that should be pushed to a flow in the <i>callback</i>.
	   * </p>
	   * <p>
	   *  `go` and `flush` are aliases of this method.
	   * </p>
	   *
	   * @for ProAct.Flow
	   * @instance
	   * @method run
	   * @param {Object} context
	   *      The value of <i>this</i> bound to the <i>callback</i> when it is executed.
	   * @param {Function} callback
	   *      The callback that will be invoked in a new running `ProAct.Flow`.
	   */
	  run: function (context, callback) {
	    var options = this.options,
	        err = options.err;
	
	    this.start();
	    if (!callback) {
	      callback = context;
	      context = null;
	    }
	
	    try {
	      if (err) {
	        try {
	          callback.call(context);
	        } catch (e) {
	          if (!e.fromFlow) {
	            e.fromFlow = true;
	            err(e);
	          } else {
	            throw e;
	          }
	        }
	      } else {
	        callback.call(context);
	      }
	    } finally {
	      this.stop();
	    }
	  },
	
	  /**
	   * Checks if there is an active {{#crossLink "ProAct.Queues"}}{{/crossLink}} instance in this `ProAct.Flow`.
	   *
	   * TODO This should be named 'isActive'.
	   *
	   * @for ProAct.Flow
	   * @instance
	   * @method isRunning
	   */
	  isRunning: function () {
	    return this.flowInstance !== null && this.flowInstance !== undefined;
	  },
	
	  /**
	   * Checks if this `ProAct.Flow` is paused.
	   *
	   * @for ProAct.Flow
	   * @instance
	   * @method isPaused
	   */
	  isPaused: function () {
	    return this.isRunning() && this.pauseMode;
	  },
	
	  /**
	   * Pushes an action to the flow.
	   * This method can defer in the flow the same action multiple times.
	   * <p>
	   *  `defer`, `enque` and `add` are aliases of this method.
	   * </p>
	   * <p>
	   *  If the flow is paused, the action will not be defered.
	   * </p>
	   *
	   * TODO Errors should be put in constants!
	   *
	   * @for ProAct.Flow
	   * @instance
	   * @method push
	   * @param {String} queueName
	   *      The name of the queue to defer the action in.
	   *      <p>
	   *        On the place of this argument the context can be passed and the queue to push in
	   *        becomes the first queue available.
	   *      </p>
	   * @param {Object} context
	   *      The context of the action.
	   *      It can be null.
	   *      <p>
	   *        If the method is called with a Function context, the context becomes the action.
	   *        This way the method can be called with only one parameter for actions without context.
	   *      </p>
	   * @param {Function} action
	   *      The action to defer into the flow.
	   *      <p>
	   *        If there is no context and the action is passed in place of the context,
	   *        this parameter can hold the arguments of the action.
	   *      </p>
	   * @param {Array} args
	   *      Arguments to be passed to the action when it is executed.
	   * @throws {Error} <i>Not in running flow!</i>, if there is no action flow instance.
	   */
	  push: function (queueName, context, action, args) {
	    if (!this.flowInstance) {
	      throw new Error('Not in running flow!');
	    }
	    if (!this.isPaused()) {
	      this.flowInstance.push(queueName, context, action, args);
	    }
	  },
	
	  /**
	   * Defers an action to the flow only once per run.
	   * <p>
	   *  If the action is pushed for the second time using this method, instead of
	   *  adding it, its set to be executed later then all the actions that were defered only once, using this method.
	   * </p>
	   * <p>
	   *  `deferOnce`, `enqueOnce` and `addOnce` are aliases of this method.
	   * </p>
	   * <p>
	   *  If the flow is paused, the action will not be defered.
	   * </p>
	   *
	   * @for ProAct.Flow
	   * @instance
	   * @method pushOnce
	   * @param {String} queueName
	   *      The name of the queue to defer the action in.
	   *      <p>
	   *        On the place of this argument the context can be passed and the queue to push in
	   *        becomes the first queue of the sub-queues.
	   *      </p>
	   * @param {Object} context
	   *      The context of the action.
	   *      It can be null.
	   *      <p>
	   *        If the method is called with a Function context, the context becomes the action.
	   *        This way the method can be called with only one parameter for actions without context.
	   *      </p>
	   * @param {Function} action
	   *      The action to defer.
	   *      <p>
	   *        If there is no context and the action is passed in place of the context,
	   *        this parameter can hold the arguments of the action.
	   *      </p>
	   * @param {Array} args
	   *      Arguments to be passed to the action when it is executed.
	   * @throws {Error} <i>Not in running flow!</i>, if there is no action flow instance.
	   */
	  pushOnce: function (queueName, context, action, args) {
	    if (!this.flowInstance) {
	      throw new Error('Not in running flow!');
	    }
	    if (!this.isPaused()) {
	      this.flowInstance.pushOnce(queueName, context, action, args);
	    }
	  },
	
	  pushClose: function (context, action, args) {
	    this.closingQueue.pushOnce(context, action, args);
	  }
	};
	
	/**
	 * The {{#crossLink "ProAct.Flow"}}{{/crossLink}} instance used by ProAct's property updates by default.
	 * <p>
	 *  It defines only one queue - the default one <i>proq</i>.
	 * </p>
	 * <p>
	 *  Override this instance if you are creating a framework or toolset over ProAct.js.
	 * </p>
	 *
	 * @property flow
	 * @type ProAct.Flow
	 * @for ProAct
	 * @final
	 */
	ProAct.flow = new ProAct.Flow(['proq'], {
	  err: function (e) {
	    console.log(e);
	  },
	  flowInstance: {
	    queue: {
	      err: function (queue, e) {
	        e.queue = queue;
	        console.log(e);
	      }
	    }
	  }
	});
	
	P.F.prototype.begin = P.F.prototype.start;
	P.F.prototype.end = P.F.prototype.stop;
	P.F.prototype.defer = P.F.prototype.enque = P.F.prototype.add = P.F.prototype.push;
	P.F.prototype.deferOnce = P.F.prototype.enqueOnce = P.F.prototype.addOnce = P.F.prototype.pushOnce;
	P.F.prototype.flush = P.F.prototype.go = P.F.prototype.run;
	
	/**
	 * @module proact-core
	 */
	
	
	/**
	 * ActorUtil provides methods that can be used to make the Actor to 'act'.
	 * The Actor is ProAct.js version of the base `Observable` object. Various types
	 * of listeners can be attached to it and used to observe its `actions`.
	 *
	 * On the other hand the `Actor` should do something or `act`, because something
	 * has to be observed after all.
	 *
	 * The `ActorUtil` contains a set of methods that help implementing these `acts`.
	 *
	 * For example the we can trigger events/values in the `Streams`. This is thier `act`.
	 * This triggering can be implemented with ease using the methods defined in `ActorUtil`.
	 *
	 * Another example is `Properties` - they can be set or updated by the reactive flow -> they should react.
	 *
	 * So `ActorUtil` provides the `Actors` with helpful methods for `acting` and `reacting`.
	 *
	 * All these methods use the {{#crossLink "ProAct.Flow"}}{{/crossLink}} to defer the changes the right way.
	 * And the using the `flow` these methods handle the dependencies between the `Actors`.
	 *
	 * Use the methods in the `ActorUtil` to implement your `Actor's` `actions` and `reactions`.
	 *
	 * @namespace ProAct
	 * @private
	 * @class ActorUtil
	 * @extensionfor ProAct.Actor
	 * @static
	 */
	ActorUtil = {
	
	  /**
	   * Updating/notifying method that can be applied to an {{#crossLink "ProAct.Actor"}}{{/crossLink}}
	   *
	   * This method defers the update and the notifications into {{#crossLink "ProAct.flow"}}{{/crossLink}}.
	   *
	   * If the state of the caller is {{#crossLink "ProAct.States.destroyed)"}}{{/crossLink}}, an exception will be thrown.
	   * If the state of the caller is {{#crossLink "ProAct.States.closed)"}}{{/crossLink}}, nothing will happen.
	   *
	   * Examples:
	   *
	   * You can implement a stream and in it's `trigger` method use this:
	   * ```
	   *   ActorUtil.update.call(this, event);
	   * ```
	   * This way the event will be triggered into the stream and all the listeners to the stream will be notified.
	   * For this to work you'll have to override the `makeEvent` method of the stream to return the unmodified source - no state/no event generation,
	   * the event will just go through.
	   *
	   *
	   * If you want to implement a statefull `Actor` like a `property`, you can set a state in it and just notify all the
	   * observing `Actors` with this method.
	   *
	   *
	   * @method update
	   * @protected
	   * @param {Object} [source] The event/value, causing the update -> can be null : no source.
	   * @param {Object} [actions] For which actions should notify -> can be null : default actions.
	   * @param {Object} [eventData] Data for creating the updating event -> can be null : no data.
	   * @return {Object} The calling object.
	   */
	  update: function (source, actions, eventData) {
	    if (this.state === ProAct.States.destroyed) {
	      throw new Error('You can not trigger actions on destroyed actors!');
	    }
	
	    if (this.state === ProAct.States.closed) {
	      return;
	    }
	
	    var actor = this;
	    if (!P.flow.isRunning()) {
	      P.flow.run(function () {
	        ActorUtil.doUpdate.call(actor, source, actions, eventData);
	      });
	    } else {
	      ActorUtil.doUpdate.call(actor, source, actions, eventData);
	    }
	    return this;
	  },
	
	  /**
	   * Contains the real notify/update logic defered by {{#crossLink "ProAct.ActorUtil/update:method"}}{{/crossLink}} into the flow.
	   * It is private method, should not be used - use `update`.
	   *
	   * @method doUpdate
	   * @private
	   * @param {Object} [source] The event/value, causing the update -> can be null : no source.
	   * @param {Object} [actions] For which actions should notify -> can be null : default actions.
	   * @param {Object} [eventData] Data for creating the updating event -> can be null : no data.
	   * @return {Object} The calling object.
	   */
	  doUpdate: function (source, actions, eventData) {
	    if (!actions) {
	      actions = this.defaultActions();
	    }
	
	    var ln, i, j,
	        listener,
	        listeners,
	        length,
	        event;
	
	    if (P.U.isString(actions)) {
	      listeners = this.listeners[actions];
	    } else {
	      while (actions.indexOf('close') !== -1) {
	        P.U.remove(actions, 'close');
	      }
	
	      listeners = [];
	      ln = actions.length;
	
	      if (this.parent === null && actions.length === 0) {
	        return this;
	      }
	
	      for (i = 0; i < ln; i++) {
	        listenersForAction = this.listeners[actions[i]];
	
	        if (listenersForAction) {
	          for (j = 0; j < listenersForAction.length; j++) {
	            if (listenersForAction[j].destroyed || listenersForAction[j].closed) {
	              this.off(actions[i], listenersForAction[j]);
	              continue;
	            }
	          }
	          listeners = listeners.concat(listenersForAction);
	        }
	      }
	    }
	
	    if (listeners.length === 0 && this.parent === null && actions !== 'close') {
	      return this;
	    }
	
	    if (actions === 'close' && !this.canClose()) {
	      return this;
	    }
	
	    length = listeners.length;
	    event = this.makeEvent(source, eventData);
	
	    for (i = 0; i < length; i++) {
	      listener = listeners[i];
	      if (!listener) {
	        throw new Error('Invalid null listener for actions : ' + actions);
	      }
	
	      if (P.U.isString(actions) && listener.destroyed) {
	        this.off(actions, listener);
	        continue;
	      }
	
	      this.defer(event, listener);
	
	      if (listener.property) {
	        ActorUtil.doUpdate.call(listener.property, event);
	      }
	    }
	
	    if (this.parent && this.parent.call) {
	      this.defer(event, this.parent);
	    }
	
	    if (actions === 'close') {
	      P.flow.pushClose(this, this.doClose);
	    }
	
	    return this;
	  }
	};
	P.U.defValProp(ProAct, 'ActorUtil', false, false, false, ActorUtil);
	
	/**
	 * @module proact-core
	 */
	
	/**
	 * <p>
	 *  `ProAct.Actor` is the basic observer-observable functionallity in ProAct.js
	 * </p>
	 * <p>
	 *  The actors in ProAct.js form the dependency graph.
	 *  If some actor listens to changes from another - it depends on it.
	 * </p>
	 * <p>
	 *  The actors can transform the values or events incoming to them.
	 * </p>
	 * <p>
	 *  Every actor can have a parent actor, that will be notified for all the changes
	 *  on the child-actor, it is something as special observer.
	 * </p>
	 * <p>
	 *  ProAct.Actor is part of the core module of ProAct.js.
	    System.out.println();
	 * </p>
	 *
	 * @class ProAct.Actor
	 * @constructor
	 * @param {String} [queueName]
	 *      The name of the queue all the updates should be pushed to.
	 *      <p>
	 *        If this parameter is null/undefined the default queue of
	 *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
	 *      </p>
	 *      <p>
	 *        If this parameter is not a string it is used as the
	 *        <i>transforms</i>.
	 *      </p>
	 * @param {Array} [transforms]
	 *      A list of transformation to be used on all incoming chages.
	 */
	function Actor (queueName, transforms) {
	  if (queueName && !P.U.isString(queueName)) {
	    transforms = queueName;
	    queueName = null;
	  }
	
	  P.U.defValProp(this, 'listeners', false, false, true, this.defaultListeners());
	
	  P.U.defValProp(this, 'listener', false, false, true, null);
	  P.U.defValProp(this, 'errListener', false, false, true, null);
	  P.U.defValProp(this, 'closeListener', false, false, true, null);
	  P.U.defValProp(this, 'parent', false, false, true, null);
	
	  P.U.defValProp(this, 'queueName', false, false, false, queueName);
	  P.U.defValProp(this, 'transforms', false, false, true,
	                 (transforms ? transforms : []));
	
	  P.U.defValProp(this, 'state', false, false, true, P.States.init);
	
	  this.init();
	}
	ProAct.Actor = P.Pro = Actor;
	
	P.U.ex(P.Actor, {
	
	  /**
	   * A constant defining bad values or bad events.
	   *
	   * Part of the filtering mechainsm; If a transformation returns
	   * a `BadValue`, based on uncomming event -> the event is skipped.
	   *
	   * @property BadValue
	   * @type Object
	   * @final
	   * @static
	   * @for ProAct.Actor
	   */
	  BadValue: {},
	
	  /**
	   * A constant defining closing or ending events.
	   *
	   * If a transformation returns this value, the actor will be closed.
	   *
	   * You can manually close `Actor`s updating them with this constant as an event.
	   *
	   * @property Close
	   * @type Object
	   * @final
	   * @static
	   * @for ProAct.Actor
	   */
	  Close: {},
	
	  /**
	   * Transforms the passed <i>val</i> using the {{#crossLink "ProAct.Actor/transforms:method"}}{{/crossLink}} method of the passed <i>actor</i>.
	   *
	   * @method transforms
	   * @for ProAct.Actor
	   * @static
	   * @param {ProAct.Actor} actor The `ProAct.Actor` which transformations should be used.
	   * @param {Object} val The value to transform.
	   * @return {Object} The transformed value.
	   */
	  transform: function (actor, val) {
	    var i, t = actor.transforms, ln = t.length;
	    for (i = 0; i < ln; i++) {
	      val = t[i].call(actor, val);
	      if (val === P.Actor.BadValue) {
	        break;
	      }
	
	      if (val === P.Actor.Close) {
	        break;
	      }
	    }
	
	    return val;
	  }
	});
	
	P.Actor.prototype = {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.Actor
	   * @final
	   * @for ProAct.Actor
	   */
	  constructor: ProAct.Actor,
	
	  /**
	   * Initializes this actor.
	   * <p>
	   *  This method logic is run only if the current state of <i>this</i> is
	   *  {{#crossLink "ProAct.States/init:property"}}{{/crossLink}}.
	   * </p>
	   * <p>
	   *  Then {{#crossLink "ProAct.Actor/afterInit:method"}}{{/crossLink}} is called to finish the initialization.
	   * </p>
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method init
	   */
	  init: function () {
	    if (this.state !== P.States.init) {
	      return;
	    }
	
	    this.doInit();
	
	    this.afterInit();
	  },
	
	  /**
	   * Allocating of resources or initializing is done here.
	   * <p>
	   *  Empty by default.
	   * </p>
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @protected
	   * @method doInit
	   */
	  doInit: function () {},
	
	  /**
	   * Called automatically after initialization of this actor.
	   * <p>
	   *  By default it changes the state of <i>this</i> to {{#crossLink "ProAct.States/ready:property"}}{{/crossLink}}.
	   * </p>
	   * <p>
	   *  It can be overridden to define more complex initialization logic.
	   * </p>
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @protected
	   * @method afterInit
	   */
	  afterInit: function () {
	    this.state = P.States.ready;
	  },
	
	  /**
	   * Closes this actor => it state becomes {{#crossLink "ProAct.States/closed:property"}}{{/crossLink}}.
	   *
	   * This sends a `close` event to all the subscribers to closing.
	   *
	   * After closing the actor it can't emit events anymore.
	   *
	   * Example:
	   * ```
	   *  var actor = new ProAct.Actor();
	   *  actor.onClose(function () {
	   *    console.log('Done!');
	   *  });
	   *
	   *  actor.close(); // We will see 'Done!' on the console output.
	   * ```
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method close
	   * @return {ProAct.Actor} This instance - can be chained.
	   */
	  close: function () {
	    if (this.state === P.States.closed) {
	      return;
	    }
	    return ActorUtil.update.call(this, P.Actor.Close, 'close');
	  },
	
	  /**
	   * Checks if <i>this</i> can be closed.
	   * <p>
	   *  Defaults to return true.
	   * </p>
	   *
	   * @for ProAct.Actor
	   * @protected
	   * @instance
	   * @method canClose
	   */
	  canClose: function () {
	    return true;
	  },
	
	  /**
	   * This method is called when a `close` event is pushed to this `Actor`.
	   *
	   * It removes all the subscriptions to the `Actor` and sets its
	   * state to {{#crossLink "ProAct.States/closed:property"}}{{/crossLink}}.
	   *
	   * Do not call this method; it is private!
	   *
	   * @for ProAct.Actor
	   * @private
	   * @instance
	   * @protected
	   * @method doClose
	   */
	  doClose: function () {
	    this.state = P.States.closed;
	    this.offAll();
	    if (this.listener) {
	      this.listener.closed = true;
	    }
	  },
	
	  /**
	   * Called immediately before destruction.
	   *
	   * The idea is to be implemented by extenders to free additional resources on destroy.
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @abstract
	   * @protected
	   * @method beforeDestroy
	   */
	  beforeDestroy: function () {
	  },
	
	  /**
	   * Destroys this `ProAct.Actor` instance.
	   * <p>
	   *  The state of <i>this</i> is set to {{#crossLink "ProAct.States/destroyed:property"}}{{/crossLink}}.
	   * </p>
	   *
	   * Calls {{#crossLink "ProAct.Actor/beforeDestroy:method"}}{{/crossLink}}
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method destroy
	   */
	  destroy: function () {
	    if (this.state === P.States.destroyed) {
	      return;
	    }
	
	    this.beforeDestroy();
	
	    this.listeners = undefined;
	
	    if (this.listener) {
	      this.listener.destroyed = true;
	    }
	    this.listener = undefined;
	    this.errListener = undefined;
	    this.closeListener = undefined;
	    this.parent = undefined;
	
	    this.queueName = undefined;
	    this.transforms = undefined;
	
	    this.state = P.States.destroyed;
	  },
	
	  /**
	   * Generates the initial listeners object.
	   * It can be overridden for alternative listeners collections.
	   * It is used for resetting all the listeners too.
	   *
	   * The default types of listeners are:
	   * ```
	   *  {
	   *    change: [],
	   *    error: [],
	   *    close: []
	   *  }
	   * ```
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @protected
	   * @method defaultListeners
	   * @return {Object} A map containing the default listeners collections.
	   */
	  defaultListeners: function () {
	    return {
	      change: [],
	      error: [],
	      close: []
	    };
	  },
	
	  /**
	   * A list of actions or action to be used when no action is passed for the methods working with actions.
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method defaultActions
	   * @protected
	   * @default 'change'
	   * @return {Array|String} The actions to be used if no actions are provided to action related methods, like
	   *  {{#crossLink "ProAct.Actor/on:method"}}{{/crossLink}},
	   *  {{#crossLink "ProAct.Actor/off:method"}}{{/crossLink}},
	   *  {{#crossLink "ProAct.ActorUtil/update:method"}}{{/crossLink}}.
	   */
	  defaultActions: function () {
	    return 'change';
	  },
	
	  /**
	   * Creates the <i>listener</i> of this actor.
	   *
	   * Every actor should have one listener that should pass to other actors.
	   *
	   * <p>
	   *  This listener turns the actor in a observer.
	   * </p>
	   * <p>
	   *  Should be overriden with specific listener, by default it returns {{#crossLink "ProAct/N:method"}}{{/crossLink}}.
	   * </p>
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @abstract
	   * @method makeListener
	   * @protected
	   * @default {ProAct.N}
	   * @return {Object} The <i>listener of this observer</i>.
	   */
	  makeListener: P.N,
	
	  /**
	   * Creates the <i>error listener</i> of this actor.
	   *
	   * Every actor should have one error listener that should pass to other actors.
	   *
	   * <p>
	   *  This listener turns the actor in a observer for errors.
	   * </p>
	   * <p>
	   *  Should be overriden with specific listener, by default it returns {{#crossLink "ProAct/N:method"}}{{/crossLink}}.
	   * </p>
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @abstract
	   * @method makeErrListener
	   * @protected
	   * @default {ProAct.N}
	   * @return {Object} The <i>error listener of this observer</i>.
	   */
	  makeErrListener: P.N,
	
	  /**
	   * Creates the <i>closing listener</i> of this actor.
	   *
	   * Every actor should have one closing listener that should pass to other actors.
	   *
	   * <p>
	   *  This listener turns the actor in a observer for closing events.
	   * </p>
	   * <p>
	   *  Should be overriden with specific listener, by default it returns {{#crossLink "ProAct/N:method"}}{{/crossLink}}.
	   * </p>
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @abstract
	   * @protected
	   * @method makeCloseListener
	   * @default {ProAct.N}
	   * @return {Object} The <i>closing listener of this observer</i>.
	   */
	  makeCloseListener: P.N,
	
	  /**
	   * Creates the <i>event</i> to be send to the listeners on update.
	   *
	   * <p>
	   *  The <i>event</i> should be an instance of {{#crossLink "ProAct.Event"}}{{/crossLink}}.
	   * </p>
	   *
	   * <p>
	   *  By default this method returns {{#crossLink "ProAct.Event.Types/value:property"}}{{/crossLink}} event.
	   * </p>
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method makeEvent
	   * @default {ProAct.Event} with type {{#crossLink "ProAct.Event.Types/value:property"}}{{/crossLink}}.
	   * @protected
	   * @param {ProAct.Event} source The source event of the event. It can be null
	   * @return {ProAct.Event} The event.
	   */
	  makeEvent: function (source) {
	    return new P.Event(source, this, P.Event.Types.value);
	  },
	
	  /**
	   * Attaches a new listener to this `ProAct.Actor`.
	   *
	   * The listener may be function or object that defines a <i>call</i> method.
	   *
	   * ```
	   *   actor.on(function (v) {
	   *    console.log(v);
	   *   });
	   *
	   *   actor.on('error', function (v) {
	   *    console.error(v);
	   *   });
	   *
	   *   actor.on({
	   *    call: function (v) {
	   *      console.log(v);
	   *    }
	   *   });
	   * ```
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method on
	   * @param {Array|String} actions
	   *      The action/actions to listen for. If this parameter is skipped or null/undefined,
	   *      the actions from {{#crossLink "ProAct.Actor/defaultActions:method"}}{{/crossLink}} are used.
	   *      <p>
	   *        The actions can be skipped and on their place as first parameter to be passed the <i>listener</i>.
	   *      </p>
	   * @param {Object} listener
	   *      The listener to attach. It must be instance of Function or object with a <i>call</i> method.
	   * @return {ProAct.Actor}
	   *      <b>this</b>
	   */
	  on: function (actions, listener) {
	    if (!P.U.isString(actions) && !P.U.isArray(actions)) {
	      listener = actions;
	      actions = this.defaultActions();
	    }
	    if (!P.U.isArray(actions)) {
	      actions = [actions];
	    }
	
	    var ln = actions.length,
	        action, i, listeners;
	
	    for (i = 0; i < ln; i ++) {
	      action = actions[i];
	      listeners = this.listeners[action];
	
	      if (!listeners) {
	        listeners = this.listeners[action] = [];
	      }
	
	      listeners.push(listener);
	    }
	
	    return this;
	  },
	
	  /**
	   * Removes a <i>listener</i> from the passed <i>action</i>.
	   *
	   * <p>
	   *  If this method is called without parameters, all the listeners for all the actions are removed.
	   *  The listeners are reset using {{#crossLink "ProAct.Actor/defaultActions:method"}}{{/crossLink}}.
	   * </p>
	   *
	   * Examples are:
	   *
	   * Removing a listener:
	   * ```
	   *  var listener = function (v) {
	   *    console.log(v);
	   *  };
	   *  actor.on(listener);
	   *  actor.off(listener);
	   * ```
	   *
	   * Or for removing all the listeners attached to an actor:
	   * ```
	   *  actor.off();
	   * ```
	   *
	   * Or for removing all the listeners of a given type attached to an actor:
	   * ```
	   *  actor.off('error');
	   * ```
	   *
	   * Or for removing a listener from different type of actions:
	   * ```
	   *  var listener = function (v) {
	   *    console.log(v);
	   *  };
	   *  actor.on(listener);
	   *  actor.onErr(listener);
	   *
	   *  actor.off(['error', 'change'], listener);
	   * ```
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method off
	   * @param {Array|String} actions
	   *      The action/actions to stop listening for. If this parameter is skipped or null/undefined,
	   *      the actions from {{#crossLink "ProAct.Actor/defaultActions:method"}}{{/crossLink}} are used.
	   *      <p>
	   *        The actions can be skipped and on their place as first parameter to be passed the <i>listener</i>.
	   *      </p>
	   * @param {Object} listener
	   *      The listener to detach. If it is skipped, null or undefined all the listeners are removed from this actor.
	   * @return {ProAct.Actor}
	   *      <b>this</b>
	   */
	  off: function (actions, listener) {
	    if (!actions && !listener) {
	      this.listeners = this.defaultListeners();
	      return this;
	    }
	
	    if (!P.U.isString(actions) && !P.U.isArray(actions)) {
	      listener = actions;
	      actions = this.defaultActions();
	    }
	    if (!P.U.isArray(actions)) {
	      actions = [actions];
	    }
	
	    var ln = actions.length,
	        action, i, listeners;
	
	    for (i = 0; i < ln; i ++) {
	      action = actions[i];
	      listeners = this.listeners[action];
	
	      if (listeners) {
	        P.U.remove(listeners, listener);
	      }
	    }
	
	    return this;
	  },
	
	  /**
	   * Attaches a new error listener to this ProAct.Actor.
	   *
	   * The listener may be function or object that defines a <i>call</i> method.
	   *
	   * This is the same as calling `on('error', listener)` on an `Actor`...
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method onErr
	   * @param {Object} listener
	   *      The listener to attach. It must be instance of Function or object with a <i>call</i> method.
	   * @return {ProAct.Actor}
	   *      <b>this</b>
	   */
	  onErr: function (listener) {
	    return this.on('error', listener);
	  },
	
	  /**
	   * Removes an error <i>listener</i> from the passed <i>action</i>.
	   *
	   * This is the same as calling `off('error', listener)` on an `Actor`...
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method offErr
	   * @param {Object} listener
	   *      The listener to detach. If it is skipped, null or undefined all the listeners are removed from this actor.
	   * @return {ProAct.Actor}
	   *      <b>this</b>
	   */
	  offErr: function (listener) {
	    return this.off('error', listener);
	  },
	
	  /**
	   * Attaches a new close notifcation listener to this `ProAct.Actor`.
	   *
	   * The listener may be function or object that defines a <i>call</i> method.
	   *
	   * This is the same as calling `on('close', listener)` on an `Actor`...
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method onClose
	   * @param {Object} listener
	   *      The listener to attach. It must be instance of Function or object with a <i>call</i> method.
	   * @return {ProAct.Actor}
	   *      <b>this</b>
	   */
	  onClose: function (listener) {
	    return this.on('close', listener);
	  },
	
	  /**
	   * Removes a close notification <i>listener</i> from the passed <i>action</i>.
	   *
	   * This is the same as calling `off('close', listener)` on an `Actor`...
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method offClose
	   * @param {Object} listener
	   *      The listener to detach. If it is skipped, null or undefined all the listeners are removed from this actor.
	   * @return {ProAct.Actor}
	   *      <b>this</b>
	   */
	  offClose: function (listener) {
	    return this.off('close', listener);
	  },
	
	  /**
	   * Attaches the passed listener to listen to values, errors and the close notification from this `ProAct.Actor`.
	   *
	   * The listener may be function or object that defines a <i>call</i> method.
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method onAll
	   * @param {Object} listener
	   *      The listener to attach. It must be instance of Function or object with a <i>call</i> method.
	   * @return {ProAct.Actor}
	   *      <b>this</b>
	   */
	  onAll: function (listener) {
	    return this.on(listener).onClose(listener).onErr(listener);
	  },
	
	  /**
	   * Removes all notifications <i>listener</i> from the passed <i>action</i>.
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method offAll
	   * @param {Object} listener
	   *      The listener to detach. If it is skipped, null or undefined all the listeners are removed from this actor.
	   * @return {ProAct.Actor}
	   *      <b>this</b>
	   */
	  offAll: function (listener) {
	    this.off(listener);
	    this.off('error', listener);
	    return this.off('close', listener);
	  },
	
	  /**
	   * Links source actors into this actor. This means that <i>this actor</i>
	   * is listening for changes from the <i>sources</i>.
	   * <p>
	   *  A good example is one stream to have another as as source -> if data comes into the source
	   *  stream, it is passed to the listening too. That way the source stream is plugged <b>into</b> the listening one.
	   * </p>
	   * <p>
	   *  The listeners from {{#crossLink "ProAct.Actor/makeListener:method"}}{{/crossLink}},
	   *  {{#crossLink "ProAct.Actor/makeErrListener:method"}}{{/crossLink}} and {{#crossLink "ProAct.Actor/makeCloseListener:method"}}{{/crossLink}} are used.
	   * </p>
	   *
	   * Chaining actors is very powerful operation. It can be used to merge many source actors into one.
	   *
	   * ```
	   *  var sourceActor1 = <Actor implementation>;
	   *  var sourceActor2 = <Actor implementation>;
	   *  var actor = <Actor implementation>;
	   *
	   *  actor.into(sourceActor1, sourceActor2);
	   *  actor.on(function (v) {
	   *    console.log(v);
	   *  });
	   *
	   * ```
	   *
	   * Now if the any of the source actors is updated, the update will be printed on the console by the `actor`.
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method into
	   * @param [...]
	   *      Zero or more source ProAct.Actors to set as sources.
	   * @return {ProAct.Actor}
	   *      <b>this</b>
	   */
	  into: function () {
	    var args = slice.call(arguments),
	        ln = args.length, i, source;
	    for (i = 0; i < ln; i++) {
	      source = args[i];
	      source.on(this.makeListener());
	      source.onErr(this.makeErrListener());
	      source.onClose(this.makeCloseListener());
	    }
	
	    return this;
	  },
	
	  /**
	   * The reverse of {{#crossLink "ProAct.Actor/into:method"}}{{/crossLink}} - sets <i>this actor</i> as a source
	   * to the passed <i>destination</i> actor.
	   *
	   * ```
	   *  var sourceActor = <Actor implementation>;
	   *  var actor = <Actor implementation>;
	   *
	   *  sourceActor.out(actor);
	   *  actor.on(function (v) {
	   *    console.log(v);
	   *  });
	   *
	   *  Now if the any of the source actors is updated, the update will be printed on the console by the `actor`.
	   *
	   * ```
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method out
	   * @param {ProAct.Actor} destination
	   *      The actor to set as source <i>this</i> to.
	   * @return {ProAct.Actor}
	   *      <b>this</b>
	   */
	  out: function (destination) {
	    destination.into(this);
	
	    return this;
	  },
	
	  /**
	   * Adds a new <i>transformation</i> to the list of transformations
	   * of <i>this actor</i>.
	   *
	   * <p>
	   *  A transformation is a function or an object that has a <i>call</i> method defined.
	   *  This function or call method should have one argument and to return a transformed version of it.
	   *  If the returned value is {@link ProAct.Actor.BadValue}, the next transformations are skipped and the updating
	   *  value/event becomes - bad value.
	   * </p>
	   *
	   * <p>
	   *  Every value/event that updates <i>this actor</i> will be transformed using the new transformation.
	   * </p>
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method transform
	   * @protected
	   * @param {Object} transformation
	   *      The transformation to add.
	   * @return {ProAct.Actor}
	   *      <b>this</b>
	   */
	  transform: function (transformation) {
	    this.transforms.push(transformation);
	    return this;
	  },
	
	  /**
	   * Adds a new <i>transformation</i> to the list of transformations
	   * of <i>this actor</i>.
	   *
	   * A transformation is a function or an object that has a <i>call</i> method defined.
	   * This function or call method should have one argument and to return a transformed version of it.
	   * If the returned value is {@link ProAct.Actor.BadValue}, the next transformations are skipped and the updating
	   * value/event becomes - bad value.
	   *
	   * Every value/event that updates <i>this actor</i> will be transformed using the new transformation.
	   *
	   * The idea of this method is that it just calls {{#crossLink "ProAct.Actor/transform:method"}}{{/crossLink}},
	   * but it can be overidden from another module.
	   *
	   * TODO Maybe transformStored is a bad name 
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method transformStored
	   * @protected
	   * @param {Object} transformation
	   *      The transformation to add. Can be string - to be retrieved by name.
	   * @param {String} type
	   *      The type of the transformation, for example `mapping`.
	   * @return {ProAct.Actor}
	   *      <b>this</b>
	   */
	  transformStored: function (transformation, type) {
	    return this.transform(transformation);
	  },
	
	  /**
	   * Adds a mapping transformation to <i>this actor</i>.
	   * <p>
	   *  Mapping transformations just transform one value into another. For example if we get update with
	   *  the value of <i>3</i> and we have mapping transformation that returns the updating value powered by <i>2</i>,
	   *  we'll get <i>9</i> as actual updating value.
	   * </p>
	   *
	   * @for ProAct.Actor
	   * @protected
	   * @instance
	   * @method mapping
	   * @param {Object} mappingFunction
	   *      Function or object with a <i>call method</i> to use as map function.
	   * @return {ProAct.Actor}
	   *      <b>this</b>
	   */
	  mapping: function (mappingFunction) {
	    return this.transformStored(mappingFunction, 'map');
	  },
	
	  /**
	   * Adds a filtering transformation to <i>this actor</i>.
	   * <p>
	   *  Filtering can be used to filter the incoming update values. For example you can
	   *  filter by only odd numbers as update values.
	   * </p>
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @protected
	   * @method filtering
	   * @param {Object} filteringFunction
	   *      The filtering function or object with a call method, should return boolean.
	   * @return {ProAct.Actor}
	   *      <b>this</b>
	   */
	  filtering: function(filteringFunction) {
	    var self = this,
	    filter = filteringFunction.call ? function (val) {
	      if (filteringFunction.call(self, val)) {
	        return val;
	      };
	      return P.Actor.BadValue;
	    } : filteringFunction;
	
	    return this.transformStored(filter, 'filter');
	  },
	
	  /**
	   * Adds an accumulation transformation to <i>this actor</i>.
	   * <p>
	   *  Accumulation is used to compute a value based on the previous one.
	   * </p>
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @protected
	   * @method accumulation
	   * @param {Object} initVal
	   *      Initial value for the accumulation. For example '0' for sum.
	   * @param {Object} accumulationFunction
	   *      The function to accumulate.
	   * @return {ProAct.Actor}
	   *      <b>this</b>
	   */
	  accumulation: function (initVal, accumulationFunction) {
	    if (!accumulationFunction) {
	      accumulationFunction = initVal;
	      initVal = undefined;
	    }
	
	    var self = this,
	        val = initVal,
	        acc = accumulationFunction.call ? function (newVal) {
	          val = accumulationFunction.call(self, val, newVal)
	          return val;
	        } : accumulationFunction;
	    return this.transformStored(acc, 'acc');
	  },
	
	  /**
	   * Creates a new ProAct.Actor instance with source <i>this</i> and mapping
	   * the passed <i>mapping function</i>.
	   * <p>
	   *  Should be overridden with creating the right actor.
	   * </p>
	   *
	   * ```
	   *  var actor = sourceActor.map(function (el) {
	   *    return el * el;
	   *  });
	   * ```
	   *
	   * or
	   *
	   * ```
	   *  var actor = sourceActor.map('+');
	   * ```
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @abstract
	   * @method map
	   * @param {Object|Function|Strin} mappingFunction
	   *      Function or object with a <i>call method</i> to use as map function.
	   *      Can be string for predefined mapping functions.
	   * @return {ProAct.Actor}
	   *      A new ProAct.Actor instance with the <i>mapping</i> applied.
	   */
	  map: P.N,
	
	  /**
	   * Creates a new ProAct.Actor instance with source <i>this</i> and filtering
	   * the passed <i>filtering function</i>.
	   * <p>
	   *  Should be overridden with creating the right actor.
	   * </p>
	   *
	   * ```
	   *  var actor = sourceActor.filter(function (el) {
	   *    return el % 2 == 0;
	   *  });
	   * ```
	   *
	   * or
	   *
	   * ```
	   *  var actor = sourceActor.filter('odd');
	   *
	   * ```
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @abstract
	   * @method filter
	   * @param {Object} filteringFunction
	   *      The filtering function or object with a call method, should return boolean.
	   * @return {ProAct.Actor}
	   *      A new ProAct.Actor instance with the <i>filtering</i> applied.
	   */
	  filter: P.N,
	
	  /**
	   * Creates a new ProAct.Actor instance with source <i>this</i> and accumulation
	   * the passed <i>accumulation function</i>.
	   * <p>
	   *  Should be overridden with creating the right actor.
	   * </p>
	   *
	   * ```
	   *  var actor = sourceActor.accumulate(0, function (current, el) {
	   *    return current + el;
	   *  });
	   * ```
	   *
	   * or
	   *
	   * ```
	   *  var actor = sourceActor.accumulate('+');
	   * ```
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @abstract
	   * @method accumulate
	   * @param {Object} initVal
	   *      Initial value for the accumulation. For example '0' for sum.
	   * @param {Object} accumulationFunction
	   *      The function to accumulate.
	   * @return {ProAct.Actor}
	   *      A new ProAct.Actor instance with the <i>accumulation</i> applied.
	   */
	  accumulate: P.N,
	
	  /**
	   * Defers a ProAct.Actor listener.
	   * <p>
	   *  By default this means that the listener is put into active {{#crossLink "ProAct.Flow"}}{{/crossLink}} using it's
	   *  {{#crossLink "ProAct.Flow/pushOnce:method"}}{{/crossLink}} method, but it can be overridden.
	   * </p>
	   *
	   * This method determines the order of actions, triggered by the changes in the data flow.
	   * The default implementation is executing only one update on this Actor per data flow change.
	   * This means that if the `Actor` depends on other three Actors, and all of them get updated,
	   * it is updated only once with the last update value.
	   *
	   * @for ProAct.Actor
	   * @protected
	   * @instance
	   * @method defer
	   * @param {Object} event
	   *      The event/value to pass to the listener.
	   * @param {Object} listener
	   *      The listener to defer. It should be a function or object defining the <i>call</i> method.
	   * @return {ProAct.Actor}
	   *      <i>this</i>
	   */
	  defer: function (event, listener) {
	    var queueName = (listener.queueName) ? listener.queueName : this.queueName;
	
	    if (P.U.isFunction(listener)) {
	      P.flow.pushOnce(queueName, listener, [event]);
	    } else {
	      P.flow.pushOnce(queueName, listener, listener.call, [event]);
	    }
	    return this;
	  }
	};
	
	/**
	 * @module proact-core
	 */
	
	/**
	 * <p>
	 *  Constructs a `ProAct.Event`. The event contains information of the update.
	 * </p>
	 * <p>
	 *  `ProAct.Event` is part of the core module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.Event
	 * @constructor
	 * @param {ProAct.Event} source
	 *      If there is an event that coused this event - it is the source. Can be null - no source.
	 * @param {Object} target
	 *      The thing that triggered this event.
	 * @param {ProAct.Event.Types} type
	 *      The type of the event
	 * @param [...] args
	 *      Arguments of the event, for example for value event, these are the old value and the new value.
	 */
	function Event (source, target, type) {
	  this.source = source;
	  this.target = target;
	  this.type = type;
	  this.args = slice.call(arguments, 3);
	};
	ProAct.Event = P.E = Event;
	
	P.U.ex(ProAct.Event, {
	
	  /**
	   * Factory method for creating of new ProAct.Events with ease.
	   * <p>
	   *  NOTE: For now only works with arrays, because creating array events required a lot of code.
	   * </p>
	   *
	   * @for ProAct.Event
	   * @static
	   * @param {ProAct.Event} source
	   *      If there is an event that coused this event - it is the source. Can be null - no source.
	   * @param {Object} target
	   *      The thing that triggered this event.
	   * @param {ProAct.Event.Types|String} type
	   *      The type of the event. Can be string for ease.
	   *      For now this method supports only {{#crossLink "ProAct.Event.Types/array:property"}}{{/crossLink}} events.
	   *      It is possible to pass the string 'array' for type.
	   * @param {Array} data
	   *      Arguments of the event.
	   * @return {ProAct.Event}
	   *      The new event.
	   */
	  make: function (source, target, type, data) {
	    if (type === 'array' || type === P.E.Types.array) {
	      return P.E.makeArray(data[0], data.slice(1));
	    }
	  },
	
	  /**
	   * Factory method for creating of new ProAct.Events of type {{#crossLink "ProAct.Event.Types/array:property"}}{{/crossLink}} with ease.
	   * <p>
	   *  NOTE: For now only array modifying events can be created - remove and splice (you can trigger a value for add).
	   * </p>
	   *
	   * TODO Move to the proact-arrays package!
	   *
	   * @for ProAct.Event
	   * @static
	   * @param {ProAct.Event} source
	   *      If there is an event that coused this event - it is the source. Can be null - no source.
	   * @param {Object} target
	   *      The thing that triggered this event.
	   * @param {ProAct.Array.Operations|String} subType
	   *      The operation type of the event to create. Can be string or instance of
	   *      {@link ProAct.Array.Operations}.
	   *      Prossible string values are - 'remove' and 'splice' for now.
	   * @param {Array} data
	   *      Arguments of the event.
	   * @return {ProAct.Event}
	   *      The new event.
	   */
	  makeArray: function (source, target, subType, data) {
	    var eventType = P.E.Types.array, arr;
	    if (subType === 'remove' || subType === P.A.Operations.remove) {
	      return new P.E(source, target, eventType, P.A.Operations.remove, data[0], data[1], data[2]);
	    }
	
	    if (subType === 'splice' || subType === P.A.Operations.splice) {
	      if (!P.U.isArray(data[1])) {
	        data[1] = new Array(data[1]);
	      }
	
	      return new P.E(source, target, eventType, P.A.Operations.splice, data[0], data[1], data[2]);
	    }
	  },
	
	  /**
	   * Factory method for creating of new ProAct.Events without target and source with ease.
	   * <p>
	   *  NOTE: For now only array modifying events can be created - remove and splice (you can trigger a value for add).
	   * </p>
	   *
	   * Using this method we can create for example an event for removing the i-th element from ProAct.Array like this:
	   * <pre>
	   *  ProAct.Event.simple('array', 'del', el, array);
	   * </pre>
	   * This event can be passed to the ProAct.ArrayCore#update method of the core of a ProAct.Array and it will delete
	   * the element in it.
	   *
	   * TODO Some of these types and comments should be undepended of the proact-arrays module.
	   *
	   * @for ProAct.Event
	   * @static
	   * @param {ProAct.Event.Types|String} eventType
	   *      The type of the event. Can be string for ease.
	   *      For now this method supports only {@link ProAct.Event.Types.array} events.
	   *      It is possible to pass the string 'array' or 'a' for type.
	   * @param {ProAct.Array.Operations|String} subType
	   *      The operation type of the event to create. Can be string or instance of
	   *      {@link ProAct.Array.Operations}.
	   *      Prossible string values are - 'pop', 'shift', 'deleteElement' or 'del' (at index) and 'splice' for now.
	   * @param {Object} value
	   *      Used a value of the event.
	   *      For array events this is for example the value to be added or to be removed.
	   *      It can be index too.
	   * @param {Array} array
	   *      Optional parameter for array events - the array target of the event.
	   *      It will be set as target.
	   *      Can be used for determining event's parameters too.
	   * @return {ProAct.Event}
	   *      The new event.
	   */
	  simple: function (eventType, subType, value, array) {
	    if ((eventType === 'array' || eventType === 'a') && (subType === 'pop' || subType === 'shift')) {
	      return P.E.makeArray(null, array, 'remove', [subType === 'shift' ? 0 : 1]);
	    }
	
	    if ((eventType === 'array' || eventType === 'a') && (subType === 'splice')) {
	      return P.E.makeArray(null, array, 'splice', [value, 1]);
	    }
	
	    if ((eventType === 'array' || eventType === 'a') && (subType === 'deleteElement' || subType === 'del')) {
	      if (array) {
	        var index = array.indexOf(value);
	
	        if (index !== -1) {
	          return P.E.makeArray(null, array, 'splice', [index, 1]);
	        }
	      } else {
	        return P.E.makeArray(null, array, 'splice', [null, [value]]);
	      }
	    }
	
	    return null;
	  }
	});
	
	/**
	 * Defines the possible types of the ProAct.Events.
	 *
	 * @namespace ProAct.Event
	 * @class Types
	 * @static
	 */
	ProAct.Event.Types = {
	
	  /**
	   * Value type events. Events for changing a value.
	   * <p>
	   *  For properties the args of the event contain the ProAct Object, the old value
	   *  of the property and the new value.
	   * </p>
	   *
	   * @type Number
	   * @property value
	   * @final
	   * @for ProAct.Event
	   */
	  value: 0,
	
	  /**
	   * Array type events. Events for changes in {@link ProAct.Array}.
	   * <p>
	   *  The args should consist of operation, index, old values, new values.
	   * </p>
	   *
	   * TODO Move it to the proact-arrays module.
	   *
	   * @type Number
	   * @property array
	   * @final
	   * @for ProAct.Event
	   */
	  array: 1,
	
	  /**
	   * Close type events. Events for closing streams or destroying properties.
	   *
	   * @type Number
	   * @property close
	   * @final
	   * @for ProAct.Event
	   */
	  close: 2,
	
	  /**
	   * Error type events. Events for errors.
	   *
	   * @type Number
	   * @property error
	   * @final
	   * @for ProAct.Event
	   */
	  error: 3
	};
	
	/**
	 * @module proact-core
	 */
	
	/**
	 * <p>
	 *  Constructs a ProAct.Core. The core is an {{#crossLink "ProAct.Actor"}}{{/crossLink}} which can be used to manage other {@link ProAct.Actor} objects or groups many ProAct.Actor objects.
	 * </p>
	 * <p>
	 *  For example a shell can be a plain old JavaScript object; The core will be in charge of creating dynamic properties for every field of the shell.
	 * </p>
	 * <p>
	 *  The idea of the core is to inject observer-observable capabilities in normal objects, or just group many observables.
	 * </p>
	 * <p>
	 *  `ProAct.Core` is an abstract class, that has a {{#crossLink "ProAct.States"}}{{/crossLink}} state. Its initializing logic should be implemented in an extender.
	 * </p>
	 * <p>
	 *  ProAct.Core is used as a parent for the {{#crossLink "ProAct.Actor"}}{{/crossLink}}s it manages, so it can be passed as a listener object - defines a <i>call method</i>.
	 * </p>
	 * <p>
	 *  ProAct.Core is part of the core module of ProAct.js.
	 * </p>
	 *
	 * TODO Maybe should be renamed to something else? For example ActorGroup or ActorTroupe, or maybe ActorManager :).
	 *
	 * @class ProAct.Core
	 * @extends ProAct.Actor
	 * @param {Object} shell
	 *      The shell arrounf this core. This ProAct.Core manages observer-observable behavior for this <i>shell</i> object.
	 * @param {Object} meta
	 *      Optional meta data to be used to define the observer-observable behavior of the <i>shell</i>.
	 */
	function Core (shell, meta) {
	  this.shell = shell;
	  this.state = P.States.init;
	  this.meta = meta || {};
	  this.queueName = (this.meta.p && this.meta.p.queueName &&
	                    P.U.isString(this.meta.p.queueName)) ? this.meta.p.queueName : null;
	
	  P.Actor.call(this, this.queueName); // Super!
	}
	ProAct.Core = P.C = Core;
	
	ProAct.Core.prototype = P.U.ex(Object.create(P.Actor.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.Core
	   * @final
	   * @for ProAct.Core
	   */
	  constructor: ProAct.Core,
	
	  /**
	   * A function to be set to the <i>shell</i> object's <b>p</b> field (if it is configured in {{#crossLink "ProAct.Configuration"}}{{/crossLink}}.
	   * <p>
	   *  This function is the link to the this ProAct.Core of the <i>shell</i>.
	   *  It can be overridden to return different aspects of the core depending on parameters passed.
	   * </p>
	   *
	   * @for ProAct.Core
	   * @instance
	   * @method value
	   * @default {this}
	   * @return {Object}
	   *      Some aspects of <i>this</i> `ProAct.Core`.
	   */
	  value: function () {
	    return this;
	  },
	
	  /**
	   * Initializes <i>this</i> ProAct.Core. This method should be called when the core should become active.
	   * <p>
	   *  The main idea of the method is to change the {{#crossLink "ProAct.States"}}{{/crossLink}}
	   *  state of <i>this</i> to {{#crossLink "ProAct.States/ready:property"}}{{/crossLink}}, by
	   *  settuping everything needed by the shell to has observer-observable logic.
	   * </p>
	   * <p>
	   *  The abstract {{#crossLink "ProAct.Core/setup:method"}}{{/crossLink}} method is called for the actual setup.
	   *  If it throws an error, <i>this</i> state is set to {{#crossLink "ProAct.States/error:property"}}{{/crossLink}}
	   *  and the core stays inactive.
	   * </p>
	   *
	   * @for ProAct.Core
	   * @instance
	   * @method prob
	   * @return {ProAct.Core} <i>this</i>
	   */
	  prob: function () {
	    var self = this,
	        conf = ProAct.Configuration,
	        keyprops = conf.keyprops,
	        keypropList = conf.keypropList;
	
	    try {
	      this.setup();
	
	      if (keyprops && keypropList.indexOf('p') !== -1) {
	        P.U.defValProp(this.shell, 'p', false, false, false, P.U.bind(this, this.value));
	      }
	
	      this.state = P.States.ready;
	    } catch (e) {
	      this.state = P.States.error;
	      throw e;
	    }
	
	    return this;
	  },
	
	  /**
	   * Abstract method called by {{#crossLink "ProAct.Core/prob:method"}}{{/crossLink}}
	   * for the actual initialization of <i>this</i> core.
	   *
	   * By default it throws an exception.
	   *
	   * @for ProAct.Core
	   * @protected
	   * @instance
	   * @abstract
	   * @method setup
	   */
	  setup: function () {
	    throw Error('Abstract, implement!');
	  },
	
	  /**
	   * `ProAct.Core` can be used as a parent listener for its managed
	   * {{#crossLink "ProAct.Actor"}}{{/crossLink}}s, so it defines the <i>call</i> method.
	   * <p>
	   *  By default this method calls {{#crossLink "ProAct.ActorUtil/update:method"}}{{/crossLink}}
	   *  with <i>this</i> and the passed <i>event</i>.
	   * </p>
	   *
	   * @for ProAct.Core
	   * @instance
	   * @method call
	   * @param {Object} event
	   *      The value/event that this listener is notified for.
	   */
	  call: function (event) {
	    ActorUtil.update.call(this, event);
	  }
	});
	
	
	/**
	 * @module proact-core
	 */
	
	/**
	 * A `ProbProvider` provides a way for creating a ProAct implementation,
	 * using raw data.
	 *
	 * For example such a provider can provide a way to create an
	 * {{#crossLink "ProAct.Actor"}}{{/crossLink}} from a plain JavaScript object.
	 *
	 * @class ProAct.ProbProvider
	 * @constructor
	 */
	function ProbProvider () {
	};
	
	ProAct.ProbProvider = ProbProvider;
	
	ProbProvider.prototype = {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.ProbProvider
	   * @final
	   * @for ProAct.ProbProvider
	   */
	  constructor: ProbProvider,
	
	  /**
	   * Used to check if this `ProAct.ProbProvider` is compliant with the passed data.
	   *
	   * Abstract - must be implemented by an extender.
	   *
	   * @for ProAct.ProbProvider
	   * @abstract
	   * @instance
	   * @method filter
	   * @param {Object} data
	   *      The data to check.
	   * @param {Object|String} meta
	   *      Meta-data used to help in filtering.
	   * @return {Boolean}
	   *      If <i>this</i> provider is compliant with the passed data.
	   */
	  filter: function (data, meta) {
	    throw new Error('Implement!');
	  },
	
	  /**
	   * Creates a reactive object from the passed data
	   *
	   * Abstract - must be implemented by an extender.
	   *
	   * @for ProAct.ProbProvider
	   * @abstract
	   * @instance
	   * @method provide
	   * @param {Object} data
	   *      The data to use as a source for the object.
	   * @param {Object|String} meta
	   *      Meta-data used to help when creating.
	   * @return {Object}
	   *      A reactive representation of the data.
	   */
	  provide: function (data, meta) {
	    throw new Error('Implement!');
	  }
	};
	
	(function (P) {
	  var providers = [];
	
	  P.U.ex(P.ProbProvider, {
	
	
	    /**
	     * Registers a `ProAct.ProbProvider`.
	     *
	     * The provider is appended in the end of the list of `ProAct.ProbProvider`s.
	     *
	     * @for ProAct.ProbProvider
	     * @method register
	     * @static
	     * @param {ProAct.ProbProvider} provider
	     *      The `ProAct.ProbProvider` to register.
	     */
	    register: function (provider) {
	      providers.push(provider);
	    },
	
	    /**
	     * Provides a reactive representation of passed simple data.
	     *
	     * @for ProAct.ProbProvider
	     * @static
	     * @param {Object} data
	     *      The data for which to try and provide a reactive object representation.
	     * @param {String|Object} meta
	     *      Meta information to be used for filtering and configuration of the reactive object to be provided.
	     * @return {Object}
	     *      A reactive object provided by registered provider, or null if there is no compliant provider.
	     */
	    provide: function (data, meta) {
	      var ln = providers.length,
	          result = null,
	          provider = null,
	          i;
	
	      for (i = 0; i < ln; i++) {
	        provider = providers[i];
	        if (provider.filter(data, meta)) {
	          break;
	        } else {
	          provider = null;
	        }
	      }
	
	      if (provider) {
	        result = provider.provide(data, meta);
	      }
	
	      return result;
	    }
	  });
	}(P));
	
	/**
	 * The `ProAct.prob` method is the entry point for creating reactive values in ProAct.js
	 *
	 * TODO More docs
	 *
	 * @for ProAct
	 * @method prob
	 * @static
	 * @param {Object} object
	 *      The object/value to make reactive.
	 * @param {Object|String} meta
	 *      Meta-data used to help in the reactive object creation.
	 * @return {Object}
	 *      Reactive representation of the passed <i>object</i>.
	 */
	function prob (object, meta) {
	  return ProbProvider.provide(object, meta);
	}
	ProAct.prob = prob;
	
	
	/**
	 * The `proact-streams` module provides stateless streams to the ProAct.js API.
	 * FRP reactive streams.
	 *
	 * @module proact-streams
	 * @main proact-streams
	 */
	
	// PRIVATE
	var StreamUtil = {
	  go: function (event, useTransformations) {
	    if (this.listeners.change.length === 0) {
	      return this;
	    }
	    if (useTransformations) {
	      try {
	        event = P.Actor.transform(this, event);
	      } catch (e) {
	        StreamUtil.triggerErr.call(this, e);
	        return this;
	      }
	    }
	
	    if (event === P.Actor.BadValue) {
	      return this;
	    }
	
	    return ActorUtil.update.call(this, event);
	  },
	
	  triggerMany: function () {
	    var i, args = slice.call(arguments), ln = args.length;
	
	    for (i = 0; i < ln; i++) {
	      this.trigger(args[i], true);
	    }
	
	    return this;
	  },
	
	  trigger: function (event, useTransformations) {
	    if (useTransformations === undefined) {
	      useTransformations = true;
	    }
	
	    return StreamUtil.go.call(this, event, useTransformations);
	  },
	
	  triggerErr: function (err) {
	    return ActorUtil.update.call(this, err, 'error');
	  },
	
	  triggerClose: function (data) {
	    return ActorUtil.update.call(this, data, 'close');
	  }
	
	};
	
	/**
	 * <p>
	 *  Constructs a `ProAct.Stream`.
	 *  The stream is a simple {{#crossLink "ProAct.Actor"}}{{/crossLink}}, without state.
	 * </p>
	 * <p>
	 *  The streams are ment to emit values, events, changes and can be plugged into other `Actors`.
	 *  For example it is possible to connect multiple streams, to merge them and to separate them,
	 *  to plug them into properties.
	 * </p>
	 * <p>
	 *  The reactive environment consists of the properties and the objects containing them, but
	 *  the outside world is not reactive. It is possible to use the `ProAct.Streams` as connections from the
	 *  outside world to the reactive environment.
	 * </p>
	 * <p>
	 *    The transformations can be used to change the events or values emitetted.
	 * </p>
	 * <p>
	 *  `ProAct.Stream` is part of the proact-streams module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.Stream
	 * @extends ProAct.Actor
	 * @constructor
	 * @param {String} queueName
	 *      The name of the queue all the updates should be pushed to.
	 *      <p>
	 *        If this parameter is null/undefined the default queue of
	 *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
	 *      </p>
	 *      <p>
	 *        If this parameter is not a string it is used as the
	 *        <i>source</i>.
	 *      </p>
	 * @param {ProAct.Actor} source
	 *      A default source of the stream, can be null.
	 * @param {Array} transforms
	 *      A list of transformation to be used on all incoming chages.
	 */
	function Stream (queueName, source, transforms) {
	  if (queueName && !P.U.isString(queueName)) {
	    transforms = source;
	    source = queueName;
	    queueName = null;
	  }
	  P.Actor.call(this, queueName, transforms);
	
	  this.sourceNumber = 0;
	
	  if (source) {
	    this.into(source);
	  }
	}
	ProAct.Stream = ProAct.S = Stream;
	
	P.U.ex(P.S, {
	  fromString: function (str, args) {
	    throw new Error('Stream.fromString is not implemented!');
	  }
	});
	
	ProAct.Stream.prototype = P.U.ex(Object.create(P.Actor.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.Stream
	   * @final
	   * @for ProAct.Stream
	   */
	  constructor: ProAct.Stream,
	
	  /**
	   * Creates the <i>event</i> to be send to the listeners on update.
	   * <p>
	   *  Streams don't create new events by default, the event is the source.
	   * </p>
	   *
	   * @for ProAct.Stream
	   * @protected
	   * @instance
	   * @method makeEvent
	   * @param {ProAct.Event} source
	   *      The source event of the event. It can be null
	   * @return {ProAct.Event}
	   *      The event.
	   */
	  makeEvent: function (source) {
	    return source;
	  },
	
	  /**
	   * Creates the <i>listener</i> of this stream.
	   *
	   * @for ProAct.Stream
	   * @protected
	   * @instance
	   * @method makeListener
	   * @return {Object}
	   *      The <i>listener of this stream</i>.
	   */
	  makeListener: function () {
	    if (!this.listener) {
	      var stream = this;
	      this.listener = function (event) {
	        if (stream.trigger) {
	          stream.trigger(event, true);
	        } else {
	          StreamUtil.trigger.call(stream, event, true);
	        }
	      };
	    }
	
	    return this.listener;
	  },
	
	  /**
	   * Creates the <i>error listener</i> of this stream.
	   * <p>
	   *  The listener pushes the incoming event into `this Stream` by default.
	   * </p>
	   *
	   * @for ProAct.Stream
	   * @protected
	   * @instance
	   * @method makeErrListener
	   * @return {Object}
	   *      The <i>error listener of this stream</i>.
	   */
	  makeErrListener: function () {
	    if (!this.errListener) {
	      var stream = this;
	      this.errListener = function (error) {
	        if (stream.triggerErr) {
	          stream.triggerErr(event);
	        } else {
	          StreamUtil.triggerErr.call(stream, error);
	        }
	      };
	    }
	
	    return this.errListener;
	  },
	
	  /**
	   * Creates the <i>closing listener</i> of this stream.
	   *
	   * Pushes a closing notification into the stream by default.
	   *
	   * @for ProAct.Stream
	   * @instance
	   * @protected
	   * @method makeCloseListener
	   * @return {Object}
	   *      The <i>closing listener of this stream</i>.
	   */
	  makeCloseListener: function () {
	    if (!this.closeListener) {
	      var stream = this;
	      this.closeListener = function (data) {
	        if (stream.triggerClose) {
	          stream.triggerClose(data);
	        } else {
	          StreamUtil.triggerClose.call(stream, data);
	        }
	      };
	    }
	
	    return this.closeListener;
	  },
	
	  /**
	   * Defers a `ProAct.Actor` listener.
	   * <p>
	   *  For streams this means pushing it to active flow using {{#crossLink "ProAct.Flow/push:method"}}{{/crossLink}}.
	   *  If the listener is object with 'property' field, it is done using {{#crossLink "ProAct.Actor/defer:method"}}{{/crossLink}}.
	   *  That way the reactive environment is updated only once, but the streams are not part of it.
	   * </p>
	   *
	   * @for ProAct.Stream
	   * @protected
	   * @instance
	   * @method defer
	   * @param {Object} event
	   *      The event/value to pass to the listener.
	   * @param {Object} listener
	   *      The listener to defer. It should be a function or object defining the <i>call</i> method.
	   * @return {ProAct.Actor}
	   *      <i>this</i>
	   */
	  defer: function (event, listener) {
	    if (!listener) {
	      return;
	    }
	
	    if (listener.property) {
	      P.Actor.prototype.defer.call(this, event, listener);
	      return;
	    }
	    var queueName = (listener.queueName) ? listener.queueName : this.queueName;
	
	    if (P.U.isFunction(listener)) {
	      P.flow.push(queueName, listener, [event]);
	    } else {
	      P.flow.push(queueName, listener, listener.call, [event]);
	    }
	  },
	
	  /**
	   * Creates a new `ProAct.Stream` instance with source <i>this</i> and mapping
	   * the passed <i>mapping function</i>.
	   *
	   * ```
	   *   var mapped = stream.map(function (v) {
	   *     return v * v;
	   *   });
	   *
	   *   mapped.on(function (v) {
	   *     console.log(v); // squares
	   *   });
	   * ```
	   *
	   * @for ProAct.Stream
	   * @instance
	   * @method map
	   * @param {Object} mappingFunction
	   *      Function or object with a <i>call method</i> to use as map function.
	   * @return {ProAct.Stream}
	   *      A new `ProAct.Stream` instance with the <i>mapping</i> applied.
	   */
	  map: function (mappingFunction) {
	    return new P.S(this).mapping(mappingFunction);
	  },
	
	  /**
	   * Creates a new `ProAct.Stream` instance with source <i>this</i> and filtering
	   * the passed <i>filtering function</i>.
	   *
	   * ```
	   *   var filtered = stream.filter(function (v) {
	   *     return v % 2 === 1;
	   *   });
	   *
	   *   filtered.on(function (v) {
	   *     console.log(v); // odds
	   *   });
	   * ```
	   *
	   * @for ProAct.Stream
	   * @instance
	   * @method filter
	   * @param {Object} filteringFunction
	   *      The filtering function or object with a call method, should return boolean.
	   * @return {ProAct.Stream}
	   *      A new `ProAct.Stream` instance with the <i>filtering</i> applied.
	   */
	  filter: function (filteringFunction) {
	    return new P.S(this).filtering(filteringFunction);
	  },
	
	  /**
	   * Creates a new `ProAct.Stream` instance with source <i>this</i> and accumulation
	   * the passed <i>accumulation function</i>.
	   *
	   * ```
	   *  var acc = stream.accumulate(0, function (p, v) {
	   *    return p + v;
	   *  });
	   *
	   *  acc.on(console.log); // sums
	   * ```
	   *
	   * @for ProAct.Stream
	   * @instance
	   * @method accumulate
	   * @param {Object} initVal
	   *      Initial value for the accumulation. For example '0' for sum.
	   * @param {Object} accumulationFunction
	   *      The function to accumulate.
	   * @return {ProAct.Stream}
	   *      A new `ProAct.Stream` instance with the <i>accumulation</i> applied.
	   */
	  accumulate: function (initVal, accumulationFunction) {
	    return new P.S(this).accumulation(initVal, accumulationFunction);
	  },
	
	  /**
	   * Creates a new `ProAct.Stream` instance that merges this with other streams.
	   * The new instance will have new value on value from any of the source streams.
	   *
	   * ```
	   *  var merged = stream1.merge(stream2);
	   * ```
	   *
	   * Here if `stream1` emits:
	   * 1--2---3----5-----X
	   *
	   * and `steam2` emits:
	   * ----A-----B-----C-----D--X
	   *
	   * `merged` will emit:
	   * 1--2A--3--B-5---C-----D--X
	   *
	   * @for ProAct.Stream
	   * @instance
	   * @method merge
	   * @param [...]
	   *      A list of streams to be set as sources.
	   * @return {ProAct.Stream}
	   *      A new `ProAct.Stream` instance with the sources this and all the passed streams.
	   */
	  merge: function () {
	    var sources = [this].concat(slice.call(arguments)),
	        result = new P.S();
	
	    return P.S.prototype.into.apply(result, sources);
	  },
	
	  /**
	   * Links source actors into this `ProAct.Stream`. This means that <i>this stream</i>
	   * is listening for changes from the <i>sources</i>.
	   *
	   * The streams count their sources and when the sources are zero, they become inactive.
	   *
	   * ```
	   *  var stream1 = ProAct.stream();
	   *  var stream2 = ProAct.stream();
	   *  var stream = ProAct.stream();
	   *
	   *  stream.into(stream1, stream2);
	   *  stream.on(function (v) {
	   *    console.log(v);
	   *  });
	   *
	   * ```
	   *
	   * Now if the any of the source streams is emits,
	   * the notification will be printed on the output.
	   *
	   * @for ProAct.Stream
	   * @instance
	   * @method into
	   * @param [...]
	   *      Zero or more source {{#crossLink "ProAct.Actor"}}{{/crossLink}}s to set as sources.
	   * @return {ProAct.Stream}
	   *      <b>this</b>
	   */
	  into: function () {
	    ProAct.Actor.prototype.into.apply(this, arguments);
	
	    this.sourceNumber += arguments.length;
	
	    return this;
	  },
	
	  /**
	   * Checks if <i>this</i> can be closed.
	   *
	   * Uses the number of the active sources to decide if `this stream` is ready to be closed.
	   * If the active sources are zero - it can.
	   *
	   * @for ProAct.Stream
	   * @protected
	   * @instance
	   * @method canClose
	   */
	  canClose: function () {
	    this.sourceNumber -= 1;
	
	    return this.sourceNumber <= 0;
	  }
	});
	
	// Methods added to the ProAct.Actor from the proact-streams module.
	P.U.ex(P.Actor.prototype, {
	
	  /**
	   * Turns this `ProAct.Actor` to a {{#crossLink "ProAct.Stream"}}{{/crossLink}}.
	   *
	   * In reality this method creates a new `Stream` with source this.
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method toStream
	   */
	  toStream: function () {
	    return new P.S(this.queueName, this);
	  },
	
	  /**
	   * Creates a new {{#crossLink "ProAct.Stream"}}{{/crossLink}} with source - `this`.
	   * It skips the first `n` updates incoming from `this`.
	   *
	   * source : --3---4---5--4---3---4---5--|->
	   * skip(3): -------------4---3---4---5--|->
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method skip
	   * @param {Number} n The number of notifications to skip.
	   */
	  skip: function (n) {
	    var i = n, self = this;
	    return this.fromLambda(function (stream, event) {
	      if (event === ProAct.Actor.Close) {
	        stream.close();
	        return;
	      }
	
	      i--;
	      if (i < 0) {
	        self.offAll(stream.lambda);
	        stream.into(self);
	        stream.trigger(event);
	      }
	    });
	  },
	
	  /**
	   * Creates a new {{#crossLink "ProAct.Stream"}}{{/crossLink}} with source - `this`.
	   * It skips notifications from its source, while a condition is true.
	   *
	   * ```
	   *
	   *  source.skipWhile(function (v) {
	   *      return v % 2 === 1;
	   *  });
	   *
	   *  // source :
	   *  // --3---5---2--4---3---4---5--|->
	   *  // skipWhile:
	   *  // ----------2--4---3---4---5--|->
	   *
	   * ```
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method skipWhile
	   * @param {Function} condition
	   *        A condition function, which is called for each of the incoming values
	   *        While it returns true, the elements are skipped,
	   *        after it returns false for the first time, the current and all the following values are emitted.
	   */
	  skipWhile: function (condition) {
	    var self = this,
	        cond = condition ? condition : function (e) {
	          return e;
	        };
	    return this.fromLambda(function (stream, event) {
	      if (event === ProAct.Actor.close) {
	        stream.close();
	        return;
	      }
	
	      if (!cond(event)) {
	        self.offAll(stream.lambda);
	        stream.into(self);
	        stream.trigger(event);
	      }
	    });
	  },
	
	  /**
	   * Creates a new {{#crossLink "ProAct.Stream"}}{{/crossLink}} with source - `this`.
	   * It skips dublicating elements, comming one after another.
	   *
	   * ```
	   *
	   *  source.skipDuplicates();
	   *
	   *  // source :
	   *  // --3---5---5--4---3---3---5--|->
	   *  // skipDuplicates:
	   *  // --3---5------4---3-------5--|->
	   *
	   * ```
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method skipDuplicates
	   * @param {Function} comparator
	   *      A function used to compare the elements.
	   *      If nothing is passed it defaults to comparing using `===`.
	   */
	  skipDuplicates: function (comparator) {
	    var last = undefined,
	        cmp = comparator ? comparator : function (a, b) {
	          return a === b;
	        };
	    return this.fromLambda(function (stream, event) {
	      if (!cmp(last, event)) {
	        stream.trigger(event);
	        last = event;
	      }
	    });
	  },
	
	  /**
	   * Creates a new {{#crossLink "ProAct.Stream"}}{{/crossLink}} with source - `this`.
	   * It emits the difference between the last update and the current incomming update from the source.
	   *
	   * ```
	   *
	   *  source.diff(0, function(prev, v) {
	   *      return v - prev;
	   *  });
	   *
	   *  // source :
	   *  // --3---5------6---|->
	   *  // diff:
	   *  // --3---2------1---|->
	   *
	   * ```
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method diff
	   * @param {Object} seed
	   *      A value to pass the `differ` function as previous on the inital notification from the source.
	   * @param {Function} differ
	   *      Creates the difference, receives two params - the previous update and the current.
	   *      It can be skipped - the default `differ` function returns array with two elements - the previous and the curren updates.
	   */
	  diff: function(seed, differ) {
	    var last = seed,
	        fn = differ ? differ : function (last, next) {
	          return [last, next];
	        };
	    return this.fromLambda(function (stream, event) {
	      if (event === ProAct.Actor.close) {
	        stream.close();
	        return;
	      }
	
	      if (last === undefined) {
	        last = event;
	        return;
	      }
	
	      stream.trigger(differ(last, event));
	      last = event;
	    });
	  },
	
	  /**
	   * Creates a new {{#crossLink "ProAct.Stream"}}{{/crossLink}} with source - `this`.
	   * It takes the first `limit` updates incoming from `this`.
	   *
	   * source : --3---4---5--4---3---4---5--|->
	   * skip(3): --3---4---5--|->
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method take
	   * @param {Number} limit The number of notifications to emit.
	   */
	  take: function (limit) {
	    var left = limit;
	    return this.fromLambda(function (stream, event) {
	      left--;
	      if (left >= 0) {
	        stream.trigger(event, true);
	      }
	      if (left <= 0 && stream.state === ProAct.States.ready) {
	        stream.close();
	      }
	    });
	  },
	
	  /**
	   * Creates a new {{#crossLink "ProAct.Stream"}}{{/crossLink}} with source - `this`.
	   * It emits notifications from its source, while a condition is true.
	   *
	   * ```
	   *
	   *  source.takeWhile(function (v) {
	   *      return v % 2 === 1;
	   *  });
	   *
	   *  // source :
	   *  // --3---5---2--4---3---4---5--|->
	   *  // takeWhile:
	   *  // --3---5--|->
	   *
	   * ```
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method takeWhile
	   * @param {Function} condition
	   *        A condition function, which is called for each of the incoming values
	   *        While it returns true, the elements are emitted,
	   *        after it returns false for the first time, the stream created by takeWhile closes.
	   */
	  takeWhile: function (condition) {
	    return this.fromLambda(function (stream, event) {
	      if (condition.call(null, event)) {
	        stream.trigger(event);
	      } else {
	        stream.close();
	      }
	    });
	  },
	
	  /**
	   * Creates a new {{#crossLink "ProAct.Stream"}}{{/crossLink}} with source - `this`.
	   * The logic of the stream is implemented through the passed `lambda` parameter.
	   *
	   * TODO The first parameter of the lambda should be called something else and not stream.
	   *
	   * ```
	   *  source.fromLambda(function (stream, notification) {
	   *    stream.trigger(notification);
	   *  });
	   *
	   *  // Just forwards notifications..
	   *
	   * ```
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method fromLambda
	   * @param {Function} lambda
	   *      A function, with two arguments - the returned by this function stream and notification.
	   *      For every update comming from `this`, the lambda is called with the update and the stream in it.
	   *      Has the `trigger`, `triggerErr` and `triggerClose` methods.
	   */
	  fromLambda: function (lambda) {
	    var stream = new ProAct.Stream(this.queueName),
	        listener = function (e) {
	          stream.trigger = StreamUtil.trigger;
	          stream.triggerErr = StreamUtil.triggerErr;
	          stream.triggerClose = StreamUtil.triggerClose;
	
	          lambda.call(null, stream, e);
	
	          stream.trigger = undefined;
	          stream.triggerErr = undefined;
	          stream.triggerClose = undefined;
	        };
	    this.onAll(listener);
	    stream.lambda = listener;
	
	    return stream;
	  },
	
	  /**
	   * Creates a new {{#crossLink "ProAct.Stream"}}{{/crossLink}} with source - `this`.
	   * For every update incomming from the source, a new `Actor` is created using the `mapper`
	   * function. All the updates, emitted by the streams, returned by the `mapper` are emitted by the
	   * `Actor` created by `flatMap`
	   *
	   *
	   * ```
	   *  source.flatMap(function (v) {
	   *    return ProAct.seq(100, [v, v +1 ]);
	   *  });
	   *
	   *  // source:
	   *  // -1---2----4-----3-----2-----1---->
	   *  // flatMap
	   *  // -1-2-2-3--4-5---3-4---2-3---1-2-->
	   *
	   * ```
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method flatMap
	   * @param {Function} mapper
	   *      A function that returns an `ProAct.Actor` using the incomming notification.
	   */
	  flatMap: function (mapper) {
	    return this.fromLambda(function (stream, e) {
	      if (e !== P.Actor.Close) {
	        var actor = mapper ? mapper.call(null, e) : e;
	        stream.into(actor);
	      }
	    });
	  },
	
	  /**
	   * Creates a new {{#crossLink "ProAct.Stream"}}{{/crossLink}} with source - `this`.
	   * For every update incomming from the source, a new `Actor` is created using the `mapper`
	   * function. ALl the updates, emitted by the streams, returned by the `mapper` are emitted by the
	   * `Actor` created by `flatMap`. The number of the currently active sources is limited by the
	   * passed `limit`. All the sources created after the limit is reached are queued and reused as sources later.
	   *
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method flatMapLimited
	   * @param {Function} mapper
	   *      A function that returns an `ProAct.Actor` using the incomming notification.
	   * @param {Number} limit
	   *      The number of the currently active sources.
	   */
	  flatMapLimited: function (mapper, limit) {
	    var queue = [], current = 0, addActor = function (stream, actor) {
	      if (!actor) {
	        return;
	      }
	      if (current < limit) {
	        current++;
	        stream.into(actor);
	
	        actor.onClose(function () {
	          current--;
	          actor.offAll(stream.makeListener());
	
	          addActor(stream, queue.shift());
	        });
	      } else {
	        queue.push(actor);
	      }
	    };
	
	    return this.fromLambda(function (stream, e) {
	      var actor = mapper ? mapper.call(null, e) : e;
	
	      addActor(stream, actor);
	    });
	  },
	
	  /**
	   * Creates a new {{#crossLink "ProAct.Stream"}}{{/crossLink}} with source - `this`.
	   * For every update comming from `this`, a new `ProAct.Actor` is created using the logic
	   * passed through `mapper`. This new `Actor` becomes the current source of the `ProAct.Stream`,
	   * returned by this method. The next update will create a new source, which will become
	   * the current one and replace the old one. This is the same as {{#crossLink "ProAct.Actor/flatMapLimited:method"}}{{/crossLink}},
	   * with `limit` of `1`.
	   *
	   * ```
	   *  source.flatMapLast(function (v) {
	   *    return ProAct.seq(100, [v, v + 1, v + 2, v + 3]);
	   *  });
	   *
	   *  // source:
	   *  // -1---2----4-----3-----2-----1----|->
	   *  // flatMapLast
	   *  // -1-2-2-3-44-5-6-3-4-5-2-3-4-1-2-3-4-|->
	   *
	   * ```
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method flatMapLast
	   * @param {Function} mapper
	   *      A function that returns an `ProAct.Actor` using the incomming notification.
	   */
	  flatMapLast: function (mapper) {
	    var oldActor;
	    return this.fromLambda(function (stream, e) {
	      var actor = mapper ? mapper.call(null, e) : e;
	      if (oldActor) {
	        oldActor.offAll(stream.makeListener());
	      }
	      oldActor = actor;
	      stream.into(actor);
	    });
	  },
	
	  /**
	   * Creates a new {{#crossLink "ProAct.Stream"}}{{/crossLink}} with source - `this`.
	   * For every update comming from `this`, a new `ProAct.Actor` is created using the logic
	   * passed through `mapper`. The first such `Actor` becomes the source of the `Actor`, returned by this
	   * method. When it finishes, if a new `Actor` is emitted, it becomes the source.
	   *
	   * ```
	   *  source.flatMapLast(function (v) {
	   *    return ProAct.seq(100, [v, v + 1, v + 2, v + 3]);
	   *  });
	   *
	   *  // source:
	   *  // -1---2----4-----3-----2-----1----|->
	   *  // flatMapFirst
	   *  // -1-2-3-4--4-5-6-7-----2-3-4-5-|->
	   *
	   * ```
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method flatMapFirst
	   * @param {Function} mapper
	   *      A function that returns an `ProAct.Actor` using the incomming notification.
	   */
	  flatMapFirst: function (mapper) {
	    var oldActor;
	    return this.fromLambda(function (stream, e) {
	      if (oldActor && oldActor.state !== ProAct.States.closed) {
	        return;
	      }
	
	      var actor = mapper ? mapper.call(null, e) : e;
	      if (oldActor) {
	        oldActor.offAll(stream.makeListener());
	      }
	      oldActor = actor;
	      stream.into(actor);
	    });
	  }
	});
	
	P.S.prototype.t = P.S.prototype.trigger;
	P.S.prototype.tt = P.S.prototype.triggerMany;
	
	/**
	 * @module proact-streams
	 */
	
	/**
	 * <p>
	 *  Constructs a `ProAct.BufferedStream`. This is a {{#crossLink "ProAct.Stream"}}{{/crossLink}} with a buffer.
	 * </p>
	 * <p>
	 *  On new value/event the listeners are not updated, but the value/event is stored in the buffer.
	 * </p>
	 *
	 * `ProAct.BufferedStream` is an abstract class.
	 * <p>
	 *  When the buffer is flushed every value/event is emitted to the listeners. In case with property listeners
	 *  they are updated only once with the last event/value. Good for performance optimizations.
	 * </p>
	 * <p>
	 *  For example if it is set to stream mouse move events, we don't care for each of the event but for a portion of them.
	 * </p>
	 * <p>
	 *  `ProAct.BufferedStream` is part of the `proact-streams` module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.BufferedStream
	 * @extends ProAct.Stream
	 * @constructor
	 * @abstract
	 * @param {String} queueName
	 *      The name of the queue all the updates should be pushed to.
	 *      <p>
	 *        If this parameter is null/undefined the default queue of
	 *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
	 *      </p>
	 *      <p>
	 *        If this parameter is not a string it is used as the
	 *        <i>source</i>.
	 *      </p>
	 * @param {ProAct.Actor} source
	 *      A default source of the stream, can be null.
	 * @param {Array} transforms
	 *      A list of transformation to be used on all incoming chages.
	 */
	function BufferedStream (queueName, source, transforms) {
	  if (queueName && !P.U.isString(queueName)) {
	    transforms = source;
	    source = queueName;
	    queueName = null;
	  }
	
	  P.S.call(this, queueName, source, transforms);
	  this.buffer = [];
	}
	ProAct.BufferedStream = P.BS = BufferedStream;
	
	ProAct.BufferedStream.prototype = P.U.ex(Object.create(P.S.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.BufferedStream
	   * @final
	   * @for ProAct.BufferedStream
	   */
	  constructor: ProAct.BufferedStream,
	
	  /**
	   * Flushes the stream by emitting all the events/values stored in its buffer.
	   * The buffer becomes empty.
	   *
	   * @for ProAct.BufferedStream
	   * @instance
	   * @method flush
	   * @return {ProAct.BufferedStream}
	   *      <i>this</i>
	   */
	  flush: function () {
	    var self = this, i, b = this.buffer, ln = b.length;
	
	    P.flow.run(function () {
	      for (i = 0; i < ln; i+= 2) {
	        StreamUtil.go.call(self, b[i], b[i+1]);
	      }
	      self.buffer = [];
	    });
	
	    return this;
	  }
	});
	
	/**
	 * @module proact-streams
	 */
	
	/**
	 * <p>
	 *  Constructs a `ProAct.SizeBufferedStream`. When the buffer is full (has the same size as <i>this</i> size), it is flushed.
	 * </p>
	 * <p>
	 *  `ProAct.SizeBufferedStream` is part of the `proact-streams` module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.SizeBufferedStream
	 * @constructor
	 * @extends ProAct.BufferedStream
	 * @param {String} queueName
	 *      The name of the queue all the updates should be pushed to.
	 *      <p>
	 *        If this parameter is null/undefined the default queue of
	 *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
	 *      </p>
	 *      <p>
	 *        If this parameter is not a string it is used as the
	 *        <i>source</i>.
	 *      </p>
	 * @param {ProAct.Actor} source
	 *      A default source of the stream, can be null.
	 *      <p>
	 *        If this is the only one passed argument and it is a number - it becomes the size of the buffer.
	 *      </p>
	 * @param {Array} transforms
	 *      A list of transformation to be used on all incoming chages.
	 *      <p>
	 *        If the arguments passed are two and this is a number - it becomes the size of the buffer.
	 *      </p>
	 * @param {Number} size
	 *      The size of the buffer.
	 * @throws {Error} SizeBufferedStream must contain size, if there is no size passed to it.
	 */
	function SizeBufferedStream (queueName, source, transforms, size) {
	  if (queueName && !P.U.isString(queueName)) {
	    size = transforms;
	    transforms = source;
	    source = queueName;
	    queueName = null;
	  }
	  if (typeof source === 'number') {
	    size = source;
	    source = null;
	  } else if (typeof transforms === 'number') {
	    size = transforms;
	    transforms = null;
	  }
	  P.BS.call(this, queueName, source, transforms);
	
	  if (!size) {
	    throw new Error('SizeBufferedStream must contain size!');
	  }
	
	  this.size = size;
	}
	ProAct.SizeBufferedStream = P.SBS = SizeBufferedStream;
	
	ProAct.SizeBufferedStream.prototype = P.U.ex(Object.create(P.BS.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.SizeBufferedStream
	   * @final
	   * @for ProAct.SizeBufferedStream
	   */
	  constructor: ProAct.SizeBufferedStream,
	
	  /**
	   * <p>
	   *  Triggers a new event/value to the stream. If the buffer is full, anything that is listening for events from
	   *  this stream will get updated with all the values/events in the buffer.
	   * </p>
	   * <p>
	   *  ProAct.Stream.t is alias of this method.
	   * </p>
	   *
	   * @for ProAct.SizeBufferedStream
	   * @instance
	   * @method trigger
	   * @param {Object} event
	   *      The event/value to pass to trigger.
	   * @param {Boolean} useTransformations
	   *      If the stream should transform the triggered value. By default it is true (if not passed)
	   * @return {ProAct.Stream}
	   *      <i>this</i>
	   */
	  trigger: function (event, useTransformations) {
	    this.buffer.push(event, useTransformations);
	
	    if (this.size !== null && (this.buffer.length / 2) === this.size) {
	      this.flush();
	    }
	    return this;
	  }
	});
	
	P.U.ex(P.S.prototype, {
	
	  /**
	   * Creates a new {{#crossLink "ProAct.SizeBufferedStream"}}{{/crossLink}} instance having as source <i>this</i>.
	   *
	   * @for ProAct.Stream
	   * @instance
	   * @method bufferit
	   * @param {Number} size
	   *      The size of the buffer of the new ProAct.SizeBufferedStream.
	   * @return {ProAct.SizeBufferedStream}
	   *      A {{#crossLink "ProAct.SizeBufferedStream"}}{{/crossLink}} instance.
	   * @throws {Error} `SizeBufferedStream` must contain size, if there is no size passed to it.
	   */
	  bufferit: function (size) {
	    return new P.SBS(this, this.queueName, size);
	  }
	});
	
	P.SBS.prototype.t = P.SBS.prototype.trigger;
	
	/**
	 * @module proact-streams
	 */
	
	/**
	 * <p>
	 *  Constructs a `ProAct.DelayedStream`. When a given time interval passes the buffer of the stream is flushed authomatically.
	 * </p>
	 * <p>
	 *  `ProAct.DelayedStream` is part of the streams module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.DelayedStream
	 * @extends ProAct.BufferedStream
	 * @constructor
	 * @param {String} queueName
	 *      The name of the queue all the updates should be pushed to.
	 *      <p>
	 *        If this parameter is null/undefined the default queue of
	 *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
	 *      </p>
	 *      <p>
	 *        If this parameter is not a string it is used as the
	 *        <i>source</i>.
	 *      </p>
	 * @param {ProAct.Actor} source
	 *      A default source of the stream, can be null.
	 *      <p>
	 *        If this is the only one passed argument and it is a number - it becomes the delay of the stream.
	 *      </p>
	 * @param {Array} transforms
	 *      A list of transformation to be used on all incoming chages.
	 *      <p>
	 *        If the arguments passed are two and this is a number - it becomes the delay of the stream.
	 *      </p>
	 * @param {Number} delay
	 *      The time delay to be used to flush the stream.
	 */
	function DelayedStream (queueName, source, transforms, delay) {
	  if (queueName && !P.U.isString(queueName)) {
	    delay = transforms;
	    transforms = source;
	    source = queueName;
	    queueName = null;
	  }
	  if (typeof source === 'number') {
	    delay = source;
	    source = null;
	  } else if (P.U.isObject(source) && typeof transforms === 'number') {
	    delay = transforms;
	    transforms = null;
	  }
	  P.BS.call(this, queueName, source, transforms);
	
	  this.delayId = null;
	  this.setDelay(delay);
	}
	ProAct.DelayedStream = P.DBS = DelayedStream;
	
	ProAct.DelayedStream.prototype = P.U.ex(Object.create(P.BS.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.DelayedStream
	   * @final
	   * @for ProAct.DelayedStream
	   */
	  constructor: ProAct.DelayedStream,
	
	  /**
	   * <p>
	   *  Triggers a new event/value to the stream. It is stored in the buffer of the stream and not emitted.
	   * </p>
	   * <p>
	   *  `ProAct.DelayedStream.t` is alias of this method.
	   * </p>
	   * TODO - this method shoudl be private, we don't want manual triggering...
	   *
	   * @for ProAct.DelayedStream
	   * @instance
	   * @method trigger
	   * @param {Object} event
	   *      The event/value to pass to trigger.
	   * @param {Boolean} useTransformations
	   *      If the stream should transform the triggered value. By default it is true (if not passed)
	   * @return {ProAct.DelayedStream}
	   *      <i>this</i>
	   */
	  trigger: function (event, useTransformations) {
	    this.buffer.push(event, useTransformations);
	    return this;
	  },
	
	  /**
	   * <p>
	   *  Cancels the delay interval flushes. If this method is called the stream will stop emitting incoming values/event,
	   *  until the {{#crossLink "ProAct.DelayedStream/setDelay:method"}}{{/crossLink}} method is called.
	   * </p>
	   *
	   * @for ProAct.DelayedStream
	   * @instance
	   * @method cancelDelay
	   * @return {ProAct.DelayedStream}
	   *      <i>this</i>
	   */
	  cancelDelay: function () {
	    if (this.delayId !== null){
	      clearInterval(this.delayId);
	      this.delayId = null;
	    }
	
	    return this;
	  },
	
	  /**
	   * <p>
	   *  Modifies the delay of the stream. The current delay is canceled using the {{#crossLink "ProAct.DelayedStream/cancelDelay:method"}}{{/crossLink}} method.
	   * </p>
	   *
	   * @for ProAct.DelayedStream
	   * @instance
	   * @method setDelay
	   * @param {Number} delay
	   *      The new delay of the stream.
	   * @return {ProAct.DelayedStream}
	   *      <i>this</i>
	   */
	  setDelay: function (delay) {
	    this.delay = delay;
	    this.cancelDelay();
	
	    if (!this.delay) {
	      return;
	    }
	
	    var self = this;
	    this.delayId = setInterval(function () {
	      self.flush();
	    }, this.delay);
	
	    return this;
	  }
	});
	
	P.U.ex(P.S.prototype, {
	
	  /**
	   * Creates a new {{#crossLink "ProAct.DelayedStream"}}{{/crossLink}} instance having as source <i>this</i>.
	   *
	   * @for ProAct.Stream
	   * @instance
	   * @method delay
	   * @param {Number} delay
	   *      The time delay to be used for flushing the buffer of the new stream.
	   * @return {ProAct.DelayedStream}
	   *      A {{#crossLink "ProAct.DelayedStream"}}{{/crossLink}} instance.
	   */
	  delay: function (delay) {
	    return new P.DBS(this, this.queueName, delay);
	  }
	});
	
	P.DBS.prototype.t = P.DBS.prototype.trigger;
	
	/**
	 * @module proact-streams
	 */
	
	/**
	 * <p>
	 *  Constructs a `ProAct.ThrottlingStream`. This is special kind of {{#crossLink "ProAct.DelayedStream"}}{{/crossLink}}.
	 * </p>
	 * <p>
	 *  The main idea is the following : if <i>n</i> values/events are triggered to this stream before the time delay for
	 *  flushing passes, only the last one, the <i>n</i>-th is emitted.
	 * </p>
	 * <p>
	 *  `ProAct.ThrottlingStream` is part of the `proact-streams` module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.ThrottlingStream
	 * @constructor
	 * @extends ProAct.DelayedStream
	 * @param {String} queueName
	 *      The name of the queue all the updates should be pushed to.
	 *      <p>
	 *        If this parameter is null/undefined the default queue of
	 *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
	 *      </p>
	 *      <p>
	 *        If this parameter is not a string it is used as the
	 *        <i>source</i>.
	 *      </p>
	 * @param {ProAct.Actor} source
	 *      A default source of the stream, can be null.
	 *      <p>
	 *        If this is the only one passed argument and it is a number - it becomes the delay of the stream.
	 *      </p>
	 * @param {Array} transforms
	 *      A list of transformation to be used on all incoming chages.
	 *      <p>
	 *        If the arguments passed are two and this is a number - it becomes the delay of the stream.
	 *      </p>
	 * @param {Number} delay
	 *      The time delay to be used to flush the stream.
	 */
	function ThrottlingStream (queueName, source, transforms, delay) {
	  P.DBS.call(this, queueName, source, transforms, delay);
	}
	ProAct.ThrottlingStream = P.TDS = ThrottlingStream;
	
	ProAct.ThrottlingStream.prototype = P.U.ex(Object.create(P.DBS.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.ThrottlingStream
	   * @final
	   * @for ProAct.ThrottlingStream
	   */
	  constructor: ProAct.ThrottlingStream,
	
	  /**
	   * <p>
	   *  Triggers a new event/value to the stream. It is stored in the buffer of the stream and not emitted.
	   *  But the buffer of `ProAct.ThrottlingStream` can store only one value/event, so when the delay passes only
	   *  the last value/event triggered into the stream by this method is emitted.
	   * </p>
	   * <p>
	   *  `ProAct.ThrottlingStream.t` is alias of this method.
	   * </p>
	   *
	   * TODO - should be moved to StreamUtil.
	   *
	   * @for ProAct.ThrottlingStream
	   * @instance
	   * @method trigger
	   * @param {Object} event
	   *      The event/value to pass to trigger.
	   * @param {Boolean} useTransformations
	   *      If the stream should transform the triggered value. By default it is true (if not passed)
	   * @return {ProAct.ThrottlingStream}
	   *      <i>this</i>
	   */
	  trigger: function (event, useTransformations) {
	    this.buffer[0] = event;
	    this.buffer[1] = useTransformations;
	
	    return this;
	  }
	});
	
	P.U.ex(P.Stream.prototype, {
	
	  /**
	   * Creates a new {{#crossLink "ProAct.ThrottlingStream"}}{{/crossLink}} instance having as source <i>this</i>.
	   *
	   * @for ProAct.Stream
	   * @instance
	   * @method throttle
	   * @param {Number} delay
	   *      The time delay to be used for flushing the buffer of the new stream.
	   * @return {ProAct.ThrottlingStream}
	   *      A {{#crossLink "ProAct.ThrottlingStream"}}{{/crossLink}} instance.
	   */
	  throttle: function (delay) {
	    return new P.TDS(this, delay);
	  }
	});
	
	P.TDS.prototype.t = P.TDS.prototype.trigger;
	
	/**
	 * @module proact-streams
	 */
	
	/**
	 * <p>
	 *  Constructs a `ProAct.DebouncingStream`. It is a {{#crossLink "ProAct.DelayedStream"}}{{/crossLink}} that resets its flushing interval on every new value/event.
	 *  Only the last event/value triggered in given interval will be emitted.
	 * </p>
	 * <p>
	 *  `ProAct.DebouncingStream` is part of the proact-streams module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.DebouncingStream
	 * @extends ProAct.DelayedStream
	 * @constructor
	 * @param {String} queueName
	 *      The name of the queue all the updates should be pushed to.
	 *      <p>
	 *        If this parameter is null/undefined the default queue of
	 *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
	 *      </p>
	 *      <p>
	 *        If this parameter is not a string it is used as the
	 *        <i>source</i>.
	 *      </p>
	 * @param {ProAct.Actor} source
	 *      A default source of the stream, can be null.
	 *      <p>
	 *        If this is the only one passed argument and it is a number - it becomes the delay of the stream.
	 *      </p>
	 * @param {Array} transforms
	 *      A list of transformation to be used on all incoming chages.
	 *      <p>
	 *        If the arguments passed are two and this is a number - it becomes the delay of the stream.
	 *      </p>
	 * @param {Number} delay
	 *      The time delay to be used to flush the stream.
	 */
	function DebouncingStream (queueName, source, transforms, delay) {
	  P.DBS.call(this, queueName, source, transforms, delay);
	}
	ProAct.DebouncingStream = P.DDS = DebouncingStream;
	
	ProAct.DebouncingStream.prototype = P.U.ex(Object.create(P.DBS.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.DebouncingStream
	   * @final
	   * @for ProAct.DebouncingStream
	   */
	  constructor: ProAct.DebouncingStream,
	
	  /**
	   * <p>
	   *  Triggers a new event/value to the stream. It is stored in the buffer of the stream and not emitted.
	   *  But the buffer of `ProAct.DebouncingStream` can store only one value/event, so when the delay passes only
	   *  the last value/event triggered into the stream by this method is emitted.
	   *  On every call of this method the delay is reset.
	   *  So for example if you have mouse move as source, it will emit only the last mouse move event, that was send <i>delay</i> milliseconds ago.
	   * </p>
	   * <p>
	   *  ProAct.DebouncingStream.t is alias of this method.
	   * </p>
	   *
	   * @for ProAct.DebouncingStream
	   * @instance
	   * @method trigger
	   * @param {Object} event
	   *      The event/value to pass to trigger.
	   * @param {Boolean} useTransformations
	   *      If the stream should transform the triggered value. By default it is true (if not passed)
	   * @return {ProAct.DebouncingStream}
	   *      <i>this</i>
	   */
	  trigger: function (event, useTransformations) {
	    this.buffer = [];
	    this.cancelDelay();
	    this.setDelay(this.delay);
	    this.buffer.push(event, useTransformations);
	  }
	});
	
	P.U.ex(P.Stream.prototype, {
	
	  /**
	   * Creates a new {{#crossLink "ProAct.DebouncingStream"}}{{/crossLink}} instance having as source <i>this</i>.
	   *
	   * @memberof ProAct.Stream
	   * @instance
	   * @method debounce
	   * @param {Number} delay
	   *      The time delay to be used for flushing the buffer of the new stream.
	   * @return {ProAct.DebouncingStream}
	   *      A {{#crossLink "ProAct.DebouncingStream"}}{{/crossLink}} instance.
	   */
	  debounce: function (delay) {
	    return new P.DDS(this, this.queueName, delay);
	  }
	});
	
	P.DDS.prototype.t = P.DDS.prototype.trigger;
	
	/**
	 * @module proact-streams
	 */
	
	/**
	 * <p>
	 *  Constructs a `ProAct.SubscribableStream`. This is a `Stream` that has a custom `subscribe` function, used to subscribe to a source.
	 * </p>
	 *
	 * This can be used to stream sources like browser events. The stream is lazy, when there are no listeners to it,
	 * it is not subscribed to the source, on the first listener it is subscribed, when every listener is unsubscibed, it is unsubscribed.
	 *
	 * <p>
	 *  `ProAct.SubscribableStream` is part of the `proact-streams` module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.SubscribableStream
	 * @constructor
	 * @extends ProAct.Stream
	 * @param {Function} subscribe
	 *      A function used to subscribe to a source, when the first listener to this stream is attached.
	 * @param {String} queueName
	 *      The name of the queue all the updates should be pushed to.
	 *      <p>
	 *        If this parameter is null/undefined the default queue of
	 *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
	 *      </p>
	 *      <p>
	 *        If this parameter is not a string it is used as the
	 *        <i>source</i>.
	 *      </p>
	 * @param {ProAct.Actor} source
	 *      A default source of the stream, can be null.
	 *      <p>
	 *        If this is the only one passed argument and it is a number - it becomes the size of the buffer.
	 *      </p>
	 * @param {Array} transforms
	 *      A list of transformation to be used on all incoming chages.
	 *      <p>
	 *        If the arguments passed are two and this is a number - it becomes the size of the buffer.
	 *      </p>
	 */
	function SubscribableStream (subscribe, queueName, source, transforms) {
	  P.S.call(this, queueName, source, transforms);
	
	  this.subscribe = subscribe;
	  this.unsubscribe = null;
	  this.subscriptions = 0;
	}
	ProAct.SubscribableStream = P.SUS = SubscribableStream;
	
	ProAct.SubscribableStream.prototype = P.U.ex(Object.create(P.S.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.SubscribableStream
	   * @final
	   * @for ProAct.SubscribableStream
	   */
	  constructor: ProAct.SubscribableStream,
	
	  /**
	   * Attaches a new listener to this `ProAct.SubscribableStream`.
	   *
	   * The listener may be function or object that defines a <i>call</i> method.
	   * On the first attached listener the `subscribe` function passed to the constructor will be called.
	   * That way the stream will be subscribed to custom data source.
	   *
	   * ```
	   *   stream.on(function (v) {
	   *    console.log(v);
	   *   });
	   *
	   *   stream.on('error', function (v) {
	   *    console.error(v);
	   *   });
	   *
	   *   stream.on({
	   *    call: function (v) {
	   *      console.log(v);
	   *    }
	   *   });
	   * ```
	   *
	   * @for ProAct.SubscribableStream
	   * @instance
	   * @method on
	   * @param {Array|String} actions
	   *      The action/actions to listen for. If this parameter is skipped or null/undefined,
	   *      the actions from {{#crossLink "ProAct.Actor/defaultActions:method"}}{{/crossLink}} are used.
	   *      <p>
	   *        The actions can be skipped and on their place as first parameter to be passed the <i>listener</i>.
	   *      </p>
	   * @param {Object} listener
	   *      The listener to attach. It must be instance of Function or object with a <i>call</i> method.
	   * @return {ProAct.SubscribableStream}
	   *      <b>this</b>
	   */
	  on: function (actions, listener) {
	    if (this.subscriptions === 0) {
	      this.unsubscribe = this.subscribe(this);
	    }
	    this.subscriptions++;
	
	    return P.S.prototype.on.call(this, actions, listener);
	  },
	
	  /**
	   * Removes a <i>listener</i> from the passed <i>action</i>.
	   *
	   * If this method is called without parameters, all the listeners for all the actions are removed.
	   * The listeners are reset using {{#crossLink "ProAct.Actor/defaultActions:method"}}{{/crossLink}}.
	   *
	   * If the last listener is removed using this method, `this stream` authomatically unsubscribes
	   * from the source, using the function, returned by the `subscribe` function passed to the constructor.
	   *
	   * Examples are:
	   *
	   * Removing a listener:
	   * ```
	   *  var listener = function (v) {
	   *    console.log(v);
	   *  };
	   *  stream.on(listener);
	   *  stream.off(listener);
	   * ```
	   *
	   * Or for removing all the listeners attached to an stream:
	   * ```
	   *  stream.off();
	   * ```
	   *
	   * Or for removing all the listeners of a given type attached to an stream:
	   * ```
	   *  stream.off('error');
	   * ```
	   *
	   * Or for removing a listener from different type of actions:
	   * ```
	   *  var listener = function (v) {
	   *    console.log(v);
	   *  };
	   *  stream.on(listener);
	   *  stream.onErr(listener);
	   *
	   *  stream.off(['error', 'change'], listener);
	   * ```
	   *
	   * @for ProAct.SubscribableStream
	   * @instance
	   * @method off
	   * @param {Array|String} actions
	   *      The action/actions to stop listening for. If this parameter is skipped or null/undefined,
	   *      the actions from {{#crossLink "ProAct.Actor/defaultActions:method"}}{{/crossLink}} are used.
	   *      <p>
	   *        The actions can be skipped and on their place as first parameter to be passed the <i>listener</i>.
	   *      </p>
	   * @param {Object} listener
	   *      The listener to detach. If it is skipped, null or undefined all the listeners are removed from this actor.
	   * @return {ProAct.SubscribableStream}
	   *      <b>this</b>
	   */
	  off: function (actions, listener) {
	    this.subscriptions--;
	
	    if (!actions && !listener) {
	      this.subscriptions = 0;
	    }
	    if (this.subscriptions < 0) {
	      this.subscriptions = 0;
	    }
	
	    if (this.subscriptions === 0 && this.unsubscribe) {
	      this.unsubscribe(this);
	    }
	
	    return P.S.prototype.off.call(this, actions, listener);
	  }
	});
	
	/**
	 * @module proact-streams
	 */
	
	/**
	 * Creates a {{#crossLink "ProAct.Stream"}}{{/crossLink}} instance.
	 *
	 * This method is capable of creating various `source` streams.
	 *
	 * For example if the method is called like that:
	 * ```
	 *  var stream = ProAct.stream();
	 * ```
	 *
	 * A sourceless stream will be created, but it will be possible to invoke `trigger*` on it:
	 * ```
	 *  stream.trigger(val);
	 *  stream.triggerErr(new Error());
	 *  stream.triggerClose();
	 * ```
	 *
	 * The method can be called with a subscribe function too:
	 * ```
	 *  var stream = ProAct.stream(function (source) {
	 *    // ... logic using the source - the source is a stream, that has trigger/triggerErr/triggerClose
	 *    $('.sel').on('click.myClick', function (e) {
	 *      source.trigger(e);
	 *    });
	 *
	 *    return function () {
	 *      // unsubscribing logic
	 *      $('.sel').off('click.myClick');
	 *    };
	 *  });
	 * ```
	 *
	 * So subscribe/unsubscribe to an even source can be programmed using this method.
	 *
	 * The first argument can be a string too and if that's the case, {{#crossLink "ProAct.Stream"}}{{/crossLink}}'s
	 * `fromString` method will be used for the stream construction.
	 *
	 * @for ProAct
	 * @method stream
	 * @param {String|Function} [subscribe]
	 *      Can be null for no subsbcribe functon, can function to be used for subscribtion to a source or
	 *      can be string to use it with {{#crossLink "ProAct.Stream/fromString:method"}}{{/crossLink}}
	 * @param {Array} [transformations]
	 *      A list of transformation to be used on all incoming chages.
	 * @param {ProAct.Actor} source
	 *      A default source of the stream, can be null.
	 * @param {String} queueName
	 *      The name of the queue all the updates should be pushed to.
	 *      <p>
	 *        If this parameter is null/undefined the default queue of
	 *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
	 *      </p>
	 *      <p>
	 *        If this parameter is not a string it is used as the
	 *        <i>source</i>.
	 *      </p>
	 * @static
	 * @return {ProAct.Stream}
	 *      A {{#crossLink "ProAct.Stream"}}{{/crossLink}} instance.
	 */
	function stream (subscribe, transformations, source, queueName) {
	  var stream;
	  if (!subscribe) {
	    stream = new ProAct.Stream(queueName, source, transformations);
	  } else if (P.U.isFunction(subscribe)) {
	    stream = new ProAct.SubscribableStream(subscribe, queueName, source, transformations);
	  } else if (P.U.isString(subscribe)) {
	    stream = Stream.fromString(subscribe, slice.call(arguments, 1));
	  }
	
	  stream.trigger = StreamUtil.trigger;
	  stream.triggerErr = StreamUtil.triggerErr;
	  stream.triggerClose= StreamUtil.triggerClose;
	
	  return stream;
	}
	ProAct.stream = stream;
	
	/**
	 * Creates a closed {{#crossLink "ProAct.Stream"}}{{/crossLink}}.
	 *
	 * @for ProAct
	 * @method closed
	 * @static
	 * @return {ProAct.Stream}
	 *      A closed {{#crossLink "ProAct.Stream"}}{{/crossLink}} instance.
	 */
	function closed () {
	  return P.stream().close();
	}
	ProAct.closed = P.never = closed;
	
	/**
	 * Creates a {{#crossLink "ProAct.Stream"}}{{/crossLink}}, which emits the passed "value" once and then closes.
	 * <p>Example:</p>
	 * <pre>
	    var stream = ProAct.timeout(1000, 7);
	    stream.on(function (v) {
	      console.log(v);
	    });
	
	   // This will print '7' after 1s and will close.
	
	 * </pre>
	 *
	 * @for ProAct
	 * @method timeout
	 * @static
	 * @param {Number} timeout
	 *      The time to wait (in milliseconds) before emitting the <i>value</i> and close.
	 * @param {Object} value
	 *      The value to emit.
	 * @return {ProAct.Stream}
	 *      A {{#crossLink "ProAct.Stream"}}{{/crossLink}} instance.
	 */
	function timeout (timeout, value) {
	  var stream = P.stream();
	
	  window.setTimeout(function () {
	    stream.trigger(value);
	    stream.close();
	  }, timeout);
	
	  return stream;
	}
	ProAct.timeout = ProAct.later = timeout;
	
	/**
	 * Creates a {{#crossLink "ProAct.Stream"}}{{/crossLink}}, which emits the passed "value" over and over again at given time interval.
	 * <p>Example:</p>
	 * <pre>
	    var stream = ProAct.interval(1000, 7);
	    stream.on(function (v) {
	      console.log(v);
	    });
	
	   // This will print one number on every 1s and the numbers will be 7,7,7,7,7....
	
	 * </pre>
	 *
	 * @for ProAct
	 * @method interval
	 * @static
	 * @param {Number} interval
	 *      The time in milliseconds on which the <i>value</i> will be emitted.
	 * @param {Object} value
	 *      The value to emit.
	 * @return {ProAct.Stream}
	 *      A {{#crossLink "ProAct.Stream"}}{{/crossLink}} instance.
	 */
	function interval (interval, value) {
	  var stream = P.stream();
	
	  window.setInterval(function () {
	    stream.trigger(value);
	  }, interval);
	
	  return stream;
	}
	ProAct.interval = interval;
	
	/**
	 * Creates a {{#crossLink "ProAct.Stream"}}{{/crossLink}}, which emits values of the passed <i>vals</i> array on the passed <i>interval</i> milliseconds.
	 * <p>
	 *  When every value is emitted through the stream it is closed.
	 * <p>
	 * <p>Example:</p>
	 * <pre>
	    var stream = ProAct.seq(1000, [4, 5]);
	    stream.on(function (v) {
	      console.log(v);
	    });
	
	   // This will print one number on every 1s and the numbers will be 4 5 and the stream will be closed.
	
	 * </pre>
	 *
	 * @for ProAct
	 * @method seq
	 * @static
	 * @param {Number} interval
	 *      The time in milliseconds on which a value of the passed <i>vals</i> array will be emitted.
	 * @param {Array} vals
	 *      The array containing the values to be emitted on the passed <i>interval</i>.
	 * @return {ProAct.Stream}
	 *      A {{#crossLink "ProAct.Stream"}}{{/crossLink}} instance.
	 */
	function seq (interval, vals) {
	  var stream = P.stream(),
	      operation;
	
	  if (vals.length > 0) {
	    operation = function () {
	      var value = vals.shift();
	      stream.trigger(value);
	
	      if (vals.length === 0) {
	        stream.close();
	      } else {
	        window.setTimeout(operation, interval);
	      }
	    };
	    window.setTimeout(operation, interval);
	  }
	
	  return stream;
	}
	ProAct.seq = seq;
	
	/**
	 * Creates a {{#crossLink "ProAct.Stream"}}{{/crossLink}}, which emits values of the passed <i>vals</i> array on the passed interval.
	 * <p>
	 *  When every value is emitted through the stream they are emitted again and again and so on...
	 * <p>
	 * <p>Example:</p>
	 * <pre>
	    var stream = ProAct.repeat(1000, [4, 5]);
	    stream.on(function (v) {
	      console.log(v);
	    });
	
	   // This will print one number on every 1s and the numbers will be 4 5 4 5 4 5 4 5 4 5 .. and so on
	
	 * </pre>
	 *
	 * @for ProAct
	 * @method interval
	 * @static
	 * @param {Number} interval
	 *      The time in milliseconds on which a value of the passed <i>vals</i> array will be emitted.
	 * @param {Array} vals
	 *      The array containing the values to be emitted on the passed <i>interval</i>.
	 * @return {ProAct.Stream}
	 *      A {{#crossLink "ProAct.Stream"}}{{/crossLink}} instance.
	 */
	function repeat (interval, vals) {
	  var stream = P.stream(), i = 0;
	
	  if (vals.length > 0) {
	    window.setInterval(function () {
	      if (i === vals.length) {
	        i = 0;
	      }
	
	      var value = vals[i++];
	      stream.trigger(value);
	    }, interval);
	  }
	
	  return stream;
	}
	ProAct.repeat = repeat;
	
	/**
	 * The {{#crossLink "ProAct/fromInvoke:method"}}{{/crossLink}} creates a {{#crossLink "ProAct.Stream"}}{{/crossLink}}, which emits the result of the passed
	 * <i>func</i> argument on every <i>interval</i> milliseconds.
	 * <p>
	 *  If <i>func</i> returns {{#crossLink "ProAct/closed:method"}}{{/crossLink}} the stream is closed.
	 * </p>
	 * <p>Example:</p>
	 * <pre>
	    var stream = ProAct.fromInvoke(1000, function () {
	      return 5;
	    });
	    stream.on(function (v) {
	      console.log(v);
	    });
	
	    // After 1s we'll see '5' in the log, after 2s we'll see a second '5' in the log and so on...
	
	 * </pre>
	 *
	 * @for ProAct
	 * @method fromInvoke
	 * @static
	 * @param {Number} interval
	 *      The interval on which <i>func</i> will be called and its returned value will
	 *      be triggered into the stream.
	 * @param {Function} func
	 *      The function to invoke in order to get the value to trigger into the stream.
	 * @return {ProAct.Stream}
	 *      A {{#crossLink "ProAct.Stream"}}{{/crossLink}} instance.
	 */
	function fromInvoke (interval, func) {
	  var stream = P.stream(), id;
	
	  id = window.setInterval(function () {
	    var value = func.call();
	
	    if (value !== ProAct.close) {
	      stream.trigger(value);
	    } else {
	      stream.close();
	      window.clearInterval(id);
	    }
	
	  }, interval);
	
	  return stream;
	}
	ProAct.fromInvoke = fromInvoke;
	
	/**
	 * Creates a {{#crossLink "ProAct.Stream"}}{{/crossLink}}, which emits the result of an action that uses a callback
	 * to notify that it is finished.
	 *
	 * This can be used to create streams from http requests for example.
	 *
	 * Example:
	 * ```
	 *  var stream = ProAct.fromCallback(action);
	 *  stream.on(function (v) {
	 *    console.log(v);
	 *  });
	 *
	 * ```
	 *
	 * @for ProAct
	 * @method fromCallback
	 * @static
	 * @param {Function} callbackCaller
	 *      The action that receives a callback.
	 * @return {ProAct.Stream}
	 *      A {{#crossLink "ProAct.Stream"}}{{/crossLink}} instance.
	 */
	function fromCallback (callbackCaller) {
	  var stream = P.stream();
	
	  callbackCaller(function (result) {
	    stream.trigger(result);
	    stream.close();
	  });
	
	  return stream;
	}
	
	ProAct.fromCallback = fromCallback;
	
	attachers = {
	  addEventListener: 'removeEventListener',
	  addListener: 'removeListener',
	  on: 'off'
	};
	attacherKeys = Object.keys(attachers);
	
	/**
	 * Creates a {{#crossLink "ProAct.Stream"}}{{/crossLink}} with source an evet emitter or dispatcher,
	 * it can be used with jQuery for example for example.
	 *
	 * Example:
	 * ```
	 *  var stream = ProAct.fromEventDispatcher($('.some-input'), 'keydown');
	 *  stream.on(function (e) {
	 *    console.log(e.which);
	 *  });
	 *
	 * ```
	 *
	 * @for ProAct
	 * @method fromEventDispatcher
	 * @static
	 * @param {Object} target
	 *      The event dispatcher, can be a jQuery button, or a DOM element, or somethnig like that.
	 * @param {String} eventType
	 *      The type of the event - for example 'click'.
	 * @return {ProAct.Stream}
	 *      A {{#crossLink "ProAct.Stream"}}{{/crossLink}} instance.
	 */
	function fromEventDispatcher (target, eventType) {
	  var i, ln = attacherKeys.length,
	      on, off,
	      attacher, current;
	
	  for (i = 0; i < ln; i++) {
	    attacher = attacherKeys[i];
	    current = target[attacher];
	
	    if (current && P.U.isFunction(current)) {
	      on = attacher;
	      off = attachers[attacher];
	      break;
	    }
	  }
	
	  if (on === undefined) {
	    return null;
	  }
	
	  return new ProAct.SubscribableStream(function (stream) {
	    target[on](eventType, stream.trigger);
	
	    return function (stream) {
	      target[off](eventType, stream.trigger);
	    };
	  });
	}
	
	ProAct.fromEventDispatcher = fromEventDispatcher;
	
	
	/**
	 * @module proact-properties
	 */
	
	/**
	 * <p>
	 *  Constructs a `ProAct.ValueEvent`. The value event contains information of a value property update.
	 * </p>
	 *
	 * @class ProAct.ValueEvent
	 * @extends ProAct.Event
	 * @constructor
	 * @param {ProAct.Event} source
	 *      If there is an event that coused this event - it is the source. Can be null - no source.
	 * @param {Object} target
	 *      The thing that triggered this event. In most cases this should be instance of a {{#crossLink "ProAct.Property"}}{{/crossLink}}
	 */
	function ValueEvent (source, target) {
	  var type = ProAct.Event.Types.value,
	      args = slice.call(arguments, 2);
	  ProAct.Event.apply(this, [source, target, type].concat(args));
	
	  this.object = args[0];
	  this.oldVal = args[1];
	  this.newVal = args[2];
	}
	
	ProAct.ValueEvent = P.VE = ValueEvent;
	
	ValueEvent.prototype = P.U.ex(Object.create(ProAct.Event.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.ValueEvent
	   * @final
	   * @for ProAct.ValueEvent
	   */
	  constructor: ValueEvent,
	
	  /**
	   * A `ValueEvent` represents change of a property from an old value to a new value.
	   * This method returns the old value, that was changed.
	   *
	   * @for ProAct.ValueEvent
	   * @instance
	   * @method fromVal
	   * @return {Object}
	   *      The old value.
	   */
	  fromVal: function () {
	    if (this.object && this.object.__pro__ &&
	        this.object.__pro__.properties[this.target].type() === P.P.Types.auto) {
	      return this.object.__pro__.properties[this.target].oldVal;
	    }
	
	    return this.oldVal;
	  },
	
	  /**
	   * A `ValueEvent` represents change of a property from an old value to a new value.
	   * This method returns the new value.
	   *
	   * @for ProAct.ValueEvent
	   * @instance
	   * @method toVal
	   * @return {Object}
	   *      The new value.
	   */
	  toVal: function () {
	    if (this.object && this.object.__pro__ &&
	        this.object.__pro__.properties[this.target].type() === P.P.Types.auto) {
	      return this.object.__pro__.properties[this.target].val;
	    }
	
	    return this.newVal;
	  }
	});
	
	
	/**
	 * The `proact-properties` module provides stateful reactive values attached to normal JavaScript
	 * object's fields.
	 *
	 * @module proact-properties
	 * @main proact-properties
	 */
	
	/**
	 * <p>
	 *  Constructs a `ProAct.Property`.
	 *  The properties are simple {{#crossLink "ProAct.Actor"}}{{/crossLink}}s with state.
	 *  The basic property has a state of a simple value - number/string/boolean.
	 * </p>
	 * <p>
	 *  Every property could represent a field in a plain JavaScript object.
	 *  It makes it reactive, on reading the property value,
	 *  if {{#crossLink "ProAct/currentCaller:property"}}{{/crossLink}} is set,
	 *  it is added as a listener to the property changes.
	 * </p>
	 * <p>
	 *  Every property has a type. The default property has a type of a simple value.
	 * </p>
	 * <p>
	 *  All the properties of an object are managed by its {{#crossLink "ProAct.ObjectCore"}}{{/crossLink}},
	 *  which is set to a hidden field of the object - '__pro__'.
	 * </p>
	 * <p>
	 *  When created every property is in {{#crossLink "ProAct.States/init:property"}}{{/crossLink}}, state,
	 *  when it is functional, the state is changed to {{#crossLink "ProAct.States/ready:property"}}{{/crossLink}}.
	 *  If the property is not in {{#crossLink "ProAct.States/ready:property"}}{{/crossLink}} state, it is not useable.
	 * </p>
	 * <p>
	 *  {{#crossLink "ProAct.Actor/init:method"}}{{/crossLink}} is called by this constructor for the property initialization.
	 *  It should initialize the property and set its state to {{#crossLink "ProAct.States/ready:property"}}{{/crossLink}}.
	 * </p>
	 * <p>
	 *  ProAct.Property is part of the `proact-properties` module of `ProAct.js`.
	 * </p>
	 *
	 * Examples:
	 * ```
	 *  var property = new Property({v: 5}, 'v');
	 *  property.get(); // This is 5
	 *  property.set(4);
	 *  property.get(); // This is 4
	 * ```
	 *
	 * @class ProAct.Property
	 * @extends ProAct.Actor
	 * @constructor
	 * @param {String} queueName
	 *      The name of the queue all the updates should be pushed to.
	 *      <p>
	 *        If this parameter is null/undefined the default queue of
	 *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
	 *      </p>
	 *      <p>
	 *        If this parameter is not a string it is used as the
	 *        <i>proObject</i>.
	 *      </p>
	 * @param {Object} proObject
	 *      A plain JavaScript object, holding a field, this property will represent.
	 * @param {String} property
	 *      The name of the field of the object, this property should represent.
	 * @param {Function} getter
	 *      An optional getter to be used when the property is read.
	 *      If this parameter is empty, a new {{#crossLink "ProAct.Property/defaultGetter:method"}}{{/crossLink}} is build for <i>this</i>.
	 * @param {Function} setter
	 *      An optional setter to be used when the property is written.
	 *      If this parameter is empty, a new {{#crossLink "ProAct.Property/defaultSetter:method"}}{{/crossLink}} is build for <i>this</i>.
	 */
	function Property (queueName, proObject, property, getter, setter) {
	  if (queueName && !P.U.isString(queueName)) {
	    setter = getter;
	    getter = property;
	    property = proObject;
	    proObject = queueName;
	    queueName = null;
	  }
	
	  if (!(proObject || property)) {
	    property = 'v';
	    proObject = {v: null};
	  }
	
	  P.U.defValProp(this, 'proObject', false, false, true, proObject);
	  this.property = property;
	
	  if (!this.proObject.__pro__) {
	    P.U.defValProp(proObject, '__pro__', false, false, true, new ProAct.ObjectCore(proObject));
	  }
	
	  this.proObject.__pro__.properties[property] = this;
	
	  this.get = getter || P.P.defaultGetter(this);
	  this.set = setter || P.P.defaultSetter(this);
	
	  this.oldVal = null;
	  this.val = proObject[property];
	
	  this.g = this.get;
	  this.s = this.set;
	
	  P.Actor.call(this, queueName); // Super!
	  this.parent = this.proObject.__pro__;
	
	  var meta = this.parent.meta.p;
	  this.isStaticTyped = meta && meta.statics && meta.statics.indexOf(this.property) !== -1;
	}
	ProAct.Property = P.P = Property;
	
	P.U.ex(ProAct.Property, {
	
	  /**
	   * Defines the possible types of the `ProAct.Property`.
	   *
	   * @class Types
	   * @namespace ProAct.Property
	   * @static
	   */
	  Types: {
	
	    /**
	     * ProAct.Property for simple types - Numbers, Strings or Booleans.
	     *
	     * @property simple
	     * @type Number
	     * @final
	     * @for ProAct.Property.Types
	     */
	    simple: 'simple', // strings, booleans and numbers
	
	    /**
	     * ProAct.Property for auto computed types - Functions.
	     *
	     * @property auto
	     * @type Number
	     * @final
	     * @for ProAct.Property.Types
	     */
	    auto: {}, // functions - dependent
	
	    /**
	     * ProAct.Property for object types - fields containing objects.
	     *
	     * @property object
	     * @type Number
	     * @final
	     * @for ProAct.Property.Types
	     */
	    object: {}, // references Pro objects
	
	    /**
	     * ProAct.Property for nil types - fields containing null or undefined.
	     *
	     * @property nil
	     * @type Number
	     * @final
	     * @for ProAct.Property.Types
	     */
	    nil: {}, // nulls
	
	    /**
	     * Retrieves the right` ProAct.Property.Types` value from a value.
	     *
	     * @for ProAct.Property.Types
	     * @method type
	     * @param {Object} value
	     *      The value to use to compute the `ProAct.Property.Types` member for.
	     * @return {Number}
	     *      The type of the passed value.
	     */
	    type: function (value) {
	      if (value === null) {
	        return P.P.Types.nil;
	      } else if (P.U.isFunction(value)) {
	        return P.P.Types.auto;
	      } else if (P.U.isObject(value)) {
	        return P.P.Types.object;
	      } else {
	        return P.P.Types.simple;
	      }
	    }
	  },
	
	  /**
	   * Generates a default getter function for a `ProAct.Property` instance.
	   * <p>
	   *  Every `ProAct.Property` instance has a getter and a setter,
	   *  they can be passed in the constructor, but if left blank,
	   *  this method is used for creating the getter function.
	   * </p>
	   * <p>
	   *  The default getter function uses {{#crossLink "ProAct.Property/addCaller:method"}}{{/crossLink}}
	   *  method to track the {{#crossLink "ProAct/currentCaller:property"}}{{/crossLink}} listener if set.
	   *  If it is set it is added as a listener to the passed <i>property</i>.
	   * </p>
	   *
	   * @for ProAct.Property
	   * @static
	   * @private
	   * @method defaultGetter
	   * @param {ProAct.Property} property
	   *      The `ProAct.Property` instance to generate a getter function for.
	   * @return {Function}
	   *      The generated getter function.
	   */
	  defaultGetter: function (property) {
	    return function () {
	      property.addCaller();
	
	      return property.val;
	    };
	  },
	
	  /**
	   * Generates a default setter function for a ProAct.Property instance.
	   * <p>
	   *  Every `ProAct.Property` instance has a setter and a getter,
	   *  they can be passed in the constructor, but if left blank,
	   *  this method is used for creating the setter function.
	   * </p>
	   * <p>
	   *  The default setter function uses the {{#crossLink "ProAct.ActorUtil/update:method"}}{{/crossLink}}
	   *  method to update all the listeners for <i>change</i>s for the passed <i>property</i>.
	   * </p>
	   * <p>
	   *  It updates the listeners only if the new value of the property
	   *  is different from the old one (using <i>===</i> for the comparison).
	   * </p>
	   *
	   * @for ProAct.Property
	   * @private
	   * @method defaultSetter
	   * @static
	   * @param {ProAct.Property} property
	   *      The `ProAct.Property` instance to generate a setter function for.
	   * @param {Function} setter
	   *      A setter function for the way of setting the value.
	   *      It can be skipped if the value should be set using <i>=</i>.
	   * @return {Function}
	   *      The generated setter function.
	   */
	  defaultSetter: function (property, setter) {
	    return function (newVal) {
	      if (property.state != P.States.ready) {
	        return;
	      }
	      newVal = P.Actor.transform(property, newVal);
	      if (newVal === P.Actor.BadValue || property.val === newVal) {
	        return;
	      }
	
	      property.oldVal = property.val;
	      if (setter) {
	        property.val = setter.call(property.proObject, newVal);
	      } else {
	        property.val = newVal;
	      }
	
	      if (property.type() !== P.P.Types.auto && P.P.Types.type(property.val) !== property.type()) {
	        P.P.reProb(property).update();
	        return;
	      }
	
	      ActorUtil.update.call(property);
	    };
	  },
	
	  /**
	   * Used to define the managed by a `ProAct.Property` instance field of the passed <i>obj</i>.
	   * <p>
	   *  The field is writable, enumerable and configurable.
	   * </p>
	   *
	   * @for ProAct.Property
	   * @method defineProp
	   * @private
	   * @static
	   * @param {Object} obj
	   *      The object which field should be defined as a property.
	   * @param {String} prop
	   *      The name of the property field to define.
	   * @param {Function} get
	   *      The getter that should be used to read the new property to be defined.
	   * @param {Function} set
	   *      The setter that should be used to update the new property to be defined.
	   */
	  defineProp: function (obj, prop, get, set) {
	    Object.defineProperty(obj, prop, {
	      get: get,
	      set: set,
	      enumerable: true,
	      configurable: true
	    });
	  },
	
	  /**
	   * Recreates a property, using its current value.
	   * <p>
	   *  The re-definition works by using {{#crossLink "ProAct.Property/destroy:method"}}{{/crossLink}}
	   *  to destroy the passed <i>property</i> first, and then the
	   *  {{#crossLink "ProAct.ObjectCore/makeProp:method"}}{{/crossLink}} method is called of the
	   *  {{#crossLink "ProAct.ObjectCore"}}{{/crossLink}} of the object the <i>property</i> belongs to.
	   * </p>
	   * <p>
	   *  This way a new `ProAct.Property` instance is created to replace the passed one.
	   * </p>
	   *
	   * @for ProAct.Property
	   * @private
	   * @method reProb
	   * @static
	   * @param {ProAct.Property} property
	   *      The ProAct.Property instance to re-define.
	   * @return {ProAct.Property}
	   *      The new re-defined property.
	   */
	  reProb: function (property) {
		    if (property.isStaticTyped || property.state !== P.States.ready) {
	      return;
	    }
	
	    var po = property.proObject,
	        p = property.property,
	        l = property.listeners.change;
	
	    property.destroy();
	    return po.__pro__.makeProp(p, l);
	  },
	
	  /**
	   * Creates a constant property. It's value can not be changed.
	   *
	   * ```
	   *  var property = ProAct.Property.constant(5);
	   *
	   *  console.log(property.get()); // 5
	   *
	   *  property.set(4);
	   *  console.log(property.get()); // 5
	   * ```
	   *
	   * @for ProAct.Property
	   * @static
	   * @method constant
	   * @param {Object} val The value of the property. Can not be changed.
	   * @param {Object} meta Optional meta data for the property.
	   * @param {String} queueName The name of the queue all the updates should be pushed to. By default the default queue is used.
	   * @return {ProAct.Property} The new constant property.
	   */
	  constant: function (val, meta, queueName) {
	    return P.P.value(val, meta, queueName).close();
	  },
	
	  /**
	   * Creates a value property. It's value can be updated any time and other properties may depend on it.
	   *
	   * This propety is eager - this means that it is initialized automatically even if it's not used.
	   *
	   * ```
	   *  var property = ProAct.Property.value(5);
	   *
	   *  console.log(property.get()); // 5
	   *
	   *  property.set(4);
	   *  console.log(property.get()); // 4
	   * ```
	   *
	   * @for ProAct.Property
	   * @static
	   * @method value
	   * @param {Object} val The value of the property.
	   * @param {Object} meta Optional meta data for the property.
	   * @param {String} queueName The name of the queue all the updates should be pushed to. By default the default queue is used.
	   * @return {ProAct.Property} The new value property.
	   */
	  value: function (val, meta, queueName) {
	    var property = P.P.lazyValue(val, meta, queueName);
	    property.get();
	
	    return property;
	  },
	
	  /**
	   * Creates a lazy initialized value property. It's value can be updated any time and other properties may depend on it.
	   *
	   * Being lazy means, that the property won't be initialized until it is read (it's get() method is called).
	   *
	   * ```
	   *  var property = ProAct.Property.lazyValue(5);
	   *
	   *  console.log(property.get()); // 5
	   *
	   *  property.set(4);
	   *  console.log(property.get()); // 4
	   * ```
	   *
	   * @for ProAct.Property
	   * @static
	   * @method lazyValue
	   * @param {Object} val The value of the property.
	   * @param {Object} meta Optional meta data for the property.
	   * @param {String} queueName The name of the queue all the updates should be pushed to. By default the default queue is used.
	   * @return {ProAct.Property} The new lazily initialized value property.
	   */
	  lazyValue: function (val, meta, queueName) {
	    if (meta && (P.U.isString(meta) || P.U.isArray(meta))) {
	      meta = {
	        v: meta
	      };
	    }
	
	    meta = meta || {};
	    meta.p = meta.p || {};
	    meta.p.statics = meta.p.statics || ['v'];
	    if (queueName) {
	      meta.p.queueName = queueName;
	    }
	
	    var object = {v: val},
	        core = new ObjectCore(object, meta);
	    P.U.defValProp(object, '__pro__', false, false, false, core);
	    core.prob();
	
	    return core.properties.v;
	  }
	});
	
	ProAct.Property.prototype = P.U.ex(Object.create(P.Actor.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.Property
	   * @final
	   * @for ProAct.Property
	   */
	  constructor: ProAct.Property,
	
	  /**
	   * Retrieves the {{#crossLink "ProAct.Property.Types"}}{{/crossLink}} value of <i>this</i> property.
	   * <p>
	   *  For instances of the base class - `ProAct.Property` it is
	   *  {{#crossLink "ProAct.Property.Types/simple:property"}}{{/crossLink}}.
	   * </p>
	   *
	   * @for ProAct.Property
	   * @instance
	   * @method type
	   * @return {Number}
	   *      The right type of the property.
	   */
	  type: function () {
	    return P.P.Types.simple;
	  },
	
	  /**
	   * Creates the <i>event</i> to be send to the listeners of this `ProAct.Property` on update.
	   * <p>
	   *  The <i>event</i> should be an instance of {{#crossLink "ProAct.Event"}}{{/crossLink}}.
	   * </p>
	   * <p>
	   *  By default this method returns {{#crossLink "ProAct.Event.Types/value:property"}}{{/crossLink}} event with target the property name and arguments:
	   *  <ul>
	   *    <li>The object this `ProAct.Property` manages a field for.</li>
	   *    <li>The old value of this property.</li>
	   *    <li>The new value of this property.</li>
	   *  </ul>
	   * </p>
	   *
	   * @for ProAct.Property
	   * @instance
	   * @protected
	   * @method makeEvent
	   * @default {ProAct.Event} with type {{#crossLink "ProAct.Event.Types/value:property"}}{{/crossLink}}.
	   * @param {ProAct.Event} source
	   *      The source event of the event. It can be null
	   * @return {ProAct.ValueEvent}
	   *      The event, created.
	   */
	  makeEvent: function (source) {
	    return new P.VE(source, this.property, this.proObject, this.oldVal, this.val);
	  },
	
	  /**
	   * Creates the <i>listener</i> of this `ProAct.Property`.
	   * <p>
	   *  This listener turns the observable in a observer.
	   * </p>
	   * <p>
	   *  The listener for ProAct.Property is an object defining the <i>call</i> method.
	   * </p>
	   * <p>
	   *  It has a <i>property</i> field set to <i>this</i>.
	   * </p>
	   * <p>
	   *  On value changes the <i><this</i> value is set to the new value using the {{#crossLink "ProAct.Actor/transform:method"}}{{/crossLink}} to transform it.
	   * </p>
	   *
	   * @for ProAct.Property
	   * @instance
	   * @protected
	   * @method makeListener
	   * @return {Object}
	   *      The <i>listener of this ProAct.Property</i>.
	   */
	  makeListener: function () {
	    if (!this.listener) {
	      var self = this;
	
	      this.listener = {
	        property: self,
	        queueName: self.queueName,
	        call: function (newVal) {
	          if (newVal && newVal.type !== undefined && newVal.type === P.E.Types.value && newVal.args.length === 3 && newVal.target) {
	            newVal = newVal.args[0][newVal.target];
	          }
	
	          self.set(newVal);
	        }
	      };
	    }
	
	    return this.listener;
	  },
	
	  /**
	   * Initializes this property.
	   * <p>
	   *  First the property is defined as a field in its object,
	   *  using {{#crossLink "ProAct.Property/defineProp:method"}}{{/crossLink}}.
	   * </p>
	   *
	   * @for ProAct.Property
	   * @instance
	   * @protected
	   * @method doInit
	   */
	  doInit: function () {
	    P.P.defineProp(this.proObject, this.property, this.get, this.set);
	    P.P.defineProp(this, 'v', this.get, this.set);
	  },
	
	  /**
	   * Uses {{#crossLink "ProAct/currentCaller:property"}}{{/crossLink}} to
	   * automatically add a new listener to this property if the caller is set.
	   * <p>
	   *  This method is used by the default getter to make every reader of the property a listener to it.
	   * </p>
	   *
	   * @for ProAct.Property
	   * @protected
	   * @instance
	   * @method addCaller
	   */
	  addCaller: function () {
	    var caller = P.currentCaller;
	
	    if (caller && caller.property !== this) {
	      this.on(caller);
	    }
	  },
	
	  /**
	   * A hook that is called right before destruction, the extenders use it to clean up resources.
	   *
	   * The `ProAct.Property` deletes its state and is removed from its core container.
	   *
	   * Don't override it.
	   *
	   * @for ProAct.Property
	   * @protected
	   * @instance
	   * @method beforeDestroy
	   */
	  beforeDestroy: function () {
	    delete this.proObject.__pro__.properties[this.property];
	    this.oldVal = undefined;
	
	    P.U.defValProp(this.proObject, this.property, true, true, true, this.val);
	    this.get = this.set = this.property = this.proObject = undefined;
	    this.g = this.s = undefined;
	    this.val = undefined;
	    this.isStaticTyped = undefined;
	    delete this.v;
	  },
	
	  /**
	   * Creates a new `ProAct.Property` instance with source <i>this</i> and mapping
	   * the passed <i>mapping function</i>.
	   *
	   * When the source is changed, the product of this operator is updated too.
	   *
	   * ```
	   *  var val = ProAct.Property.value(5);
	   *  var plusOne = val.map(function (v) {
	   *    return v + 1;
	   *  });
	   *
	   *  plusOne.get(); // 6
	   *
	   *  val.set(4);
	   *  plusOne.get(); // 5
	   * ```
	   *
	   * or
	   *
	   * ```
	   *  var positive = val.map('+');
	   *
	   *  val.set(-4);
	   *
	   *  positive.get(); // 4
	   * ```
	   *
	   * @for ProAct.Property
	   * @instance
	   * @method map
	   * @param {Object|Function|Strin} mappingFunction
	   *      Function or object with a <i>call method</i> to use as map function.
	   *      Can be string for predefined mapping functions.
	   * @return {ProAct.Property}
	   *      A new `ProAct.Property` instance with the <i>mapping</i> applied.
	   */
	  map: function (mappingFunction) {
	    var prop = P.P.value(this.val, {}, this.queueName).mapping(mappingFunction).into(this);
	    ActorUtil.update.call(this);
	    return prop;
	  },
	
	  /**
	   * Creates a new `ProAct.Property` instance with source <i>this</i> and filtering
	   * the passed <i>filtering function</i>.
	   *
	   * When the source changes, the product, may be updated.
	   *
	   * TODO On creation if the filter fails, the property keeps the original value.
	   * What to do? Also these kinds of properties shouldn't be set manually.
	   *
	   * ```
	   *  var prop = ProAct.Property.value(4);
	   *  var even = sourceActor.filter(function (el) {
	   *    return el % 2 == 0;
	   *  });
	   *
	   *  even.get(); // 4
	   *
	   *  prop.set(5);
	   *  even.get(); // 4
	   *
	   *  prop.set(6);
	   *  even.get(); // 6
	   * ```
	   *
	   * or
	   *
	   * ```
	   *  var actor = sourceActor.filter('odd');
	   *
	   * ```
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method filter
	   * @param {Object} filteringFunction
	   *      The filtering function or object with a call method, should return boolean.
	   * @return {ProAct.Property}
	   *      A new ProAct.Actor instance with the <i>filtering</i> applied.
	   */
	  filter: function (filteringFunction) {
	    var prop = P.P.value(this.val, {}, this.queueName).filtering(filteringFunction).into(this);
	
	    ActorUtil.update.call(this);
	    return prop;
	  },
	
	  /**
	   * Creates a new `ProAct.Property` instance with source <i>this</i> and accumulation
	   * the passed <i>accumulation function</i>.
	   *
	   * Some examples:
	   *
	   * ```
	   *  var prop = ProAct.Property.value(3);
	   *  var acc = prop.accumulate(0, function (current, el) {
	   *    return current + el;
	   *  });
	   *
	   *  acc.get(); // 3
	   *
	   *  prop.set(5);
	   *
	   *  acc.get(); // 8
	   *
	   *  prop.set(2);
	   *
	   *  acc.get(); // 10
	   * ```
	   *
	   * @for ProAct.Property
	   * @instance
	   * @method accumulate
	   * @param {Object} initVal
	   *      Initial value for the accumulation. For example '0' for sum.
	   * @param {Object} accumulationFunction
	   *      The function to accumulate.
	   * @return {ProAct.Property}
	   *      A new `ProAct.Property` instance with the <i>accumulation</i> applied.
	   */
	  accumulate: function (initVal, accumulationFunction) {
	    var prop = P.P.value(this.val, {}, this.queueName).accumulation(initVal, accumulationFunction).into(this);
	    ActorUtil.update.call(this);
	    return prop;
	  },
	
	  /**
	   * The <b>toString()</b> method returns a string representing this `ProAct.Property`.
	   * <p>
	   *  The string representation is the value of <i>this</i> property.
	   * </p>
	   *
	   * @for ProAct.Property
	   * @instance
	   * @method toString
	   */
	  toString: function () {
	    return this.val + '';
	  },
	
	  valueOf: function () {
	    return this.val;
	  }
	});
	
	P.U.ex(P.Actor.prototype, {
	
	  /**
	   * Generates a new {{#crossLink "ProAct.Property"}}{{/crossLink}} containing the state of an accumulations.
	   *
	   * <p>
	   *  The value will be updated with every update coming to this actor.
	   * </p>
	   *
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method reduce
	   * @param {Object} initVal
	   *      Initial value for the accumulation. For example '0' for sum.
	   * @param {Object} accumulationFunction
	   *      The function to accumulate.
	   * @return {ProAct.Property}
	   *      A {{#crossLink "ProAct.Property"}}{{/crossLink}} instance observing <i>this</i> with the accumulation applied.
	   */
	  reduce: function (initVal, accumulationFunction) {
	    return P.P.value(initVal).into(this.accumulate(initVal, accumulationFunction));
	  },
	
	
	  /**
	   * Creates a {{{#crossLink "ProAct.Property"}}{{/crossLink}} instance,
	   * dependent on this.
	   * Comes from the `proact-properties` module.
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method toProperty
	   */
	  toProperty: function () {
	    return P.P.value(this.val, {}, this.queueName).into(this);
	  }
	});
	
	function PropertyProbProvider () {
	};
	
	PropertyProbProvider.prototype = P.U.ex(Object.create(P.ProbProvider.prototype), {
	  constructor: PropertyProbProvider,
	  filter: function (data, meta) {
	    return data === null || (!P.U.isObject(data) && !P.U.isArray(data));
	  },
	  provide: function (data, meta) {
	    return P.P.lazyValue(data, meta);
	  }
	});
	
	P.ProbProvider.register(new PropertyProbProvider());
	
	/**
	 * @module proact-properties
	 */
	
	/**
	 * <p>
	 *  Constructs a `ProAct.AutoProperty`.
	 *  The properties are simple {{#crossLink "ProAct.Actor"}}{{/crossLink}}s with state.
	 *  The auto-computed or functional property has a state of a function return value.
	 * </p>
	 * <p>
	 *  Auto-computed properties are functions which are turned
	 *  to {{#crossLink "ProAct.Property"}}{{/crossLink}}s by a {{#crossLink "ProAct.ObjectCore"}}{{/crossLink}}.
	 * </p>
	 * <p>
	 *  If these functions are reading another fields of ProAct.js objects,
	 *  they authomatically become dependent on them.
	 * </p>
	 * <p>
	 *  For example:
	 *  <pre>
	 *    var obj = {
	 *      a: 1,
	 *      b: 2,
	 *      c: function () {
	 *        return this.a - this.b;
	 *      }
	 *    };
	 *  </pre>
	 *  If this object - <i>obj</i> is turned to a reactive ProAct.js object,
	 *  it becomes a simple object with three fields:
	 *  <pre>
	 *    {
	 *      a: 1,
	 *      b: 2,
	 *      c: -1
	 *    }
	 *  </pre>
	 *  But now <i>c</i> is dependent on <i>a</i> and <i>b</i>,
	 *  so if <i>a</i> is set to <b>4</b>, <i>obj</i> becomes:
	 *  <pre>
	 *    {
	 *      a: 1,
	 *      b: 2,
	 *      c: 2
	 *    }
	 *  </pre>
	 * </p>
	 * <p>
	 *  The logic is the following:
	 *  <ul>
	 *    <li>The property is initialized to be lazy, so its state is {{#crossLink "ProAct.States/init:property"}}{{/crossLink}}</li>
	 *    <li>
	 *      On its first read, the {{#crossLink "ProAct/currentCaller:property"}}{{/crossLink}} is set to the listener of the property,
	 *      so all the properties read in the function body become observed by it.
	 *      The value of the property is computed using the original function of the field.
	 *    </li>
	 *    <li>On this first read the state of the property is updated to {{#crossLink "ProAct.States/ready:property"}}{{/crossLink}}.</li>
	 *    <li>On its following reads it is a simple value, computed from the first read. No re-computations on get.</li>
	 *    <li>If a property, this auto-computed property depends changes, the value of <i>this</i> ProAct.AutoProperty is recomputed.</li>
	 *    <li>Setting the property can be implemented easy, because on set, the original function of the property is called with the new value.</li>
	 *  </ul>
	 * </p>
	 * <p>
	 *  `ProAct.AutoProperty` can be dependant on another `ProAct.AutoProperty`.
	 * </p>
	 * <p>
	 *  `ProAct.AutoProperty` is part of the proact-properties module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.AutoProperty
	 * @extends ProAct.Property
	 * @constructor
	 * @param {String} queueName
	 *      The name of the queue all the updates should be pushed to.
	 *      <p>
	 *        If this parameter is null/undefined the default queue of
	 *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
	 *      </p>
	 *      <p>
	 *        If this parameter is not a string it is used as the
	 *        <i>proObject</i>.
	 *      </p>
	 * @param {Object} proObject
	 *      A plain JavaScript object, holding a field, this property will represent.
	 * @param {String} property
	 *      The name of the field of the object, this property should represent.
	 */
	function AutoProperty (queueName, proObject, property) {
	  if (queueName && !P.U.isString(queueName)) {
	    property = proObject;
	    proObject = queueName;
	    queueName = null;
	  }
	
	  this.func = proObject[property];
	
	  var self = this,
	      getter = function () {
	        self.addCaller();
	        var oldCaller = P.currentCaller,
	            get = P.P.defaultGetter(self),
	            set = P.P.defaultSetter(self, function (newVal) {
	              return self.func.call(self.proObject, newVal);
	            }),
	            args = arguments,
	            autoFunction;
	
	        P.currentCaller = self.makeListener();
	
	        autoFunction = function () {
	          self.val = self.func.apply(self.proObject, args);
	        };
	        P.flow.run(function () {
	          P.flow.pushOnce(autoFunction);
	        });
	
	        P.currentCaller = oldCaller;
	
	        P.P.defineProp(self.proObject, self.property, get, set);
	
	        self.state = P.States.ready;
	
	        self.val = P.Actor.transform(self, self.val);
	        return self.val;
	      };
	
	  P.P.call(this, queueName, proObject, property, getter, function () {});
	}
	ProAct.AutoProperty = P.FP = AutoProperty;
	
	ProAct.AutoProperty.prototype = P.U.ex(Object.create(P.P.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.AutoProperty
	   * @final
	   * @for ProAct.AutoProperty
	   */
	  constructor: ProAct.AutoProperty,
	
	  /**
	   * Retrieves the {{#crossLink "ProAct.Property.Types"}}{{/crossLink}} value of <i>this</i> property.
	   * <p>
	   *  For instances of the `ProAct.AutoProperty` class, it is
	   *  {{#crossLink "ProAct.Property.Types/auto:property"}}{{/crossLink}}.
	   * </p>
	   *
	   * @for ProAct.AutoProperty
	   * @instance
	   * @method type
	   * @return {Number}
	   *      The right type of the property.
	   */
	  type: function () {
	    return P.P.Types.auto;
	  },
	
	  /**
	   * Creates the <i>listener</i> of this `ProAct.AutoProperty`.
	   * <p>
	   *  This listener turns the observable in a observer.
	   * </p>
	   * <p>
	   *  The listener for `ProAct.AutoProperty` is an object defining the <i>call</i> method.
	   * </p>
	   * <p>
	   *  It has a <i>property</i> field set to <i>this</i>.
	   * </p>
	   * <p>
	   *  On value changes the <i><this</i> value is set to the value computed by the original function,
	   *  using the {{#crossLink "ProAct.Actor/transform:method"}}{{/crossLink}} to transform it.
	   * </p>
	   *
	   * @for ProAct.AutoProperty
	   * @protected
	   * @instance
	   * @method makeListener
	   * @return {Object}
	   *      The <i>listener of this ProAct.AutoProperty</i>.
	   */
	  makeListener: function () {
	    if (!this.listener) {
	      var self = this;
	
	      this.listener = {
	        property: self,
	        queueName: self.queueName,
	        call: function () {
	          self.oldVal = self.val;
	          self.val = P.Actor.transform(self, self.func.call(self.proObject));
	        }
	      };
	    }
	
	    return this.listener;
	  },
	
	  /**
	   * Called automatically after initialization of this property.
	   * <p>
	   *  For `ProAct.AutoProperty` it does nothing -
	   *  the real initialization is lazy and is performed on the first read of <i>this</i>.
	   * </p>
	   *
	   * @for ProAct.AutoProperty
	   * @protected
	   * @instance
	   * @method afterInit
	   */
	  afterInit: function () {}
	});
	
	/**
	 * @module proact-properties
	 */
	
	/**
	 * <p>
	 *  Constructs a `ProAct.ObjectProperty`.
	 *  The properties are simple {{#crossLink "ProAct.Actor"}}{{/crossLink}}s with state. The object property
	 *  has a state of a JavaScript object value.
	 * </p>
	 * <p>
	 *  The value of `ProAct.ObjectProperty` is object, turned to reactive ProAct.js object recursively.
	 * </p>
	 * <p>
	 *  On changing the object value to another object the listeners for fields with the same name in the objects,
	 *  are moved from the old value's fields to the new value's fields.
	 * </p>
	 * <p>
	 *  If set to null or undefined, the property is re-defined, using {{#crossLink "ProAct.Property/reProb:method"}}{{/crossLink}}
	 * </p>
	 * <p>
	 *  `ProAct.ObjectProperty` is lazy - its object is made reactive on the first read of the property.
	 *  Its state is set to {{#crossLink "ProAct.States/ready:property"}}{{/crossLink}} on the first read too.
	 * </p>
	 * <p>
	 *  `ProAct.ObjectProperty` is part of the proact-properties module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.ObjectProperty
	 * @extends ProAct.Property
	 * @constructor
	 * @param {String} queueName
	 *      The name of the queue all the updates should be pushed to.
	 *      <p>
	 *        If this parameter is null/undefined the default queue of
	 *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
	 *      </p>
	 *      <p>
	 *        If this parameter is not a string it is used as the
	 *        <i>proObject</i>.
	 *      </p>
	 * @param {Object} proObject
	 *      A plain JavaScript object, holding a field, this property will represent.
	 * @param {String} property
	 *      The name of the field of the object, this property should represent.
	 */
	function ObjectProperty (queueName, proObject, property) {
	  if (queueName && !P.U.isString(queueName)) {
	    property = proObject;
	    proObject = queueName;
	    queueName = null;
	  }
	  var self = this, getter;
	
	  getter = function () {
	    self.addCaller();
	    if (!self.val.__pro__) {
	      P.prob(self.val);
	    }
	
	    var get = P.P.defaultGetter(self),
	        set = function (newVal) {
	          if (self.val == newVal) {
	            return;
	          }
	
	          self.oldVal = self.val;
	          self.val = newVal;
	
	          if (self.val === null || self.val === undefined) {
	            P.P.reProb(self).update();
	            return self;
	          }
	
	          if (self.oldVal) {
	            if (!self.val.__pro__) {
	              P.prob(self.val);
	            }
	
	            if (P.U.isArray(this)) {
	              self.update();
	              return;
	            }
	
	            var oldProps = self.oldVal.__pro__.properties,
	                newProps = self.val.__pro__.properties,
	                oldPropName, oldProp, newProp, oldListeners, newListeners,
	                i, j, oldListenersLength, newListenersLength,
	                toAdd, toRemove = [], toRemoveLength;
	
	            for (oldPropName in oldProps) {
	              if (oldProps.hasOwnProperty(oldPropName)) {
	                newProp = newProps[oldPropName];
	                if (!newProp) {
	                  continue;
	                }
	                newListeners = newProp.listeners.change;
	
	                oldProp = oldProps[oldPropName];
	                oldListeners = oldProp.listeners.change;
	                oldListenersLength = oldListeners.length;
	
	                for (i = 0; i < oldListenersLength; i++) {
	                  toAdd = true;
	                  for (j = 0; j < newListenersLength; j++) {
	                    if (oldListeners[i] == newListeners[j]) {
	                      toAdd = false;
	                    }
	                  }
	                  if (toAdd) {
	                    newProp.on(oldListeners[i]);
	                    toRemove.push(i);
	                  }
	                }
	
	                toRemoveLength = toRemove.length;
	                for (i = 0; i < toRemoveLength; i++) {
	                  oldListeners.splice[toRemove[i], 1];
	                }
	                toRemove = [];
	              }
	            }
	          }
	
	          ActorUtil.update.call(self);
	        };
	
	    P.P.defineProp(self.proObject, self.property, get, set);
	
	    self.state = P.States.ready;
	    return self.val;
	  };
	
	  P.P.call(this, queueName, proObject, property, getter, function () {});
	}
	ProAct.ObjectProperty = P.OP = ObjectProperty;
	
	ProAct.ObjectProperty.prototype = P.U.ex(Object.create(P.P.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.ObjectProperty
	   * @final
	   * @for ProAct.ObjectProperty
	   */
	  constructor: ProAct.ObjectProperty,
	
	  /**
	   * Retrieves the {{#crossLink "ProAct.Property.Types"}}{{/crossLink}} value of <i>this</i> property.
	   * <p>
	   *  For instances of the `ProAct.ObjectProperty` class, it is
	   *  {{#crossLink "ProAct.Property.Types/object:property"}}{{/crossLink}}.
	   * </p>
	   *
	   * @for ProAct.ObjectProperty
	   * @instance
	   * @method type
	   * @return {Number}
	   *      The right type of the property.
	   */
	  type: function () {
	    return P.P.Types.object;
	  },
	
	  /**
	   * Called automatically after initialization of this property.
	   * <p>
	   *  For `ProAct.ObjectProperty` it does nothing -
	   *  the real initialization is lazy and is performed on the first read of <i>this</i>.
	   * </p>
	   *
	   * @for ProAct.ObjectProperty
	   * @protected
	   * @instance
	   * @method afterInit
	   */
	  afterInit: function () {}
	});
	
	/**
	 * @module proact-properties
	 */
	
	/**
	 * <p>
	 *  Constructs a `ProAct.ProxyProperty`. This is a property, pointing to another {{#crossLink "ProAct.Property"}}{{/crossLink}}.
	 * </p>
	 * <p>
	 *  The value of `ProAct.ProxyProperty` is the value of its target, if the target is updated, the proxy is updated.
	 * </p>
	 * <p>
	 *  By setting the value of the proxy, the value of the target is updated, the proxy doesn't have its own value, it uses
	 *  the value of the target.
	 * </p>
	 * <p>
	 *  `ProAct.ProxyProperty` is part of the proact-properties module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.ProxyProperty
	 * @extends ProAct.Property
	 * @constructor
	 * @param {String} queueName
	 *      The name of the queue all the updates should be pushed to.
	 *      <p>
	 *        If this parameter is null/undefined the default queue of
	 *        {@link ProAct.flow} is used.
	 *      </p>
	 *      <p>
	 *        If this parameter is not a string it is used as the
	 *        <i>proObject</i>.
	 *      </p>
	 * @param {Object} proObject
	 *      A plain JavaScript object, holding a field, this property will represent.
	 * @param {String} property
	 *      The name of the field of the object, this property should represent.
	 * @param {ProAct.Property} target
	 *      The target {{#crossLink "ProAct.Property"}}{{/crossLink}}, that will provide the value of the new `ProAct.ProxyProperty`.
	 */
	function ProxyProperty (queueName, proObject, property, target) {
	  if (queueName && !P.U.isString(queueName)) {
	    target = property;
	    property = proObject;
	    proObject = queueName;
	    queueName = null;
	  }
	  var self = this, getter, setter;
	
	  getter = function () {
	    self.addCaller();
	    return target.val;
	  };
	
	  setter = function (newVal) {
	    if (target.val === newVal) {
	      return;
	    }
	
	    target.oldVal = target.val;
	    target.val = P.Actor.transform(self, newVal);
	
	    if (target.val === null || target.val === undefined) {
	      P.P.reProb(target).update();
	      return;
	    }
	
	    ActorUtil.update.call();
	  };
	
	  P.P.call(this, queueName, proObject, property, getter, setter);
	
	  this.target = target;
	  this.target.on(this.makeListener());
	}
	ProAct.ProxyProperty = P.PXP = ProxyProperty;
	
	ProAct.ProxyProperty.prototype = P.U.ex(Object.create(P.P.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.ProxyProperty
	   * @final
	   * @for ProAct.ProxyProperty
	   */
	  constructor: ProAct.ProxyProperty,
	
	  /**
	   * Retrieves the {{#crossLink "ProAct.Property.Types"}}{{/crossLink}} value of <i>this</i> property.
	   * <p>
	   *  For `ProAct.ProxyProperty` this is the type if its <i>target</i>.
	   * </p>
	   *
	   * @for ProAct.ProxyProperty
	   * @instance
	   * @method type
	   * @return {Number}
	   *      The right type of the property.
	   */
	  type: function () {
	    return this.target.type();
	  },
	
	  /**
	   * Creates the <i>listener</i> of this `ProAct.ProxyProperty`.
	   * <p>
	   *  This listener turns the observable in a observer.
	   * </p>
	   * <p>
	   *  The listener for ProAct.ProxyProperty is an object defining an empty <i>call</i> method.
	   * </p>
	   * <p>
	   *  It has a <i>property</i> field set to <i>this</i>.
	   * </p>
	   *
	   * @for ProAct.ProxyProperty
	   * @protected
	   * @instance
	   * @method makeListener
	   * @return {Object}
	   *      The <i>listener of this `ProAct.ProxyProperty`</i>.
	   */
	  makeListener: function () {
	    if (!this.listener) {
	      var self = this;
	
	      this.listener = {
	        property: self,
	        queueName: self.queueName,
	        call: P.N
	      };
	    }
	
	    return this.listener;
	  }
	
	});
	
	/**
	 * @module proact-properties
	 */
	
	/**
	 * <p>
	 *  The `ProAct.PropertyProvider` is an abstract class.
	 * </p>
	 * <p>
	 *  Many providers can be registered for many kinds of properties.
	 * </p>
	 * <p>
	 *  When a ProAct.js object is initialized its fields are turned into properties.
	 *  Depending on the type and the name of the field, as well as meta information the valid
	 *  type of {{#crossLink "ProAct.Property"}}{{/crossLink}} is created and used.
	 *  The `PropertyProviders` have 'filter' method and depending on it the valid kind is decided.
	 * </p>
	 * <p>
	 *  ProAct.PropertyProvider is part of the proact-properties module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.PropertyProvider
	 * @constructor
	 */
	function PropertyProvider () {}
	ProAct.PropertyProvider = P.PP = PropertyProvider;
	
	
	(function (P) {
	  var providers = [];
	
	  P.U.ex(P.PP, {
	
	
	    /**
	     * Registers a `ProAct.PropertyProvider`.
	     * <p>
	     *  The provider is appended in the end of the list of `ProAct.PropertyProviders`.
	     * </p>
	     * <p>
	     *  When a property must be provided if there is a `ProAct.PropertyProvider` registered before
	     *  the passed <i>propertyProvider</i>, with valid filtering for the passed field, it will
	     *  be used instead.
	     * </p>
	     *
	     * @for ProAct.PropertyProvider
	     * @method registerProvider
	     * @static
	     * @param {ProAct.PropertyProvider} propertyProvider
	     *      The `ProAct.PropertyProvider` to register.
	     */
	    registerProvider: function (propertyProvider) {
	      providers.push(propertyProvider);
	    },
	
	    /**
	     * Registers a `ProAct.PropertyProvider`.
	     * <p>
	     *  The provider is prepended in the beginning of the list of `ProAct.PropertyProviders`.
	     * </p>
	     * <p>
	     *  It's filtering will be called before any other registered provider.
	     * </p>
	     *
	     * @for ProAct.PropertyProvider
	     * @method prependProvider
	     * @static
	     * @param {ProAct.PropertyProvider} propertyProvider
	     *      The `ProAct.PropertyProvider` to register.
	     */
	    prependProvider: function (propertyProvider) {
	      providers.unshift(propertyProvider);
	    },
	
	    /**
	     * Removes a `ProAct.PropertyProvider` from the list of the registered `ProAct.PropertyProviders`.
	     *
	     * @for ProAct.PropertyProvider
	     * @method unregisterProvider
	     * @static
	     * @param {ProAct.PropertyProvider} propertyProvider
	     *      The ProAct.PropertyProvider to unregister.
	     */
	    unregisterProvider: function (propertyProvider) {
	      P.U.remove(providers, propertyProvider);
	    },
	
	    /**
	     * Removes all `ProAct.PropertyProviders` from the list of the registered `ProAct.PropertyProviders`.
	     *
	     * @for ProAct.PropertyProvider
	     * @static
	     * @method clearProviders
	     */
	    clearProviders: function () {
	      providers = [];
	    },
	
	    /**
	     * Provides a {{#crossLink "ProAct.Property"}}{{/crossLink}} instance using the list of the registered
	     * `ProAct.PropertyProviders`.
	     * <p>
	     *  The providers are tried in the order of their registration
	     *  (the order can be changed using {{#crossLink "ProAct.PropertyProvider/prependProvider:method"}}{{/crossLink}}).
	     * </p>
	     * <p>
	     *  The {{#crossLink "ProAct.PropertyProvider/filter:method"}}{{/crossLink}} method is used to check
	     *  if a provider is compliant with the passed arguments.
	     * </p>
	     * <p>
	     *  If a compliant provider is found, its {{#crossLink "ProAct.PropertyProvider/provide:method"}}{{/crossLink}} method
	     *  is used to provide the {{#crossLink "ProAct.Property"}}{{/crossLink}} instance.
	     * </p>
	     *
	     * @for ProAct.PropertyProvider
	     * @static
	     * @param {String} queueName
	     *      The name of the queue all the updates should be pushed to.
	     *      <p>
	     *        If this parameter is null/undefined the default queue of
	     *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
	     *      </p>
	     *      <p>
	     *        If this parameter is not a string it is used as the
	     *        <i>object</i>.
	     *      </p>
	     * @param {Object} object
	     *      The object to provide a {{#crossLink "ProAct.Property"}}{{/crossLink}} instance for.
	     * @param {String} property
	     *      The field name of the <i>object</i> to turn into a {{#crossLink "ProAct.Property"}}{{/crossLink}}.
	     * @param {String|Array} meta
	     *      Meta information to be used for filtering and configuration of the {{#crossLink "ProAct.Property"}}{{/crossLink}} instance to be provided.
	     * @return {ProAct.Property}
	     *      A property provided by registered provider, or null if there is no compliant provider.
	     */
	    provide: function (queueName, object, property, meta) {
	      if (queueName && !P.U.isString(queueName)) {
	        meta = property;
	        property = object;
	        object = queueName;
	        queueName = null;
	      }
	      var ln = providers.length,
	          prop = null,
	          provider = null,
	          i;
	
	      for (i = 0; i < ln; i++) {
	        provider = providers[i];
	        if (provider.filter(object, property, meta)) {
	          break;
	        } else {
	          provider = null;
	        }
	      }
	
	      if (provider) {
	        prop = provider.provide(queueName, object, property, meta);
	      }
	
	      return prop;
	    }
	  });
	}(P));
	
	ProAct.PropertyProvider.prototype = {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.PropertyProvider
	   * @final
	   * @for ProAct.PropertyProvider
	   */
	  constructor: ProAct.PropertyProvider,
	
	  /**
	   * Used to check if this `ProAct.PropertyProvider` is compliant with the field and meta data
	   * to be used for creating a {{#crossLink "ProAct.Property"}}{{/crossLink}} instance with
	   * {{#crossLink "ProAct.PropertyProvider/provide:method"}}{{/crossLink}}.
	   * <p>
	   *  Abstract - must be implemented by an extender.
	   * </p>
	   *
	   * @for ProAct.PropertyProvider
	   * @abstract
	   * @instance
	   * @method filter
	   * @param {Object} object
	   *      The object to which a new {{#crossLink "ProAct.Property"}}{{/crossLink}} instance should be provided.
	   * @param {String} property
	   *      The field name of the <i>object</i> to turn into a {{#crossLink "ProAct.Property"}}{{/crossLink}}.
	   *      Can be used in the filtering process.
	   *      <p>
	   *        For example field name beginning with foo. Can be turned into a FooProperty.
	   *      </p>
	   * @param {String|Array} meta
	   *      Meta information to be used for filtering and configuration of the {{#crossLink "ProAct.Property"}}{{/crossLink}} instance to be provided.
	   * @return {Boolean}
	   *      If <i>this</i> provider is compliant with the passed arguments.
	   */
	  filter: function (object, property, meta) {
	    throw new Error('Abstract! Implement!');
	  },
	
	  /**
	   * Provides an instance of {{#crossLink "ProAct.Property"}}{{/crossLink}}.
	   * <p>
	   *  It should be called only after <i>this</i> {{#crossLink "ProAct.PropertyProvider/filter:method"}}{{/crossLink}} method,
	   *  called with the same arguments returns true.
	   * </p>
	   * <p>
	   *  Abstract - must be implemented in an extender.
	   * </p>
	   *
	   * @for ProAct.PropertyProvider
	   * @abstract
	   * @instance
	   * @method provide
	   * @param {String} queueName
	   *      The name of the queue all the updates should be pushed to.
	   *      <p>
	   *        If this parameter is null/undefined the default queue of
	   *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
	   *      </p>
	   * @param {Object} object
	   *      The object to which a new {{#crossLink "ProAct.Property"}}{{/crossLink}} instance should be provided.
	   * @param {String} property
	   *      The field of the <i>object</i> to turn into a {{#crossLink "ProAct.Property"}}{{/crossLink}}. Can be used in the filtering process.
	   * @param {String|Array} meta
	   *      Meta information to be used for filtering and configuration of the {{#crossLink "ProAct.Property"}}{{/crossLink}} instance to be provided.
	   * @return {ProAct.Property}
	   *      A property provided by <i>this</i> provider.
	   */
	  provide: function (queueName, object, property, meta) {
	    throw new Error('Abstract! Implement!');
	  }
	};
	
	/**
	 * <p>
	 *  Constructor for `ProAct.SimplePropertyProvider`.
	 * </p>
	 * <p>
	 *  Provides {{#crossLink "ProAct.Property"}}{{/crossLink}} instances for fields of simple types - strings, numbers, booleans.
	 * </p>
	 * <p>
	 *  `ProAct.SimplePropertyProvider` is part of the proact-properties module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.SimplePropertyProvider
	 * @extends ProAct.PropertyProvider
	 * @constructor
	 */
	ProAct.SimplePropertyProvider = P.SPP = function () {
	  P.PP.call(this);
	};
	
	ProAct.SimplePropertyProvider.prototype = P.U.ex(Object.create(P.PP.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.SimplePropertyProvider
	   * @final
	   * @for ProAct.SimplePropertyProvider
	   */
	  constructor: ProAct.SimplePropertyProvider,
	
	  /**
	   * Used to check if this `ProAct.SimplePropertyProvider` is compliant with the field and meta data.
	   *
	   * @for ProAct.SimplePropertyProvider
	   * @instance
	   * @method filter
	   * @param {Object} object
	   *      The object to which a new {{#crossLink "ProAct.Property"}}{{/crossLink}} instance should be provided.
	   * @param {String} property
	   *      The field name of the <i>object</i> to turn into a {{#crossLink "ProAct.Property"}}{{/crossLink}}. Can be used in the filtering process.
	   * @param {String|Array} meta
	   *      Meta information to be used for filtering and configuration of the {{#crossLink "ProAct.Property"}}{{/crossLink}} instance to be provided.
	   * @return {Boolean}
	   *      True if the value of <b>object[property]</b> not undefined or null as well as object, array ot function.
	   */
	  filter: function (object, property, meta) {
	    var v = object[property];
	    return (v === null || v === undefined) || (!P.U.isFunction(v) && !P.U.isArray(v) && !P.U.isObject(v));
	  },
	
	  /**
	   * Provides an instance of {{#crossLink "ProAct.Property"}}{{/crossLink}}.
	   *
	   * @for ProAct.SimplePropertyProvider
	   * @instance
	   * @method provide
	   * @param {String} queueName
	   *      The name of the queue all the updates should be pushed to.
	   *      <p>
	   *        If this parameter is null/undefined the default queue of
	   *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
	   *      </p>
	   * @param {Object} object
	   *      The object to which a new {{#crossLink "ProAct.Property"}}{{/crossLink}} instance should be provided.
	   * @param {String} property
	   *      The field of the <i>object</i> to turn into a {{#crossLink "ProAct.Property"}}{{/crossLink}}.
	   * @param {String|Array} meta
	   *      Meta information to be used for filtering and configuration of the {{#crossLink "ProAct.Property"}}{{/crossLink}} instance to be provided.
	   * @return {ProAct.Property}
	   *      A {{#crossLink "ProAct.Property"}}{{/crossLink}} instance provided by <i>this</i> provider.
	   */
	  provide: function (queueName, object, property, meta) {
	    return new P.P(queueName, object, property);
	  }
	});
	
	/**
	 * <p>
	 *  Constructor for `ProAct.AutoPropertyProvider`.
	 * </p>
	 * <p>
	 *  Provides {{#crossLink "ProAct.AutoProperty"}}{{/crossLink}} instances for fields pointing to functions.
	 * </p>
	 * <p>
	 *  `ProAct.AutoPropertyProvider` is part of the `proact-properties` module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.AutoPropertyProvider
	 * @extends ProAct.PropertyProvider
	 * @constructor
	 */
	ProAct.AutoPropertyProvider = P.FPP = function () {
	  P.PP.call(this);
	};
	
	ProAct.AutoPropertyProvider.prototype = P.U.ex(Object.create(P.PP.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.AutoPropertyProvider
	   * @final
	   * @for ProAct.AutoPropertyProvider
	   */
	  constructor: ProAct.AutoPropertyProvider,
	
	  /**
	   * Used to check if this `ProAct.AutoPropertyProvider` is compliant with the field and meta data.
	   *
	   * @for ProAct.AutoPropertyProvider
	   * @instance
	   * @method filter
	   * @param {Object} object
	   *      The object to which a new {{#crossLink "ProAct.AutoProperty"}}{{/crossLink}} instance should be provided.
	   * @param {String} property
	   *      The field name of the <i>object</i> to turn into a {{#crossLink "ProAct.AutoProperty"}}{{/crossLink}}.
	   * @param {String|Array} meta
	   *      Meta information to be used for filtering and configuration of the {{#crossLink "ProAct.AutoProperty"}}{{/crossLink}} instance to be provided.
	   * @return {Boolean}
	   *      True if the value of <b>object[property]</b> a function.
	   */
	  filter: function (object, property, meta) {
	    return P.U.isFunction(object[property]);
	  },
	
	  /**
	   * Provides an instance of {{#crossLink "ProAct.AutoProperty"}}{{/crossLink}}.
	   *
	   * @for ProAct.AutoPropertyProvider
	   * @instance
	   * @method provide
	   * @param {String} queueName
	   *      The name of the queue all the updates should be pushed to.
	   *      <p>
	   *        If this parameter is null/undefined the default queue of
	   *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
	   *      </p>
	   * @param {Object} object
	   *      The object to which a new {{#crossLink "ProAct.AutoProperty"}}{{/crossLink}} instance should be provided.
	   * @param {String} property
	   *      The field of the <i>object</i> to turn into a {{#crossLink "ProAct.AutoProperty"}}{{/crossLink}}.
	   * @param {String|Array} meta
	   *      Meta information to be used for filtering and configuration of the {{#crossLink "ProAct.AutoProperty"}}{{/crossLink}} instance to be provided.
	   * @return {ProAct.AutoProperty}
	   *      A {{#crossLink "ProAct.AutoProperty"}}{{/crossLink}} instance provided by <i>this</i> provider.
	   */
	  provide: function (queueName, object, property, meta) {
	    return new P.FP(queueName, object, property);
	  }
	});
	
	/**
	 * <p>
	 *  Constructor for ProAct.ObjectPropertyProvider.
	 * </p>
	 * <p>
	 *  Provides {{#crossLink "ProAct.ObjectProperty"}}{{/crossLink}} instances for fields pointing to objects, different from arrays or functions.
	 * </p>
	 * <p>
	 *  `ProAct.ObjectPropertyProvider` is part of the proact-properties module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.ObjectPropertyProvider
	 * @extends ProAct.PropertyProvider
	 * @constructor
	 */
	ProAct.ObjectPropertyProvider = P.OPP = function () {
	  P.PP.call(this);
	};
	
	ProAct.ObjectPropertyProvider.prototype = P.U.ex(Object.create(P.PP.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.ObjectPropertyProvider
	   * @final
	   * @for ProAct.ObjectPropertyProvider
	   */
	  constructor: ProAct.ObjectPropertyProvider,
	
	  /**
	   * Used to check if this `ProAct.ObjectPropertyProvider` is compliant with the field and meta data.
	   *
	   * @for ProAct.ObjectPropertyProvider
	   * @instance
	   * @method filter
	   * @param {Object} object
	   *      The object to which a new {{#crossLink "ProAct.ObjectProperty"}}{{/crossLink}} instance should be provided.
	   * @param {String} property
	   *      The field name of the <i>object</i> to turn into a {{#crossLink "ProAct.ObjectProperty"}}{{/crossLink}}.
	   * @param {String|Array} meta
	   *      Meta information to be used for filtering and configuration of the {{#crossLink "ProAct.ObjectProperty"}}{{/crossLink}} instance to be provided.
	   * @return {Boolean}
	   *      True if the value of <b>object[property]</b> an object, different from array or function.
	   */
	  filter: function (object, property, meta) {
	    return P.U.isObject(object[property]);
	  },
	
	  /**
	   * Provides an instance of {{#crossLink "ProAct.ObjectProperty"}}{{/crossLink}}.
	   *
	   * @for ProAct.ObjectPropertyProvider
	   * @instance
	   * @method provide
	   * @param {String} queueName
	   *      The name of the queue all the updates should be pushed to.
	   *      <p>
	   *        If this parameter is null/undefined the default queue of
	   *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
	   *      </p>
	   * @param {Object} object
	   *      The object to which a new {{#crossLink "ProAct.ObjectProperty"}}{{/crossLink}} instance should be provided.
	   * @param {String} property
	   *      The field of the <i>object</i> to turn into a {{#crossLink "ProAct.ObjectProperty"}}{{/crossLink}}.
	   * @param {String|Array} meta
	   *      Meta information to be used for filtering and configuration of the {{#crossLink "ProAct.ObjectProperty"}}{{/crossLink}} instance to be provided.
	   * @return {ProAct.ObjectProperty}
	   *      A {{#crossLink "ProAct.ObjectProperty"}}{{/crossLink}} instance provided by <i>this</i> provider.
	   */
	  provide: function (queueName, object, property, meta) {
	    return new P.OP(queueName, object, property);
	  }
	});
	
	/**
	 * <p>
	 *  Constructor for `ProAct.ProxyPropertyProvider`.
	 * </p>
	 * <p>
	 *  Provides {{#crossLink "ProAct.ProxyProperty"}}{{/crossLink}} instances for fields that should point to properties.
	 * </p>
	 * <p>
	 *  `ProAct.ProxyPropertyProvider` is part of the proact-properties module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.ProxyPropertyProvider
	 * @extends ProAct.PropertyProvider
	 * @constructor
	 */
	ProAct.ProxyPropertyProvider = P.PXPP = function () {
	  P.PP.call(this);
	};
	
	ProAct.ProxyPropertyProvider.prototype = P.U.ex(Object.create(P.PP.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.ProxyPropertyProvider
	   * @final
	   * @for ProAct.ProxyPropertyProvider
	   */
	  constructor: ProAct.ProxyPropertyProvider,
	
	  /**
	   * Used to check if this `ProAct.ProxyPropertyProvider` is compliant with the meta data.
	   *
	   * @for ProAct.ProxyPropertyProvider
	   * @instance
	   * @method filter
	   * @param {Object} object
	   *      The object to which a new {{#crossLink "ProAct.ProxyProperty"}}{{/crossLink}} instance should be provided.
	   * @param {String} property
	   *      The field name of the <i>object</i> to turn into a {{#crossLink "ProAct.ProxyProperty"}}{{/crossLink}}.
	   * @param {ProAct.Property} meta
	   *      If the meta is present and of type {{#crossLink "ProAct.Property"}}{{/crossLink}}, it becomes the target property of the
	   *      {{#crossLink "ProAct.ProxyProperty"}}{{/crossLink}} that will be provided.
	   * @return {Boolean}
	   *      True if <i>meta</i> argument is present and is instance of {{#crossLink "ProAct.Property"}}{{/crossLink}}.
	   */
	  filter: function (object, property, meta) {
	    if (!meta || !(meta instanceof ProAct.Property)) {
	      return false;
	    }
	
	    return meta instanceof ProAct.Property;
	  },
	
	  /**
	   * Provides an instance of {{#crossLink "ProAct.ProxyProperty"}}{{/crossLink}}.
	   *
	   * @for ProAct.ProxyPropertyProvider
	   * @instance
	   * @method provide
	   * @param {String} queueName
	   *      The name of the queue all the updates should be pushed to.
	   *      <p>
	   *        If this parameter is null/undefined the default queue of
	   *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
	   *      </p>
	   * @param {Object} object
	   *      The object to which a new {{#crossLink "ProAct.ProxyProperty"}}{{/crossLink}} instance should be provided.
	   * @param {String} property
	   *      The field of the <i>object</i> to turn into a {{#crossLink "ProAct.ProxyProperty"}}{{/crossLink}}.
	   * @param {ProAct.Property} meta
	   *      The target {{#crossLink "ProAct.Property"}}{{/crossLink}} of the {{#crossLink "ProAct.ProxyProperty"}}{{/crossLink}} to be created.
	   * @return {ProAct.ProxyProperty}
	   *      A {{#crossLink "ProAct.ProxyProperty"}}{{/crossLink}} instance provided by <i>this</i> provider.
	   */
	  provide: function (queueName, object, property, meta) {
	    return new P.PXP(queueName, object, property, meta);
	  }
	});
	
	P.PP.registerProvider(new P.ProxyPropertyProvider());
	P.PP.registerProvider(new P.SimplePropertyProvider());
	P.PP.registerProvider(new P.AutoPropertyProvider());
	P.PP.registerProvider(new P.ObjectPropertyProvider());
	
	/**
	 * @module proact-properties
	 */
	
	/**
	 * <p>
	 *  Constructs a `ProAct.ObjectCore`.
	 *  `ProAct.ObjectCore` is a {{#crossLink "ProAct.Core"}}{{/crossLink}} that manages all the
	 *  {{#crossLink "ProAct.Property"}}{{/crossLink}} instances for a reactive ProAct.js object.
	 * </p>
	 * <p>
	 *  It is responsible for all the {{#crossLink "ProAct.Property"}}{{/crossLink}} instances as well as
	 *  initializing them and deciding which type of property corresponds to which field.
	 * </p>
	 * <p>
	 *  `ProAct.ObjectCore` is part of the proact-properties module of ProAct.js.
	 * </p>
	 *
	 * ```
	 *  
	 *  var object = {
	 *    a: 4,
	 *    b: 5,
	 *    c: function () {
	 *      return this.a + this.b;
	 *    }
	 *  };
	 *  var core = new ProAct.ObjectCore(object);
	 *
	 *  console.log(object.c); // 9
	 *
	 *  object.a = 1;
	 *  console.log(object.c); // 6
	 *
	 *  console.log(core.value('c')); // 6
	 *
	 *  core.set('b', 2));
	 *  console.log(object.b); // 2
	 *  console.log(object.c); // 3
	 * ```
	 *
	 * @class ProAct.ObjectCore
	 * @extends ProAct.Core
	 * @constructor
	 * @param {Object} object
	 *      The shell objec arround this core. This should be plain JavaScript object.
	 * @param {Object} meta
	 *      Optional meta data to be used to define the observer-observable behavior of the <i>object</i>.
	 *      For example transformations for its properties.
	 */
	function ObjectCore (object, meta) {
	  this.properties = {};
	
	  P.C.call(this, object, meta); // Super!
	};
	ProAct.ObjectCore = P.OC = ObjectCore;
	
	ProAct.ObjectCore.prototype = P.U.ex(Object.create(P.C.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.ObjectCore
	   * @final
	   * @for ProAct.ObjectCore
	   */
	  constructor: ProAct.ObjectCore,
	
	  /**
	   * A function to be set to the <i>shell</i> object's <b>p</b> field (if it is configured in {{#crossLink "ProAct.Configuration"}}{{/crossLink}}).
	   * <p>
	   *  It uses its <i>p</i> argument if it is string to return the right {{#crossLink "ProAct.Property"}}{{/crossLink}} for passed field name.
	   * </p>
	   * <p>
	   *  If the <i>p</i> argument is <b>*</b> or empty <i>this</i> `ProAct.ObjectCore` instance is returned.
	   * </p>
	   *
	   * ```
	   *  core.value('a'); // returns the shell's 'a' value - shell.a.
	   *  core.value('*'); // returns this.
	   *  core.value(); // returns this.
	   * ```
	   *
	   * @for ProAct.ObjectCore
	   * @instance
	   * @method value
	   * @param {String} p
	   *      The name of the managed {{#crossLink "ProAct.Property"}}{{/crossLink}} to retrieve.
	   *      It can be set to <b>*</b> or skipped for <i>this</i> itself to be retrieved.
	   * @return {Object}
	   *      Managed {{#crossLink "ProAct.Property"}}{{/crossLink}} instance with field name equal to the passed <i>p</i> parameter or <i>this</i>.
	   */
	  value: function (p) {
	    if (!p || p === '*') {
	      return this;
	    }
	
	    return this.properties[p];
	  },
	
	  /**
	   * Initializes all the {{#crossLink "ProAct.Property"}}{{/crossLink}} instances for the <i>shell</i>of <i>this</i> ProAct.ObjectCore.
	   * <p>
	   *  Using the types of the fields of the <i>shell</i> object the right {{#crossLink "ProAct.Property"}}{{/crossLink}} instances are created and stored
	   *  in <i>this</i> using {{#crossLink "ProAct.Configuration/makeProp:method"}}{{/crossLink}}.
	   * </p>
	   *
	   * @for ProAct.ObjectCore
	   * @protected
	   * @instance
	   * @method setup
	   */
	  setup: function () {
	    var object = this.shell,
	        property;
	
	    for (property in object) {
	      this.makeProp(property, null, this.meta[property]);
	    }
	  },
	
	  /**
	   * Creates a {{#crossLink "ProAct.Property"}}{{/crossLink}} instance for <i>this</i>'s shell.
	   *
	   * ```
	   *  var shell = {a: 3};
	   *  var core = new ProAct.Core(shell);
	   *
	   *  shell.b = function () { return this.a + 5; };
	   *  core.makeProp('b');
	   *
	   *  console.log(shell.b); // 8
	   *
	   *  shell.a = 5;
	   *  console.log(shell.b); // 10
	   * ```
	   *
	   * @for ProAct.ObjectCore
	   * @instance
	   * @method makeProp
	   * @param {String} property
	   *      The name of the property, the name of the field in the <i>shell</i>.
	   * @param {Array} listeners
	   *      Initial listeners for 'change' of the property, can be skipped.
	   * @param {String|Array} meta
	   *      Meta information for the property to create, for example if the meta contains 'noprop', no property is created,
	   *      and the initial value of the field is preserved.
	   * @return {ProAct.Property}
	   *      The newly crated and stored in <i>this</i> property, or null if no property was created.
	   * @throws {Error}
	   *      If there is no field defined in the <i>shell</i> named as the passed <i>property</i>.
	   */
	  makeProp: function (property, listeners, meta) {
	    var object = this.shell,
	        conf = ProAct.Configuration,
	        keyprops = conf.keyprops,
	        keypropList = conf.keypropList,
	        result;
	
	    if (meta && (meta === 'noprop' || (meta.indexOf && meta.indexOf('noprop') >= 0))) {
	      return null;
	    }
	
	    if (keyprops && keypropList.indexOf(property) !== -1) {
	      throw Error('The property name ' + property + ' is a key word for pro objects! Objects passed to ProAct.prob can not contain properties named as keyword properties.');
	      return null;
	    }
	
	    if (object.hasOwnProperty(property)) {
	      result = P.PP.provide(this.queueName, object, property, meta);
	    }
	
	    if (!result) {
	      return null;
	    }
	
	    if (listeners) {
	      this.properties[property].listeners.change = this.properties[property].listeners.change.concat(listeners);
	    }
	
	    this.applyMeta(meta, result);
	
	    return result;
	  },
	
	  /**
	   * Applies meta information and actions on already created property.
	   *
	   * This method is called by the {{#crossLink "ProAct.ObjectCore/makeProp:method"}}{{/crossLink}} one,
	   * other modules can inject logic by overriding it.
	   *
	   * @for ProAct.ObjectCore
	   * @protected
	   * @instance
	   * @method applyMeta
	   * @param {String|Array} meta
	   *      Meta information for the property to modify with.
	   * @param {ProAct.Property} property
	   *      The property to update.
	   */
	  applyMeta: function (meta, property) {
	  },
	
	  /**
	   * Sets the value of a managed property. The interesting thing here is that
	   * if the property does not exist this method creates it and stores a new field in the <i>shell</i> object
	   * with the passed <i>value</i>.
	   * <p>
	   *  The new field is reactive.
	   * </p>
	   *
	   * ```
	   *  var shell = {a: 3};
	   *  var core = new ProAct.Core(shell);
	   *
	   *  core.set('b', function () { return this.a + 5; });
	   *
	   *  console.log(shell.b); // 8
	   *
	   *  shell.a = 5;
	   *  console.log(shell.b); // 10
	   * ```
	   *
	   * @for ProAct.ObjectCore
	   * @instance
	   * @method set
	   * @param {String} property
	   *      The name of the property to update/create.
	   * @param {Object} value
	   *      The value of the property to be set.
	   */
	  set: function (property, value) {
	    var object = this.shell;
	
	    object[property] = value;
	    if (this.properties[property]) {
	      return;
	    }
	
	    this.makeProp(property);
	  }
	});
	
	function ObjectProbProvider () {
	};
	
	ObjectProbProvider.prototype = P.U.ex(Object.create(P.ProbProvider.prototype), {
	  constructor: ObjectProbProvider,
	  filter: function (data, meta) {
	    return P.U.isObject(data) && !P.U.isArray(data);
	  },
	  provide: function (data, meta) {
	    var core = new P.OC(data, meta);
	    P.U.defValProp(data, '__pro__', false, false, false, core);
	
	    core.prob();
	
	    return data;
	  }
	});
	
	P.ProbProvider.register(new ObjectProbProvider());
	
	/**
	 * @module proact-properties
	 */
	
	/**
	 * The `ProAct.proxy` creates proxies or decorators to ProAct.js objects.
	 * <p>
	 *  The decorators extend the <i>target</i> and can add new properties which depend on the extended ones.
	 * </p>
	 *
	 * @for ProAct
	 * @method proxy
	 * @static
	 * @param {Object} object
	 *      The object/value to make decorator to the <i>target</i>.
	 * @param {Object} target
	 *      The object to decorate.
	 * @param {Object|String} meta
	 *      Meta-data used to help in the reactive object creation for the proxy.
	 * @param {Object|String} targetMeta
	 *      Meta-data used to help in the reactive object creation for the target, if it is not reactive.
	 * @return {Object}
	 *      Reactive representation of the passed <i>object</i>, decorating the passed <i>target</i>.
	 */
	function proxy (object, target, meta, targetMeta) {
	  if (!object || !target) {
	    return null;
	  }
	
	  if (!P.U.isProObject(target)) {
	    target = ProAct.prob(target, targetMeta);
	  }
	
	  if (!meta || !P.U.isObject(meta)) {
	    meta = {};
	  }
	
	  var properties = target.__pro__.properties,
	      property;
	
	  for (property in properties) {
	    if (!object.hasOwnProperty(property)) {
	      object[property] = null;
	      meta[property] = properties[property];
	    }
	  }
	
	  object = ProAct.prob(object, meta);
	
	  return object;
	}
	ProAct.proxy = proxy;
	
	/**
	 * Checks if the passed value is a valid ProAct.js object or not.
	 * ProAct.js object have a special `__pro__` object that is hidden in them, which should be instance of {{#crossLink "ProAct.Core"}}{{/crossLink}}.
	 *
	 * @method isProObject
	 * @param {Object} value The value to check.
	 * @return {Boolean} True if the value is object containing {{#crossLink "ProAct.Property"}}{{/crossLink}} instances and has a `core`.
	 */
	function isProObject (value) {
	  return value && ProAct.U.isObject(value) && value.__pro__ !== undefined && ProAct.U.isObject(value.__pro__.properties);
	}
	
	ProAct.Utils.isProObject = isProObject;
	
	/**
	 * <p>
	 *  Represents the current caller of a method, the initiator of the current action.
	 * </p>
	 * <p>
	 *  This property does the magic when for example an {{#crossLink "ProAct.AutoProperty"}}{{/crossLink}} is called
	 *  for the first time and the dependencies to the other properties are created.
	 *  The current caller expects to be used in a single threaded environment.
	 * </p>
	 * <p>
	 *  Do not remove or modify this property manually.
	 * </p>
	 *
	 * @property currentCaller
	 * @type Object
	 * @default null
	 * @static
	 * @for ProAct
	 */
	ProAct.currentCaller = null;
	
	/**
	 * Contains a set of utility functions to ease working with {{#crossLink "ProAct.Array"}}{{/crossLink}}s.
	 * Can be reffered by using `ProAct.AU` too.
	 *
	 * This class is part of the `proact-arrays` module of ProAct.js.
	 *
	 * @namespace ProAct
	 * @class ArrayUtils
	 * @static
	 */
	ProAct.ArrayUtils = Pro.AU = {
	
	  /**
	   * Checks if the passed value is instance of the {{#crossLink "ProAct.Array"}}{{/crossLink}} type or not.
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
	   *
	   * @method isArrayObject
	   * @param {Object} value The value to check.
	   * @return {Boolean} True if the passed `value` is an Array or ProAct.Array instance.
	   */
	  isArrayObject: function (value) {
	    return P.U.isArray(value) || P.ArrayUtils.isProArray(value);
	  }
	
	};
	
	/**
	 * @module proact-arrays
	 */
	
	/**
	 * <p>
	 *  Constructs a `ProAct.ArrayProperty`.
	 *  A property is a simple {{#crossLink "ProAct.Actor"}}{{/crossLink}} with state.
	 * </p>
	 * <p>
	 *  The value of `ProAct.ArrayProperty` is an array, turned to reactive ProAct.js array -
	 *  {{#crossLink "ProAct.Array"}}{{/crossLink}}.
	 * </p>
	 * <p>
	 *  On changing the array value to another array the listeners for indices/length are moved from the old value to the new value.
	 * </p>
	 * <p>
	 *  If set to null or undefined, the property is re-defined, using
	 *  {{#crossLink "ProAct.Property/reProb:method"}}{{/crossLink}}.
	 * </p>
	 * <p>
	 *  `ProAct.ArrayProperty` is lazy - its object is made reactive on the first read of the property.
	 *  Its state is set to {{#crossLink "ProAct.States/ready:property"}}{{/crossLink}} on the first read too.
	 * </p>
	 * <p>
	 *  `ProAct.ArrayProperty` is part of the proact-arrays module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.ArrayProperty
	 * @extends ProAct.Property
	 * @constructor
	 * @param {String} queueName
	 *      The name of the queue all the updates should be pushed to.
	 *      <p>
	 *        If this parameter is null/undefined the default queue of
	 *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
	 *      </p>
	 *      <p>
	 *        If this parameter is not a string it is used as the
	 *        <i>proObject</i>.
	 *      </p>
	 * @param {Object} proObject
	 *      A plain JavaScript object, holding a field, this property will represent.
	 * @param {String} property
	 *      The name of the field of the object, this property should represent.
	 */
	function ArrayProperty (queueName, proObject, property) {
	  if (queueName && !P.U.isString(queueName)) {
	    property = proObject;
	    proObject = queueName;
	    queueName = null;
	  }
	
	  var self = this, getter;
	
	  getter = function () {
	    var isPA = P.AU.isProArray;
	
	    self.addCaller();
	    if (!isPA(self.val)) {
	      self.val = new P.A(self.val);
	    }
	
	    var get = P.P.defaultGetter(self),
	        set = function (newVal) {
	          if (self.val == newVal || self.val.valueOf() == newVal) {
	            return;
	          }
	
	          self.oldVal = self.val;
	          self.val = newVal;
	
	          if (self.val === null || self.val === undefined) {
	            P.P.reProb(self).update();
	            return self;
	          }
	
	          if (!isPA(self.val)) {
	            self.val = new P.A(self.val);
	            if (queueName) {
	              self.val.core.queueName = queueName;
	            }
	          }
	
	          if (self.oldVal) {
	            var i, listener,
	                toRemove = [], toRemoveLength,
	                oldIndListeners = self.oldVal.__pro__.listeners.index,
	                oldIndListenersLn = oldIndListeners.length,
	                newIndListeners = self.val.__pro__.listeners.index,
	                oldLenListeners = self.oldVal.__pro__.listeners.length,
	                oldLenListenersLn = oldLenListeners.length,
	                newLenListeners = self.val.__pro__.listeners.length;
	
	            for (i = 0; i < oldIndListenersLn; i++) {
	              listener = oldIndListeners[i];
	              if (listener.property && listener.property.proObject === self.proObject) {
	                newIndListeners.push(listener);
	                toRemove.push(i);
	              }
	            }
	            toRemoveLength = toRemove.length;
	            for (i = 0; i < toRemoveLength; i++) {
	              oldIndListeners.splice[toRemove[i], 1];
	            }
	            toRemove = [];
	
	            for (i = 0; i < oldLenListenersLn; i++) {
	              listener = oldLenListeners[i];
	              if (listener.property && listener.property.proObject === self.proObject) {
	                newLenListeners.push(listener);
	                toRemove.push(i);
	              }
	            }
	            toRemoveLength = toRemove.length;
	            for (i = 0; i < toRemoveLength; i++) {
	              oldLenListeners.splice[toRemove[i], 1];
	            }
	            toRemove = [];
	          }
	
	          ActorUtil.update.call(self);
	        };
	
	    P.P.defineProp(self.proObject, self.property, get, set);
	
	    self.state = P.States.ready;
	    return self.val;
	  };
	
	  P.P.call(this, queueName, proObject, property, getter, function () {});
	}
	ProAct.ArrayProperty = P.AP = ArrayProperty;
	
	ProAct.ArrayProperty.prototype = P.U.ex(Object.create(P.P.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.ArrayProperty
	   * @final
	   * @for ProAct.ArrayProperty
	   */
	  constructor: ProAct.ArrayProperty,
	
	  /**
	   * Retrieves the {{#crossLink "ProAct.Property.Types"}}{{/crossLink}} value of <i>this</i> property.
	   * <p>
	   *  For instances of the `ProAct.ArrayProperty` class, it is
	   *  {{#crossLink "ProAct.Property.Types/array:property"}}{{/crossLink}}.
	   * </p>
	   *
	   * @for ProAct.ArrayProperty
	   * @instance
	   * @method type
	   * @return {Number}
	   *      The right type of the property.
	   */
	  type: function () {
	    return P.P.Types.array;
	  },
	
	  /**
	   * Called automatically after initialization of this property.
	   * <p>
	   *  For `ProAct.ArrayProperty` it does nothing -
	   *  the real initialization is lazy and is performed on the first read of <i>this</i>.
	   * </p>
	   *
	   * @for ProAct.ArrayProperty
	   * @protected
	   * @instance
	   * @method afterInit
	   */
	  afterInit: function () {}
	});
	
	/**
	 * <p>
	 *  Constructor for `ProAct.ArrayPropertyProvider`.
	 * </p>
	 * <p>
	 *  Provides {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}} instances for fields pointing to arrays.
	 * </p>
	 * <p>
	 *  `ProAct.ArrayPropertyProvider` is part of the proact-properties module of ProAct.js.
	 * </p>
	 *
	 * @for ProAct.ArrayPropertyProvider
	 * @extends ProAct.PropertyProvider
	 * @constructor
	 */
	ProAct.ArrayPropertyProvider = P.APP = function () {
	  P.PP.call(this);
	};
	
	ProAct.ArrayPropertyProvider.prototype = P.U.ex(Object.create(P.PP.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.ArrayPropertyProvider
	   * @final
	   * @for ProAct.ArrayPropertyProvider
	   */
	  constructor: ProAct.ArrayPropertyProvider,
	
	  /**
	   * Used to check if this `ProAct.ArrayPropertyProvider` is compliant with the field and meta data.
	   *
	   * @for ProAct.ArrayPropertyProvider
	   * @instance
	   * @method filter
	   * @param {Object} object
	   *      The object to which a new {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}} instance should be provided.
	   * @param {String} property
	   *      The field name of the <i>object</i> to turn into a {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}}.
	   * @param {String|Array} meta
	   *      Meta information to be used for filtering and configuration of the {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}} instance to be provided.
	   * @return {Boolean}
	   *      True if the value of <b>object[property]</b> an array.
	   */
	  filter: function (object, property, meta) {
	    return P.AU.isArrayObject(object[property]);
	  },
	
	  /**
	   * Provides an instance of {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}}.
	   *
	   * @for ProAct.ArrayPropertyProvider
	   * @instance
	   * @method provide
	   * @param {String} queueName
	   *      The name of the queue all the updates should be pushed to.
	   *      <p>
	   *        If this parameter is null/undefined the default queue of
	   *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
	   *      </p>
	   * @param {Object} object
	   *      The object to which a new {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}} instance should be provided.
	   * @param {String} property
	   *      The field of the <i>object</i> to turn into a {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}}.
	   * @param {String|Array} meta
	   *      Meta information to be used for filtering and configuration of the {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}} instance to be provided.
	   * @return {ProAct.ArrayProperty}
	   *      A {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}} instance provided by <i>this</i> provider.
	   */
	  provide: function (queueName, object, property, meta) {
	    return new P.AP(queueName, object, property);
	  }
	});
	
	P.PP.registerProvider(new P.ArrayPropertyProvider());
	
	var oldTypeFunction = P.P.Types.type;
	P.U.ex(P.Property.Types, {
	
	    /**
	     * ProAct.Property for array types - fields containing arrays.
	     *
	     * @property array
	     * @type Number
	     * @final
	     * @for ProAct.Property.Types
	     */
	    array: {}, // arrays
	
	    type: function (value) {
	      if (P.U.isArray(value)) {
	        return P.P.Types.array;
	      }
	
	      return oldTypeFunction(value);
	    }
	
	});
	
	/**
	 * The `proact-arrays` module provides reactive arrays.
	 * All the modification operations over arrays, like `push` for example could be listened to.
	 *
	 *
	 * @module proact-arrays
	 * @main proact-arrays
	 */
	
	/**
	 * <p>
	 *  Constructs a `ProAct.ArrayCore`. `ProAct.ArrayCore` is a {{#crossLink "ProAct.Core"}}{{/crossLink}} that manages all the updates/listeners for an `ProAct.Array`.
	 * </p>
	 * <p>
	 *  It is responsible for updating length or index listeners and adding the right ones on read.
	 * </p>
	 * <p>
	 *  `ProAct.ArrayCore` is part of the `proact-arrays` module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.ArrayCore
	 * @constructor
	 * @extends ProAct.Core
	 * @param {Object} array
	 *      The shell {{#crossLink "ProAct.Array"}}{{/crossLink}} arround this core.
	 * @param {Object} meta
	 *      Optional meta data to be used to define the observer-observable behavior of the <i>array</i>.
	 */
	ProAct.ArrayCore = P.AC = function (array, meta) {
	  P.C.call(this, array, meta); // Super!
	
	  this.lastIndexCaller = null;
	  this.lastLengthCaller = null;
	};
	
	ProAct.ArrayCore.prototype = P.U.ex(Object.create(P.C.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.ArrayCore
	   * @final
	   * @for ProAct.ArrayCore
	   */
	  constructor: ProAct.ArrayCore,
	
	  /**
	   * Generates function wrapper around a normal function which sets
	   * the {{#crossLink "ProAct.ArrayCore/indexListener:method"}}{{/crossLink}} of the index calling the function.
	   * <p>
	   *  This is used if the array is complex - contains other ProAct.js objects, and there should be special
	   *  updates for their elements/properties.
	   * </p>
	   *
	   * @for ProAct.ArrayCore
	   * @instance
	   * @method actionFunction
	   * @param {Function} fun
	   *      The source function.
	   * @return {Function}
	   *      The action function wrapper.
	   */
	  actionFunction: function (fun) {
	    var core = this;
	    return function () {
	      var oldCaller = P.currentCaller,
	          i = arguments[1], res;
	
	      P.currentCaller = core.indexListener(i);
	      res = fun.apply(this, slice.call(arguments, 0));
	      P.currentCaller = oldCaller;
	
	      return res;
	    };
	  },
	
	  /**
	   * Generates listener for given index or reuses already generated one.
	   * <p>
	   *  This listener mimics a property listener, the idea is - if anything is listening to
	   *  index changes in this' shell (array) and the shell is complex - has elements that are ProAct.js objects,
	   *  if some of this element has property change, its notification should be dispatched to all the objects,
	   *  listening to index changes in the array.
	   * </p>
	   * <p>
	   *  So this way we can listen for stuff like array.[].foo - the foo property change for every element in the array.
	   * </p>
	   *
	   * @for ProAct.ArrayCore
	   * @instance
	   * @protected
	   * @method indexListener
	   * @param {Number} i
	   *      The index.
	   * @return {Object}
	   *      A listener mimicing a property one.
	   */
	  indexListener: function (i) {
	    if (!this.indexListeners) {
	      this.indexListeners = {};
	    }
	
	    var core = this,
	        shell = core.shell;
	    if (!this.indexListeners[i]) {
	      this.indexListeners[i] = {
	        call: function (source) {
	          core.makeListener(new P.E(source, shell, P.E.Types.array, [
	            P.A.Operations.set, i, shell._array[i], shell._array[i]
	          ]));
	        },
	        property: core
	      };
	    }
	
	    return this.indexListeners[i];
	  },
	
	  /**
	   * Creates the <i>listener</i> of this `ProAct.ArrayCore`.
	   * <p>
	   *  The right array typed events can change this' shell (array).
	   * </p>
	   * <p>
	   *  If a non-event element is passed to the listener, the element is pushed
	   *  to the shell.
	   * </p>
	   * <p>
	   *  If a value event is passed to the listener, the new value is pushed
	   *  to the shell.
	   * </p>
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @protected
	   * @method makeListener
	   * @return {Object}
	   *      The <i>listener of this ArrayCore</i>.
	   */
	  makeListener: function () {
	    if (!this.listener) {
	      var self = this.shell;
	      this.listener =  {
	        queueName: this.queueName,
	        call: function (event) {
	          if (!event || !(event instanceof P.E)) {
	            self.push(event);
	            return;
	          }
	
	          if (event.type === P.E.Types.value) {
	            self.push(event.args[2]);
	            return;
	          }
	
	          var op    = event.args[0],
	              ind   = event.args[1],
	              ov    = event.args[2],
	              nv    = event.args[3],
	              nvs,
	              operations = P.Array.Operations;
	
	          if (op === operations.set) {
	            self[ind] = nv;
	          } else if (op === operations.add) {
	            nvs = slice.call(nv, 0);
	            if (ind === 0) {
	              pArrayProto.unshift.apply(self, nvs);
	            } else {
	              pArrayProto.push.apply(self, nvs);
	            }
	          } else if (op === operations.remove) {
	            if (ind === 0) {
	              self.shift();
	            } else {
	              self.pop();
	            }
	          } else if (op === operations.setLength) {
	            self.length = nv;
	          } else if (op === operations.reverse) {
	            self.reverse();
	          } else if (op === operations.sort) {
	            if (P.U.isFunction(nv)) {
	              self.sort(nv);
	            } else {
	              self.sort();
	            }
	          } else if (op === operations.splice) {
	            if (nv) {
	              nvs = slice.call(nv, 0);
	            } else {
	              nvs = [];
	            }
	            if (ind === null || ind === undefined) {
	              ind = self.indexOf(ov[0]);
	              if (ind === -1) {
	                return;
	              }
	            }
	            pArrayProto.splice.apply(self, [ind, ov.length].concat(nvs));
	          }
	        }
	      };
	    }
	
	    return this.listener;
	  },
	
	  /**
	   * Generates the initial listeners object.
	   * It is used for resetting all the listeners too.
	   * <p>
	   *  For `ProAct.ArrayCore` the default listeners object is
	   *  <pre>
	   *    {
	   *      index: [],
	   *      length: []
	   *    }
	   *  </pre>
	   * </p>
	   *
	   * @for ProAct.ArrayCore
	   * @protected
	   * @instance
	   * @method defaultListeners
	   * @return {Object}
	   *      A map containing the default listeners collections (index and length type of listeners).
	   */
	  defaultListeners: function () {
	    return {
	      index: [],
	      length: []
	    };
	  },
	
	  /**
	   * A list of actions or action to be used when no action is passed for the methods working with actions.
	   * <p>
	   *  For `ProAct.ArrayCore` these are both 'length' and 'index' actions.
	   * </p>
	   *
	   * @for ProAct.ArrayCore
	   * @protected
	   * @instance
	   * @method defaultActions
	   * @default ['length', 'index']
	   * @return {Array}
	   *      The actions to be used if no actions are provided to action related methods,
	   *      like {{#crossLink "ProAct.Actor/on:method"}}{{/crossLink}}, {{#crossLink "ProAct.Actor/off:method"}}{{/crossLink}}, {{#crossLink "ProAct.Actor/update:method"}}{{/crossLink}}, {{#crossLink "ProAct.Actor/willUpdate:method"}}{{/crossLink}}.
	   */
	  defaultActions: function () {
	    return ['length', 'index'];
	  },
	
	  /**
	   * Creates the <i>event</i> to be send to the listeners on update.
	   * <p>
	   *  By default this method returns {{#crossLink "ProAct.Event.Types/array:property"}}{{/crossLink}} event.
	   * </p>
	   *
	   * @for ProAct.ArrayCore
	   * @instance
	   * @protected
	   * @method makeEvent
	   * @default {ProAct.Event} with type {{#crossLink "ProAct.Event.Types/array:property"}}{{/crossLink}}
	   * @param {ProAct.Event} source
	   *      The source event of the event. It can be null
	   * @param {Array} eventData
	   *      An array of four elements describing the changes:
	   *      <ol>
	   *        <li>{{#crossLink "ProAct.Array.Operations"}}{{/crossLink}} member defining the changing operation - for example {{#crossLink "ProAct.Array.Operations/add:property"}}{{/crossLink}}</li>
	   *        <li>The index on which the chage occures.</li>
	   *        <li>The old values beginning from the index.</li>
	   *        <li>The new values beginning from the index.</li>
	   *      </ol>
	   *      Can be null. If null an empty (unchanging) event is created.
	   * @return {ProAct.Event}
	   *      The event.
	   */
	  makeEvent: function (source, eventData) {
	    if (!eventData) {
	      return new P.E(source, this.shell, P.E.Types.array, pArrayOps.setLength, -1, this.shell.length, this.shell.length);
	    }
	
	    var op = eventData[0],
	        ind = eventData[1],
	        oldVal = eventData[2],
	        newVal = eventData[3];
	
	    return new P.E(source, this.shell, P.E.Types.array, op, ind, oldVal, newVal);
	  },
	
	  /**
	   * Uses {{#crossLink "ProAct/currentCaller:property"}}{{/crossLink}} to automatically add a new listener to this property if the caller is set.
	   * <p>
	   *  This method is used by the index getters or the length getter to make every reader of the length/index a listener to it.
	   * </p>
	   *
	   * @for ProAct.ArrayCore
	   * @protected
	   * @instance
	   * @method addCaller
	   * @param {String} type
	   *      If the caller should be added as an 'index' listener or a 'length' listener. If skipped or null it is added as both.
	   */
	  addCaller: function (type) {
	    if (!type) {
	      this.addCaller('index');
	      this.addCaller('length');
	      return;
	    }
	
	    var caller = P.currentCaller,
	        capType = type.charAt(0).toUpperCase() + type.slice(1),
	        lastCallerField = 'last' + capType + 'Caller',
	        lastCaller = this[lastCallerField];
	
	    if (caller && lastCaller !== caller) {
	      this.on(type, caller);
	      this[lastCallerField] = caller;
	    }
	  },
	
	  /**
	   * Special update method for updating listeners after a {{#crossLink "ProAct.Array/splice:method"}}{{/crossLink}} call.
	   * <p>
	   *  Depending on the changes the index listeners, the length listeners or both can be notified.
	   * </p>
	   *
	   * @for ProAct.ArrayCore
	   * @instance
	   * @method updateSplice
	   * @param {Number} index
	   *      The index of the splice operation.
	   * @param {Array} spliced
	   *      A list of the deleted items. Can be empty.
	   * @param {Array} newItems
	   *      A list of the newly added items. Can be empty.
	   * @return {ProAct.ArrayCore}
	   *      <i>this</i>
	   */
	  updateSplice: function (index, spliced, newItems) {
	    var actions, op = pArrayOps.splice;
	
	    if (!spliced || !newItems || (spliced.length === 0 && newItems.length === 0)) {
	      return;
	    }
	
	    if (spliced.length === newItems.length) {
	      actions = 'index';
	    } else if (!newItems.length || !spliced.length) {
	      actions = 'length';
	    }
	
	    return ActorUtil.update.call(this, null, actions, [op, index, spliced, newItems]);
	  },
	
	  /**
	   * Special update method for updating listeners by comparrison to another array.
	   * <p>
	   *  For every difference between <i>this shell</i>'s array and the passed one, there will be listeners notification.
	   * </p>
	   *
	   * @for ProAct.ArrayCore
	   * @instance
	   * @method updateByDiff
	   * @param {Array} array
	   *      The array to compare to.
	   * @return {ProAct.ArrayCore}
	   *      <i>this</i>
	   */
	  updateByDiff: function (array) {
	    var j, diff = P.U.diff(array, this.shell._array), cdiff;
	
	    for (j in diff) {
	      cdiff = diff[j];
	      if (cdiff) {
	        this.updateSplice(j, cdiff.o, cdiff.n);
	      }
	    }
	
	    return this;
	  },
	
	  /**
	   * Initializes all the index accessors and the length accessor for <i>this's shell array</i>.
	   * <p>
	   *  For the length on every read, the {{#crossLink "ProAct/currentCaller:property"}}{{/crossLink}} is added as a 'length' listener.
	   * </p>
	   * <p>
	   *  For every index on every read, the {{#crossLink "ProAct/currentCaller:property"}}{{/crossLink}} is added as an 'index' listener.
	   *  Listener accessors are defined using {{#crossLink "ProAct.ArrayCore/defineIndexProp:method"}}{{/crossLink}}.
	   * </p>
	   * <p>
	   *  {{#crossLink "ProAct.ArrayCore/addCaller:method"}}{{/crossLink}} is used to retrieve the current caller and add it as the right listener.
	   * </p>
	   * <p>
	   *  Setting values for an index or the length updates the right listeners.
	   * </p>
	   *
	   * @for ProAct.ArrayCore
	   * @protected
	   * @instance
	   * @method setup
	   */
	  setup: function () {
	    var self = this,
	        array = this.shell,
	        ln = array._array.length,
	        getLength, setLength, oldLength, i;
	
	    for (i = 0; i < ln; i++) {
	      this.defineIndexProp(i);
	    }
	
	    getLength = function () {
	      self.addCaller('length');
	
	      return array._array.length;
	    };
	
	    setLength = function (newLength) {
	      if (array._array.length === newLength) {
	        return;
	      }
	
	      oldLength = array._array.length;
	      array._array.length = newLength;
	
	      ActorUtil.update.call(self, null, 'length', [pArrayOps.setLength, -1, oldLength, newLength]);
	
	      return newLength;
	    };
	
	    Object.defineProperty(array, 'length', {
	      configurable: false,
	      enumerable: true,
	      get: getLength,
	      set: setLength
	    });
	  },
	
	  /**
	   * Defines accessors for index of <i>this' shell array</i>.
	   * <p>
	   *  For an index on every read, the {{#crossLink "ProAct/currentCaller:property"}}{{/crossLink}} is added as an 'index' listener.
	   * </p>
	   * <p>
	   *  {{#crossLink "ProAct.ArrayCore/addCaller:method"}}{{/crossLink}} is used to retrieve the current caller and add it as the right listener.
	   * </p>
	   * <p>
	   *  Setting values for an index updates the 'index' listeners.
	   * </p>
	   * <p>
	   *  If on the index is reciding an array or an object, it is turned to reactive object/array.
	   * </p>
	   *
	   * @for ProAct.ArrayCore
	   * @protected
	   * @instance
	   * @method defineIndexProp
	   * @param {Number} i
	   *      The index to define accessor for.
	   */
	  defineIndexProp: function (i) {
	    var self = this,
	        proArray = this.shell,
	        array = proArray._array,
	        oldVal,
	        isA = P.U.isArray,
	        isO = P.U.isObject,
	        isF = P.U.isFunction;
	
	    if (isA(array[i])) {
	      new P.ArrayProperty(array, i);
	    } else if (isF(array[i])) {
	    } else if (array[i] === null) {
	    } else if (isO(array[i])) {
	      this.isComplex = true;
	      new P.ObjectProperty(array, i);
	    }
	
	    Object.defineProperty(proArray, i, {
	      enumerable: true,
	      configurable: true,
	      get: function () {
	        self.addCaller('index');
	
	        return array[i];
	      },
	      set: function (newVal) {
	        if (array[i] === newVal) {
	          return;
	        }
	
	        oldVal = array[i];
	        array[i] = newVal;
	
	        ActorUtil.update.call(self, null, 'index', [pArrayOps.set, i, oldVal, newVal]);
	      }
	    });
	  }
	});
	
	/**
	 * @module proact-arrays
	 */
	
	/**
	 * Creates a wrapper around a plain JavaScript array that is capable of tracking changes on the array and notifying listeners.
	 * <p>
	 *  It has a {{#crossLink "ProAct.ArrayCore"}}{{/crossLink}} which it uses to observe the array for changes or to update the array on changes.
	 * </p>
	 * <p>
	 *  `ProAct.Array` is array-like object, it has all the methods defined in the JavaScript Array class, length property and indices.
	 * </p>
	 * <p>
	 *  `ProAct.Array` is part of the `proact-arrays` module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.Array
	 * @constructor
	 * @extends Array
	 * @param [...]
	 *      I can take an array as a parameter and it becomes reactive wrapper around it.
	 *      It can take a list of arguments which become the wrapped array.
	 *      If nothing is passed it becomes wrapper arround an empty array.
	 */
	ProAct.Array = P.A = pArray = function () {
	  var self = this,
	      getLength, setLength, oldLength,
	      arr, core;
	
	  // Setup _array:
	  if (arguments.length === 0) {
	    arr = [];
	  } else if (arguments.length === 1 && P.U.isArray(arguments[0])) {
	    arr = arguments[0];
	  } else {
	    arr = slice.call(arguments);
	  }
	
	  P.U.defValProp(this, '_array', false, false, true, arr);
	
	  // Setup core:
	  core = new P.AC(this);
	  P.U.defValProp(this, '__pro__', false, false, false, core);
	  P.U.defValProp(this, 'core', false, false, false, core);
	  core.prob();
	};
	
	P.U.ex(P.A, {
	
	  /**
	   * Defines a set of the possible operations over an array.
	   *
	   * @class Operations
	   * @namespace ProAct.Array
	   * @static
	   */
	  Operations: {
	
	    /**
	     * Represents setting a value to an index of an array.
	     * <pre>
	     *  array[3] = 12;
	     * </pre>
	     *
	     * @property set
	     * @type Number
	     * @final
	     * @for ProAct.Array.Operations
	     */
	    set: 0,
	
	    /**
	     * Represents adding values to array.
	     * <pre>
	     *  array.push(12);
	     *  array.unshift(12);
	     * </pre>
	     *
	     * @property add
	     * @type Number
	     * @final
	     * @for ProAct.Array.Operations
	     */
	    add: 1,
	
	    /**
	     * Represents removing values from array.
	     * <pre>
	     *  array.pop();
	     *  array.shift();
	     * </pre>
	     *
	     * @property remove
	     * @type Number
	     * @final
	     * @for ProAct.Array.Operations
	     */
	    remove: 2,
	
	    /**
	     * Represents setting the length of an array.
	     * <pre>
	     *  array.length = 5;
	     * </pre>
	     *
	     * @property setLength
	     * @type Number
	     * @final
	     * @for ProAct.Array.Operations
	     */
	    setLength: 3,
	
	    /**
	     * Represents reversing the element order in an array.
	     * <pre>
	     *  array.reverse();
	     * </pre>
	     *
	     * @property reverse
	     * @type Number
	     * @final
	     * @for ProAct.Array.Operations
	     */
	    reverse: 4,
	
	    /**
	     * Represents sorting the elements in an array.
	     * <pre>
	     *  array.sort();
	     * </pre>
	     *
	     * @property sort
	     * @type Number
	     * @final
	     * @for ProAct.Array.Operations
	     */
	    sort: 5,
	
	    /**
	     * Represents the powerful <i>splice</i> operation.
	     * <pre>
	     *  array.splice(2, 3, 4, 15, 6);
	     * </pre>
	     *
	     * @property splice
	     * @type Number
	     * @final
	     * @for ProAct.Array.Operations
	     */
	    splice: 6,
	  },
	
	  /**
	   * A helper method for filtering an array and notifying the right listeners of the filtered result.
	   * <p>
	   *  This is used if there is an `ProAct.Array` created by filtering another `ProAct.Array`.
	   *  If the original is changed, the filtered array should be changed in some cases.
	   *  So refilter does this - changes the dependent filtered array, using
	   *  {{#crossLink "ProAct.ArrayCore/updateByDiff:method"}}{{/crossLink}}.
	   * </p>
	   *
	   * @for ProAct.Array
	   * @static
	   * @param {ProAct.Array} original
	   *      The original array to filter by.
	   * @param {ProAct.Array} filtered
	   *      The array to be filtered - changed by a filter function, applied on the original.
	   * @param {Array} filterArgs
	   *      Arguments of the filtering - filtering function and data.
	   */
	  reFilter: function (original, filtered, filterArgs) {
	    var oarr = filtered._array;
	
	    filtered._array = filter.apply(original._array, filterArgs);
	    filtered.core.updateByDiff(oarr);
	  }
	});
	pArrayOps = pArray.Operations;
	
	ProAct.Array.prototype = pArrayProto = P.U.ex(Object.create(arrayProto), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.Array
	   * @final
	   * @for ProAct.Array
	   */
	  constructor: ProAct.Array,
	
	  /**
	   * The <b>concat()</b> method returns a new array comprised of this array joined with other array(s) and/or value(s).
	   * <p>
	   *  The result `ProAct.Array` is dependent on <i>this</i>, so if <i>this</i> changes, the concatenation resut will be updated.
	   * </p>
	   * <p>
	   *  If the argument passed is another `ProAct.Array` the result array is dependent on it too.
	   * </p>
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method concat
	   * @param [...]
	   *      Arrays and/or values to concatenate to the resulting array.
	   * @return {ProAct.Array}
	   *      A new `ProAct.Array` consisting of the elements in the <i>this</i> object on which it is called, followed in order by,
	   *      for each argument, the elements of that argument (if the argument is an array) or the argument itself (if the argument is not an array).
	   */
	  concat: function () {
	    var res, rightProArray;
	
	    if (arguments.length === 1 && P.AU.isProArray(arguments[0])) {
	      rightProArray = arguments[0];
	      arguments[0] = rightProArray._array;
	    }
	
	    res = new P.A(concat.apply(this._array, arguments));
	    if (rightProArray) {
	      this.core.on(pArrayLs.leftConcat(res, this, rightProArray));
	      rightProArray.core.on(pArrayLs.rightConcat(res, this, rightProArray));
	    } else {
	      this.core.on(pArrayLs.leftConcat(res, this, slice.call(arguments, 0)));
	    }
	
	    return res;
	  },
	
	  /**
	   * The <b>every()</b> method tests whether all elements in the `ProAct.Array` pass the test implemented by the provided function.
	   * <p>
	   *  This method adds the {{#crossLink "ProAct/currentCaller:property"}}{{/crossLink}} as a listener to both 'index' type and 'length' type of changes.
	   * </p>
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method every
	   * @param {Function} callback
	   *      Function to test for each element.
	   * @param {Object} thisArg
	   *      Value to use as this when executing <i>callback</i>.
	   * @return {Boolean}
	   *      True if all the elements in the <i>this</i> ProAct.Array pass the test implemented by the <i>callback</i>, false otherwise.
	   */
	  every: function (fun, thisArg) {
	    this.core.addCaller();
	    if (this.core.isComplex) {
	      fun = this.core.actionFunction(fun);
	    }
	
	    return every.call(this._array, fun, thisArg);
	  },
	
	  /**
	   * Does the same as the {{#crossLink "ProAct.Array/every:method"}}{{/crossLink}} method, but the result is a {{#crossLink "ProAct.Property"}}{{/crossLink}} depending on changes on the array.
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method pevery
	   * @param {Function} fun
	   *      Function to test for each element.
	   * @param {Object} thisArg
	   *      Value to use as this when executing <i>callback</i>.
	   * @return {ProAct.Property}
	   *      {{#crossLink "ProAct.Property"}}{{/crossLink}} with value of true if all the elements in <i>this</i> `ProAct.Array` pass the test implemented by the <i>fun</i>, false otherwise.
	   */
	  pevery: function (fun, thisArg) {
	    var val = P.P.lazyValue(every.apply(this._array, arguments));
	
	    this.core.on(pArrayLs.every(val, this, arguments));
	
	    return val;
	  },
	
	  /**
	   * The <b>some()</b> method tests whether some element in the array passes the test implemented by the provided function.
	   * <p>
	   *  This method adds the {{#crossLink "ProAct/currentCaller:property"}}{{/crossLink}} as a listener to both 'index' type and 'length' type of changes.
	   * </p>
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method some
	   * @param {Function} callback
	   *      Function to test for each element.
	   * @param {Object} thisArg
	   *      Value to use as this when executing <i>callback</i>.
	   * @return {Boolean}
	   *      True if one or more of the elements in <i>this</i> `ProAct.Array` pass the test implemented by the <i>callback</i>, false otherwise.
	   */
	  some: function () {
	    this.core.addCaller();
	
	    return some.apply(this._array, arguments);
	  },
	
	  /**
	   * Does the same as the {{#crossLink "ProAct.Array/some:method"}}{{/crossLink}} method, but the result is a {{#crossLink "ProAct.Property"}}{{/crossLink}} depending on changes on the array.
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method psome
	   * @param {Function} fun
	   *      Function to test for each element.
	   * @param {Object} thisArg
	   *      Value to use as this when executing <i>callback</i>.
	   * @return {ProAct.Property}
	   *      {{#crossLink "ProAct.Property"}}{{/crossLink}} with value of true if one or more of the elements in <i>this</i> `ProAct.Array` pass the test implemented by the <i>fun</i>, false otherwise.
	   */
	  psome: function (fun, thisArg) {
	    var val = P.P.lazyValue(some.apply(this._array, arguments));
	
	    this.core.on(pArrayLs.some(val, this, arguments));
	
	    return val;
	  },
	
	  /**
	   * The <b>forEach()</b> method executes a provided function once per array element.
	   * <p>
	   *  This method adds the {{#crossLink "ProAct/currentCaller:property"}}{{/crossLink}} as a listener to both 'index' type and 'length' type of changes.
	   * </p>
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method forEach
	   * @param {Function} fun
	   *      Function to execute for each element.
	   * @param {Object} thisArg
	   *      Value to use as <i>this</i> when executing <i>callback</i>.
	   */
	  forEach: function (fun /*, thisArg */) {
	    this.core.addCaller();
	
	    return forEach.apply(this._array, arguments);
	  },
	
	  /**
	   * The <b>filter()</b> method creates a new `ProAct.Array` with all elements that pass the test implemented by the provided function.
	   * <p>
	   *  The result `ProAct.Array` is dependent on <i>this</i>, so if <i>this</i> changes, the filtered resut will be updated.
	   * </p>
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method filter
	   * @param {Function} fun
	   *      Function to test for each element.
	   * @param {Object} thisArg
	   *      Value to use as this when executing <i>fun</i>.
	   * @return {ProAct.Array}
	   *      A new `ProAct.Array` consisting of the elements in <i>this</i> `ProAct.Array` that pass the test implemented by <i>fun</i>.
	   */
	  filter: function (fun, thisArg, isComplex) {
	    if (this.core.isComplex || isComplex) {
	      fun = this.core.actionFunction(fun);
	    }
	
	    var filtered = new P.A(filter.apply(this._array, arguments)),
	        listener = pArrayLs.filter(filtered, this, arguments);
	    this.core.on(listener);
	
	    filtered.core.filteringListener = listener;
	
	    return filtered;
	  },
	
	  /**
	   * The <b>map()</b> method creates a new `ProAct.Array` with the results of calling a provided function on every element in <i>this</i> `ProAct.Array`.
	   * <p>
	   *  The result `ProAct.Array` is dependent on <i>this</i>, so if <i>this</i> changes, the mapped resut will be updated.
	   * </p>
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method map
	   * @param {Function} fun
	   *      Function that produces an element of the new `ProAct.Array`, taking three arguments:
	   *      <ol>
	   *        <li><b>currentValue</b> : The current element being processed in the array.</li>
	   *        <li><b>index</b> : The index of the current element being processed in the array.</li>
	   *        <li><b>array</b> : The array map was called upon.</li>
	   *      </ol>
	   * @param {Object} thisArg
	   *      Value to use as this when executing <i>fun</i>.
	   * @return {ProAct.Array}
	   *      A new `ProAct.Array` consisting of the elements in <i>this</i> `ProAct.Array` transformed by <i>fun</i>.
	   */
	  map: function (fun, thisArg) {
	    var mapped = new P.A(map.apply(this._array, arguments));
	    this.core.on(pArrayLs.map(mapped, this, arguments));
	
	    return mapped;
	  },
	
	  /**
	   * The <b>reduce()</b> method applies a function against an accumulator and each value of the `ProAct.Array` (from left-to-right) has to reduce it to a single value.
	   * <p>
	   *  This method adds the {{#crossLink "ProAct/currentCaller:property"}}{{/crossLink}} as a listener to both 'index' type and 'length' type of changes.
	   * </p>
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method reduce
	   * @param {Function} fun
	   *      Function to execute on each value in the array, taking four arguments:
	   *      <ol>
	   *        <li><b>previousValue</b> : The value previously returned in the last invocation of the <i>fun</i>, or <i>initialValue</i>, if supplied.</li>
	   *        <li><b>currentValue</b> : The current element being processed in the `ProAct.Array`.</li>
	   *        <li><b>index</b> : The index of the current element being processed in the `ProAct.Array`.</li>
	   *        <li><b>array</b> : The array reduce was called upon.</li>
	   *      </ol>
	   * @param {Object} initialValue
	   *      Object to use as the first argument to the first call of the <i>fun</i> .
	   * @return {Object}
	   *      The value of the last <i>fun</i> invocation.
	   */
	  reduce: function (fun /*, initialValue */) {
	    this.core.addCaller();
	
	    return reduce.apply(this._array, arguments);
	  },
	
	  /**
	   * Does the same as the {{#crossLink "ProAct.Array/reduce:method"}}{{/crossLink}} method, but the result is a {{#crossLink "ProAct.Property"}}{{/crossLink}} depending on changes on <i>this</i> `ProAct.Array`.
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method preduce
	   * @param {Function} fun
	   *      Function to execute on each value in the array, taking four arguments:
	   *      <ol>
	   *        <li><b>previousValue</b> : The value previously returned in the last invocation of the <i>fun</i>, or <i>initialValue</i>, if supplied.</li>
	   *        <li><b>currentValue</b> : The current element being processed in the `ProAct.Array`.</li>
	   *        <li><b>index</b> : The index of the current element being processed in the `ProAct.Array`.</li>
	   *        <li><b>array</b> : The array reduce was called upon.</li>
	   *      </ol>
	   * @param {Object} initialValue
	   *      Object to use as the first argument to the first call of the <i>fun</i> .
	   * @return {ProAct.Property}
	   *      {{#crossLink "ProAct.Property"}}{{/crossLink}} with value of the last <i>fun</i> invocation.
	   */
	  preduce: function (fun /*, initialValue */) {
	    var val = P.P.lazyValue(reduce.apply(this._array, arguments));
	    this.core.on(pArrayLs.reduce(val, this, arguments));
	
	    return val;
	  },
	
	  /**
	   * The <b>reduceRight()</b> method applies a function against an accumulator and each value of the `ProAct.Array` (from right-to-left) as to reduce it to a single value.
	   * <p>
	   *  This method adds the {{#crossLink "ProAct/currentCaller:property"}}{{/crossLink}} as a listener to both 'index' type and 'length' type of changes.
	   * </p>
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method reduceRight
	   * @param {Function} fun
	   *      Function to execute on each value in the array, taking four arguments:
	   *      <ol>
	   *        <li><b>previousValue</b> : The value previously returned in the last invocation of the <i>fun</i>, or <i>initialValue</i>, if supplied.</li>
	   *        <li><b>currentValue</b> : The current element being processed in the `ProAct.Array`.</li>
	   *        <li><b>index</b> : The index of the current element being processed in the `ProAct.Array`.</li>
	   *        <li><b>array</b> : The array reduce was called upon.</li>
	   *      </ol>
	   * @param {Object} initialValue
	   *      Object to use as the first argument to the first call of the <i>fun</i> .
	   * @return {Object}
	   *      The value of the last <i>fun</i> invocation.
	   */
	  reduceRight: function (fun /*, initialValue */) {
	    this.core.addCaller();
	
	    return reduceRight.apply(this._array, arguments);
	  },
	
	  /**
	   * Does the same as the {{#crossLink "ProAct.Array/reduceRight:method"}}{{/crossLink}} method, but the result is a {{#crossLink "ProAct.Property"}}{{/crossLink}} depending on changes on <i>this</i> `ProAct.Array`.
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method preduceRight
	   * @param {Function} fun
	   *      Function to execute on each value in the array, taking four arguments:
	   *      <ol>
	   *        <li><b>previousValue</b> : The value previously returned in the last invocation of the <i>fun</i>, or <i>initialValue</i>, if supplied.</li>
	   *        <li><b>currentValue</b> : The current element being processed in the `ProAct.Array`.</li>
	   *        <li><b>index</b> : The index of the current element being processed in the `ProAct.Array`.</li>
	   *        <li><b>array</b> : The array reduce was called upon.</li>
	   *      </ol>
	   * @param {Object} initialValue
	   *      Object to use as the first argument to the first call of the <i>fun</i> .
	   * @return {ProAct.Property}
	   *      {{#crossLink "ProAct.Property"}}{{/crossLink}} with value of the last <i>fun</i> invocation.
	   */
	  preduceRight: function (fun /*, initialValue */) {
	    var val = P.P.lazyValue(reduceRight.apply(this._array, arguments));
	    this.core.on(pArrayLs.reduceRight(val, this, arguments));
	
	    return val;
	  },
	
	  /**
	   * The <b>indexOf()</b> method returns the first index at which a given element can be found in the ProAct.Array, or -1 if it is not present.
	   * <p>
	   *  This method adds the {{#crossLink "ProAct/currentCaller:property"}}{{/crossLink}} as a listener to both 'index' type and 'length' type of changes.
	   * </p>
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method indexOf
	   * @param {Object} searchElement
	   *      Element to locate in the ProAct.Array.
	   * @param {Number} fromIndex
	   *      Default: 0 (Entire array is searched)
	   *      <p>
	   *        The index to start the search at.
	   *        If the index is greater than or equal to the `ProAct.Array`'s length, -1 is returned,
	   *        which means the array will not be searched.
	   *        If the provided index value is a negative number,
	   *        it is taken as the offset from the end of the `ProAct.Array`.
	   *      </p>
	   *      <p>
	   *        Note: if the provided index is negative, the `ProAct.Array` is still searched from front to back.
	   *        If the calculated index is less than 0, then the whole `ProAct.Array` will be searched.
	   *      </p>
	   * @return {Number}
	   *      The index of the searched element or '-1' if it is not found in <i>this</i> `ProAct.Array`.
	   */
	  indexOf: function () {
	    this.core.addCaller();
	
	    return indexOf.apply(this._array, arguments);
	  },
	
	  /**
	   * Does the same as the {{#crossLink "ProAct.Array/indexOf:method"}}{{/crossLink}} method, but the result is a {{#crossLink "ProAct.Property"}}{{/crossLink}} depending on changes on <i>this</i> `ProAct.Array`.
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method pindexOf
	   * @param {Object} searchElement
	   *      Element to locate in the `ProAct.Array`.
	   * @param {Number} fromIndex
	   *      Default: 0 (Entire array is searched)
	   *      <p>
	   *        The index to start the search at.
	   *        If the index is greater than or equal to the `ProAct.Array`'s length, -1 is returned,
	   *        which means the array will not be searched.
	   *        If the provided index value is a negative number,
	   *        it is taken as the offset from the end of the `ProAct.Array`.
	   *      </p>
	   *      <p>
	   *        Note: if the provided index is negative, the `ProAct.Array` is still searched from front to back.
	   *        If the calculated index is less than 0, then the whole ProAct.Array will be searched.
	   *      </p>
	   * @return {ProAct.Property}
	   *      A {{#crossLink "ProAct.Property"}}{{/crossLink}} instance with value, the index of the searched element or '-1' if it is not found in <i>this</i> `ProAct.Array`.
	   */
	  pindexOf: function () {
	    var val = P.P.lazyValue(indexOf.apply(this._array, arguments));
	    this.core.on(pArrayLs.indexOf(val, this, arguments));
	
	    return val;
	  },
	
	  /**
	   * The <b>lastIndexOf()</b> method returns the last index at which a given element can be found in the `ProAct.Array`, or -1 if it is not present.
	   * The ProAct.Array is searched backwards, starting at <i>fromIndex</i>.
	   * <p>
	   *  This method adds the {{#crossLink "ProAct/currentCaller:property"}}{{/crossLink}} as a listener to both 'index' type and 'length' type of changes.
	   * </p>
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method lastIndexOf
	   * @param {Object} searchElement
	   *      Element to locate in the ProAct.Array.
	   * @param {Number} fromIndex
	   *      <p>
	   *        The index at which to start searching backwards.
	   *        Defaults to the ProAct.Array's length, i.e. the whole array will be searched.
	   *        If the index is greater than or equal to the length of the `ProAct.Array`, the whole `ProAct.Array` will be searched.
	   *        If negative, it is taken as the offset from the end of the `ProAct.Array`.
	   *      </p>
	   *      <p>
	   *        Note that even when the index is negative,
	   *        the ProAct.Array is still searched from back to front.
	   *        If the calculated index is less than 0, -1 is returned, i.e. the `ProAct.Array` will not be searched.
	   *      </p>
	   * @return {Number}
	   *      The index of the searched backwards element or '-1' if it is not found in <i>this</i> `ProAct.Array`.
	   */
	  lastIndexOf: function () {
	    this.core.addCaller();
	
	    return lastIndexOf.apply(this._array, arguments);
	  },
	
	  /**
	   * Does the same as the {{#crossLink "ProAct.Array/lastIndexOf:method"}}{{/crossLink}} method, but the result is a {{#crossLink "ProAct.Property"}}{{/crossLink}} depending on changes on <i>this</i> `ProAct.Array`.
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method plastindexOf
	   * @param {Object} searchElement
	   *      Element to locate in the `ProAct.Array`.
	   * @param {Number} fromIndex
	   *      <p>
	   *        The index at which to start searching backwards.
	   *        Defaults to the `ProAct.Array`'s length, i.e. the whole array will be searched.
	   *        If the index is greater than or equal to the length of the `ProAct.Array`, the whole ProAct.Array will be searched.
	   *        If negative, it is taken as the offset from the end of the` ProAct.Array`.
	   *      </p>
	   *      <p>
	   *        Note that even when the index is negative,
	   *        the ProAct.Array is still searched from back to front.
	   *        If the calculated index is less than 0, -1 is returned, i.e. the `ProAct.Array` will not be searched.
	   *      </p>
	   * @return {ProAct.Property}
	   *      A {{#crossLink "ProAct.Property"}}{{/crossLink}} instance with value, the index of the backwards searched element or '-1' if it is not found in <i>this</i> `ProAct.Array`.
	   */
	  plastindexOf: function () {
	    var val = P.P.lazyValue(lastIndexOf.apply(this._array, arguments));
	    this.core.on(pArrayLs.lastIndexOf(val, this, arguments));
	
	    return val;
	  },
	
	  /**
	   * The <b>join()</b> method joins all elements of an `ProAct.Array` into a string.
	   * <p>
	   *  This method adds the {{#crossLink "ProAct/currentCaller:property"}}{{/crossLink}} as a listener to both 'index' type and 'length' type of changes.
	   * </p>
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method join
	   * @param {String} separator
	   *      Specifies a string to separate each element of the `ProAct`.
	   *      The separator is converted to a string if necessary.
	   *      <p>
	   *       If omitted, the ProAct.Array elements are separated with a comma.
	   *      </p>
	   * @return {String}
	   *      A string representation of all the elements in <i>this</i> `ProAct.Array`, separated by the provided <i>separator</i>.
	   */
	  join: function () {
	    this.core.addCaller();
	
	    return join.apply(this._array, arguments);
	  },
	
	  /**
	   * Does the same as the {{#crossLink "ProAct.Array/join:method"}}{{/crossLink}} method, but the result is a {{#crossLink "ProAct.Property"}}{{/crossLink}} depending on changes on <i>this</i> `ProAct.Array`.
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method pjoin
	   * @param {String} separator
	   *      Specifies a string to separate each element of the `ProAct`.
	   *      The separator is converted to a string if necessary.
	   *      <p>
	   *       If omitted, the ProAct.Array elements are separated with a comma.
	   *      </p>
	   * @return {ProAct.Property}
	   *      A {{#crossLink "ProAct.Property"}}{{/crossLink}} instance with value : string representation of all the elements in <i>this</i> `ProAct.Array`, separated by the provided <i>separator</i>.
	   */
	  pjoin: function (separator) {
	    var reduced = this.preduce(function (i, el) {
	      return i + separator + el;
	    }, ''), res = P.P.lazyValue(function () {
	      if (!reduced.v) {
	        return '';
	      }
	      return reduced.v.substring(1);
	    });
	    return res;
	  },
	
	  /**
	   * The <b>toLocaleString()</b> method returns a string representing the elements of the ProAct.Array.
	   * The elements are converted to Strings using their toLocaleString methods and these Strings are separated by a locale-specific String (such as a comma ",").
	   * <p>
	   *  This method adds the {{#crossLink "ProAct/currentCaller:property"}}{{/crossLink}} as a listener to both 'index' type and 'length' type of changes.
	   * </p>
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method toLocaleString
	   * @return {String}
	   *      Locale-specific string representing the elements of <i>this</i> ProAct.Array.
	   */
	  toLocaleString: function () {
	    this.core.addCaller();
	
	    return toLocaleString.apply(this._array, arguments);
	  },
	
	  /**
	   * The <b>toString()</b> method returns a string representing the specified `ProAct.Array` and its elements.
	   * The elements are converted to Strings using their toLocaleString methods and these Strings are separated by a locale-specific String (such as a comma ",").
	   * <p>
	   *  This method adds the {{#crossLink "ProAct/currentCaller:property"}}{{/crossLink}} as a listener to both 'index' type and 'length' type of changes.
	   * </p>
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method toString
	   * @return {String}
	   *      A string representing the elements of <i>this</i> `ProAct.Array`.
	   */
	  toString: function () {
	    this.core.addCaller();
	
	    return toString.apply(this._array, arguments);
	  },
	
	  /**
	   * Returns the result of {{#crossLink "ProAct.Array/toArray:method"}}{{/crossLink}}.
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method valueOf
	   * @return {Array}
	   *        This ProAct.Array converted to plain JavaScript array.
	   */
	  valueOf: function () {
	    return this.toArray();
	  },
	
	  /**
	   * The <b>slice()</b> method returns a shallow copy of a portion of <i>this</i> `ProAct.Array` into a new `ProAct.Array` object.
	   * <p>
	   *  The result `ProAct.Array` is dependent on <i>this</i>, so if <i>this</i> changes, the slice resut will be updated.
	   * </p>
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method slice
	   * @param {Number} begin
	   *      Zero-based index at which to begin extraction.
	   *      As a negative index, begin indicates an offset from the end of the sequence. slice(-2) extracts the last two elements in the sequence.
	   *      If begin is omitted, slice begins from index 0.
	   * @param {Number} end
	   *      Zero-based index at which to end extraction. slice extracts up to but not including end.
	   *      slice(1,4) extracts the second element up to the fourth element (elements indexed 1, 2, and 3).
	   *      As a negative index, end indicates an offset from the end of the sequence. slice(2,-1) extracts the third element through the second-to-last element in the sequence.
	   *      If end is omitted, slice extracts to the end of the sequence.
	   * @return {ProAct.Array}
	   *      A portion of <i>this</i> `ProAct.Array`, dependent on it.
	   */
	  slice: function () {
	    var sliced = new P.A(slice.apply(this._array, arguments));
	    this.core.on(pArrayLs.slice(sliced, this, arguments));
	
	    return sliced;
	  },
	
	  /**
	   * The <b>reverse()</b> method reverses an `ProAct.Array` in place. The first array element becomes the last and the last becomes the first.
	   * <p>
	   *  This method notifies the 'index' listeners attached to <i>this</i>' {{#crossLink "ProAct.ArrayCore"}}{{/crossLink}}.
	   * </p>
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method reverse
	   */
	  reverse: function () {
	    if (this._array.length === 0) {
	      return;
	    }
	    var reversed = reverse.apply(this._array, arguments);
	
	    ActorUtil.update.call(this.core, null, 'index', [pArrayOps.reverse, -1, null, null]);
	    return reversed;
	  },
	
	  /**
	   * The <b>sort()</b> method sorts the elements of <i>this</i> `ProAct.Array` in place and returns the <i>this</i>. The sort is not necessarily stable.
	   * The default sort order is according to string Unicode code points.
	   * <p>
	   *  This method notifies the 'index' listeners attached to <i>this</i>' {{#crossLink "ProAct.ArrayCore"}}{{/crossLink}}.
	   * </p>
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method sort
	   * @return {ProAct.Array}
	   *      <i>this</i>
	   */
	  sort: function () {
	    if (this._array.length === 0) {
	      return;
	    }
	    var sorted = sort.apply(this._array, arguments),
	        args = arguments;
	
	    ActorUtil.update.call(this.core, null, 'index', [pArrayOps.sort, -1, null, args]);
	    return this;
	  },
	
	  /**
	   * The <b>splice()</b> method changes the content of <i>this</i> `ProAct.Array`, adding new elements while removing old elements.
	   * <p>
	   *  This method may notify the 'index' listeners or the 'length' listeners, or even the both types of listeners, attached to <i>this</i>' {{#crossLink "ProAct.ArrayCore"}}{{/crossLink}}, depending
	   *  on what the splicing does - removing, adding or changing elements (removing and adding).
	   * </p>
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method splice
	   * @param {Number} index
	   *      Index at which to start changing the `ProAct.Array`.
	   *      If greater than the length of the `ProAct.Array`, actual starting index will be set to the length of the <i>this</i>.
	   *      If negative, will begin that many elements from the end.
	   * @param {Number} howMany
	   *      An integer indicating the number of old `ProAct.Array` elements to remove.
	   *      If howMany is 0, no elements are removed. In this case, you should specify at least one new element.
	   *      If howMany is greater than the number of elements left in the ProAct.Array starting at index,
	   *      then all of the elements through the end of the ProAct.Array will be deleted.
	   * @param [...]
	   *      <b>element1, ..., elementN</b>:
	   *      <p>
	   *        The elements to add to the `ProAct.Array`. If you don't specify any elements, splice simply removes elements from the `ProAct.Array`.
	   *      </p>
	   * @return {ProAct.Array}
	   *      An `ProAct.Array` containing the removed elements.
	   *      If only one element is removed, an `ProAct.Array` of one element is returned.
	   *      If no elements are removed, an empty `ProAct.Array` is returned.
	   */
	  splice: function (index, howMany) {
	    var oldLn = this._array.length,
	        spliced = splice.apply(this._array, arguments),
	        ln = this._array.length, delta,
	        newItems = slice.call(arguments, 2);
	
	    index = !~index ? ln - index : index
	    howMany = (howMany == null ? ln - index : howMany) || 0;
	
	    if (newItems.length > howMany) {
	      delta = newItems.length - howMany;
	      while (delta--) {
	        this.core.defineIndexProp(oldLn++);
	      }
	    } else if (howMany > newItems.length) {
	      delta = howMany - newItems.length;
	      while (delta--) {
	        delete this[--oldLn];
	      }
	    }
	
	    this.core.updateSplice(index, spliced, newItems);
	    return new P.A(spliced);
	  },
	
	  /**
	   * The <b>pop()</b> method removes the last element from an `ProAct.Array` and returns that element.
	   * <p>
	   *  This method notifies the 'length' listeners, attached to <i>this</i>' {{#crossLink "ProAct.ArrayCore"}}{{/crossLink}}.
	   * </p>
	   * <p>
	   *  This method removes the special index accessor of the deleted element's index - the last index.
	   * </p>
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method pop
	   * @return {Object}
	   *      The removed element. If <i>this</i> `ProAct.Array` is empty the result is undefined.
	   */
	  pop: function () {
	    if (this._array.length === 0) {
	      return;
	    }
	    var popped = pop.apply(this._array, arguments),
	        index = this._array.length;
	
	    delete this[index];
	    ActorUtil.update.call(this.core, null, 'length', [pArrayOps.remove, this._array.length, popped, null]);
	
	    return popped;
	  },
	
	  /**
	   * The <b>push()</b> method adds one or more elements to the end of an `ProAct.Array` and returns the new length of the `ProAct.Array`.
	   * <p>
	   *  This method notifies the 'length' listeners, attached to <i>this</i>' {{#crossLink "ProAct.ArrayCore"}}{{/crossLink}}.
	   * </p>
	   * <p>
	   *  This method defines new index accessors for the elements on the new indexes. So these indexes can be set and read, and
	   *  will attatch listeners to the {{#crossLink "ProAct.ArrayCore"}}{{/crossLink}} or update them.
	   * </p>
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method push
	   * @param [...]
	   *      <b>element1, ..., elementN</b> : The elements to add to the end of the array.
	   * @return {Object}
	   *      The new length property of the <i>this</i>.
	   */
	  push: function () {
	    var vals = arguments, i, ln = arguments.length, index;
	
	    for (i = 0; i < ln; i++) {
	      index = this._array.length;
	      push.call(this._array, arguments[i]);
	      this.core.defineIndexProp(index);
	    }
	
	    ActorUtil.update.call(this.core, null, 'length', [pArrayOps.add, this._array.length - 1, null, slice.call(vals, 0)]);
	
	    return this._array.length;
	  },
	
	  /**
	   * The <b>shift()</b> method removes the first element from an `ProAct.Array` and returns that element. This method changes the length of the `ProAct.Array`.
	   * <p>
	   *  This method notifies the 'length' listeners, attached to <i>this</i>' {{#crossLink "ProAct.ArrayCore"}}{{/crossLink}}.
	   * </p>
	   * <p>
	   *  This method removes the special index accessor of the deleted element's index - the zero index.
	   * </p>
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method shift
	   * @return {Object}
	   *      The removed element. If <i>this</i> `ProAct.Array` is empty the result is undefined.
	   */
	  shift: function () {
	    if (this._array.length === 0) {
	      return;
	    }
	    var shifted = shift.apply(this._array, arguments),
	        index = this._array.length;
	
	    delete this[index];
	    ActorUtil.update.call(this.core, null, 'length', [pArrayOps.remove, 0, shifted, null]);
	
	    return shifted;
	  },
	
	  /**
	   * The <b>unshift()</b> method adds one or more elements to the beginning of an `ProAct.Array` and returns the new length of the `ProAct.Array`.
	   * <p>
	   *  This method notifies the 'length' listeners, attached to <i>this</i>' {{#crossLink "ProAct.ArrayCore"}}{{/crossLink}}.
	   * </p>
	   * <p>
	   *  This method defines new index accessors for the elements on the new indexes. So these indexes can be set and read, and
	   *  will attatch listeners to the {{#crossLink "ProAct.ArrayCore"}}{{/crossLink}} or update them.
	   * </p>
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method unshift
	   * @param [...]
	   *      <b>element1, ..., elementN</b> : The elements to add to the front of the array.
	   * @return {Object}
	   *      The new length property of the <i>this</i>.
	   */
	  unshift: function () {
	    var vals = slice.call(arguments, 0), i, ln = arguments.length,
	        array = this._array;
	
	    for (var i = 0; i < ln; i++) {
	      array.splice(i, 0, arguments[i]);
	      this.core.defineIndexProp(array.length - 1);
	    }
	
	    ActorUtil.update.call(this.core, null, 'length', [pArrayOps.add, 0, null, vals]);
	
	    return array.length;
	  },
	
	  /**
	   * Generates an plain array representation of <i>this</i>.
	   * <p>
	   *  The returned array is shallow copy of <i>this</i>' content, so if modified with methods like 'push' or 'pop',
	   *  <i>this</i> content will not be modified
	   * </p>
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method toArray
	   * @return {Array}
	   *      An plain JavaScript array representation of <i>this</i>.
	   */
	  toArray: function () {
	    var result = [], i, ar = this._array, ln = ar.length, el,
	        isPA = P.AU.isProArray;
	
	    for (i = 0; i < ln; i++) {
	      el = ar[i];
	      if (isPA(el)) {
	        el = el.toArray();
	      }
	
	      result.push(el);
	    }
	
	    return result;
	  },
	
	  /**
	   * Generates a JSON representation of <i>this</i>.
	   *
	   * @for ProAct.Array
	   * @instance
	   * @method toJSON
	   * @return {String}
	   *      A JSON array representing <i>this</i>.
	   */
	  toJSON: function () {
	    return JSON.stringify(this._array);
	  }
	});
	
	P.U.ex(P.Actor.prototype, {
	
	  /**
	   * Creates and returns a {{#crossLink "ProAct.Array"}}{{/crossLink}} instance, which tracks the changes of this.
	   * Uses the current queue for queueing changes.
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method toProArray
	   * @return {ProAct.Array}
	   *      A `ProAct.Array` instance tracking the changes of `this`.
	   */
	  toProArray: function () {
	    var array = new P.A();
	
	    array.core.queueName = this.queueName;
	    array.core.into(this);
	    return array;
	  }
	});
	
	function ArrayProbProvider () {
	};
	
	ArrayProbProvider.prototype = P.U.ex(Object.create(P.ProbProvider.prototype), {
	  constructor: ArrayProbProvider,
	  filter: function (data, meta) {
	    return P.U.isArray(data);
	  },
	  provide: function (data, meta) {
	    var array = new P.A(data);
	    if (meta && meta.p && meta.p.queueName && P.U.isString(meta.p.queueName)) {
	      array.core.queueName = meta.p.queueName;
	    }
	    return array;
	  }
	});
	
	P.ProbProvider.register(new ArrayProbProvider());
	
	/**
	 * @module proact-arrays
	 */
	
	/**
	 * Defines a set of special listeners used to trak {{#crossLink "ProAct.Array"}}{{/crossLink}} changes and updating dependent {{#crossLink "ProAct.Array"}}{{/crossLink}}s in an optimal way.
	 *
	 * @class Listeners
	 * @namespace ProAct.Array
	 * @static
	 */
	ProAct.Array.Listeners = P.A.L = pArrayLs = {
	
	  /**
	   * Checks the validity of an event.
	   *
	   * @for ProAct.Array.Listeners
	   * @static
	   * @param {ProAct.Event} event
	   *      The event to check.
	   * @throws {Error}
	   *      If the event is not {{#crossLink "ProAct.Event.Types/array:property"}}{{/crossLink}}
	   */
	  check: function(event) {
	    if (event.type !== P.E.Types.array) {
	      throw Error('Not implemented for non array events');
	    }
	  },
	
	  /**
	   * Generates a listener that can be attached to an {{#crossLink "ProAct.Array"}}{{/crossLink}} on which
	   * the method {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}} is invoked.
	   * <p>
	   *  The result of the {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}} method is another {{#crossLink "ProAct.Array"}}{{/crossLink}}, dependent on the <i>original</i> one.
	   * </p>
	   * <p>
	   *  For example if the original was:
	   *  <pre>
	   *    var a = new ProAct.Array([1, 3, 5]);
	   *  </pre>
	   *  and we invoked {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}} on it like this:
	   *  <pre>
	   *    var b = a.concat(7, 9); // b is [1, 3, 5, 7, 9]
	   *  </pre>
	   *  The new array - <b>b</b> is dependent on <b>a</b>, so if for example we push something to <b>a</b>, <b>b</b> should be updated:
	   *  <pre>
	   *    a.push(11); // b authomatically should become [1, 3, 5, 11, 7, 9]
	   *  </pre>
	   * </p>
	   * <p>
	   *  The generated listener by this method does this - updates the <i>transformed</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, when the <i>original</i> changes
	   *  and it does it in an optimal way.
	   * </p>
	   *
	   * @for ProAct.Array.Listeners
	   * @static
	   * @param {ProAct.Array} transformed
	   *      The array created as a result of invoking {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}} on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}.
	   * @param {ProAct.Array} original
	   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} on which {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}} was invoked.
	   * @param {Array} args
	   *      The arguments passed to {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}}, when it was invoked on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}
	   * @return {Function}
	   *      A listener for events from the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, updating the <i>transformed</i> {{#crossLink "ProAct.Array"}}{{/crossLink}} on
	   *      every new event, if it is necessary.
	   */
	  leftConcat: function (transformed, original, args) {
	    return function (event) {
	      pArrayLs.check(event);
	      var op    = event.args[0],
	          ind   = event.args[1],
	          ov    = event.args[2],
	          nv    = event.args[3],
	          argln = args.length,
	          nvs, toAdd;
	      if (op === pArrayOps.set) {
	        transformed[ind] = nv;
	      } else if (op === pArrayOps.add) {
	        nvs = slice.call(nv, 0);
	        if (ind === 0) {
	          pArrayProto.unshift.apply(transformed, nvs);
	        } else {
	          pArrayProto.splice.apply(transformed, [transformed._array.length - argln, 0].concat(nvs));
	        }
	      } else if (op === pArrayOps.remove) {
	        if (ind === 0) {
	          pArrayProto.shift.call(transformed, ov);
	        } else {
	          pArrayProto.splice.apply(transformed, [transformed._array.length - argln - 1, 1]);
	        }
	      } else if (op === pArrayOps.setLength) {
	        nvs = ov -nv;
	        if (nvs > 0) {
	          pArrayProto.splice.apply(transformed, [nv, nvs]);
	        } else {
	          toAdd = [ov, 0];
	          toAdd.length = 2 - nvs;
	          pArrayProto.splice.apply(transformed, toAdd);
	        }
	      } else if (op === pArrayOps.reverse || op === pArrayOps.sort) {
	        nvs = transformed._array;
	        if (P.AU.isProArray(args)) {
	          toAdd = args._array;
	        } else {
	          toAdd = args;
	        }
	        transformed._array.length = 0;
	        push.apply(transformed._array, concat.apply(original._array, toAdd));
	        transformed.core.updateByDiff(nvs);
	      } else if (op === pArrayOps.splice) {
	        pArrayProto.splice.apply(transformed, [ind, ov.length].concat(nv));
	      }
	    };
	  },
	
	  /**
	   * Generates a listener that can be attached to an {{#crossLink "ProAct.Array"}}{{/crossLink}} on which
	   * the method {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}} is invoked with argument, another {{#crossLink "ProAct.Array"}}{{/crossLink}}.
	   * <p>
	   *  The result of the {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}} method is another {{#crossLink "ProAct.Array"}}{{/crossLink}},
	   *  dependent on both the <i>original</i> and the passed as an argument one.
	   * </p>
	   * <p>
	   *  For example if the original was:
	   *  <pre>
	   *    var a = new ProAct.Array([1, 3, 5]);
	   *  </pre>
	   *  and we invoked {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}} on it like this:
	   *  <pre>
	   *    var x = new ProAct.Array(7, 9);
	   *    var b = a.concat(x); // b is [1, 3, 5, 7, 9]
	   *  </pre>
	   *  The new array - <b>b</b> is dependent on <b>x</b>, so if for example we push something to <b>x</b>, <b>b</b> should be updated:
	   *  <pre>
	   *    x.push(13); // b authomatically should become [1, 3, 5, 7, 9, 13]
	   *  </pre>
	   * </p>
	   * <p>
	   *  The generated listener by this method does this - updates the <i>transformed</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, when the <i>original</i> changes
	   *  and it does it in an optimal way.
	   * </p>
	   *
	   * @for ProAct.Array.Listeners
	   * @static
	   * @param {ProAct.Array} transformed
	   *      The array created as a result of invoking {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}} on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}.
	   * @param {ProAct.Array} original
	   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} on which {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}} was invoked.
	   * @param {ProAct.Array} right
	   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} passed as an argument to {{#crossLink "ProAct.Array/concat:method"}}{{/crossLink}}.
	   * @return {Function}
	   *      A listener for events from the <i>right</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, updating the <i>transformed</i> {{#crossLink "ProAct.Array"}}{{/crossLink}} on
	   *      every new event, if it is necessary.
	   */
	  rightConcat: function (transformed, original, right) {
	    return function (event) {
	      pArrayLs.check(event);
	      var op    = event.args[0],
	          ind   = event.args[1],
	          ov    = event.args[2],
	          nv    = event.args[3],
	          oln   = original._array.length,
	          nvs;
	      if (op === pArrayOps.set) {
	        transformed[oln + ind] = nv;
	      } else if (op === pArrayOps.add) {
	        if (ind === 0) {
	          pArrayProto.splice.apply(transformed, [oln, 0].concat(nv));
	        } else {
	          pArrayProto.push.apply(transformed, nv);
	        }
	      } else if (op === pArrayOps.remove) {
	        if (ind === 0) {
	          pArrayProto.splice.call(transformed, oln, 1);
	        } else {
	          pArrayProto.pop.call(transformed, ov);
	        }
	      } else if (op === pArrayOps.setLength) {
	        transformed.length = oln + nv;
	      } else if (op === pArrayOps.reverse || op === pArrayOps.sort) {
	        nvs = transformed._array;
	        transformed._array.length = 0;
	        push.apply(transformed._array, concat.apply(original._array, right._array));
	        transformed.core.updateByDiff(nvs);
	      } else if (op === pArrayOps.splice) {
	        pArrayProto.splice.apply(transformed, [ind + oln, ov.length].concat(nv));
	      }
	    };
	  },
	
	  /**
	   * Generates a listener that can be attached to an {{#crossLink "ProAct.Array"}}{{/crossLink}} on which
	   * the method {{#crossLink "ProAct.Array/pevery:method"}}{{/crossLink}} is invoked.
	   * <p>
	   *  The result of the {{#crossLink "ProAct.Array/pevery:method"}}{{/crossLink}} method is a {{#crossLink "ProAct.Property"}}{{/crossLink}}, dependent on the <i>original</i> array.
	   * </p>
	   * <p>
	   *  For example if the original was:
	   *  <pre>
	   *    var a = new ProAct.Array([1, 3, 5]);
	   *  </pre>
	   *  and we invoked {{#crossLink "ProAct.Array/pevery:method"}}{{/crossLink}} on it like this:
	   *  <pre>
	   *    var val = a.pevery(function (el) {
	   *      return el % 2 === 1;
	   *    }); // val.v is true.
	   *  </pre>
	   *  The new value - <b>val</b> is dependent on <b>a</b>, so if for example we push something to <b>a</b>, <b>val</b> should be updated:
	   *  <pre>
	   *    a.push(2); // val.v authomatically should become false.
	   *  </pre>
	   * </p>
	   * <p>
	   *  The generated listener by this method does this - updates the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}}, when the <i>original</i> array changes
	   *  and it does it in an optimal way.
	   * </p>
	   *
	   * @for ProAct.Array.Listeners
	   * @static
	   * @param {ProAct.Property} val
	   *      The result of invoking {{#crossLink "ProAct.Array/pevery:method"}}{{/crossLink}} on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}.
	   * @param {ProAct.Array} original
	   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} on which {{#crossLink "ProAct.Array/pevery:method"}}{{/crossLink}} was invoked.
	   * @param {Array} args
	   *      The arguments passed to {{#crossLink "ProAct.Array/pevery:method"}}{{/crossLink}}, when it was invoked on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}
	   * @return {Function}
	   *      A listener for events from the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, updating the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}} on
	   *      every new event, if it is necessary.
	   */
	  every: function (val, original, args) {
	    var fun = args[0], thisArg = args[1];
	    return function (event) {
	      pArrayLs.check(event);
	      var op  = event.args[0],
	          ind = event.args[1],
	          ov  = event.args[2],
	          nv  = event.args[3],
	          ev;
	      if (op === pArrayOps.set) {
	        ev = fun.call(thisArg, nv);
	        if (val.valueOf() === true && !ev) {
	          val.v = false;
	        } else if (val.valueOf() === false && ev) {
	          val.v = every.apply(original._array, args);
	        }
	      } else if (op === pArrayOps.add) {
	        if (val.valueOf() === true) {
	          val.v = every.call(nv, fun, thisArg);
	        }
	      } else if (op === pArrayOps.remove) {
	        if (val.valueOf() === false && !fun.call(thisArg, ov)) {
	          val.v = every.apply(original._array, args);
	        }
	      } else if (op === pArrayOps.setLength) {
	        if (val.valueOf() === false) {
	          val.v = every.apply(original._array, args);
	        }
	      } else if (op === pArrayOps.splice) {
	        if (val.valueOf() === true) {
	          val.v = every.call(nv, fun, thisArg);
	        } else if (every.call(nv, fun, thisArg) && !every.call(ov, fun, thisArg)) {
	          val.v = every.apply(original._array, args);
	        }
	      }
	    };
	  },
	
	  /**
	   * Generates a listener that can be attached to an {{#crossLink "ProAct.Array"}}{{/crossLink}} on which
	   * the method {{#crossLink "ProAct.Array/psome:method"}}{{/crossLink}} is invoked.
	   * <p>
	   *  The result of the {{#crossLink "ProAct.Array/psome:method"}}{{/crossLink}} method is a {{#crossLink "ProAct.Property"}}{{/crossLink}}, dependent on the <i>original</i> array.
	   * </p>
	   * <p>
	   *  For example if the original was:
	   *  <pre>
	   *    var a = new ProAct.Array([1, 3, 5]);
	   *  </pre>
	   *  and we invoked {{#crossLink "ProAct.Array/psome:method"}}{{/crossLink}} on it like this:
	   *  <pre>
	   *    var val = a.psome(function (el) {
	   *      return el % 2 === 0;
	   *    }); // val.v is false.
	   *  </pre>
	   *  The new value - <b>val</b> is dependent on <b>a</b>, so if for example we push something to <b>a</b>, <b>val</b> should be updated:
	   *  <pre>
	   *    a.push(2); // val.v authomatically should become true
	   *  </pre>
	   * </p>
	   * <p>
	   *  The generated listener by this method does this - updates the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}}, when the <i>original</i> array changes
	   *  and it does it in an optimal way.
	   * </p>
	   *
	   * @for ProAct.Array.Listeners
	   * @static
	   * @param {ProAct.Property} val
	   *      The result of invoking {{#crossLink "ProAct.Array/psome:method"}}{{/crossLink}} on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}.
	   * @param {ProAct.Array} original
	   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} on which {{#crossLink "ProAct.Array/psome:method"}}{{/crossLink}} was invoked.
	   * @param {Array} args
	   *      The arguments passed to {{#crossLink "ProAct.Array/psome:method"}}{{/crossLink}}, when it was invoked on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}
	   * @return {Function}
	   *      A listener for events from the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, updating the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}} on
	   *      every new event, if it is necessary.
	   */
	  some: function (val, original, args) {
	    var fun = args[0], thisArg = args[1];
	    return function (event) {
	      pArrayLs.check(event);
	      var op  = event.args[0],
	          ind = event.args[1],
	          ov  = event.args[2],
	          nv  = event.args[3],
	          sv;
	      if (op === pArrayOps.set) {
	        sv = fun.call(thisArg, nv);
	        if (val.valueOf() === false && sv) {
	          val.v = true;
	        } else if (val.valueOf() === true && !sv) {
	          val.v = some.apply(original._array, args);
	        }
	      } else if (op === pArrayOps.add) {
	        if (val.valueOf() === false) {
	          val.v = some.call(nv, fun, thisArg);
	        }
	      } else if (op === pArrayOps.remove) {
	        if (val.valueOf() === true && fun.call(thisArg, ov)) {
	          val.v = some.apply(original._array, args);
	        }
	      } else if (op === pArrayOps.setLength) {
	        if (val.valueOf() === true) {
	          val.v = some.apply(original._array, args);
	        }
	      } else if (op === pArrayOps.splice) {
	        if (val.valueOf() === false) {
	          val.v = some.call(nv, fun, thisArg);
	        } else if (some.call(ov, fun, thisArg) && !some.call(nv, fun, thisArg)) {
	          val.v = some.apply(original._array, args);
	        }
	      }
	    };
	  },
	
	  /**
	   * Generates a listener that can be attached to an {{#crossLink "ProAct.Array"}}{{/crossLink}} on which
	   * the method {{#crossLink "ProAct.Array/filter:method"}}{{/crossLink}} is invoked.
	   * <p>
	   *  The result of the {{#crossLink "ProAct.Array/filter:method"}}{{/crossLink}} method is another {{#crossLink "ProAct.Array"}}{{/crossLink}}, dependent on the <i>original</i> one.
	   * </p>
	   * <p>
	   *  For example if the original was:
	   *  <pre>
	   *    var a = new ProAct.Array([1, 3, 5]);
	   *  </pre>
	   *  and we invoked {{#crossLink "ProAct.Array/filter:method"}}{{/crossLink}} on it like this:
	   *  <pre>
	   *    var b = a.filter(function (el) {
	   *      return el % 2 === 0;
	   *    }); // b is []
	   *  </pre>
	   *  The new array - <b>b</b> is dependent on <b>a</b>, so if for example we unshift something to <b>a</b>, <b>b</b> should be updated:
	   *  <pre>
	   *    a.unshift(4); // b authomatically should become [4]
	   *  </pre>
	   * </p>
	   * <p>
	   *  The generated listener by this method does this - updates the <i>filtered</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, when the <i>original</i> changes
	   *  and it does it in an optimal way.
	   * </p>
	   *
	   * @for ProAct.Array.Listeners
	   * @static
	   * @param {ProAct.Array} filtered
	   *      The array created as a result of invoking {{#crossLink "ProAct.Array/filter:method"}}{{/crossLink}} on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}.
	   * @param {ProAct.Array} original
	   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} on which {{#crossLink "ProAct.Array/filter:method"}}{{/crossLink}} was invoked.
	   * @param {Array} args
	   *      The arguments passed to {{#crossLink "ProAct.Array/filter:method"}}{{/crossLink}}, when it was invoked on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}
	   * @return {Function}
	   *      A listener for events from the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, updating the <i>filtered</i> {{#crossLink "ProAct.Array"}}{{/crossLink}} on
	   *      every new event, if it is necessary.
	   */
	  filter: function (filtered, original, args) {
	    var fun = args[0], thisArg = args[1];
	    return function (event) {
	      if (P.U.isFunction(event)) {
	        args[0] = fun = event;
	        pArray.reFilter(original, filtered, args);
	        return;
	      }
	
	      pArrayLs.check(event);
	      var op  = event.args[0],
	          ind = event.args[1],
	          ov  = event.args[2],
	          nv  = event.args[3],
	          napply, oapply, oarr,
	          nvs, fnvs, j, ln, diff;
	
	      if (op === pArrayOps.set) {
	        napply = fun.call(thisArg, nv);
	        oapply = fun.call(thisArg, ov);
	
	        if (oapply === true || napply === true) {
	          pArray.reFilter(original, filtered, args);
	        }
	      } else if (op === pArrayOps.add) {
	        fnvs = [];
	        nvs = slice.call(nv, 0);
	        ln = nvs.length;
	        if (ind === 0) {
	          j = ln - 1;
	          while(j >= 0) {
	            if (fun.apply(thisArg, [nvs[j], j, original._array])) {
	              fnvs.unshift(nvs[j]);
	            }
	            j--;
	          }
	
	          if (fnvs.length) {
	            pArrayProto.unshift.apply(filtered, fnvs);
	          }
	        } else {
	          j = 0;
	          while(j < ln) {
	            if (fun.apply(thisArg, [nvs[j], original._array.length - (ln - j), original._array])) {
	              fnvs.push(nvs[j]);
	            }
	            j++;
	          }
	
	          if (fnvs.length) {
	            pArrayProto.push.apply(filtered, fnvs);
	          }
	        }
	      } else if (op === pArrayOps.remove) {
	        if (fun.apply(thisArg, [ov, ind, original._array])) {
	          if (ind === 0) {
	            filtered.shift();
	          } else {
	            filtered.pop();
	          }
	        }
	      } else if (op === pArrayOps.setLength) {
	        pArray.reFilter(original, filtered, args);
	      } else if (op === pArrayOps.reverse) {
	        filtered.reverse();
	      } else if (op === pArrayOps.sort) {
	        pArrayProto.sort.apply(filtered, nv);
	      } else if (op === pArrayOps.splice) {
	        pArray.reFilter(original, filtered, args);
	      }
	    };
	  },
	
	  /**
	   * Generates a listener that can be attached to an {{#crossLink "ProAct.Array"}}{{/crossLink}} on which
	   * the method {{#crossLink "ProAct.Array/map:method"}}{{/crossLink}} is invoked.
	   * <p>
	   *  The result of the {{#crossLink "ProAct.Array/map:method"}}{{/crossLink}} method is another {{#crossLink "ProAct.Array"}}{{/crossLink}}, dependent on the <i>original</i> one.
	   * </p>
	   * <p>
	   *  For example if the original was:
	   *  <pre>
	   *    var a = new ProAct.Array([1, 3, 5]);
	   *  </pre>
	   *  and we invoked {{#crossLink "ProAct.Array/map:method"}}{{/crossLink}} on it like this:
	   *  <pre>
	   *    var b = a.map(function (el) {
	   *      return el * el;
	   *    }); // b is [1, 9, 25]
	   *  </pre>
	   *  The new array - <b>b</b> is dependent on <b>a</b>, so if for example we pop from <b>a</b>, <b>b</b> should be updated:
	   *  <pre>
	   *    a.pop(); // b authomatically should become [1, 9]
	   *  </pre>
	   * </p>
	   * <p>
	   *  The generated listener by this method does this - updates the <i>mapped</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, when the <i>original</i> changes
	   *  and it does it in an optimal way.
	   * </p>
	   *
	   * @for ProAct.Array.Listeners
	   * @static
	   * @param {ProAct.Array} mapped
	   *      The array created as a result of invoking {{#crossLink "ProAct.Array/map:method"}}{{/crossLink}} on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}.
	   * @param {ProAct.Array} original
	   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} on which {{#crossLink "ProAct.Array/map:method"}}{{/crossLink}} was invoked.
	   * @param {Array} args
	   *      The arguments passed to {{#crossLink "ProAct.Array/map:method"}}{{/crossLink}}, when it was invoked on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}
	   * @return {Function}
	   *      A listener for events from the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, updating the <i>mapped</i> {{#crossLink "ProAct.Array"}}{{/crossLink}} on
	   *      every new event, if it is necessary.
	   */
	  map: function (mapped, original, args) {
	    var fun = args[0], thisArg = args[1];
	    return function (event) {
	      pArrayLs.check(event);
	      var op  = event.args[0],
	          ind = event.args[1],
	          ov  = event.args[2],
	          nv  = event.args[3],
	          nvs, j, ln, mnvs;
	      if (op === pArrayOps.set) {
	        mapped[ind] = fun.call(thisArg, nv);
	      } else if (op === pArrayOps.add) {
	        mnvs = [];
	        nvs = slice.call(nv, 0);
	        ln = nvs.length;
	        if (ind === 0) {
	          j = ln - 1;
	          while(j >= 0) {
	            mnvs[j] = fun.apply(thisArg, [nvs[j], j, original._array]);
	            j--;
	          }
	
	          pArrayProto.unshift.apply(mapped, mnvs);
	        } else {
	          j = 0;
	          while(j < ln) {
	            mnvs[j] = fun.apply(thisArg, [nvs[j], original._array.length - (ln - j), original._array]);
	            j++;
	          }
	
	          pArrayProto.push.apply(mapped, mnvs);
	        }
	      } else if (op === pArrayOps.remove) {
	        if (ind === 0) {
	          mapped.shift();
	        } else {
	          mapped.pop();
	        }
	      } else if (op === pArrayOps.setLength) {
	        mapped.length = nv;
	      } else if (op === pArrayOps.reverse) {
	        mapped.reverse();
	      } else if (op === pArrayOps.sort) {
	        pArrayProto.sort.apply(mapped, nv);
	      } else if (op === pArrayOps.splice) {
	        mnvs = [];
	        j = 0;
	        while (j < nv.length) {
	          mnvs[j] = fun.apply(thisArg, [nv[j], (j + ind), original._array]);
	          j++;
	        }
	
	        pArrayProto.splice.apply(mapped, [
	          ind,
	          ov.length
	        ].concat(mnvs));
	      }
	    };
	  },
	
	  /**
	   * Generates a listener that can be attached to an {{#crossLink "ProAct.Array"}}{{/crossLink}} on which
	   * the method {{#crossLink "ProAct.Array/preduce:method"}}{{/crossLink}} is invoked.
	   * <p>
	   *  The result of the {{#crossLink "ProAct.Array/preduce:method"}}{{/crossLink}} method is a {{#crossLink "ProAct.Property"}}{{/crossLink}}, dependent on the <i>original</i> array.
	   * </p>
	   * <p>
	   *  For example if the original was:
	   *  <pre>
	   *    var a = new ProAct.Array([1, 3, 5]);
	   *  </pre>
	   *  and we invoked {{#crossLink "ProAct.Array/preduce:method"}}{{/crossLink}} on it like this:
	   *  <pre>
	   *    var val = a.preduce(function (pel, el) {
	   *      return pel + el;
	   *    }, 0); // val.v is 0 + 1 + 3 + 5 = 9.
	   *  </pre>
	   *  The new value - <b>val</b> is dependent on <b>a</b>, so if for example we shift from <b>a</b>, <b>val</b> should be updated:
	   *  <pre>
	   *    a.shift(); // val.v authomatically should become 0 + 3 + 5 = 8.
	   *  </pre>
	   * </p>
	   * <p>
	   *  The generated listener by this method does this - updates the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}}, when the <i>original</i> array changes
	   *  and it does it in an optimal way.
	   * </p>
	   *
	   * @for ProAct.Array.Listeners
	   * @static
	   * @param {ProAct.Property} val
	   *      The result of invoking {{#crossLink "ProAct.Array/preduce:method"}}{{/crossLink}} on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}.
	   * @param {ProAct.Array} original
	   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} on which {{#crossLink "ProAct.Array/preduce:method"}}{{/crossLink}} was invoked.
	   * @param {Array} args
	   *      The arguments passed to {{#crossLink "ProAct.Array/preduce:method"}}{{/crossLink}}, when it was invoked on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}
	   * @return {Function}
	   *      A listener for events from the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, updating the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}} on
	   *      every new event, if it is necessary.
	   */
	  reduce: function (val, original, args) {
	    var oldLn = original._array.length, fun = args[0];
	    return function (event) {
	      pArrayLs.check(event);
	      var op  = event.args[0],
	          ind = event.args[1],
	          ov  = event.args[2],
	          nv  = event.args[3];
	      if ((op === pArrayOps.add && ind !== 0) ||
	         (op === pArrayOps.splice && ind >= oldLn && ov.length === 0)) {
	        val.v = reduce.apply(nv, [fun, val.valueOf()]);
	      } else {
	        val.v = reduce.apply(original._array, args);
	      }
	      oldLn = original._array.length;
	    };
	  },
	
	  /**
	   * Generates a listener that can be attached to an {{#crossLink "ProAct.Array"}}{{/crossLink}} on which
	   * the method {{#crossLink "ProAct.Array/preduceRight:method"}}{{/crossLink}} is invoked.
	   * <p>
	   *  The result of the {{#crossLink "ProAct.Array/preduceRight:method"}}{{/crossLink}} method is a {{#crossLink "ProAct.Property"}}{{/crossLink}}, dependent on the <i>original</i> array.
	   * </p>
	   * <p>
	   *  For example if the original was:
	   *  <pre>
	   *    var a = new ProAct.Array([1, 3, 5]);
	   *  </pre>
	   *  and we invoked {{#crossLink "ProAct.Array/preduceRight:method"}}{{/crossLink}} on it like this:
	   *  <pre>
	   *    var val = a.preduceRight(function (pel, el) {
	   *      return pel + el;
	   *    }, 0); // val.v is 0 + 5 + 3 + 1 = 9.
	   *  </pre>
	   *  The new value - <b>val</b> is dependent on <b>a</b>, so if for example we splice <b>a</b>, <b>val</b> should be updated:
	   *  <pre>
	   *    a.splice(1, 2, 4, 5); // val.v authomatically should become 0 + 5 + 4 + 1 = 10.
	   *  </pre>
	   * </p>
	   * <p>
	   *  The generated listener by this method does this - updates the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}}, when the <i>original</i> array changes
	   *  and it does it in an optimal way.
	   * </p>
	   *
	   * @for ProAct.Array.Listeners
	   * @static
	   * @param {ProAct.Property} val
	   *      The result of invoking {{#crossLink "ProAct.Array/preduceRight:method"}}{{/crossLink}} on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}.
	   * @param {ProAct.Array} original
	   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} on which {{#crossLink "ProAct.Array/preduceRight:method"}}{{/crossLink}} was invoked.
	   * @param {Array} args
	   *      The arguments passed to {{#crossLink "ProAct.Array/preduceRight:method"}}{{/crossLink}}, when it was invoked on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}
	   * @return {Function}
	   *      A listener for events from the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, updating the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}} on
	   *      every new event, if it is necessary.
	   */
	  reduceRight: function (val, original, args) {
	    var fun = args[0];
	    return function (event) {
	      pArrayLs.check(event);
	      var op  = event.args[0],
	          ind = event.args[1],
	          ov  = event.args[2],
	          nv  = event.args[3];
	      if ((op === pArrayOps.add && ind === 0) ||
	         (op === pArrayOps.splice && ind === 0 && ov.length === 0)) {
	        val.v = reduceRight.apply(nv, [fun, val.valueOf()]);
	      } else {
	        val.v = reduceRight.apply(original._array, args);
	      }
	    };
	  },
	
	  /**
	   * Generates a listener that can be attached to an {{#crossLink "ProAct.Array"}}{{/crossLink}} on which
	   * the method {{#crossLink "ProAct.Array/pindexOf:method"}}{{/crossLink}} is invoked.
	   * <p>
	   *  The result of the {{#crossLink "ProAct.Array/pindexOf:method"}}{{/crossLink}} method is a {{#crossLink "ProAct.Property"}}{{/crossLink}}, dependent on the <i>original</i> array.
	   * </p>
	   * <p>
	   *  For example if the original was:
	   *  <pre>
	   *    var a = new ProAct.Array([1, 3, 5]);
	   *  </pre>
	   *  and we invoked {{#crossLink "ProAct.Array/pindexOf:method"}}{{/crossLink}} on it like this:
	   *  <pre>
	   *    var val = a.pindexOf(5); // val.v is 2.
	   *  </pre>
	   *  The new value - <b>val</b> is dependent on <b>a</b>, so if for example we reverse <b>a</b>, <b>val</b> should be updated:
	   *  <pre>
	   *    a.reverse(); // val.v authomatically should become 0.
	   *  </pre>
	   * </p>
	   * <p>
	   *  The generated listener by this method does this - updates the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}}, when the <i>original</i> array changes
	   *  and it does it in an optimal way.
	   * </p>
	   *
	   * @for ProAct.Array.Listeners
	   * @static
	   * @param {ProAct.Property} val
	   *      The result of invoking {{#crossLink "ProAct.Array/pindexOf:method"}}{{/crossLink}} on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}.
	   * @param {ProAct.Array} original
	   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} on which {{#crossLink "ProAct.Array/pindexOf:method"}}{{/crossLink}} was invoked.
	   * @param {Array} args
	   *      The arguments passed to {{#crossLink "ProAct.Array/pindexOf:method"}}{{/crossLink}}, when it was invoked on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}
	   * @return {Function}
	   *      A listener for events from the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, updating the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}} on
	   *      every new event, if it is necessary.
	   */
	  indexOf: function (val, original, args) {
	    var what = args[0], fromIndex = args[1], hasFrom = !!fromIndex;
	    return function (event) {
	      pArrayLs.check(event);
	      var op  = event.args[0],
	          ind = event.args[1],
	          ov  = event.args[2],
	          nv  = event.args[3],
	          v = val.valueOf(),
	          nvi, i;
	
	      if (op === pArrayOps.set) {
	        if (ov === what) {
	          val.v = indexOf.apply(original._array, args);
	        } else if (nv === what && (ind < v || v === -1) && (!hasFrom || ind >= fromIndex)) {
	          val.v = ind;
	        }
	      } else if (op === pArrayOps.add) {
	        nvi = nv.indexOf(what);
	        if (ind === 0) {
	          if (nvi !== -1 && (!hasFrom || ind >= fromIndex)) {
	            val.v = nvi;
	          } else if (v !== -1) {
	            val.v = v + nv.length;
	          }
	        } else if (v === -1 &&  (!hasFrom || ind >= fromIndex)) {
	          if (nvi !== -1) {
	            val.v = ind;
	          }
	        }
	      } else if (op === pArrayOps.remove) {
	        if (v !== -1) {
	          if (ind === 0) {
	            if (ov === what && !hasFrom) {
	              val.v = indexOf.apply(original._array, args);
	            } else {
	              val.v = v - 1;
	            }
	          } else if (what === ov) {
	            val.v = -1;
	          }
	        }
	      } else if (op === pArrayOps.setLength && nv <= v) {
	        val.v = -1;
	      } else if (op === pArrayOps.reverse || op === pArrayOps.sort) {
	        val.v = indexOf.apply(original._array, args);
	      } else if (op === pArrayOps.splice) {
	        nvi = nv.indexOf(what);
	        i = nvi + ind;
	        if (ind <= v) {
	          if (nvi !== -1 && i < v && (!hasFrom || fromIndex <= i)) {
	            val.v = i;
	          } else if (nv.length !== ov.length && ov.indexOf(what) === -1) {
	            v = v + (nv.length - ov.length);
	            if (!hasFrom || v >= fromIndex) {
	              val.v = v;
	            } else {
	              val.v = indexOf.apply(original._array, args);
	            }
	          } else {
	            val.v = indexOf.apply(original._array, args);
	          }
	        } else if (v === -1 && nvi !== -1) {
	          val.v = i;
	        }
	      }
	    };
	  },
	
	  /**
	   * Generates a listener that can be attached to an {{#crossLink "ProAct.Array"}}{{/crossLink}} on which
	   * the method {{#crossLink "ProAct.Array/plastIndexOf:method"}}{{/crossLink}} is invoked.
	   * <p>
	   *  The result of the {{#crossLink "ProAct.Array/plastIndexOf:method"}}{{/crossLink}} method is a {{#crossLink "ProAct.Property"}}{{/crossLink}}, dependent on the <i>original</i> array.
	   * </p>
	   * <p>
	   *  For example if the original was:
	   *  <pre>
	   *    var a = new ProAct.Array([5, 4, 5, 3]);
	   *  </pre>
	   *  and we invoked {{#crossLink "ProAct.Array/plastIndexOf:method"}}{{/crossLink}} on it like this:
	   *  <pre>
	   *    var val = a.plastIndexOf(5); // val.v is 2.
	   *  </pre>
	   *  The new value - <b>val</b> is dependent on <b>a</b>, so if for example we sort <b>a</b>, <b>val</b> should be updated:
	   *  <pre>
	   *    a.sort(); // val.v authomatically should become 3.
	   *  </pre>
	   * </p>
	   * <p>
	   *  The generated listener by this method does this - updates the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}}, when the <i>original</i> array changes
	   *  and it does it in an optimal way.
	   * </p>
	   *
	   * @for ProAct.Array.Listeners
	   * @static
	   * @param {ProAct.Property} val
	   *      The result of invoking {{#crossLink "ProAct.Array/plastIndexOf:method"}}{{/crossLink}} on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}.
	   * @param {ProAct.Array} original
	   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} on which {{#crossLink "ProAct.Array/plastIndexOf:method"}}{{/crossLink}} was invoked.
	   * @param {Array} args
	   *      The arguments passed to {{#crossLink "ProAct.Array/plastIndexOf:method"}}{{/crossLink}}, when it was invoked on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}
	   * @return {Function}
	   *      A listener for events from the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, updating the <i>val</i> {{#crossLink "ProAct.Property"}}{{/crossLink}} on
	   *      every new event, if it is necessary.
	   */
	  lastIndexOf: function (val, original, args) {
	    var what = args[0], fromIndex = args[1], hasFrom = !!fromIndex;
	    return function (event) {
	      pArrayLs.check(event);
	      var op  = event.args[0],
	          ind = event.args[1],
	          ov  = event.args[2],
	          nv  = event.args[3],
	          v = val.valueOf(),
	          nvi, i;
	
	      if (op === pArrayOps.set) {
	        if (ov === what) {
	          val.v = lastIndexOf.apply(original._array, args);
	        } else if (nv === what && (ind > v || v === -1) && (!hasFrom || ind <= fromIndex)) {
	          val.v = ind;
	        }
	      } else if (op === pArrayOps.add) {
	        nvi = nv.indexOf(what);
	        if (ind === 0) {
	          if (nvi !== -1 && v === -1 && (!hasFrom || ind <= fromIndex)) {
	            val.v = nvi;
	          } else if (v !== -1) {
	            val.v = v + nv.length;
	          }
	        } else if (nvi !== -1 && (!hasFrom || (ind + nvi) <= fromIndex)) {
	          val.v = ind + nvi;
	        }
	      } else if (op === pArrayOps.remove) {
	        if (v !== -1) {
	          if (ind === 0) {
	            val.v = v - 1;
	          } else if (what === ov) {
	            val.v = lastIndexOf.apply(original._array, args);
	          }
	        }
	      } else if (op === pArrayOps.splice || op === pArrayOps.reverse || op === pArrayOps.sort || (op === pArrayOps.setLength && nv < ov)) {
	        val.v = lastIndexOf.apply(original._array, args);
	      }
	    };
	  },
	
	  /**
	   * Generates a listener that can be attached to an {{#crossLink "ProAct.Array"}}{{/crossLink}} on which
	   * the method {{#crossLink "ProAct.Array/slice:method"}}{{/crossLink}} is invoked.
	   * <p>
	   *  The result of the {{#crossLink "ProAct.Array/slice:method"}}{{/crossLink}} method is another {{#crossLink "ProAct.Array"}}{{/crossLink}}, dependent on the <i>original</i> one.
	   * </p>
	   * <p>
	   *  For example if the original was:
	   *  <pre>
	   *    var a = new ProAct.Array([1, 3, 5]);
	   *  </pre>
	   *  and we invoked {{#crossLink "ProAct.Array/slice:method"}}{{/crossLink}} on it like this:
	   *  <pre>
	   *    var b = a.slice(1); // b is [3, 5]
	   *  </pre>
	   *  The new array - <b>b</b> is dependent on <b>a</b>, so if for example we push to <b>a</b>, <b>b</b> should be updated:
	   *  <pre>
	   *    a.push(32); // b authomatically should become [3, 5, 32]
	   *  </pre>
	   * </p>
	   * <p>
	   *  The generated listener by this method does this - updates the <i>sliced</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, when the <i>original</i> changes
	   *  and it does it in an optimal way.
	   * </p>
	   *
	   * @for ProAct.Array.Listeners
	   * @static
	   * @param {ProAct.Array} sliced
	   *      The array created as a result of invoking {{#crossLink "ProAct.Array/slice:method"}}{{/crossLink}} on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}.
	   * @param {ProAct.Array} original
	   *      The {{#crossLink "ProAct.Array"}}{{/crossLink}} on which {{#crossLink "ProAct.Array/slice:method"}}{{/crossLink}} was invoked.
	   * @param {Array} args
	   *      The arguments passed to {{#crossLink "ProAct.Array/slice:method"}}{{/crossLink}}, when it was invoked on the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}
	   * @return {Function}
	   *      A listener for events from the <i>original</i> {{#crossLink "ProAct.Array"}}{{/crossLink}}, updating the <i>sliced</i> {{#crossLink "ProAct.Array"}}{{/crossLink}} on
	   *      every new event, if it is necessary.
	   */
	  slice: function (sliced, original, args) {
	    var s = args[0], e = args[1], hasEnd = !!e;
	    return function (event) {
	      pArrayLs.check(event);
	      var op  = event.args[0],
	          ind = event.args[1],
	          ov  = event.args[2],
	          nv  = event.args[3],
	          osl;
	      if (op === pArrayOps.set) {
	        if (ind >= s && (!hasEnd || ind < e)) {
	          sliced[ind - s] = nv;
	        }
	      } else {
	        osl = sliced._array;
	        sliced._array.length = 0;
	        push.apply(sliced._array, slice.apply(original._array, args));
	        sliced.core.updateByDiff(osl);
	      }
	    };
	  }
	};
	
	/**
	 * The `proact-dsl` module provides DSL for creating and managing different ProAct objects.
	 *
	 *
	 * @module proact-dsl
	 * @main proact-dsl
	 */
	
	/**
	 * <p>
	 *  Constructs a `ProAct.Registry`.
	 *  It is used to store/create objects that can be referenced or configured using the {{#crossLink "ProAct.DSL"}}{{/crossLink}}.
	 * </p>
	 * <p>
	 *  `ProAct.Registry` is part of the `proact-dsl` module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.Registry
	 * @constructor
	 */
	function Registry () {
	  this.providers = {};
	}
	ProAct.Registry = P.R = Registry;
	
	ProAct.Registry.prototype = rProto = {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.Registry
	   * @final
	   * @for ProAct.Registry
	   */
	  constructor: ProAct.Registry,
	
	  /**
	   * Registers a {{#crossLink "ProAct.Registry.Provider"}}{{/crossLink}} for the passed <i>namespace</i> in the registry.
	   *
	   * @for ProAct.Registry
	   * @instance
	   * @method register
	   * @param {String} namespace
	   *      The namespace to register the <i>provider</i> in.
	   * @param {ProAct.Registry.Provider} provider
	   *      The {{#crossLink "ProAct.Registry.Provider"}}{{/crossLink}} to register.
	   * @return {ProAct.Registers}
	   *      <i>this</i>
	   * @throws {Error}
	   *      If a {{#crossLink "ProAct.Registry.Provider"}}{{/crossLink}} is already registered for the passed <i>namespace</i>.
	   */
	  register: function (namespace, provider) {
	    if (this.providers[namespace]) {
	      throw new Error(namespace + 'is already registered in this registry.');
	    }
	    this.providers[namespace] = provider;
	    if (provider.registered) {
	      provider.registered(this);
	    }
	    return this;
	  },
	
	  /**
	   * Retrieves the right {{#crossLink "ProAct.Registry.Provider"}}{{/crossLink}} using the <i>name</i> of stored
	   * in <i>this</i> ProAct.Registry object, or the <i>name</i> of an object to be stored
	   *
	   * @for ProAct.Registry
	   * @instance
	   * @method getProviderByName
	   * @param {String} name
	   *      The name of storable object.
	   *      <p>
	   *        It must be in the format '{namespace}:{key}'.
	   *      </p>
	   *      <p>
	   *        Here the namespace is the namespace the {{#crossLink "ProAct.Registry.Provider"}}{{/crossLink}} manages.
	   *      </p>
	   * @return {Array}
	   *      The first element in the result is the {{#crossLink "ProAct.Registry.Provider"}}{{/crossLink}} or undefined if not found.
	   *      <p>
	   *        The second one is the <b>key</b> at which an object is stored or will be stored in the provider.
	   *      </p>
	   *      <p>
	   *        The third element is an array with options for storing/creating an object passed to the provider using
	   *        the <i>name</i> string.
	   *      </p>
	   */
	  getProviderByName: function (name) {
	    var parts = name.split(':');
	
	    return [this.providers[parts[0]], parts[1], parts.slice(2)];
	  },
	
	  /**
	   * Configures an object to be stored using {{#crossLink "ProAct.DSL"}}{{/crossLink}} passed through <i>options</i> and DSL arguments.
	   * <p>
	   *  Example usage:
	   * </p>
	   * <p>
	   *  A {{#crossLink "ProAct.Stream"}}{{/crossLink}} is passed to the registry for setup with DSL data.
	   * </p>
	   * <p>
	   *  The data passed through the <i>options</i> parameter is
	   *  <pre>
	   *    '<<(s:foo)|map(-)|filter($1)'
	   *  </pre>
	   * </p>
	   * <p>
	   *  And the arguments for the DSL machine passed through the <i>args</i> parameter are
	   *  <pre>
	   *    [function (v) {
	   *      return v % 2 === 0;
	   *    }]
	   *  </pre>
	   * </p>
	   * <p>
	   *  This means that a {{#crossLink "ProAct.Stream"}}{{/crossLink}} stored in <i>this</i> registry by the key 'foo' should be set
	   *  as a source to the passed as the <i>object</i> parameter simple {{#crossLink "ProAct.Stream"}}{{/crossLink}}.
	   * </p>
	   * <p>
	   *  It also means that for every value comming in the <i>object</i> parameter's stream there should be mapping of negativity and
	   *  only even values should be passed to it.
	   * </p>
	   * <p>
	   *  So if we trigger in the 'foo' stream the value of <b>4</b> in our stream we will get <b>-4</b>, and if we trigger 5, we won't get anything.
	   * </p>
	   *
	   * @for ProAct.Registry
	   * @instance
	   * @method setup
	   * @param {Object} object
	   *      The object to setup.
	   * @param {String|Object} options
	   *      A {{#crossLink "ProAct.DSL"}}{{/crossLink}} data object or string used to setup the object.
	   * @param {Array} args
	   *      Arguments to be used by the {{#crossLink "ProAct.DSL/run:method"}}{{/crossLink}} method while configuring the passed <i>object</i>.
	   * @return {Object}
	   *      Ready to strore object.
	   */
	  setup: function (object, options, args) {
	    return dsl.run.apply(null, [object, options, this].concat(args));
	  },
	
	  /**
	   * Creates a new object and stores it in <i>this</i> registry, using the right provider for the creation
	   * and configuring it using the DSL passed through the <i>options</i> parameter.
	   * <p>
	   *  {{#crossLink "ProAct.Registry/getProviderByName:method"}}{{/crossLink}} is used to locate the right provider to create the object with.
	   * </p>
	   * <p>
	   *  {{#crossLink "ProAct.Registry/setup:method"}}{{/crossLink}} is used to setup the newly created object using the {{#crossLink "ProAct.DSL"}}{{/crossLink}}
	   * </p>
	   * <p>
	   *  The idea of this method is to create and configure {{#crossLink "ProAct.Actor"}}{{/crossLink}} objects.
	   * </p>
	   *
	   * @for ProAct.Registry
	   * @instance
	   * @method make
	   * @param {String} name
	   *      Name of the object to create and store.
	   *      <p>
	   *        It must be in the format '{namespace}:{key}'
	   *      </p>
	   * @param {String|Object} options
	   *      A {{#crossLink "ProAct.DSL"}}{{/crossLink}} data object or string used to setup the object to be created.
	   * @param [...]
	   *      <b>Arguments</b> to be used by the {{#crossLink "ProAct.DSL/run:method"}}{{/crossLink}} method while configuring the newly created <i>object</i>.
	   * @return {Object}
	   *      The newly created, stored and configured object, or null if there was no {{#crossLink "ProAct.Registry.Provider"}}{{/crossLink}} register for its type.
	   */
	  make: function (name, options) {
	    var args = slice.call(arguments, 2),
	        p = this.getProviderByName(name),
	        actor;
	
	    if (p[0]) {
	      actor = p[0].make.apply(p[0], [p[1], p[2]].concat(args));
	      return this.setup(actor, options, args);
	    }
	    return null;
	  },
	
	  /**
	   * Stores an object  in <i>this</i> registry, using the right provider to configure it using the DSL passed through the <i>options</i> parameter.
	   * <p>
	   *  {{#crossLink "ProAct.Registry/getProviderByName:method"}}{{/crossLink}} is used to locate the right provider to store the object to.
	   * </p>
	   *
	   * @for ProAct.Registry
	   * @instance
	   * @method store
	   * @param {String} name
	   *      Name of the object to store.
	   *      <p>
	   *        It must be in the format '{namespace}:{key}'
	   *      </p>
	   * @param {Object} object
	   *      The object to store.
	   * @param {String|Object} options
	   *      A {{#crossLink "ProAct.DSL"}}{{/crossLink}} data object or string used to setup the object to be stored (optional).
	   * @param [...]
	   *      <b>Arguments</b> to be used by the {{#crossLink "ProAct.DSL/run:method"}}{{/crossLink}} method while configuring the <i>object</i>.
	   * @return {Object}
	   *      The stored and configured object, or null if there was no {{#crossLink "ProAct.Registry.Provider"}}{{/crossLink}} register for its type.
	   */
	  store: function (name, object, options) {
	    var args = slice.call(arguments, 2),
	        p = this.getProviderByName(name);
	
	    if (p[0]) {
	      return p[0].store.apply(p[0], [p[1], object, p[2]].concat(args));
	    }
	    return null;
	  },
	
	  /**
	   * Retrieves an object, stored <i>this</i> registry.
	   * <p>
	   *  {{#crossLink "ProAct.Registry/getProviderByName:method"}}{{/crossLink}} is used to locate the right provider to retrieve the object from.
	   * </p>
	   *
	   * @for ProAct.Registry
	   * @instance
	   * @method get
	   * @param {String} name
	   *      Name of the object to find.
	   *      <p>
	   *        It must be in the format '{namespace}:{key}'
	   *      </p>
	   * @return {Object}
	   *      The stored object, or null if there was no {{#crossLink "ProAct.Registry.Provider"}}{{/crossLink}} register for its type or no object registered for the passed <i>name</i>.
	   */
	  get: function (name) {
	    var p = this.getProviderByName(name);
	
	    if (p[0]) {
	      return p[0].get(p[1]);
	    }
	    return null;
	  },
	
	  /**
	   * Helper method for transforming an array of keys of stored items in <i>this</i> `ProAct.Registry` to an array of the actual items.
	   * <p>
	   *  Mainly used by the {{#crossLink "ProAct.DSL"}}{{/crossLink}} logic.
	   * </p>
	   *
	   * @for ProAct.Registry
	   * @protected
	   * @instance
	   * @method toObjectArray
	   * @param {Array} array
	   *      Array of string keys to objects stored in <i>this</i> registry to be retrieved using {{#crossLink "ProAct.Registry/toObject:method"}}{{/crossLink}}.
	   *      <p>
	   *        If object is not stored on some key, the key itself is returned in the same possition in the result array.
	   *      </p>
	   * @return {Array}
	   *      Of the retrieved objects, in the same order as the keys.
	   */
	  toObjectArray: function (array) {
	    var self = this;
	    if (!P.U.isArray(array)) {
	      return this.toObject(array);
	    }
	    return map.call(array, function (el) {
	      return self.toObject(el);
	    });
	  },
	
	  /**
	   * Helper method for transforming a key of stored item in <i>this</i> `ProAct.Registry` to the actual item or returning the key, if
	   * the item is not found in the `ProAct.Registry`.
	   * <p>
	   *  Mainly used by the {{#crossLink "ProAct.DSL"}}{{/crossLink}} logic.
	   * </p>
	   *
	   * @for ProAct.Registry
	   * @protected
	   * @instance
	   * @method toObject
	   * @param {String|Object} data
	   *      Key of strored object or something else. If the key is valid and there is something stored on it, the stored object is retrieved.
	   *      <p>
	   *        If there is nothing stored for this <i>data</i>, the <i>data</i> itself is returned.
	   *      </p>
	   * @return {Object}
	   *      Stored object, if found using the passed <i>data</i> or the <i>data</i> itself.
	   */
	  toObject: function (data) {
	    if (P.U.isString(data)) {
	      var result = this.get(data);
	      return result ? result : data;
	    }
	
	    return data;
	  }
	};
	
	P.U.ex(P.Actor.prototype, {
	
	  /**
	   * Adds a new <i>transformation</i> to the list of transformations
	   * of <i>this actor</i>.
	   *
	   * <p>
	   *  A transformation is a function or an object that has a <i>call</i> method defined.
	   *  This function or call method should have one argument and to return a transformed version of it.
	   *  If the returned value is {{#crossLink "ProAct.Actor/BadValue:property"}}{{/crossLink}}, the next transformations are skipped and the updating
	   *  value/event becomes - bad value.
	   * </p>
	   *
	   * <p>
	   *  Every value/event that updates <i>this actor</i> will be transformed using the new transformation.
	   * </p>
	   *
	   * This method uses {{#crossLink "ProAct.Actor/transform:method"}}{{/crossLink}}, but can read transformation
	   * funtion/object stored in the registry (if the proact-dsl module is present) by it's string name.
	   *
	   * @for ProAct.Actor
	   * @instance
	   * @method transformStored
	   * @protected
	   * @param {Object|String} transformation The transformation to add. Can be string - to be retrieved by name.
	   * @param {String} type The type of the transformation, for example `mapping`.
	   * @return {ProAct.Actor}
	   *      <b>this</b>
	   */
	  transformStored: function (transformation, type) {
	    if (P.U.isString(transformation)) {
	      P.DSL.run(this, type + '(' + transformation + ')', P.registry);
	      return this;
	    }
	
	    return this.transform(transformation);
	  }
	
	});
	
	P.U.ex(P.S, {
	  fromString: function (str, args) {
	    return P.registry.setup(
	      new ProAct.Stream(), str, args
	    );
	  }
	});
	
	P.U.ex(P.ObjectCore.prototype, {
	
	  /**
	   * Applies meta information and actions on already created property.
	   *
	   * This method is called by the {{#crossLink "ProAct.ObjectCore/makeProp:method"}}{{/crossLink}} one,
	   * other modules can inject logic by overriding it.
	   *
	   * The meta is in format of the {{#crossLink "ProAct.DSL"}}{{/crossLink}}.
	   *
	   * @for ProAct.ObjectCore
	   * @protected
	   * @instance
	   * @method applyMeta
	   * @param {String|Array} meta
	   *      Meta information for the property to modify with.
	   * @param {ProAct.Property} property
	   *      The property to update.
	   */
	  applyMeta: function (meta, property) {
	    if (meta && P.registry) {
	      if (!P.U.isArray(meta)) {
	        meta = [meta];
	      }
	
	      if (!(meta[0] instanceof ProAct.Property)) {
	        P.registry.setup.apply(P.registry, [property].concat(meta));
	      }
	    }
	  }
	
	});
	
	/**
	 * @module proact-dsl
	 */
	
	/**
	 * Contains {{#crossLink "ProAct.DSL"}}{{/crossLink}} operation logic definitions.
	 * <p>
	 *  Every operation has
	 *  <ol>
	 *    <li><b>sym</b> - A symbol used to identify the right operation in a DSL string or object.</li>
	 *    <li><b>match method</b> - A method used for identifying the operation, usually it uses the <i>sym</i></li>
	 *    <li>
	 *      <b>toOptions</b> - A method which is able to turn a DSL string with the operation,
	 *      into an actual array of options containing all the functions to be executed by the DSL and their arguments.
	 *    </li>
	 *    <li><b>action</b> - The operation logic. The options object of the above method should be passed to it, as well as the targed on which the DSL should be run.</li>
	 *  </ol>
	 * </p>
	 *
	 * @namespace ProAct
	 * @class OpStore
	 * @static
	 */
	ProAct.OpStore = {
	
	  all: {
	
	    /**
	     * Can generate a simple operation definition.
	     * <p>
	     *  It is used for defining all the simple operations, like <i>map</i> or <i>filter</i>.
	     * </p>
	     *
	     * @for ProAct.OpStore.all
	     * @static
	     * @param {String} name
	     *      The name of the operation to define.
	     * @param {String} sym
	     *      The symbol of the operation that shoul dbe used to identify it from within a DSL string.
	     * @return {Object}
	     *      <ol>
	     *        <li><b>sym</b> - The symbol used to identify the operation in a DSL string or object.</li>
	     *        <li><b>match method</b> - A method using the <i>sym</i> for identifying the operation in a DSL string.</li>
	     *        <li>
	     *          <b>toOptions</b> - A method which is able to turn a DSL string with the operation,
	     *          into the actual array of options containing all the functions to be executed by the DSL and their arguments.
	     *          <p>
	     *            This method is able to fetch predefined operation functions.
	     *          </p>
	     *        </li>
	     *        <li>
	     *          <b>action</b> - The operation logic.
	     *          The options object of the above method should be passed to it, as well as the targed on which the DSL should be run.
	     *          <p>
	     *            It just calls method named as the passed <i>name</i> parameter on the targed <i>object</i>, passing it as arguments,
	     *            the argument array generated from the <i>toOptions</i> method.
	     *          </p>
	     *        </li>
	     *      </ol>
	     */
	    simpleOp: function(name, sym) {
	      return {
	        sym: sym,
	        match: function (op) {
	          return op.substring(0, sym.length) === sym;
	        },
	        setupArgument: function (arg, realArguments, predefined, opArguments) {
	          var i, k, ln, actions;
	          if (arg.charAt(0) === '$') {
	            arg = realArguments[parseInt(arg.substring(1), 10) - 1];
	          } else if (predefined && arg.charAt(0) === '&') {
	            i = arg.lastIndexOf('&');
	            k = arg.substring(0, i);
	            if (predefined[k]) {
	              arg = predefined[k].call(null, arg.substring(i + 1));
	            }
	          } else if (predefined && arg.charAt(0) === '!') {
	            arg = this.setupArgument(arg.substring(1), realArguments, predefined, opArguments);
	            if (arg) {
	              k = arg;
	              arg = function () {
	                return !k.apply(null, arguments);
	              };
	            }
	          } else if (predefined && predefined[arg]) {
	            arg = predefined[arg];
	
	            if (P.U.isArray(arg)) {
	              opArguments.push.apply(opArguments, arg);
	              arg = undefined;
	            }
	          }
	
	          return arg;
	        },
	        toOptions: function (actionObject, op) {
	          var reg = new RegExp(dslOps[name].sym + "(\\w*)\\(([\\s\\S]*)\\)"),
	              matched = reg.exec(op),
	              action = matched[1], args = matched[2],
	              opArguments = [],
	              realArguments = slice.call(arguments, 2),
	              predefined = dsl.predefined[name],
	              arg, i , ln, k;
	          if (action) {
	            opArguments.push(action);
	          }
	
	          if (args) {
	            args = args.split(',');
	            ln = args.length;
	            for (i = 0; i < ln; i++) {
	              arg = args[i].trim();
	              arg = this.setupArgument(arg, realArguments, predefined, opArguments);
	
	              if (arg !== undefined) {
	                opArguments.push(arg);
	              }
	            }
	          }
	
	          if (!actionObject[name]) {
	            actionObject[name] = opArguments;
	          } else {
	            if (!P.U.isArray(actionObject[name][0])) {
	              actionObject[name] = [actionObject[name], opArguments];
	            } else {
	              actionObject[name].push(opArguments);
	            }
	          }
	
	          actionObject.order = actionObject.order || [];
	          actionObject.order.push(name);
	        },
	        action: function (object, actionObject) {
	          if (!actionObject || !actionObject[name]) {
	            return object;
	          }
	
	          var args = actionObject[name];
	          if (!P.U.isArray(args)) {
	            args = [args];
	          }
	
	          if (name === 'accumulation' && P.U.isArray(args[0]) && args[0].length == 2 && P.U.isFunction(args[0][1])) {
	            args = args[0];
	          }
	
	          return object[name].apply(object, args);
	        }
	      };
	    }
	  }
	};
	opStoreAll = P.OpStore.all;
	
	/**
	 * Contains implementation of the `ProAct.js DSL`.
	 * <p>
	 *  The idea of the DSL is to define {{#crossLink "ProAct.Actor"}}{{/crossLink}}s and their dependencies on each other in a declarative and simple way.
	 * </p>
	 * <p>
	 *  The {{#crossLink "ProAct.Registry"}}{{/crossLink}} is used to store these actors.
	 * </p>
	 * <p>
	 *  For example if we want to have a stream configured to write in a property, it is very easy done using the DSL:
	 *  <pre>
	 *    ProAct.registry.prob('val', 0, '<<(s:data)');
	 *  </pre>
	 *  This tells the {{#crossLink "ProAct.Registry"}}{{/crossLink}} to create a {{#crossLink "ProAct.Property"}}{{/crossLink}} with the value of zero, and to point the previously,
	 *  stored 'data' stream to it.
	 * </p>
	 *
	 * @namespace ProAct
	 * @class DSL
	 * @static
	 */
	ProAct.DSL = {
	
	  /**
	   * A separator which can be used to separate multiple DSL expressions in one string.
	   *
	   * @for ProAct.DSL
	   * @type String
	   * @property separator
	   * @final
	   */
	  separator: '|',
	
	  /**
	   * The operation definitions of the DSL.
	   * <p>
	   *  All of the available and executable operations defined in the ProAct.DSL.
	   * </p>
	   * <p>
	   *  Users of ProAct.js can add their own operation to it.
	   *  <pre>
	   *    ProAct.DSL.ops.myOp = ProAct.OpStore.all.simpleOp('foo', 'foo');
	   *  </pre>
	   * </p>
	   *
	   * @namespace ProAct.DSL
	   * @class ops
	   * @static
	   */
	  ops: {
	
	    /**
	     * DSL operation for defining sources of {{#crossLink "ProAct.Actor"}}{{/crossLink}}s.
	     * <p>
	     *  For example
	     *  <pre>
	     *    '<<(s:bla)'
	     *  </pre>
	     *  means that the source of the targed of the DSL should be a stream stored in the {{#crossLink "ProAct.Registry"}}{{/crossLink}} by the key 'bla'.
	     * </p>
	     * <p>
	     *  or
	     *  <pre>
	     *    '<<($1)'
	     *  </pre>
	     *  means that the source of the targed of the DSL should be an {{#crossLink "ProAct.Actor"}}{{/crossLink}} passed to the {{#crossLink "ProAct.DSL/run:method"}}{{/crossLink}}
	     *  method as the first argument after the targed object, the DSL data and the registry.
	     * </p>
	     *
	     * @for ProAct.DSL.ops
	     * @final
	     * @property into
	     * @type Object
	     */
	    into: opStoreAll.simpleOp('into', '<<'),
	
	    /**
	     * DSL operation for setting the targed of the DSL as sources of another {{#crossLink "ProAct.Actor"}}{{/crossLink}}s.
	     * <p>
	     *  For example
	     *  <pre>
	     *    '>>(s:bla)'
	     *  </pre>
	     *  means that the targed of the DSL should become a source for a stream stored in the {{#crossLink "ProAct.Registry"}}{{/crossLink}} by the key 'bla'.
	     * </p>
	     * <p>
	     *  or
	     *  <pre>
	     *    '>>($1)'
	     *  </pre>
	     *  means that the targed of the DSL should become a source for an {{#crossLink "ProAct.Actor"}}{{/crossLink}} passed to the {{#crossLink "ProAct.DSL/run:method"}}{{/crossLink}}
	     *  method as the first argument after the targed object, the DSL data and the registry.
	     * </p>
	     *
	     * @for ProAct.DSL.ops
	     * @final
	     * @property out
	     * @type Object
	     */
	    out: opStoreAll.simpleOp('out', '>>'),
	
	    /**
	     * DSL operation for attaching listener to the target {{#crossLink "ProAct.Actor"}}{{/crossLink}} of the DSL.
	     * <p>
	     *  For example
	     *  <pre>
	     *    '@(f:bla)'
	     *  </pre>
	     *  means that listener function, stored in the {{#crossLink "ProAct.Registry"}}{{/crossLink}} as 'bla'
	     *  should be attached as a listener to the targed {{#crossLink "ProAct.Actor"}}{{/crossLink}} of the DSL.
	     * </p>
	     *
	     * @for ProAct.DSL.ops
	     * @final
	     * @property on
	     * @type Object
	     */
	    on: opStoreAll.simpleOp('on', '@'),
	
	    /**
	     * DSL operation for adding mapping to the target {{#crossLink "ProAct.Actor"}}{{/crossLink}} of the DSL.
	     * <p>
	     *  For example
	     *  <pre>
	     *    'map(f:bla)'
	     *  </pre>
	     *  means that mapping function, stored in the {{#crossLink "ProAct.Registry"}}{{/crossLink}} as 'bla'
	     *  should be mapped to the targed {{#crossLink "ProAct.Actor"}}{{/crossLink}} of the DSL.
	     * </p>
	     * <p>
	     *  or
	     *  <pre>
	     *    'map($2)'
	     *  </pre>
	     *  means that mapping function passed to the {{#crossLink "ProAct.DSL/run:method"}}{{/crossLink}}
	     *  method as the second argument after the targed object, the DSL data and the registry
	     *  should be mapped to the targed {{#crossLink "ProAct.Actor"}}{{/crossLink}} of the DSL.
	     * </p>
	     *
	     * @for ProAct.DSL.ops
	     * @final
	     * @property mapping
	     * @type Object
	     */
	    mapping: opStoreAll.simpleOp('mapping', 'map'),
	
	    /**
	     * DSL operation for adding filters to the target {{#crossLink "ProAct.Actor"}}{{/crossLink}} of the DSL.
	     * <p>
	     *  For example
	     *  <pre>
	     *    'filter(f:bla)'
	     *  </pre>
	     *  means that filtering function, stored in the {{#crossLink "ProAct.Registry"}}{{/crossLink}} as 'bla'
	     *  should be add as filter to the targed {{#crossLink "ProAct.Actor"}}{{/crossLink}} of the DSL.
	     * </p>
	     * <p>
	     *  or
	     *  <pre>
	     *    'filter($1)'
	     *  </pre>
	     *  means that filtering function passed to the {{#crossLink "ProAct.DSL/run:method"}}{{/crossLink}}
	     *  method as the first argument after the targed object, the DSL data and the registry
	     *  should be added as filter to the targed {{#crossLink "ProAct.Actor"}}{{/crossLink}} of the DSL.
	     * </p>
	     *
	     * @for ProAct.DSL.ops
	     * @final
	     * @property filtering
	     * @type Object
	     */
	    filtering: opStoreAll.simpleOp('filtering', 'filter'),
	
	    /**
	     * DSL operation for adding accumulation to the target {{#crossLink "ProAct.Actor"}}{{/crossLink}} of the DSL.
	     * <p>
	     *  For example
	     *  <pre>
	     *    'acc($1, f:bla)'
	     *  </pre>
	     *  means that accumulating function, stored in the {{#crossLink "ProAct.Registry"}}{{/crossLink}} as 'bla'
	     *  should be added as accumulation to the targed {{#crossLink "ProAct.Actor"}}{{/crossLink}} of the DSL,
	     *  and the first argument passed to {{#crossLink "ProAct.DSL/run:method"}}{{/crossLink}} after the targed object, the DSL data and the registry should
	     *  be used as initial value for the accumulation.
	     * </p>
	     *
	     * @for ProAct.DSL.ops
	     * @final
	     * @property accumulation
	     * @type Object
	     */
	    accumulation: opStoreAll.simpleOp('accumulation', 'acc')
	  },
	
	  /**
	   * A set of predefined operations to be used by the DSL.
	   *
	   * @namespace ProAct.DSL
	   * @class predefined
	   * @static
	   */
	  predefined: {
	
	    /**
	     * A set of predefined mapping operations to be used by the DSL.
	     *
	     * @class mapping
	     * @namespace ProAct.DSL.predefined
	     * @static
	     */
	    mapping: {
	
	      /**
	       * Mapping operation for changing the sign of a number to the oposite.
	       * <p>
	       *  For example 4 becomes -4 and -5 becomes 5.
	       * </p>
	       * <p>
	       *  Usage in a DSL expression:
	       *  <pre>
	       *    map(-)
	       *  </pre>
	       * </p>
	       *
	       * @for ProAct.DSL.predefined.mapping
	       * @final
	       * @static
	       * @method -
	       * @param {Number} n
	       *      The number which will have its sign inverted.
	       * @return {Number}
	       *      The same number as `n`, but with opposite sign.
	       */
	      '-': function (el) { return -el; },
	
	      /**
	       * Mapping operation for computing the square of a number.
	       * <p>
	       *  For example 4 becomes 16.
	       * </p>
	       * <p>
	       *  Usage in a DSL expression:
	       *  <pre>
	       *    map(pow)
	       *  </pre>
	       * </p>
	       *
	       * @for ProAct.DSL.predefined.mapping
	       * @static
	       * @method pow
	       * @param {Number} n
	       *      The number to power.
	       * @return {Number}
	       *      The square of `n`.
	       */
	      'pow': function (el) { return el * el; },
	
	      /**
	       * Mapping operation for computing the square root of a number.
	       * <p>
	       *  For example 4 becomes 2.
	       * </p>
	       * <p>
	       *  Usage in a DSL expression:
	       *  <pre>
	       *    map(sqrt)
	       *  </pre>
	       * </p>
	       *
	       * @for ProAct.DSL.predefined.mapping
	       * @static
	       * @method sqrt
	       * @param {Number} n
	       *      The number to compute the square root for.
	       * @return {Number}
	       *      The square root of `n`.
	       */
	      'sqrt': function (el) { return Math.sqrt(el); },
	
	      /**
	       * Mapping operation for turning an string to a decimal Number - integer.
	       * <p>
	       *  For example '4' becomes 4.
	       * </p>
	       * <p>
	       *  Usage in a DSL expression:
	       *  <pre>
	       *    map(int)
	       *  </pre>
	       * </p>
	       *
	       * @for ProAct.DSL.predefined.mapping
	       * @static
	       * @method int
	       * @param {String} str
	       *      The string to convert to integer.
	       * @return {Number}
	       *      The integer representation of `str`.
	       */
	      'int': function (el) { return parseInt(el, 10); },
	
	      /**
	       * Mapping operation for calling a method of an object.
	       * <p>
	       *  Usage in a DSL expression:
	       *  <pre>
	       *    map(&.&go)
	       *  </pre>
	       *  This will call the 'target.go' method and use its result.
	       * </p>
	       *
	       * @for ProAct.DSL.predefined.mapping
	       * @static
	       * @method &.
	       * @param {String} methodName
	       *      The method name to call.
	       * @return {Object}
	       *      The result of the method call.
	       */
	      '&.': function (arg) {
	        return function (el) {
	          var p = el[arg];
	          if (!p) {
	            return el;
	          } else if (P.U.isFunction(p)) {
	            return p.call(el);
	          } else {
	            return p;
	          }
	        };
	      },
	
	      /**
	       * Mapping operation for turning value in an
	       * ProAct.Array pop event.
	       * <p>
	       *  Usage in a DSL expression:
	       *  <pre>
	       *    map(pop)
	       *  </pre>
	       * </p>
	       *
	       * @for ProAct.DSL.predefined.mapping
	       * @static
	       * @method pop
	       * @return {Event}
	       *      Pop event.
	       */
	      pop: function () {
	        return P.E.simple('array', 'pop');
	      },
	
	      /**
	       * Mapping operation for turning value in an
	       * ProAct.Array shift event.
	       * <p>
	       *  Usage in a DSL expression:
	       *  <pre>
	       *    map(shift)
	       *  </pre>
	       * </p>
	       *
	       * @for ProAct.DSL.predefined.mapping
	       * @static
	       * @method shift
	       * @return {Event}
	       *      Shift event.
	       */
	      shift: function () {
	        return P.E.simple('array', 'shift');
	      },
	
	      /**
	       * Mapping operation for turning value event in its value.
	       * <p>
	       *  Usage in a DSL expression:
	       *  <pre>
	       *    map(eventToVal)
	       *  </pre>
	       * </p>
	       *
	       * @for ProAct.DSL.predefined.mapping
	       * @static
	       * @method eventToVal
	       * @param {Event} event
	       *      The value event to get the new value from.
	       * @return {Object}
	       *      The value.
	       */
	      eventToVal: function (event) {
	        return event.args[0][event.target];
	      },
	
	      /**
	       * Maps anything to the constant true.
	       * <p>
	       *  Usage in a DSL expression:
	       *  <pre>
	       *    map(true)
	       *  </pre>
	       * </p>
	       *
	       * @for ProAct.DSL.predefined.mapping
	       * @static
	       * @method true
	       * @param {Object} value
	       *      Arbitrary value.
	       * @return {Boolean}
	       *      Just the `true` constant.
	       */
	      'true': function (event) {
	        return true;
	      },
	
	      /**
	       * Toggles a boolean value. If the value is `true` it becomes `false` and vice versa.
	       * <p>
	       *  Usage in a DSL expression:
	       *  <pre>
	       *    map(!)
	       *  </pre>
	       * </p>
	       *
	       * @for ProAct.DSL.predefined.mapping
	       * @static
	       * @method !
	       * @param {Boolean} value
	       *      A boolean value.
	       * @return {Boolean}
	       *      The opposite of `value`.
	       */
	      '!': function (value) {
	        return !value;
	      },
	
	      /**
	       * Adds the current time to the object value, called upon
	       * If the value is not an object (for example it is a Number), it is returned as it is.
	       *
	       * <p>
	       *  Usage in a DSL expression:
	       *  <pre>
	       *    map(time)
	       *  </pre>
	       * </p>
	       *
	       * @for ProAct.DSL.predefined.mapping
	       * @static
	       * @method time
	       * @param {Object} value
	       *      The object to modify with time.
	       * @return {Object}
	       *      The modified value.
	       */
	      'time': function (value) {
	        if (P.U.isObject(value)) {
	          value.time = new Date().getTime();
	        }
	        return value;
	      }
	    },
	
	    /**
	     * A set of predefined filtering operations to be used by the DSL.
	     *
	     * @class filtering
	     * @namespace ProAct.DSL.predefined
	     * @static
	     */
	    filtering: {
	
	      /**
	       * Filtering operation for filtering only odd Numbers.
	       * <p>
	       *  Usage in a DSL expression:
	       *  <pre>
	       *    filter(odd)
	       *  </pre>
	       * </p>
	       *
	       * @for ProAct.DSL.predefined.filtering
	       * @static
	       * @method odd
	       * @param {Number} n
	       *      The number to check if it is odd.
	       * @return {Boolean}
	       *      True, if the number is odd.
	       */
	      'odd': function (el) { return el % 2 !== 0; },
	
	      /**
	       * Filtering operation for filtering only even Numbers.
	       * <p>
	       *  Usage in a DSL expression:
	       *  <pre>
	       *    filter(even)
	       *  </pre>
	       * </p>
	       *
	       * @for ProAct.DSL.predefined.filtering
	       * @static
	       * @method even
	       * @param {Number} n
	       *      The number to check if it is even.
	       * @return {Boolean}
	       *      True, if the number is even.
	       */
	      'even': function (el) { return el % 2 === 0; },
	
	      /**
	       * Filtering operation for filtering only positive Numbers.
	       * <p>
	       *  Usage in a DSL expression:
	       *  <pre>
	       *    filter(+)
	       *  </pre>
	       * </p>
	       *
	       * @for ProAct.DSL.predefined.filtering
	       * @static
	       * @method +
	       * @param {Number} n
	       *      The number to check if it is positive.
	       * @return {Boolean}
	       *      True, if the number is positive or zero.
	       */
	      '+': function (el) { return el >= 0; },
	
	      /**
	       * Filtering operation for filtering only negative Numbers.
	       * <p>
	       *  Usage in a DSL expression:
	       *  <pre>
	       *    filter(-)
	       *  </pre>
	       * </p>
	       *
	       * @for ProAct.DSL.predefined.filtering
	       * @static
	       * @method -
	       * @param {Number} n
	       *      The number to check if it is negative.
	       * @return {Boolean}
	       *      True, if the number is negative or zero.
	       */
	      '-': function (el) { return el <= 0; },
	
	      /**
	       * Flitering operation for using a method of an object as a filter.
	       * <p>
	       *  Usage in a DSL expression:
	       *  <pre>
	       *    filter(&.&boolFunc)
	       *  </pre>
	       *  This will call the 'target.boolFunc' method and use its result as a filter.
	       * </p>
	       *
	       * @for ProAct.DSL.predefined.filtering
	       * @static
	       * @method &.
	       * @param {String} methodName
	       *      The name of the method to use for filtering.
	       * @return {Boolean}
	       *      The result of the method call.
	       */
	      '&.': function (arg) {
	        return function (el) {
	          if (this.action) {
	            return this.action.call(this.context, el);
	          }
	
	          var p = el[arg];
	          if (!p) {
	            return el;
	          } else if (P.U.isFunction(p)) {
	            this.action = p;
	            this.context = el;
	          } else {
	            return p;
	          }
	        };
	      },
	
	      /**
	       * Filtering operation for filtering only values different from undefined.
	       * <p>
	       *  Usage in a DSL expression:
	       *  <pre>
	       *    filter(defined)
	       *  </pre>
	       * </p>
	       *
	       * @for ProAct.DSL.predefined.filtering
	       * @static
	       * @method defined
	       * @param {Event} event
	       *      The value event to check if its value is defined.
	       * @return {Boolean}
	       *      True if the value in the event is not `undefined`.
	       */
	      defined: function (event) {
	        return event.args[0][event.target] !== undefined;
	      },
	
	      /**
	       * Filtering operation for filtering only events
	       * that have null/undefined as a source.
	       * <p>
	       *  Usage in a DSL expression:
	       *  <pre>
	       *    filter(originalEvent)
	       *  </pre>
	       * </p>
	       *
	       * @for ProAct.DSL.predefined.filtering
	       * @static
	       * @method originalEvent
	       * @param {Event} event
	       *      The value event to check if it has a source or not.
	       * @return {Boolean}
	       *      True if the `event` passed has no source.
	       */
	      originalEvent: function (event) {
	        return event.source === undefined || event.source === null;
	      },
	
	      /**
	       * Filtering operation for passing everything.
	       * <p>
	       *  Usage in a DSL expression:
	       *  <pre>
	       *    filter(all)
	       *  </pre>
	       * </p>
	       *
	       * @for ProAct.DSL.predefined.filtering
	       * @static
	       * @method all
	       * @param {Object} val
	       *      Anything.
	       * @return {Boolean}
	       *      True.
	       */
	      all: function () {
	        return true;
	      }
	    },
	
	    /**
	     * A set of predefined accumulation operations to be used by the DSL.
	     *
	     * @class accumulation
	     * @namespace ProAct.DSL.predefined
	     * @static
	     */
	    accumulation: {
	
	      /**
	       * Accumulation operation representing a sum of numbers.
	       * <p>
	       *  Usage in a DSL expression:
	       *  <pre>
	       *    acc(+)
	       *  </pre>
	       * </p>
	       *
	       * @for ProAct.DSL.predefined.accumulation
	       * @static
	       * @property +
	       * @type Array
	       */
	      '+': [0, function (x, y) { return x + y; }],
	
	      /**
	       * Accumulation operation representing a product of numbers.
	       * <p>
	       *  Usage in a DSL expression:
	       *  <pre>
	       *    acc(*)
	       *  </pre>
	       * </p>
	       *
	       * @for ProAct.DSL.predefined.accumulation
	       * @static
	       * @constant
	       * @property *
	       * @type Array
	       */
	      '*': [1, function (x, y) { return x * y; }],
	
	      /**
	       * Accumulation operation representing string concatenation.
	       * <p>
	       *  Usage in a DSL expression:
	       *  <pre>
	       *    acc(+str)
	       *  </pre>
	       * </p>
	       *
	       * @for ProAct.DSL.predefined.accumulation
	       * @static
	       * @property +str
	       * @type Array
	       */
	      '+str': ['', function (x, y) { return x + y; }],
	    }
	  },
	
	  /**
	   * Defines a new predefined function to be reused in the DSL.
	   *
	   * For example:
	   * ```
	   *   ProAct.DSL.defPredefined('filter', 'enter', function (event) {
	   *    return event.keyCode === 13;
	   *   });
	   *
	   * ```
	   * creates a new `filtering` function, which can be used like this:
	   * ```
	   *   actor2 = actor1.filter('enter');
	   * ```
	   * the `actor2` in this case will recieve only the events with keyCode of `13`.
	   *
	   * @for ProAct.DSL
	   * @static
	   * @method defPredefined
	   * @param {String} type
	   *      One of the three -> `mapping`, `filtering` and `accumulation` types.
	   * @param {String} id
	   *      The identificator of the predefined function to be passed to trasfromation or filtering operations.
	   * @param {Function|Array} operation
	   *      The implementation of the operation.
	   */
	  defPredefined: function(type, id, operation) {
	    if (type === 'm' || type === 'map') {
	      type = 'mapping';
	    }
	    if (type === 'f' || type === 'filter') {
	      type = 'filtering';
	    }
	    if (type === 'a' || type === 'acc' || type === 'accumulate') {
	      type = 'accumulation';
	    }
	
	    ProAct.DSL.predefined[type][id] = operation;
	  },
	
	  /**
	   * Extracts DSL actions and options from a string.
	   * <p>
	   *  Splits the passed <i>optionString</i> using {{#crossLink "ProAct.DSL/separator:property"}}{{/crossLink}} as saparator
	   *  and calls {{#crossLink "ProAct.DSL/optionsFromArray:method"}}{{/crossLink}} on the result.
	   * </p>
	   *
	   * @for ProAct.DSL
	   * @static
	   * @method optionsFromString
	   * @param {String} optionString
	   *      The string to use to extract options from.
	   * @param [...]
	   *      Parameters for the extracted actions/functions/operations.
	   *      <p>
	   *        For example if the string contains 'map($1)', the first argument passed after the <i>optionString</i> argument
	   *        is passed to the 'map' operation.
	   *      </p>
	   * @return {Object}
	   *      Object containing operations as fields and options(arguments) for these operations as values.
	   *      <p>
	   *        'map($1)|filter(+)|@($2)' becomes:
	   *        <pre>
	   *          {
	   *            mapping: {first-argument-to-this-function-after-the-optionString-arg},
	   *            filtering: ProAct.DSL.predefined.filtering['+'],
	   *            on: {second-argument-to-this-function-after-the-optionString-arg}
	   *          }
	   *        </pre>
	   *      </p>
	   */
	  optionsFromString: function (optionString) {
	    return dsl.optionsFromArray.apply(null, [optionString.split(dsl.separator)].concat(slice.call(arguments, 1)));
	  },
	
	  /**
	   * Extracts DSL actions and options from an array of strings.
	   * <p>
	   *  Example <i>optionArray</i> is ['map($1)', 'filter(+)', @($2)'] and it will become options object of functions and arguments to
	   *  be applied on a target {{#crossLink "ProAct.Actor"}}{{/crossLink}} passed to the {{#crossLink "ProAct.DSL/run:method"}}{{/crossLink}} method.
	   * </p>
	   *
	   * @for ProAct.DSL
	   * @static
	   * @method optionsFromArray
	   * @param {Array} optionArray
	   *      The array of strings to use to extract options from.
	   * @param [...]
	   *      Parameters for the extracted actions/functions/operations.
	   *      <p>
	   *        For example if the array contains 'map($1)', the first argument passed after the <i>optionArray</i> argument
	   *        is passed to the 'map' operation.
	   *      </p>
	   * @return {Object}
	   *      Object containing operations as fields and options(arguments) for these operations as values.
	   *      <p>
	   *        ['map($1)', 'filter(+)', @($2)'] becomes:
	   *        <pre>
	   *          {
	   *            mapping: {first-argument-to-this-function-after-the-optionString-arg},
	   *            filtering: ProAct.DSL.predefined.filtering['+'],
	   *            on: {second-argument-to-this-function-after-the-optionString-arg}
	   *          }
	   *        </pre>
	   *      </p>
	   */
	  optionsFromArray: function (optionArray) {
	    var result = {}, i, ln = optionArray.length,
	        ops = P.R.ops, op, opType;
	    for (i = 0; i < ln; i++) {
	      op = optionArray[i];
	      for (opType in P.DSL.ops) {
	        opType = P.DSL.ops[opType];
	        if (opType.match(op)) {
	          opType.toOptions.apply(opType, [result, op].concat(slice.call(arguments, 1)));
	          break;
	        }
	      }
	    }
	    return result;
	  },
	
	  /**
	   * Configures an {{#crossLink "ProAct.Actor"}}{{/crossLink}} using the DSL passed with the <i>options</i> argument.
	   * <p>
	   *  Uses the passed {{#crossLink "ProAct.Registry"}}{{/crossLink}} to read stored values from.
	   * </p>
	   *
	   * @for ProAct.DSL
	   * @static
	   * @method
	   * @param {ProAct.Actor} actor
	   *      The target of the DSL operations.
	   * @param {ProAct.Actor|String|Object} options
	   *      The DSL formatted options to be used for the configuration.
	   *      <p>
	   *        If the value of this parameter is instance of {{#crossLink "ProAct.Actor"}}{{/crossLink}} it is set as a source to the <i>target actor</i>.
	   *      </p>
	   *      <p>
	   *        If the value ot this parameter is String - {{#crossLink "ProAct.DSL/optionsFromString:method"}}{{/crossLink}} is used to be turned to an options object.
	   *      </p>
	   *      <p>
	   *        If the values of this parameter is object, it is used to configure the <i>targed actor</i>.
	   *      </p>
	   *      <p>
	   *        The format of the object should be something like:
	   *        <pre>
	   *          {
	   *            dsl-operation: function|array-of-functions-and-arguments,
	   *            dsl-operation: function|array-of-functions-and-arguments,
	   *            dsl-operation: function|array-of-functions-and-arguments,
	   *            ...
	   *          }
	   *        </pre>
	   *      </p>
	   * @param {ProAct.Registry} registry
	   *      The registry to read stored values for the DSL operations.
	   *      <p>
	   *        For example if there is 'map(f:foo)', the mapping function is read from the registry at the key 'foo'.
	   *      </p>
	   * @param [...]
	   *      Parameters for the DSL operations.
	   *      <p>
	   *        For example if the array contains 'map($1)', the first argument passed after the <i>actor</i>, <i>options</i> and <i>registry</i> arguments
	   *        is passed to the 'map' operation.
	   *      </p>
	   * @return {ProAct.Actor}
	   *      The configured actor.
	   */
	  run: function (actor, options, registry) {
	    var isS = P.U.isString,
	        args = slice.call(arguments, 3),
	        option, i, ln, opType, oldOption,
	        multiple = {};
	
	    if (options && isS(options)) {
	      options = dsl.optionsFromString.apply(null, [options].concat(args));
	    }
	
	    if (options && options instanceof P.Actor) {
	      options = {into: options};
	    }
	
	    if (options && options.order) {
	      ln = options.order.length;
	      for (i = 0; i < ln; i++) {
	        option = options.order[i];
	        if (opType = dslOps[option]) {
	          if (registry) {
	            if (options.order.indexOf(option) !== options.order.lastIndexOf(option)) {
	              if (multiple[option] === undefined) {
	                multiple[option] = -1;
	              }
	              multiple[option] = multiple[option] + 1;
	              oldOption = options[option];
	              options[option] = options[option][multiple[option]];
	            }
	            options[option] = registry.toObjectArray(options[option]);
	          }
	
	          opType.action(actor, options);
	          if (oldOption) {
	            options[option] = oldOption;
	            oldOption = undefined;
	
	            if (multiple[option] >= options[option].length - 1) {
	              delete options[option];
	            }
	          } else {
	            delete options[option];
	          }
	        }
	      }
	    }
	
	    for (opType in dslOps) {
	      if (options && (option = options[opType])) {
	        options[opType] = registry.toObjectArray(option);
	      }
	      opType = dslOps[opType];
	      opType.action(actor, options);
	    }
	
	    return actor;
	  }
	};
	
	dsl = P.DSL;
	dslOps = dsl.ops;
	
	/**
	 * @module proact-dsl
	 */
	
	function Provider () {
	  this.stored = {};
	}
	function StreamProvider () {
	  P.R.Provider.call(this);
	}
	function FunctionProvider () {
	  P.R.Provider.call(this);
	}
	function ProObjectProvider () {
	  P.R.Provider.call(this);
	}
	
	function streamConstructArgs (args) {
	  var queueName;
	  if (args.length === 2) {
	    queueName = args[0];
	    args[0] = args[1];
	  }
	  return [queueName].concat(args);
	}
	
	P.U.ex(ProAct.Registry, {
	
	  /**
	   * Constructs a `ProAct.Registry.Provider`.
	   * The {{#crossLink "ProAct.Registry"}}{{/crossLink}} uses registered providers as storage for different objects.
	   * <p>
	   *  Every provider has one or more namespaces in the {{#crossLink "ProAct.Registry"}}{{/crossLink}} it is registered to.
	   * </p>
	   * <p>
	   *  Every provider knows how to store its type of obects, how to make them, or delete them.
	   * </p>
	   *
	   * @namespace ProAct.Registry
	   * @class Provider
	   * @constructor
	   * @static
	   */
	  Provider: Provider,
	
	  /**
	   * Constructs a `ProAct.Registry.StreamProvider`. The {{#crossLink "ProAct.Registry"}}{{/crossLink}} uses registered stream providers as storage for {{#crossLink "ProAct.Stream"}}{{/crossLink}}s.
	   *
	   * @namespace ProAct.Registry
	   * @class StreamProvider
	   * @constructor
	   * @extends ProAct.Registry.Provider
	   * @static
	   */
	  StreamProvider: StreamProvider,
	
	  /**
	   * Constructs a `ProAct.Registry.FunctionProvider`.
	   * The {{#crossLink "ProAct.Registry"}}{{/crossLink}} uses registered function providers as storage for Functions.
	   * <p>
	   *  The function provider doesn't have implementation for creation of new functions, only for storing, readin and removing them.
	   * </p>
	   *
	   * @namespace ProAct.Registry
	   * @class FunctionProvider
	   * @constructor
	   * @extends ProAct.Registry.Provider
	   * @static
	   */
	  FunctionProvider: FunctionProvider,
	
	  /**
	   * Constructs a `ProAct.Registry.ProObjectProvider`.
	   * The {{#crossLink "ProAct.Registry"}}{{/crossLink}} uses registered function providers as storage for objects with reactive {{#crossLink "ProAct.Property"}}{{/crossLink}} instances.
	   *
	   * @namespace ProAct.Registry
	   * @class ProObjectProvider
	   * @constructor
	   * @extends ProAct.Registry.Provider
	   * @static
	   */
	  ProObjectProvider: ProObjectProvider
	});
	
	ProAct.Registry.Provider.prototype = {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.Registry.Provider
	   * @final
	   * @for ProAct.Registry.Provider
	   */
	  constructor: ProAct.Registry.Provider,
	
	  /**
	   * Creates and stores an instance of the object this `ProAct.Registry.Provider` manages.
	   * <p>
	   *  For the creation is used the {{#crossLink "ProAct.Registry.Provider/provide:method"}}{{/crossLink}} method.
	   * </p>
	   *
	   * @for ProAct.Registry.Provider
	   * @instance
	   * @method make
	   * @param {String} key
	   *      The key on which the new instance will be stored.
	   * @param {Array} options
	   *      Array containing options for the creation process. For example the exact sub-type of the object to create (optional).
	   * @param [...]
	   *      Parameters passed to the constructor when the new instance is created.
	   * @return {Object}
	   *      The newly created and stored object.
	   */
	  make: function (key, options) {
	    var provided, args = slice.call(arguments, 1);
	    this.stored[key] = provided = this.provide.apply(this, args);
	    return provided;
	  },
	
	  /**
	   * Stores an instance of an object this `ProAct.Registry.Provider` manages.
	   *
	   * @for ProAct.Registry.Provider
	   * @instance
	   * @method store
	   * @param {String} key
	   *      The key on which the <i>object</i> will be stored.
	   * @param {Object} object
	   *      The object to store.
	   * @return {Object}
	   *      The stored object.
	   */
	  store: function (key, object) { return this.stored[key] = object; },
	
	  /**
	   * Reads a stored instance.
	   *
	   * @for ProAct.Registry.Provider
	   * @instance
	   * @method get
	   * @param {String} key
	   *      The key to read.
	   * @return {Object}
	   *      The stored object corresponding to the passed <i>key</i> or undefined if there is no such object.
	   */
	  get: function (key) { return this.stored[key]; },
	
	  /**
	   * Deletes a stored instance.
	   *
	   * @for ProAct.Registry.Provider
	   * @instance
	   * @method delete
	   * @param {String} key
	   *      The key to delete.
	   * @return {Object}
	   *      The stored object corresponding to the passed <i>key</i> or undefined if there is no such object.
	   */
	  del: function(key) {
	    var deleted = this.get(key);
	    delete this.stored[key];
	    return deleted;
	  },
	
	  /**
	   * A callback called by the {{#crossLink "ProAct.Registry"}}{{/crossLink}} when <i>this</i> `ProAct.Registry.Provider` is registered.
	   *
	   * @for ProAct.Registry.Provider
	   * @instance
	   * @protected
	   * @abstract
	   * @method registered
	   * @param {ProAct.Registry} registery
	   *      The registry in which <i>this</i> is being registered.
	   */
	  registered: function (registry) {},
	
	  /**
	   * An object containing all the available sub-types constructions of the managed by <i>this</i> class.
	   * <p>
	   *  Should always have a 'basic' field for the default construction operation.
	   * </p>
	   *
	   * @namespace ProAct.Registry.Provider
	   * @class types
	   * @static
	   */
	  types: {
	
	    /**
	     * Defines default construction logic for the managed object.
	     * <p>
	     *  For example if we have a `FooProvider`, this method will be something like:
	     *  <pre>
	     *    return new Foo();
	     *  </pre>
	     * </p>
	     * <p>
	     *  It is abstract and must be overridden by the extenders, or an Error will be thrown.
	     * </p>
	     *
	     * @for ProAct.Registry.Provider.types
	     * @protected
	     * @instance
	     * @abstract
	     * @method basic
	     * @return {Object}
	     *      An isntance of the managed class of objects.
	     */
	    basic: function () { throw new Error('Abstract: implement!'); }
	  },
	
	  /**
	   * Provides a new instance of the managed by <i>this</i> `ProAct.Registry.Provider` object.
	   *
	   * @for ProAct.Registry.Provider
	   * @instance
	   * @method provide
	   * @param {Array} options
	   *      An array containing the key of the object to create and store.
	   *      It may contain data to pass to the constructor of the object.
	   * @param [...]
	   *      Arguments that should be passed to the constructor.
	   * @return {Object}
	   *      An isntance of the managed class of objects.
	   */
	  provide: function (options) {
	    if (options) {
	      var type = options[0],
	          regexp, matched, args,
	          argumentData = slice.call(arguments, 1);
	      if (type && !(type === 'basic')) {
	        regexp = new RegExp("(\\w*)\\(([\\s\\S]*)\\)");
	        matched = regexp.exec(type);
	        args = matched[2];
	        if (args) {
	          args = args.split(',');
	        }
	        type = matched[1];
	        if (type && this.types[type]) {
	          return this.types[type].apply(this, [args].concat(argumentData));
	        }
	      }
	    }
	
	    return this.types.basic.apply(this, arguments);
	  }
	};
	
	ProAct.Registry.StreamProvider.prototype = P.U.ex(Object.create(P.R.Provider.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.Registry.StreamProvider
	   * @final
	   * @for ProAct.Registry.StreamProvider
	   */
	  constructor: ProAct.Registry.StreamProvider,
	
	  /**
	   * A callback called by the {{#crossLink "ProAct.Registry"}}{{/crossLink}}
	   * when <i>this</i> `ProAct.Registry.StreamProvider` is registered.
	   * <p>
	   *  It adds the methods <i>s</i> and <i>stream</i> to the
	   *  {{#crossLink "ProAct.Registry"}}{{/crossLink}}, which are aliases
	   *  of <i>this</i>' {{#crossLink "ProAct.Registry.StreamProvider/get:method"}}{{/crossLink}} method.
	   * </p>
	   *
	   * @for ProAct.Registry.StreamProvider
	   * @protected
	   * @instance
	   * @method registered
	   * @param {ProAct.Registry} registry
	   *      The registry in which <i>this</i> is being registered.
	   */
	  registered: function (registry) {
	    registry.s = registry.stream = P.U.bind(this, this.get);
	  },
	
	  /**
	   * An object containing all the available sub-types constructions of the managed by <i>this</i> class.
	   *
	   * @for ProAct.Registry.StreamProvider
	   * @namespace ProAct.Registry.StreamProvider
	   * @class types
	   * @type Object
	   * @property types
	   */
	  types: {
	
	    /**
	     * Constructs a simple {{#crossLink "ProAct.Stream"}}{{/crossLink}}
	     * <p>
	     *  <pre>
	     *    return new ProAct.Stream();
	     *  </pre>
	     * </p>
	     *
	     * @for ProAct.Registry.StreamProvider.types
	     * @protected
	     * @instance
	     * @method basic
	     * @return {ProAct.Stream}
	     *      An isntance of {{#crossLink "ProAct.Stream"}}{{/crossLink}}.
	     */
	    basic: function (args) { return P.stream(undefined, undefined, undefined, args[0]); },
	
	    /**
	     * Constructs a {{#crossLink "ProAct.DelayedStream"}}{{/crossLink}}
	     * <p>
	     *  <pre>
	     *    return new ProAct.DelayedStream(delay);
	     *  </pre>
	     * </p>
	     *
	     * @for ProAct.Registry.StreamProvider.types
	     * @protected
	     * @instance
	     * @method delayed
	     * @param {Array} args
	     *      An array of arguments - the first element of which is the <i>delay</i> of the stream to construct.
	     * @return {ProAct.DelayedStream}
	     *      An isntance of {{#crossLink "ProAct.DelayedStream"}}{{/crossLink}}.
	     */
	    delayed: function (args) {
	      var args = streamConstructArgs(args);
	      return new P.DBS(args[0], parseInt(args[1], 10));
	    },
	
	    /**
	     * Constructs a {{#crossLink "ProAct.SizeBufferedStream"}}{{/crossLink}}
	     * <p>
	     *  <pre>
	     *    return new ProAct.SizeBufferedStream(size);
	     *  </pre>
	     * </p>
	     *
	     * @for ProAct.Registry.StreamProvider.types
	     * @protected
	     * @instance
	     * @method size
	     * @param {Array} args
	     *      An array of arguments - the first element of which is the <i>size</i> of the stream to construct.
	     * @return {ProAct.SizeBufferedStream}
	     *      An isntance of {{#crossLink "ProAct.SizeBufferedStream"}}{{/crossLink}}.
	     */
	    size: function (args) {
	      var args = streamConstructArgs(args);
	      return new P.SBS(args[0], parseInt(args[1], 10));
	    },
	
	    /**
	     * Constructs a {{#crossLink "ProAct.DebouncingStream"}}{{/crossLink}}
	     * <p>
	     *  <pre>
	     *    return new ProAct.DebouncingStream(delay);
	     *  </pre>
	     * </p>
	     *
	     * @for ProAct.Registry.StreamProvider.types
	     * @protected
	     * @instance
	     * @method debouncing
	     * @param {Array} args
	     *      An array of arguments - the first element of which is the <i>delay</i> of the stream to construct.
	     * @return {ProAct.DebouncingStream}
	     *      An isntance of {{#crossLink "ProAct.DebouncingStream"}}{{/crossLink}}.
	     */
	    debouncing: function (args) {
	      var args = streamConstructArgs(args);
	      return new P.DDS(args[0], parseInt(args[1], 10));
	    },
	
	    /**
	     * Constructs a {{#crossLink "ProAct.ThrottlingStream"}}{{/crossLink}}
	     * <p>
	     *  <pre>
	     *    return new ProAct.ThrottlingStream(delay);
	     *  </pre>
	     * </p>
	     *
	     * @for ProAct.Registry.StreamProvider.types
	     * @protected
	     * @instance
	     * @method throttling
	     * @param {Array} args
	     *      An array of arguments - the first element of which is the <i>delay</i> of the stream to construct.
	     * @return {ProAct.ThrottlingStream}
	     *      An isntance of {{#crossLink "ProAct.ThrottlingStream"}}{{/crossLink}}.
	     */
	    throttling: function (args) {
	      var args = streamConstructArgs(args);
	      return new P.TDS(args[0], parseInt(args[1], 10));
	    }
	  }
	});
	
	var higher = {
	  split: function (provider, action, data) {
	    var keys = data.split(action),
	        ln = keys.length, i,
	        functions = [];
	    for (i = 0; i < ln; i++) {
	      functions.push(provider.get(keys[i].trim()));
	    }
	
	    return functions;
	  },
	  accumulator: function (functions, initial, computation) {
	    return function () {
	      var i, ln = functions.length, result = initial;
	      for (i = 0; i < ln; i++) {
	        result = computation(result, functions[i].apply(null, arguments));
	      }
	      return result;
	    };
	  },
	  or: function (tillNow, argument) {
	    return tillNow || argument;
	  },
	  and: function (tillNow, argument) {
	    return tillNow && argument;
	  }
	};
	
	ProAct.Registry.FunctionProvider.prototype = P.U.ex(Object.create(P.R.Provider.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.Registry.FunctionProvider
	   * @final
	   * @for ProAct.Registry.FunctionProvider
	   */
	  constructor: ProAct.Registry.FunctionProvider,
	
	  // Private stuff
	  predefinedActions: {
	    map: 'mapping',
	    filter: 'filtering',
	    acc: 'accumulation'
	  },
	
	  /**
	   * Reads a stored instance.
	   * <p>
	   *  If stored instance is not found and the key is in the form:
	   *  actions(arg) - it is searched in the predefined lambdas, for example:
	   *  <pre>
	   *    map(+)
	   *  </pre>
	   * </p>
	   *
	   * @for ProAct.Registry.FunctionProvider
	   * @instance
	   * @method get
	   * @param {String} key
	   *      The key to read.
	   * @return {Object}
	   *      The stored object corresponding to the passed <i>key</i> or
	   *      predefined lambda or undefined if there is no such object.
	   */
	  get: function (key) {
	    var func,
	        reg, matched,
	        action, args,
	        i, ln;
	
	    if (key.indexOf('OR') !== -1) {
	      return higher.accumulator(higher.split(this, 'OR', key), false, higher.or);
	    } else if (key.indexOf('AND') !== -1) {
	      return higher.accumulator(higher.split(this, 'AND', key), true, higher.and);
	    } else if (key.indexOf('!') === 0) {
	      func = this.get(key.substring(1));
	      return function () {
	        return !func.apply(null, arguments);
	      };
	    }
	
	    func = this.stored[key];
	    if (!func) {
	      reg = new RegExp("(\\w*)\\(([\\s\\S]*)\\)");
	      matched = reg.exec(key);
	      if (matched) {
	        action = matched[1], args = matched[2],
	        func = dsl.predefined[this.predefinedActions[action]][args];
	      }
	    }
	
	    return func;
	  }
	});
	
	ProAct.Registry.ProObjectProvider.prototype = P.U.ex(Object.create(P.R.Provider.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @property constructor
	   * @type ProAct.Registry.ProObjectProvider
	   * @final
	   * @for ProAct.Registry.ProObjectProvider
	   */
	  constructor: ProAct.Registry.ProObjectProvider,
	
	  /**
	   * A callback called by the {{#crossLink "ProAct.Registry"}}{{/crossLink}}
	   * when <i>this</i> `ProAct.Registry.ProObjectProvider` is registered.
	   * <p>
	   *  It adds the methods <i>po</i> and <i>proObject</i> to the {{#crossLink "ProAct.Registry"}}{{/crossLink}},
	   *  which are aliases of <i>this</i>' {{#crossLink "ProAct.Registry.ProObjectProvider/get:method"}}{{/crossLink}} method.
	   * </p>
	   * <p>
	   *  It adds the method <i>prob</i> to the {{#crossLink "ProAct.Registry"}}{{/crossLink}},
	   *  which is alias of <i>this</i>' {{#crossLink "ProAct.Registry.ProObjectProvider/make:method"}}{{/crossLink}} method.
	   * </p>
	   *
	   * @for ProAct.Registry.StreamProvider
	   * @protected
	   * @instance
	   * @protected
	   * @method registered
	   * @param {ProAct.Registry} registery
	   *      The registry in which <i>this</i> is being registered.
	   */
	  registered: function (registry) {
	    registry.po = registry.proObject = P.U.bind(this, this.get);
	    registry.prob = P.U.bind(this, function (key, val, meta) {
	      return this.make(key, null, val, meta);
	    });
	  },
	
	  /**
	   * An object containing all the available sub-types constructions of the managed by <i>this</i> class.
	   *
	   * @for ProAct.Registry.ProObjectProvider
	   * @namespace ProAct.Registry.ProObjectProvider
	   * @class types
	   * @type Object
	   * @property types
	   */
	  types: {
	    stat: function (options, value, meta) {
	      return P.P.value(value, meta);
	    },
	
	    /**
	     * Constructs a ProAct.js reactive object from original one, using {{#crossLink "ProAct/prob:method"}}{{/crossLink}}
	     * <p>
	     *  <pre>
	     *    return new ProAct.prob(value, meta);
	     *  </pre>
	     * </p>
	     *
	     * @for ProAct.Registry.ProObjectProvider.types
	     * @instance
	     * @method basic
	     * @protected
	     * @param {Array} options
	     *      Array containing options for the creation process.
	     * @param {Object} value
	     *      The object/value to make reactive.
	     * @param {Object|String} meta
	     *      Meta-data used to help in the reactive object creation.
	     * @return {Object}
	     *      A ractive object.
	     */
	    basic: function (options, value, meta) {
	      return P.prob(value, meta);
	    }
	  }
	});
	
	streamProvider = new P.R.StreamProvider();
	functionProvider = new P.R.FunctionProvider();
	proObjectProvider = new P.R.ProObjectProvider();
	
	/**
	 * The {{#crossLink "ProAct.Registry"}}{{/crossLink}} instance used by ProAct's by default.
	 * <p>
	 *  It has a {{#crossLink "ProAct.Registry.StreamProvider"}}{{/crossLink}} registered on the <i>s</i> namespace.
	 * </p>
	 * <p>
	 *  It has a {{#crossLink "ProAct.Registry.ProObjectProvider"}}{{/crossLink}} registered on the <i>po</i> and <i>obj</i> namespaces.
	 * </p>
	 * <p>
	 *  It has a {{#crossLink "ProAct.Registry.FunctionProvider"}}{{/crossLink}} registered on the <i>f</i> and <i>l</i> namespaces.
	 * </p>
	 * <p>
	 *  Override this instance or register your own providers in it to extend the ProAct.js DSL.
	 * </p>
	 *
	 * @property registry
	 * @type ProAct.Registry
	 * @for ProAct
	 * @static
	 */
	ProAct.registry = new P.R()
	  .register('s', streamProvider)
	  .register('po', proObjectProvider)
	  .register('obj', proObjectProvider)
	  .register('f', functionProvider)
	  .register('l', functionProvider);
	
	return Pro;
}));