;(function (pro) {
	if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = pro();
	} else {
		window.Pro = window.ProAct = window.P = pro();
	}
}(function() {
	/**
	 * ProAct.js turns plain JavaScript objects into holders of reactive properties.
	 * You can define the dependencies between these objects and properties using the 'vanilla' js syntax.
	 * For example if an object should have a property 'x', that depends on its two fields 'a' and 'b', the only thing that's needed
	 * is to define a function 'x', that refers to 'this.a' and 'this.b'.
	 *
	 * So ProAct.js can turn every vanilla JavaScript value to a set of reactive properties, and this generates a dependency graph between them.
	 * The data flow in this oriented graph is determined by its edges. So if we should receive data from the outside of this dependency system we'll need
	 * a powerful but easy to use tool to turn every user or server generated action into a data event, common to the graph. Enter the Pro.Stream - the functional
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
	 * @version 0.4.3
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
	    streamProvider, functionProvider;
	
	
	/**
	 * The current version of the library.
	 *
	 * @type String
	 * @static
	 * @constant
	 */
	ProAct.VERSION = '0.4.3';
	
	/**
	 * Defines the possible states of the ProAct objects.
	 * <ul>
	 *  <li>init - Initialized : It is not usable yet, but is market as ProAct object.</li>
	 *  <li>ready - Ready for use.</li>
	 *  <li>destroyed - Destroyed : An object that is ProAct dependent no more. All the ProAct logic should be cleaned up from it.</li>
	 *  <li>error - There was some runtime error while creating or working with the object.</li>
	 * </ul>
	 *
	 * @namespace ProAct.States
	 */
	ProAct.States = {
	  init: 1,
	  ready: 2,
	  destroyed: 3,
	  error: 4
	};
	
	
	/**
	 * Contains a set of utility functions to ease working with arrays and objects.
	 * Can be reffered by using 'ProAct.U' too.
	 *
	 * @namespace ProAct.Utils
	 */
	ProAct.Utils = Pro.U = {
	
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
	    return Pro.U.isObject(value) && Object.prototype.toString.call(value) === '[object Array]';
	  },
	
	  /**
	   * Checks if the passed value is instance of the Pro.Array type or not.
	   *
	   * @memberof ProAct.Utils
	   * @function isProArray
	   * @param {Object} value
	   * @return {Boolean}
	   * @see {@link Pro.Array}
	   */
	  isProArray: function (value) {
	    return value !== null && Pro.U.isObject(value) && Pro.U.isArray(value._array) && value.length !== undefined;
	  },
	
	  /**
	   * Checks if the passed value is a valid array-like object or not.
	   * Array like objects in ProAct.js are plain JavaScript arrays and Pro.Arrays.
	   *
	   * @memberof ProAct.Utils
	   * @function isArrayObject
	   * @param {Object} value
	   * @return {Boolean}
	   * @see {@link Pro.Array}
	   */
	  isArrayObject: function (value) {
	    return Pro.U.isArray(value) || Pro.U.isProArray(value);
	  },
	
	  /**
	   * Checks if the passed value is a valid ProAct.js object or not.
	   * ProAct.js object have a special '__pro__' object that is hidden in them, which should be instance of Pro.Core.
	   *
	   * @memberof ProAct.Utils
	   * @function isProObject
	   * @param {Object} value
	   * @return {Boolean}
	   * @see {@link Pro.Array}
	   * @see {@link Pro.Value}
	   * @see {@link Pro.Core}
	   */
	  isProObject: function (value) {
	    return value && Pro.U.isObject(value) && value.__pro__ !== undefined && Pro.U.isObject(value.__pro__.properties);
	  },
	
	  /**
	   * Checks if the passed value is a valid Pro.Value or not.
	   * Pro.Value is a simple ProAct.js object that has only one reactive property - 'v'.
	   *
	   * @memberof ProAct.Utils
	   * @function isProVal
	   * @param {Object} value
	   * @return {Boolean}
	   * @see {@link Pro.Value}
	   */
	  isProVal: function (value) {
	    return Pro.U.isProObject(value) && value.__pro__.properties.v !== undefined;
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
	   */
	  ex: function(destination, source) {
	    var p;
	    for (p in source) {
	      if (source.hasOwnProperty(p)) {
	        destination[p] = source[p];
	      }
	    }
	    return destination;
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
	      diff = Pro.U.diff(array2, array1);
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
	ProAct.Configuration = P.Conf = {
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
	 *  The {@link ProAct.Queue#go} method deques all the actions from the queue and executes them in the right
	 *  order, using their priorities.
	 * </p>
	 * <p>
	 *  A Pro.Queue can be used to setup the action flow - the order of the actions must be executed.
	 *  ProAct.js uses it to create an action flow if something changes.
	 * </p>
	 *
	 * TODO Default name should be extracted to a constant. ~meddle@2014-07-10
	 *
	 * @class ProAct.Queue
	 * @param {String} name
	 *    The name of the queue, every ProAct.Queue must have a name.
	 *    The default value of the name is 'proq'. {@link ProAct.Queues} uses the names to manage its queues.
	 * @param {Object} options
	 *    Various options for the queue.
	 *    <p>Available options:</p>
	 *    <ul>
	 *      <li>before - A callback called before each call of {@link ProAct.Queue#go}.</li>
	 *      <li>after - A callback called after each call of {@link ProAct.Queue#go}.</li>
	 *      <li>err - A callback called every time an error is thrown.</li>
	 *    </ul>
	 * @see {@link ProAct.Queues}
	 */
	ProAct.Queue = P.Q = function (name, options) {
	  this.name = name || 'proq';
	  this.options = options || {};
	
	  this._queue = [];
	};
	
	/**
	 * Executes the passed <i>action</i>.
	 *
	 * @function runAction
	 * @memberof ProAct.Queue
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
	        errHandler(queue, e);
	      }
	    } else {
	      action.apply(context, args);
	    }
	  } else {
	    if (errHandler) {
	      try {
	        action.call(context);
	      } catch(e) {
	        errHandler(queue, e);
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
	   * @memberof ProAct.Queue
	   * @instance
	   * @constant
	   * @type {Object}
	   * @default ProAct.Queue
	   */
	  constructor: ProAct.Queue,
	
	  /**
	   * Retrieves the lenght of this ProAct.Queue.
	   *
	   * @memberof ProAct.Queue
	   * @instance
	   * @method length
	   * @return {Number}
	   *      The number of actions queued in this queue.
	   */
	  length: function () {
	    return this._queue.length / 4;
	  },
	
	  /**
	   * Checks if this ProAct.Queue is empty.
	   *
	   * @memberof ProAct.Queue
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
	   *  ProAct.Queue#defer, ProAct.Queue#enque and ProAct.Queue#add are aliases of this method.
	   * </p>
	   *
	   * @memberof ProAct.Queue
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
	    if (context && P.U.isFunction(context)) {
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
	   *  ProAct.Queue#deferOnce, ProAct.Queue#enqueOnce and ProAct.Queue#addOnce are aliases of this method.
	   * </p>
	   *
	   * @memberof ProAct.Queue
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
	   * @see {@link ProAct.Queue#push}
	   */
	  pushOnce: function (context, action, args) {
	    if (context && P.U.isFunction(context)) {
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
	   *  ProAct.Queue#run is alias of this method.
	   * </p>
	   *
	   * @memberof ProAct.Queue
	   * @instance
	   * @method go
	   * @param {Boolean} once
	   *      True if 'go' should not be called for actions generated by the executed ones.
	   * @see {@link ProAct.Queue#push}
	   * @see {@link ProAct.Queue#pushOnce}
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
	 * <p>
	 *  Creates a queue of {@link ProAct.Queue}s. The order of these sub-queues is used
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
	 *  The {@link ProAct.Queues#go} method deques all the actions from all the queues and executes them in the right
	 *  order, using their priorities and queue order.
	 * </p>
	 * <p>
	 *  A ProAct.Queues can be used to setup very complex the action flow.
	 *  ProAct.js uses it with only one queue - 'proq' to create an action flow if something changes.
	 * </p>
	 *
	 * TODO We need to pass before, after and error callbacks here too. ~meddle@2014-07-10
	 *
	 * @class ProAct.Queues
	 * @param {Array} queueNames
	 *      Array with the names of the sub-queues. The size of this array determines
	 *      the number of the sub-queues.
	 * @param {Object} options
	 *    Various options for the ProAct.Queues.
	 *    <p>Available options:</p>
	 *    <ul>
	 *      <li>queue - An options object containing options to be passed to all the sub-queues. For more information see {@link ProAct.Queue}.</li>
	 *    </ul>
	 * @see {@link ProAct.Queue}
	 * @see {@link ProAct.Flow}
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
	   * @memberof ProAct.Queues
	   * @instance
	   * @constant
	   * @type {Object}
	   * @default ProAct.Queues
	   */
	  constructor: ProAct.Queues,
	
	  /**
	   * Checks if this ProAct.Queues is empty.
	   *
	   * @memberof ProAct.Queues
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
	   *  ProAct.Queues#defer, ProAct.Queues#enque and ProAct.Queues#add are aliases of this method.
	   * </p>
	   *
	   * @memberof ProAct.Queues
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
	   * @see {@link ProAct.Queue#push}
	   */
	  push: function (queueName, context, action, args) {
	    if (queueName && !P.U.isString(queueName)) {
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
	   *  ProAct.Queues#deferOnce, ProAct.Queues#enqueOnce and ProAct.Queues#addOnce are aliases of this method.
	   * </p>
	   *
	   * @memberof ProAct.Queues
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
	   * @see {@link ProAct.Queue#pushOnce}
	   */
	  pushOnce: function (queueName, context, action, args) {
	    if (queueName && !P.U.isString(queueName)) {
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
	   *  ProAct.Queues#run and ProAct.Queues#flush are aliases of this method.
	   * </p>
	   *
	   * @memberof ProAct.Queues
	   * @instance
	   * @method go
	   * @param {String} queueName
	   *      The name of the queue to begin from. Can be null and defaults to the first sub-queue.
	   * @see {@link ProAct.Queues#push}
	   * @see {@link ProAct.Queues#pushOnce}
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
	 * <p>
	 *  Constructs the action flow of the ProAct.js; An action flow is a set of actions
	 *  executed in the reactive environment, which order is determined by the dependencies
	 *  between the reactive properties. The action flow puts on motion the data flow in the reactive
	 *  ecosystem. Every change on a property triggers an action flow, which triggers the data flow.
	 * </p>
	 *  ProAct.Flow is inspired by the [Ember's Backburner.js]{@link https://github.com/ebryn/backburner.js}.
	 *  The defferences are the priority queues and some other optimizations like the the 'once' argument of the {@link ProAct.Queue#go} method.
	 *  It doesn't include debouncing and timed defer of actions for now.
	 * <p>
	 *  ProAct.Flow is used to solve many of the problems in the reactive programming, for example the diamond problem.
	 * </p>
	 * <p>
	 *  It can be used for other purposes too, for example to run rendering in a rendering queue, after all of the property updates.
	 * </p>
	 * <p>
	 *  ProAct.Flow, {@link ProAct.Queues} and {@link ProAct.Queue} together form the ActionFlow module of ProAct.
	 * </p>
	 *
	 * TODO ProAct.Flow#start and ProAct.Flow#stop are confusing names - should be renamed to something like 'init' and 'exec'.
	 *
	 * @class ProAct.Flow
	 * @param {Array} queueNames
	 *      Array with the names of the sub-queues of the {@link ProAct.Queues}es of the flow. The size of this array determines
	 *      the number of the sub-queues.
	 * @param {Object} options
	 *    Various options for the ProAct.Flow.
	 *    <p>Available options:</p>
	 *    <ul>
	 *      <li>start - A callback that will be called every time when the action flow starts.</li>
	 *      <li>stop - A callback that will be called every time when the action flow ends.</li>
	 *      <li>err - A callback that will be called if an error is thrown in the action flow.</li>
	 *      <li>flowInstance - Options object for the current flow instance. The flow instances are @{link ProAct.Queues}es.</li>
	 *    </ul>
	 * @see {@link ProAct.Queues}
	 * @see {@link ProAct.Queue}
	 */
	ProAct.Flow = P.F = function (queueNames, options) {
	  if (!queueNames) {
	    queueNames = ['proq'];
	  }
	
	  this.queueNames = queueNames;
	  this.options = options || {};
	
	  this.flowInstance = null;
	  this.flowInstances = [];
	
	  this.pauseMode = false;
	};
	
	P.F.prototype = {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @memberof ProAct.Flow
	   * @instance
	   * @constant
	   * @type {Object}
	   * @default ProAct.Flow
	   */
	  constructor: ProAct.Flow,
	
	  /**
	   * Puts the ProAct.Flow in running mode, meaning actions can be defered in it.
	   * <p>
	   *  It creates a new flow instance - instance of {@link ProAct.Queues} and
	   *  if there was a running instance, it is set to be the previous inctance.
	   * </p>
	   * <p>
	   *  If a <i>start</i> callback was passed when this ProAct.Flow was being created,
	   *  it is called with the new flow instance.
	   * </p>
	   * <p>
	   *  ProAct.Flow.begin is alias of this method.
	   * </p>
	   *
	   * @memberof ProAct.Flow
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
	
	    this.flowInstance = new Pro.Queues(queueNames, options.flowInstance);
	
	    if (start) {
	      start(this.flowInstance);
	    }
	  },
	
	  /**
	   * Starts an action flow consisting of all the actions defered after the
	   * last call of {@link ProAct.Flow#start} and then stops the ProAct.Flow.
	   *
	   * <p>
	   *  If there is a current action flow instance, it is flushed, using the
	   *  {@link ProAct.Queues#go} method.
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
	   *  ProAct.Flow#end is an alias for this method.
	   * </p>
	   *
	   * @memberof ProAct.Flow
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
	      }
	    }
	  },
	
	  /**
	   * Puts the flow in <i>pause mode</i>.
	   * When the flow is paused actions that should be defered to be run in it
	   * are skipped.
	   *
	   * @memberof ProAct.Flow
	   * @instance
	   * @method pause
	   * @see {@link ProAct.Flow#push}
	   * @see {@link ProAct.Flow#pushOnce}
	   */
	  pause: function () {
	    this.pauseMode = true;
	  },
	
	  /**
	   * Resumes the action flow if it is paused.
	   * The flow becomes active again and actions can be pushed into it.
	   *
	   * @memberof ProAct.Flow
	   * @instance
	   * @method resume
	   * @see {@link ProAct.Flow#pause}
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
	   *  ProAct.Flow#go and ProAct.Flow#flush are aliases of this method.
	   * </p>
	   *
	   * @memberof ProAct.Flow
	   * @instance
	   * @method run
	   * @param {Object} context
	   *      The value of <i>this</i> bound to the <i>callback</i> when it is executed.
	   * @param {Function} callback
	   *      The callback that will be invoked in a new running ProAct.Flow.
	   * @see {@link ProAct.Flow#start}
	   * @see {@link ProAct.Flow#stop}
	   * @see {@link ProAct.Flow#push}
	   * @see {@link ProAct.Flow#pushOnce}
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
	          err(e);
	        }
	      } else {
	        callback.call(context);
	      }
	    } finally {
	      this.stop();
	    }
	  },
	
	  /**
	   * Checks if there is an active {@link ProAct.Queues} instance in this ProAct.Flow.
	   *
	   * TODO This should be named 'isActive'.
	   *
	   * @memberof ProAct.Flow
	   * @instance
	   * @method isRunning
	   * @see {@link ProAct.Flow#start}
	   * @see {@link ProAct.Flow#stop}
	   */
	  isRunning: function () {
	    return this.flowInstance !== null && this.flowInstance !== undefined;
	  },
	
	  /**
	   * Checks if this ProAct.Flow is paused.
	   *
	   * @memberof ProAct.Flow
	   * @instance
	   * @method isPaused
	   * @see {@link ProAct.Flow#pause}
	   * @see {@link ProAct.Flow#resume}
	   */
	  isPaused: function () {
	    return this.isRunning() && this.pauseMode;
	  },
	
	  /**
	   * Pushes an action to the flow.
	   * This method can defer in the flow the same action multiple times.
	   * <p>
	   *  ProAct.Flow#defer, ProAct.Flow#enque and ProAct.Flow#add are aliases of this method.
	   * </p>
	   * <p>
	   *  If the flow is paused, the action will not be defered.
	   * </p>
	   *
	   * TODO Errors should be put in constants!
	   *
	   * @memberof ProAct.Flow
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
	   * @see {@link ProAct.Queues#push}
	   * @see {@link ProAct.Flow#isPaused}
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
	   *  ProAct.Flow#deferOnce, ProAct.Flow#enqueOnce and ProAct.Flow#addOnce are aliases of this method.
	   * </p>
	   * <p>
	   *  If the flow is paused, the action will not be defered.
	   * </p>
	   *
	   * @memberof ProAct.Flow
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
	   * @see {@link ProAct.Queues#pushOnce}
	   * @see {@link ProAct.Flow#isPaused}
	   * @throws {Error} <i>Not in running flow!</i>, if there is no action flow instance.
	   */
	  pushOnce: function (queueName, context, action, args) {
	    if (!this.flowInstance) {
	      throw new Error('Not in running flow!');
	    }
	    if (!this.isPaused()) {
	      this.flowInstance.pushOnce(queueName, context, action, args);
	    }
	  }
	};
	
	/**
	 * The {@link ProAct.Flow} instance used by ProAct's property updates by default.
	 * <p>
	 *  It defines only one queue - the default one <i>proq</i>.
	 * </p>
	 * <p>
	 *   It has default error callback that outputs errors to the {@link ProAct.flow.errStream}, if defined.
	 * </p>
	 * <p>
	 *  Override this instance if you are creating a framework or toolset over ProAct.js.
	 * </p>
	 *
	 * @type ProAct.Flow
	 * @memberof ProAct
	 * @static
	 */
	ProAct.flow = new ProAct.Flow(['proq'], {
	  err: function (e) {
	    if (P.flow.errStream) {
	      P.flow.errStream().triggerErr(e);
	    } else {
	      console.log(e);
	    }
	  },
	  flowInstance: {
	    queue: {
	      err: function (queue, e) {
	        if (P.flow.errStream) {
	          P.flow.errStream().triggerErr(e);
	        } else {
	          console.log(e);
	        }
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
	 * <p>
	 *  Constructs a ProAct.Observable. It can be used both as observer and observable.
	 * </p>
	 * <p>
	 *  The observables in ProAct.js form the dependency graph.
	 *  If some observable listens to changes from another - it depends on it.
	 * </p>
	 * <p>
	 *  The observables can transform the values or events incoming to them.
	 * </p>
	 * <p>
	 *  Every observable can have a parent observable, that will be notified for all the changes
	 *  on the child-observable, it is something as special observer.
	 * </p>
	 * <p>
	 *  ProAct.Observable is part of the core module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.Observable
	 * @param {Array} transforms
	 *      A list of transformation to be used on all incoming chages.
	 */
	ProAct.Observable = function (transforms) {
	  P.U.defValProp(this, 'listeners', false, false, true, this.defaultListeners());
	  this.sources = [];
	
	  this.listener = null;
	  this.errListener = null;
	
	  this.transforms = transforms ? transforms : [];
	
	  this.parent = null;
	};
	
	P.U.ex(P.Observable, {
	
	  /**
	   * A constant defining bad values or bad events.
	   *
	   * @memberof ProAct.Observable
	   * @type Object
	   * @static
	   * @constant
	   */
	  BadValue: {},
	
	  /**
	   * Transforms the passed <i>val</i> using the ProAct.Observable#transforms of the passed <i>observable</i>.
	   *
	   * @function transforms
	   * @memberof ProAct.Observable
	   * @static
	   * @param {ProAct.Observable} observable
	   *      The ProAct.Observable which transformations should be used.
	   * @param {Object} val
	   *      The value to transform.
	   * @return {Object}
	   *      The transformed value.
	   */
	  transform: function (observable, val) {
	    var i, t = observable.transforms, ln = t.length;
	    for (i = 0; i < ln; i++) {
	      val = t[i].call(observable, val);
	      if (val === P.Observable.BadValue) {
	        break;
	      }
	    }
	
	    return val;
	  }
	});
	
	P.Observable.prototype = {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @constant
	   * @default ProAct.Observable
	   */
	  constructor: ProAct.Observable,
	
	  /**
	   * Generates the initial listeners object. It can be overridden for alternative listeners collections.
	   * It is used for resetting all the listeners too.
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @method defaultListeners
	   * @return {Object}
	   *      A map containing the default listeners collections.
	   */
	  defaultListeners: function () {
	    return {
	      change: [],
	      error: []
	    };
	  },
	
	  /**
	   * A list of actions or action to be used when no action is passed for the methods working with actions.
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @method defaultActions
	   * @default 'change'
	   * @return {Array|String}
	   *      The actions to be used if no actions are provided to action related methods,
	   *      like {@link ProAct.Observable#on}, {@link ProAct.Observable#off}, {@link ProAct.Observable#update}, {@link ProAct.Observable#willUpdate}.
	   */
	  defaultActions: function () {
	    return 'change';
	  },
	
	  /**
	   * Creates the <i>listener</i> of this observable.
	   * Every observable should have one listener that should pass to other observables.
	   * <p>
	   *  This listener turns the observable in a observer.
	   * </p>
	   * <p>
	   *  Should be overriden with specific listener, by default it returns null.
	   * </p>
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @abstract
	   * @method makeListener
	   * @default null
	   * @return {Object}
	   *      The <i>listener of this observer</i>.
	   */
	  makeListener: P.N,
	
	  /**
	   * Creates the <i>error listener</i> of this observable.
	   * Every observable should have one error listener that should pass to other observables.
	   * <p>
	   *  This listener turns the observable in a observer for errors.
	   * </p>
	   * <p>
	   *  Should be overriden with specific listener, by default it returns null.
	   * </p>
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @abstract
	   * @method makeErrListener
	   * @default null
	   * @return {Object}
	   *      The <i>error listener of this observer</i>.
	   */
	  makeErrListener: P.N,
	
	  /**
	   * Creates the <i>event</i> to be send to the listeners on update.
	   * <p>
	   *  The <i>event</i> should be an instance of {@link ProAct.Event}.
	   * </p>
	   * <p>
	   *  By default this method returns {@link ProAct.Event.Types.value} event.
	   * </p>
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @method makeEvent
	   * @default {ProAct.Event} with type {@link ProAct.Event.Types.value}
	   * @param {ProAct.Event} source
	   *      The source event of the event. It can be null
	   * @return {ProAct.Event}
	   *      The event.
	   */
	  makeEvent: function (source) {
	    return new P.Event(source, this, P.Event.Types.value);
	  },
	
	  /**
	   * Attaches a new listener to this ProAct.Observable.
	   * The listener may be function or object that defines a <i>call</i> method.
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @method on
	   * @param {Array|String} actions
	   *      The action/actions to listen for. If this parameter is skipped or null/undefined, the actions from {@link ProAct.Observable#defaultActions} are used.
	   *      <p>
	   *        The actions can be skipped and on their place as first parameter to be passed the <i>listener</i>.
	   *      </p>
	   * @param {Object} listener
	   *      The listener to attach. It must be instance of Function or object with a <i>call</i> method.
	   * @return {ProAct.Observable}
	   *      <b>this</b>
	   * @see {@link ProAct.Observable#defaultActions}
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
	   * <p>
	   *  If this method is called without parameters, all the listeners for all the actions are removed.
	   *  The listeners are reset using {@link ProAct.Observable#defaultListeners}.
	   * </p>
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @method off
	   * @param {Array|String} actions
	   *      The action/actions to stop listening for. If this parameter is skipped or null/undefined, the actions from {@link ProAct.Observable#defaultActions} are used.
	   *      <p>
	   *        The actions can be skipped and on their place as first parameter to be passed the <i>listener</i>.
	   *      </p>
	   * @param {Object} listener
	   *      The listener to detach. If it is skipped, null or undefined all the listeners are removed from this observable.
	   * @return {ProAct.Observable}
	   *      <b>this</b>
	   * @see {@link ProAct.Observable#on}
	   * @see {@link ProAct.Observable#defaultActions}
	   * @see {@link ProAct.Observable#defaultListeners}
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
	   * Attaches a new error listener to this ProAct.Observable.
	   * The listener may be function or object that defines a <i>call</i> method.
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @method onErr
	   * @param {Object} listener
	   *      The listener to attach. It must be instance of Function or object with a <i>call</i> method.
	   * @return {ProAct.Observable}
	   *      <b>this</b>
	   * @see {@link ProAct.Observable#on}
	   */
	  onErr: function (listener) {
	    return this.on('error', listener);
	  },
	
	  /**
	   * Removes an error <i>listener</i> from the passed <i>action</i>.
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @method offErr
	   * @param {Object} listener
	   *      The listener to detach. If it is skipped, null or undefined all the listeners are removed from this observable.
	   * @return {ProAct.Observable}
	   *      <b>this</b>
	   * @see {@link ProAct.Observable#onErr}
	   */
	  offErr: function (listener) {
	    return this.off('error', listener);
	  },
	
	  /**
	   * Links source observables into this observable. This means that <i>this observable</i>
	   * is listening for changes from the <i>sources</i>.
	   * <p>
	   *  A good example is one stream to have another as as source -> if data comes into the source
	   *  stream, it is passed to the listening too. That way the source stream is plugged <b>into</b> the listening one.
	   * </p>
	   * <p>
	   *  The listeners from {@link ProAct.Observable#makeListener} and {@link ProAct.Observable#makeErrListener} are used.
	   * </p>
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @method into
	   * @param [...]
	   *      Zero or more source ProAct.Observables to set as sources.
	   * @return {ProAct.Observable}
	   *      <b>this</b>
	   * @see {@link ProAct.Observable#makeListener}
	   * @see {@link ProAct.Observable#makeErrListener}
	   */
	  into: function () {
	    var args = slice.call(arguments),
	        ln = args.length, i, source;
	    for (i = 0; i < ln; i++) {
	      source = args[i];
	      this.sources.push(source);
	      source.on(this.makeListener());
	      source.onErr(this.makeErrListener());
	    }
	
	    return this;
	  },
	
	  /**
	   * The reverse of {@link ProAct.Observable#into} - sets <i>this observable</i> as a source
	   * to the passed <i>destination</i> observable.
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @method out
	   * @param {ProAct.Observable} destination
	   *      The observable to set as source <i>this</i> to.
	   * @return {ProAct.Observable}
	   *      <b>this</b>
	   * @see {@link ProAct.Observable#into}
	   */
	  out: function (destination) {
	    destination.into(this);
	
	    return this;
	  },
	
	  /**
	   * Removes a <i>source observable</i> from <i>this</i>.
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @method offSource
	   * @param {ProAct.Observable} source
	   *      The ProAct.Observable to remove as <i>source</i>.
	   * @return {ProAct.Observable}
	   *      <b>this</b>
	   * @see {@link ProAct.Observable#into}
	   */
	  offSource: function (source) {
	    P.U.remove(this.sources, source);
	    source.off(this.listener);
	    source.offErr(this.errListener);
	
	    return this;
	  },
	
	  /**
	   * Adds a new <i>transformation</i> to the list of transformations
	   * of <i>this observable</i>.
	   * <p>
	   *  A transformation is a function or an object that has a <i>call</i> method defined.
	   *  This function or call method should have one argument and to return a transformed version of it.
	   *  If the returned value is {@link ProAct.Observable.BadValue}, the next transformations are skipped and the updating
	   *  value/event becomes - bad value.
	   * </p>
	   * <p>
	   *  Every value/event that updates <i>this observable</i> will be transformed using the new transformation.
	   * </p>
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @method transform
	   * @param {Object} transformation
	   *      The transformation to add.
	   * @return {ProAct.Observable}
	   *      <b>this</b>
	   * @see {@link ProAct.Observable.transform}
	   */
	  transform: function (transformation) {
	    this.transforms.push(transformation);
	    return this;
	  },
	
	  /**
	   * Adds a mapping transformation to <i>this observable</i>.
	   * <p>
	   *  Mapping transformations just transform one value into another. For example if we get update with
	   *  the value of <i>3</i> and we have mapping transformation that returns the updating value powered by <i>2</i>,
	   *  we'll get <i>9</i> as actual updating value.
	   * </p>
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @method mapping
	   * @param {Object} mappingFunction
	   *      Function or object with a <i>call method</i> to use as map function.
	   * @return {ProAct.Observable}
	   *      <b>this</b>
	   * @see {@link ProAct.Observable#transform}
	   */
	  mapping: function (mappingFunction) {
	    return this.transform(mappingFunction)
	  },
	
	  /**
	   * Adds a filtering transformation to <i>this observable</i>.
	   * <p>
	   *  Filtering can be used to filter the incoming update values. For example you can
	   *  filter by only odd numbers as update values.
	   * </p>
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @method filtering
	   * @param {Object} filteringFunction
	   *      The filtering function or object with a call method, should return boolean.
	   * @return {ProAct.Observable}
	   *      <b>this</b>
	   * @see {@link ProAct.Observable#transform}
	   */
	  filtering: function(filteringFunction) {
	    var _this = this;
	    return this.transform(function (val) {
	      if (filteringFunction.call(_this, val)) {
	        return val;
	      }
	      return P.Observable.BadValue;
	    });
	  },
	
	  /**
	   * Adds an accumulation transformation to <i>this observable</i>.
	   * <p>
	   *  Accumulation is used to compute a value based on the previous one.
	   * </p>
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @method accumulation
	   * @param {Object} initVal
	   *      Initial value for the accumulation. For example '0' for sum.
	   * @param {Object} accumulationFunction
	   *      The function to accumulate.
	   * @return {ProAct.Observable}
	   *      <b>this</b>
	   * @see {@link ProAct.Observable#transform}
	   */
	  accumulation: function (initVal, accumulationFunction) {
	    var _this = this, val = initVal;
	    return this.transform(function (newVal) {
	      val = accumulationFunction.call(_this, val, newVal)
	      return val;
	    });
	  },
	
	  /**
	   * Creates a new ProAct.Observable instance with source <i>this</i> and mapping
	   * the passed <i>mapping function</i>.
	   * <p>
	   *  Should be overridden with creating the right observable.
	   * </p>
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @abstract
	   * @method map
	   * @param {Object} mappingFunction
	   *      Function or object with a <i>call method</i> to use as map function.
	   * @return {ProAct.Observable}
	   *      A new ProAct.Observable instance with the <i>mapping</i> applied.
	   * @see {@link ProAct.Observable#mapping}
	   */
	  map: P.N,
	
	  /**
	   * Creates a new ProAct.Observable instance with source <i>this</i> and filtering
	   * the passed <i>filtering function</i>.
	   * <p>
	   *  Should be overridden with creating the right observable.
	   * </p>
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @abstract
	   * @method filter
	   * @param {Object} filteringFunction
	   *      The filtering function or object with a call method, should return boolean.
	   * @return {ProAct.Observable}
	   *      A new ProAct.Observable instance with the <i>filtering</i> applied.
	   * @see {@link ProAct.Observable#filtering}
	   */
	  filter: P.N,
	
	  /**
	   * Creates a new ProAct.Observable instance with source <i>this</i> and accumulation
	   * the passed <i>accumulation function</i>.
	   * <p>
	   *  Should be overridden with creating the right observable.
	   * </p>
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @abstract
	   * @method accumulate
	   * @param {Object} initVal
	   *      Initial value for the accumulation. For example '0' for sum.
	   * @param {Object} accumulationFunction
	   *      The function to accumulate.
	   * @return {ProAct.Observable}
	   *      A new ProAct.Observable instance with the <i>accumulation</i> applied.
	   * @see {@link ProAct.Observable#accumulation}
	   */
	  accumulate: P.N,
	
	  /**
	   * Generates a new {@link ProAct.Val} containing the state of an accumulations.
	   * <p>
	   *  The value will be updated with every update coming to this observable.
	   * </p>
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @method reduce
	   * @param {Object} initVal
	   *      Initial value for the accumulation. For example '0' for sum.
	   * @param {Object} accumulationFunction
	   *      The function to accumulate.
	   * @return {ProAct.Val}
	   *      A {@link ProAct.Val} instance observing <i>this</i> with the accumulation applied.
	   * @see {@link ProAct.Observable#accumulate}
	   * @see {@link ProAct.Val}
	   */
	  reduce: function (initVal, accumulationFunction) {
	    return new P.Val(initVal).into(this.accumulate(initVal, accumulationFunction));
	  },
	
	  /**
	   * Update notifies all the observers of this ProAct.Observable.
	   * <p>
	   *  If there is running {@link ProAct.flow} instance it uses it to call the
	   *  {@link ProAct.Observable.willUpdate} action with the passed <i>parameters</i>.
	   * </p>
	   * <p>
	   *  If {@link ProAct.flow} is not running, a new instance is created and the
	   *  {@link ProAct.Observable.willUpdate} action of <i>this</i> is called in it.
	   * </p>
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @method update
	   * @param {Object} source
	   *      The source of the update, for example update of ProAct.Observable, that <i>this</i> is observing.
	   *      <p>
	   *        Can be null - no source.
	   *      </p>
	   *      <p>
	   *        In the most cases {@link ProAct.Event} is the source.
	   *      </p>
	   * @param {Array|String} actions
	   *      A list of actions or a single action to update the listeners that listen to it.
	   * @param {Array} eventData
	   *      Data to be passed to the event to be created.
	   * @return {ProAct.Observable}
	   *      <i>this</i>
	   * @see {@link ProAct.Observable#willUpdate}
	   * @see {@link ProAct.Observable#makeEvent}
	   * @see {@link ProAct.flow}
	   */
	  update: function (source, actions, eventData) {
	    var observable = this;
	    if (!P.flow.isRunning()) {
	      P.flow.run(function () {
	        observable.willUpdate(source, actions, eventData);
	      });
	    } else {
	      observable.willUpdate(source, actions, eventData);
	    }
	    return this;
	  },
	
	  /**
	   * <b>willUpdate()</b> is the method used to notify observers that <i>this</i> ProAct.Observable will be updated.
	   * <p>
	   *  It uses the {@link ProAct.Observable#defer} to defer the listeners of the listening ProAct.Observables.
	   *  The idea is that everything should be executed in a running {@link ProAct.Flow}, so there will be no repetative
	   *  updates.
	   * </p>
	   * <p>
	   *  The update value will come from the {@link ProAct.Observable#makeEvent} method and the <i>source</i>
	   *  parameter will be passed to it.
	   * </p>
	   * <p>
	   *  If <i>this</i> ProAct.Observable has a <i>parent</i> ProAct.Observable it will be notified in the running flow
	   *  as well.
	   * </p>
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @method willUpdate
	   * @param {Object} source
	   *      The source of the update, for example update of ProAct.Observable, that <i>this</i> is observing.
	   *      <p>
	   *        Can be null - no source.
	   *      </p>
	   *      <p>
	   *        In the most cases {@link ProAct.Event} is the source.
	   *      </p>
	   * @param {Array|String} actions
	   *      A list of actions or a single action to update the listeners that listen to it.
	   *      If there is no action provided, the actions from {@link ProAct.Observable#defaultActions} are used.
	   * @param {Array} eventData
	   *      Data to be passed to the event to be created.
	   * @return {ProAct.Observable}
	   *      <i>this</i>
	   * @see {@link ProAct.Observable#defer}
	   * @see {@link ProAct.Observable#makeEvent}
	   * @see {@link ProAct.Observable#defaultActions}
	   * @see {@link ProAct.flow}
	   */
	  willUpdate: function (source, actions, eventData) {
	    if (!actions) {
	      actions = this.defaultActions();
	    }
	
	    var ln, i,
	        listener,
	        listeners,
	        length,
	        event;
	
	    if (P.U.isString(actions)) {
	      listeners = this.listeners[actions];
	    } else {
	      listeners = [];
	      ln = actions.length;
	
	      if (this.parent === null && actions.length === 0) {
	        return this;
	      }
	
	      for (i = 0; i < ln; i++) {
	        listeners = listeners.concat(this.listeners[actions[i]]);
	      }
	    }
	
	    if (listeners.length === 0 && this.parent === null) {
	      return this;
	    }
	
	    length = listeners.length;
	    event = this.makeEvent(source, eventData);
	
	    for (i = 0; i < length; i++) {
	      listener = listeners[i];
	
	      this.defer(event, listener);
	
	      if (listener.property) {
	        listener.property.willUpdate(event);
	      }
	    }
	
	    if (this.parent && this.parent.call) {
	      this.defer(event, this.parent);
	    }
	
	    return this;
	  },
	
	  /**
	   * Defers a ProAct.Observable listener.
	   * <p>
	   *  By default this means that the listener is put into active {@link ProAct.Flow} using it's
	   *  {@link ProAct.Flow#pushOnce} method, but it can be overridden.
	   * </p>
	   *
	   * @memberof ProAct.Observable
	   * @instance
	   * @method defer
	   * @param {Object} event
	   *      The event/value to pass to the listener.
	   * @param {Object} listener
	   *      The listener to defer. It should be a function or object defining the <i>call</i> method.
	   * @return {ProAct.Observable}
	   *      <i>this</i>
	   * @see {@link ProAct.Observable#willUpdate}
	   * @see {@link ProAct.Observable#makeListener}
	   * @see {@link ProAct.flow}
	   */
	  defer: function (event, listener) {
	    if (P.U.isFunction(listener)) {
	      P.flow.pushOnce(listener, [event]);
	    } else {
	      P.flow.pushOnce(listener, listener.call, [event]);
	    }
	    return this;
	  }
	};
	
	/**
	 * <p>
	 *  Constructs a ProAct.Event. The event contains information of the update.
	 * </p>
	 * <p>
	 *  ProAct.Event is part of the core module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.Event
	 * @param {ProAct.Event} source
	 *      If there is an event that coused this event - it is the source. Can be null - no source.
	 * @param {Object} target
	 *      The thing that triggered this event.
	 * @param {ProAct.Event.Types} type
	 *      The type of the event
	 * @param [...] args
	 *      Arguments of the event, for example for value event, these are the old value and the new value.
	 */
	ProAct.Event = P.E = function (source, target, type) {
	  this.source = source;
	  this.target = target;
	  this.type = type;
	  this.args = slice.call(arguments, 3);
	};
	
	/**
	 * Defines the possible types of the ProAct.Events.
	 *
	 * @namespace ProAct.Event.Types
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
	   * @static
	   * @constant
	   */
	  value: 0,
	
	  /**
	   * Array type events. Events for changes in {@link ProAct.Array}.
	   * <p>
	   *  The args should consist of operation, index, old values, new values.
	   * </p>
	   *
	   * @type Number
	   * @static
	   * @constant
	   * @see {@link ProAct.Array.Operations}
	   */
	  array: 1,
	
	  /**
	   * Close type events. Events for closing streams or destroying properties.
	   *
	   * @type Number
	   * @static
	   * @constant
	   */
	  close: 2,
	
	  /**
	   * Error type events. Events for errors.
	   *
	   * @type Number
	   * @static
	   * @constant
	   */
	  error: 3
	};
	
	/**
	 * <p>
	 *  Constructs a ProAct.Stream. The stream is a simple {@link ProAct.Observable}, without state.
	 * </p>
	 * <p>
	 *  The streams are ment to emit values, events, changes and can be plugged into another observables.
	 *  For example you can connect many streams, to merge them and to divide them, to plug them into properties.
	 * </p>
	 * <p>
	 *  The reactive environment consists of the properties and the objects containing them, but
	 *  the outside world is not reactive. It is possible to use the ProAct.Streams as connections from the
	 *  outside world to the reactive environment.
	 * </p>
	 * <p>
	 *    The transformations can be used to change the events or values emitetted.
	 * </p>
	 * <p>
	 *  ProAct.Stream is part of the streams module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.Stream
	 * @extends ProAct.Observable
	 * @param {ProAct.Observable} source
	 *      A default source of the stream, can be null.
	 * @param {Array} transforms
	 *      A list of transformation to be used on all incoming chages.
	 */
	ProAct.Stream = ProAct.S = function (source, transforms) {
	  P.Observable.call(this, transforms);
	
	  if (source) {
	    this.into(source);
	  }
	};
	
	ProAct.Stream.prototype = P.U.ex(Object.create(P.Observable.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @memberof ProAct.Stream
	   * @instance
	   * @constant
	   * @type {Object}
	   * @default ProAct.Stream
	   */
	  constructor: ProAct.Stream,
	
	  /**
	   * Creates the <i>event</i> to be send to the listeners on update.
	   * <p>
	   *  Streams don't create new events by default, the event is the source.
	   * </p>
	   *
	   * @memberof ProAct.Stream
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
	   * <p>
	   *  The listener of the stream just calls the method {@link ProAct.Stream#trigger} with the incoming event/value.
	   * </p>
	   *
	   * @memberof ProAct.Stream
	   * @instance
	   * @method makeListener
	   * @return {Object}
	   *      The <i>listener of this stream</i>.
	   */
	  makeListener: function () {
	    if (!this.listener) {
	      var stream = this;
	      this.listener = function (event) {
	        stream.trigger(event, true);
	      };
	    }
	
	    return this.listener;
	  },
	
	  /**
	   * Creates the <i>error listener</i> of this stream.
	   * <p>
	   *  The listener just calls {@link ProAct.Stream#triggerErr} of <i>this</i> with the incoming error.
	   * </p>
	   *
	   * @memberof ProAct.Stream
	   * @instance
	   * @method makeErrListener
	   * @return {Object}
	   *      The <i>error listener of this stream</i>.
	   */
	  makeErrListener: function () {
	    if (!this.errListener) {
	      var stream = this;
	      this.errListener = function (error) {
	        stream.triggerErr(error);
	      };
	    }
	
	    return this.errListener;
	  },
	
	  /**
	   * Defers a ProAct.Observable listener.
	   * <p>
	   *  For streams this means pushing it to active flow using {@link ProAct.Flow#push}.
	   *  If the listener is object with 'property' field, it is done using {@link ProAct.Observable#defer}.
	   *  That way the reactive environment is updated only once, but the streams are not part of it.
	   * </p>
	   *
	   * @memberof ProAct.Stream
	   * @instance
	   * @method defer
	   * @param {Object} event
	   *      The event/value to pass to the listener.
	   * @param {Object} listener
	   *      The listener to defer. It should be a function or object defining the <i>call</i> method.
	   * @return {ProAct.Observable}
	   *      <i>this</i>
	   * @see {@link ProAct.Observable#willUpdate}
	   * @see {@link ProAct.Observable#makeListener}
	   * @see {@link ProAct.flow}
	   */
	  defer: function (event, listener) {
	    if (listener.property) {
	      P.Observable.prototype.defer.call(this, event, listener);
	      return;
	    }
	
	    if (P.U.isFunction(listener)) {
	      P.flow.push(listener, [event]);
	    } else {
	      P.flow.push(listener, listener.call, [event]);
	    }
	  },
	
	  /**
	   * <p>
	   *  Triggers a new event/value to the stream. Anything that is listening for events from
	   *  this stream will get updated.
	   * </p>
	   * <p>
	   *  ProAct.Stream.t is alias of this method.
	   * </p>
	   *
	   * @memberof ProAct.Stream
	   * @instance
	   * @method trigger
	   * @param {Object} event
	   *      The event/value to pass to trigger.
	   * @param {Boolean} useTransformations
	   *      If the stream should transform the triggered value. By default it is true (if not passed)
	   * @return {ProAct.Stream}
	   *      <i>this</i>
	   * @see {@link ProAct.Observable#update}
	   */
	  trigger: function (event, useTransformations) {
	    if (useTransformations === undefined) {
	      useTransformations = true;
	    }
	
	    return this.go(event, useTransformations);
	  },
	
	  /**
	   * <p>
	   *  Triggers all the passed params, using transformations.
	   * </p>
	   * <p>
	   *  ProAct.Stream.tt is alias of this method.
	   * </p>
	   *
	   * @memberof ProAct.Stream
	   * @instance
	   * @method triggerMany
	   * @param [...]
	   *      A list of events/values to trigger
	   * @return {ProAct.Stream}
	   *      <i>this</i>
	   * @see {@link ProAct.Stream#trigger}
	   */
	  triggerMany: function () {
	    var i, args = slice.call(arguments), ln = args.length;
	
	    for (i = 0; i < ln; i++) {
	      this.trigger(args[i], true);
	    }
	
	    return this;
	  },
	
	  /**
	   * <p>
	   *  Triggers a new error to the stream. Anything that is listening for errors from
	   *  this stream will get updated.
	   * </p>
	   * <p>
	   *  ProAct.Stream.te is alias of this method.
	   * </p>
	   *
	   * @memberof ProAct.Stream
	   * @instance
	   * @method triggerErr
	   * @param {Error} err
	   *      The error to trigger.
	   * @return {ProAct.Observable}
	   *      <i>this</i>
	   * @see {@link ProAct.Observable#update}
	   */
	  triggerErr: function (err) {
	    return this.update(err, 'error');
	  },
	
	  // private
	  go: function (event, useTransformations) {
	    var i, tr = this.transforms, ln = tr.length;
	
	    if (useTransformations) {
	      try {
	        event = P.Observable.transform(this, event);
	      } catch (e) {
	        this.triggerErr(e);
	        return this;
	      }
	    }
	
	    if (event === P.Observable.BadValue) {
	      return this;
	    }
	
	    return this.update(event);
	  },
	
	  /**
	   * Creates a new ProAct.Stream instance with source <i>this</i> and mapping
	   * the passed <i>mapping function</i>.
	   *
	   * @memberof ProAct.Stream
	   * @instance
	   * @method map
	   * @param {Object} mappingFunction
	   *      Function or object with a <i>call method</i> to use as map function.
	   * @return {ProAct.Stream}
	   *      A new ProAct.Stream instance with the <i>mapping</i> applied.
	   * @see {@link ProAct.Observable#mapping}
	   */
	  map: function (mappingFunction) {
	    return new P.S(this).mapping(mappingFunction);
	  },
	
	  /**
	   * Creates a new ProAct.Stream instance with source <i>this</i> and filtering
	   * the passed <i>filtering function</i>.
	   *
	   * @memberof ProAct.Stream
	   * @instance
	   * @method filter
	   * @param {Object} filteringFunction
	   *      The filtering function or object with a call method, should return boolean.
	   * @return {ProAct.Stream}
	   *      A new ProAct.Stream instance with the <i>filtering</i> applied.
	   * @see {@link ProAct.Observable#filtering}
	   */
	  filter: function (filteringFunction) {
	    return new P.S(this).filtering(filteringFunction);
	  },
	
	  /**
	   * Creates a new ProAct.Stream instance with source <i>this</i> and accumulation
	   * the passed <i>accumulation function</i>.
	   *
	   * @memberof ProAct.Stream
	   * @instance
	   * @method accumulate
	   * @param {Object} initVal
	   *      Initial value for the accumulation. For example '0' for sum.
	   * @param {Object} accumulationFunction
	   *      The function to accumulate.
	   * @return {ProAct.Stream}
	   *      A new ProAct.Stream instance with the <i>accumulation</i> applied.
	   * @see {@link ProAct.Observable#accumulation}
	   */
	  accumulate: function (initVal, accumulationFunction) {
	    return new P.S(this).accumulation(initVal, accumulationFunction);
	  },
	
	  /**
	   * Creates a new ProAct.Stream instance that merges this with other streams.
	   * The new instance will have new value on value from any of the source streams.
	   *
	   * @memberof ProAct.Stream
	   * @instance
	   * @method merge
	   * @param [...]
	   *      A list of streams to be set as sources.
	   * @return {ProAct.Stream}
	   *      A new ProAct.Stream instance with the sources this and all the passed streams.
	   */
	  merge: function () {
	    var sources = [this].concat(slice.call(arguments)),
	        result = new P.S();
	
	    return P.S.prototype.into.apply(result, sources);
	  }
	});
	
	P.U.ex(P.F.prototype, {
	
	  /**
	   * Retrieves the errStream for logging errors from this flow.
	   * If there is no error stream, it is created.
	   *
	   * @memberof ProAct.Flow
	   * @instance
	   * @method errStream
	   * @return {ProAct.Stream}
	   *      The error stream of the flow.
	   */
	  errStream: function () {
	    if (!this.errStreamVar) {
	      this.errStreamVar = new P.S();
	    }
	
	    return this.errStreamVar;
	  }
	});
	
	P.S.prototype.t = P.S.prototype.trigger;
	P.S.prototype.tt = P.S.prototype.triggerMany;
	P.S.prototype.te = P.S.prototype.triggerErr;
	
	/**
	 * <p>
	 *  Constructs a ProAct.BufferedStream. This is a {@link ProAct.Stream} with a buffer.
	 * </p>
	 * <p>
	 *  On new value/event the listeners are not updated, but the value/event is stored in the buffer.
	 * </p>
	 * <p>
	 *  When the buffer is flushed every value/event is emitted to the listeners. In case with property listeners
	 *  they are updated only once with the last event/value. Good for performance optimizations.
	 * </p>
	 * <p>
	 *  For example if it is set to stream mouse move events, we don't care for each of the event but for a portion of them.
	 * </p>
	 * <p>
	 *  ProAct.BufferedStream is part of the streams module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.BufferedStream
	 * @extends ProAct.Stream
	 * @param {ProAct.Observable} source
	 *      A default source of the stream, can be null.
	 * @param {Array} transforms
	 *      A list of transformation to be used on all incoming chages.
	 */
	ProAct.BufferedStream = P.BS = function (source, transforms) {
	  P.S.call(this, source, transforms);
	  this.buffer = [];
	};
	
	ProAct.BufferedStream.prototype = Pro.U.ex(Object.create(P.S.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @memberof ProAct.BufferedStream
	   * @instance
	   * @constant
	   * @type {Object}
	   * @default ProAct.BufferedStream
	   */
	  constructor: ProAct.BufferedStream,
	
	  /**
	   * Flushes the stream by emitting all the events/values stored in its buffer.
	   * The buffer becomes empty.
	   *
	   * @memberof ProAct.BufferedStream
	   * @instance
	   * @method flush
	   * @return {ProAct.BufferedStream}
	   *      <i>this</i>
	   */
	  flush: function () {
	    var self = this, i, b = this.buffer, ln = b.length;
	
	    P.flow.run(function () {
	      for (i = 0; i < ln; i+= 2) {
	        self.go(b[i], b[i+1]);
	      }
	      self.buffer = [];
	    });
	
	    return this;
	  }
	});
	
	/**
	 * <p>
	 *  Constructs a ProAct.SizeBufferedStream. When the buffer is full (has the same size as <i>this</i> size), it is flushed.
	 * </p>
	 * <p>
	 *  ProAct.SizeBufferedStream is part of the streams module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.SizeBufferedStream
	 * @extends ProAct.BufferedStream
	 * @param {ProAct.Observable} source
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
	ProAct.SizeBufferedStream = P.SBS = function (source, transforms, size) {
	  if (arguments.length === 1 && typeof source === 'number') {
	    size = source;
	    source = null;
	  } else if (arguments.length === 2 && typeof transforms === 'number') {
	    size = transforms;
	    transforms = null;
	  }
	  P.BS.call(this, source, transforms);
	
	  if (!size) {
	    throw new Error('SizeBufferedStream must contain size!');
	  }
	
	  this.size = size;
	};
	
	ProAct.SizeBufferedStream.prototype = P.U.ex(Object.create(P.BS.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @memberof ProAct.SizeBufferedStream
	   * @instance
	   * @constant
	   * @type {Object}
	   * @default ProAct.SizeBufferedStream
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
	   * @memberof ProAct.SizeBufferedStream
	   * @instance
	   * @method trigger
	   * @param {Object} event
	   *      The event/value to pass to trigger.
	   * @param {Boolean} useTransformations
	   *      If the stream should transform the triggered value. By default it is true (if not passed)
	   * @return {ProAct.Stream}
	   *      <i>this</i>
	   * @see {@link ProAct.BufferedStream#flush}
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
	   * Creates a new {@link ProAct.SizeBufferedStream} instance having as source <i>this</i>.
	   *
	   * @memberof ProAct.Stream
	   * @instance
	   * @method bufferit
	   * @param {Number} size
	   *      The size of the buffer of the new ProAct.SizeBufferedStream.
	   * @return {ProAct.SizeBufferedStream}
	   *      A {@link ProAct.SizeBufferedStream} instance.
	   * @throws {Error} SizeBufferedStream must contain size, if there is no size passed to it.
	   */
	  bufferit: function (size) {
	    return new P.SBS(this, size);
	  }
	});
	
	P.SBS.prototype.t = P.SBS.prototype.trigger;
	
	/**
	 * <p>
	 *  Constructs a ProAct.DelayedStream. When a given time interval passes the buffer of the stream is flushed authomatically.
	 * </p>
	 * <p>
	 *  ProAct.DelayedStream is part of the streams module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.DelayedStream
	 * @extends ProAct.BufferedStream
	 * @param {ProAct.Observable} source
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
	ProAct.DelayedStream = P.DBS = function (source, transforms, delay) {
	  if (typeof source === 'number') {
	    delay = source;
	    source = null;
	  } else if (P.U.isObject(source) && typeof transforms === 'number') {
	    delay = transforms;
	    transforms = null;
	  }
	  P.BS.call(this, source, transforms);
	
	  this.delayId = null;
	  this.setDelay(delay);
	};
	
	ProAct.DelayedStream.prototype = P.U.ex(Object.create(P.BS.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @memberof ProAct.DelayedStream
	   * @instance
	   * @constant
	   * @type {Object}
	   * @default ProAct.DelayedStream
	   */
	  constructor: ProAct.DelayedStream,
	
	  /**
	   * <p>
	   *  Triggers a new event/value to the stream. It is stored in the buffer of the stream and not emitted.
	   * </p>
	   * <p>
	   *  ProAct.DelayedStream.t is alias of this method.
	   * </p>
	   *
	   * @memberof ProAct.DelayedStream
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
	   *  until the {@link ProAct.DelayedStream#setDelay} method is called.
	   * </p>
	   *
	   * @memberof ProAct.DelayedStream
	   * @instance
	   * @method cancelDelay
	   * @return {ProAct.DelayedStream}
	   *      <i>this</i>
	   * @see {@link ProAct.DelayedStream#setDelay}
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
	   *  Modifies the delay of the stream. The current delay is canceled using the {@link ProAct.DelayedStream#cancelDelay} method.
	   * </p>
	   *
	   * @memberof ProAct.DelayedStream
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
	   * Creates a new {@link ProAct.DelayedStream} instance having as source <i>this</i>.
	   *
	   * @memberof ProAct.Stream
	   * @instance
	   * @method delay
	   * @param {Number} delay
	   *      The time delay to be used for flushing the buffer of the new stream.
	   * @return {ProAct.DelayedStream}
	   *      A {@link ProAct.DelayedStream} instance.
	   */
	  delay: function (delay) {
	    return new P.DBS(this, delay);
	  }
	});
	
	P.DBS.prototype.t = P.DBS.prototype.trigger;
	
	/**
	 * <p>
	 *  Constructs a ProAct.ThrottlingStream. This is special kind of {@link ProAct.DelayedStream}.
	 * </p>
	 * <p>
	 *  The main idea is the following : if <i>n</i> values/events are triggered to this stream before the time delay for
	 *  flushing passes, only the last one, the <i>n</i>-th is emitted.
	 * </p>
	 * <p>
	 *  ProAct.ThrottlingStream is part of the streams module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.ThrottlingStream
	 * @extends ProAct.DelayedStream
	 * @param {ProAct.Observable} source
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
	ProAct.ThrottlingStream = P.TDS = function (source, transforms, delay) {
	  P.DBS.call(this, source, transforms, delay);
	};
	
	ProAct.ThrottlingStream.prototype = P.U.ex(Object.create(P.DBS.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @memberof ProAct.ThrottlingStream
	   * @instance
	   * @constant
	   * @type {Object}
	   * @default ProAct.ThrottlingStream
	   */
	  constructor: ProAct.ThrottlingStream,
	
	  /**
	   * <p>
	   *  Triggers a new event/value to the stream. It is stored in the buffer of the stream and not emitted.
	   *  But the buffer of ProAct.ThrottlingStream can store only one value/event, so when the delay passes only
	   *  the last value/event triggered into the stream by this method is emitted.
	   * </p>
	   * <p>
	   *  ProAct.ThrottlingStream.t is alias of this method.
	   * </p>
	   *
	   * @memberof ProAct.ThrottlingStream
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
	   * Creates a new {@link ProAct.ThrottlingStream} instance having as source <i>this</i>.
	   *
	   * @memberof ProAct.Stream
	   * @instance
	   * @method throttle
	   * @param {Number} delay
	   *      The time delay to be used for flushing the buffer of the new stream.
	   * @return {ProAct.ThrottlingStream}
	   *      A {@link ProAct.ThrottlingStream} instance.
	   */
	  throttle: function (delay) {
	    return new P.TDS(this, delay);
	  }
	});
	
	P.TDS.prototype.t = P.TDS.prototype.trigger;
	
	/**
	 * <p>
	 *  Constructs a ProAct.DelayedStream. A {@link ProAct.DelayedStream} that resets its flushing interval on every new value/event.
	 *  Only the last event/value triggered in given interval will be emitted.
	 * </p>
	 * <p>
	 *  ProAct.DebouncingStream is part of the streams module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.DebouncingStream
	 * @extends ProAct.DelayedStream
	 * @param {ProAct.Observable} source
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
	ProAct.DebouncingStream = P.DDS = function (source, transforms, delay) {
	  P.DBS.call(this, source, transforms, delay);
	};
	
	ProAct.DebouncingStream.prototype = P.U.ex(Object.create(P.DBS.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @memberof ProAct.DebouncingStream
	   * @instance
	   * @constant
	   * @type {Object}
	   * @default ProAct.DebouncingStream
	   */
	  constructor: ProAct.DebouncingStream,
	
	  /**
	   * <p>
	   *  Triggers a new event/value to the stream. It is stored in the buffer of the stream and not emitted.
	   *  But the buffer of ProAct.DebouncingStream can store only one value/event, so when the delay passes only
	   *  the last value/event triggered into the stream by this method is emitted. On every call of this method the delay is reset.
	   *  So for example if you have mouse move as source, it will emit only the last mouse move event, that was send <i>delay</i> milliseconds ago.
	   * </p>
	   * <p>
	   *  ProAct.DebouncingStream.t is alias of this method.
	   * </p>
	   *
	   * @memberof ProAct.ThrottlingStream
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
	    this.buffer = [];
	    this.cancelDelay();
	    this.setDelay(this.delay);
	    this.buffer.push(event, useTransformations);
	  }
	});
	
	P.U.ex(P.Stream.prototype, {
	
	  /**
	   * Creates a new {@link ProAct.DebouncingStream} instance having as source <i>this</i>.
	   *
	   * @memberof ProAct.Stream
	   * @instance
	   * @method debounce
	   * @param {Number} delay
	   *      The time delay to be used for flushing the buffer of the new stream.
	   * @return {ProAct.DebouncingStream}
	   *      A {@link ProAct.DebouncingStream} instance.
	   */
	  debounce: function (delay) {
	    return new P.DDS(this, delay);
	  }
	});
	
	P.DDS.prototype.t = P.DDS.prototype.trigger;
	
	/**
	 * <p>
	 *  Constructs a ProAct.Property. The properties are simple {@link ProAct.Observable}s with state. The basic property
	 *  has a state of a simple value - number/string/boolean.
	 * </p>
	 * <p>
	 *  Every property represents a field in a plain javascript object. It makes it reactive, on reading the property value,
	 *  if {@link ProAct.currentCaller} is set, it is added as a listener to the property changes.
	 * </p>
	 * <p>
	 *  Every property has a type the default property has a type of a simple value.
	 * </p>
	 * <p>
	 *  All the properties of an object are managed by its {@link ProAct.ObjectCore}, which is set to a hidden field of the object - '__pro__'.
	 * </p>
	 * <p>
	 *  When created every property is in {@link ProAct.States.init} state, when it is functional, the state is changed to {@link ProAct.States.ready}.
	 *  If the property is not in {@link ProAct.States.ready} state, it is not useable.
	 * </p>
	 * <p>
	 *  {@link ProAct.Property#init} is called by this constructor for the property initialization. It should initialize the property and set its state to {@link ProAct.States.ready}.
	 * </p>
	 * <p>
	 *  ProAct.Property is part of the properties module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.Property
	 * @extends ProAct.Observable
	 * @param {Object} proObject
	 *      A plain JavaScript object, holding a field, this property will represent.
	 * @param {String} property
	 *      The name of the field of the object, this property should represent.
	 * @param {Function} getter
	 *      An optional getter to be used when the property is read. If this parameter is empty, a new {@link ProAct.Property.defaultGetter} is build for <i>this</i>.
	 * @param {Function} setter
	 *      An optional setter to be used when the property is written. If this parameter is empty, a new {@link ProAct.Property.defaultSetter} is build for <i>this</i>.
	 * @see {@link ProAct.ObjectCore}
	 * @see {@link ProAct.Property.defaultGetter}
	 * @see {@link ProAct.Property.defaultSetter}
	 * @see {@link ProAct.Property#init}
	 * @see {@link ProAct.States.init}
	 * @see {@link ProAct.States.ready}
	 */
	ProAct.Property = P.P = function (proObject, property, getter, setter) {
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
	
	  this.state = P.States.init;
	  this.g = this.get;
	  this.s = this.set;
	
	  P.Observable.call(this); // Super!
	  this.parent = this.proObject.__pro__;
	
	  this.init();
	};
	
	P.U.ex(ProAct.Property, {
	
	  /**
	   * Defines the possible types of the ProAct.Property.
	   *
	   * @namespace ProAct.Property.Types
	   */
	  Types: {
	
	    /**
	     * ProAct.Property for simple types - Numbers, Strings or Booleans.
	     *
	     * @memberof ProAct.Property.Types
	     * @static
	     * @constant
	     */
	    simple: 0, // strings, booleans and numbers
	
	    /**
	     * ProAct.Property for auto computed types - Functions.
	     *
	     * @memberof ProAct.Property.Types
	     * @static
	     * @constant
	     */
	    auto: 1, // functions - dependent
	
	    /**
	     * ProAct.Property for object types - fields containing objects.
	     *
	     * @memberof ProAct.Property.Types
	     * @static
	     * @constant
	     */
	    object: 2, // references Pro objects
	
	    /**
	     * ProAct.Property for array types - fields containing arrays.
	     *
	     * @memberof ProAct.Property.Types
	     * @static
	     * @constant
	     */
	    array: 3, // arrays
	
	    /**
	     * ProAct.Property for nil types - fields containing null or undefined.
	     *
	     * @memberof ProAct.Property.Types
	     * @static
	     * @constant
	     */
	    nil: 4, // nulls
	
	    /**
	     * Retrieves the right ProAct.Property.Types value from a value.
	     *
	     * @memberof ProAct.Property.Types
	     * @static
	     * @param {Object} value
	     *      The value to use to compute the ProAct.Property.Types member for.
	     * @return {Number}
	     *      The type of the passed value.
	     */
	    type: function (value) {
	      if (value === null) {
	        return P.P.Types.nil;
	      } else if (P.U.isFunction(value)) {
	        return P.P.Types.auto;
	      } else if (P.U.isArray(value)) {
	        return P.P.Types.array;
	      } else if (P.U.isObject(value)) {
	        return P.P.Types.object;
	      } else {
	        return P.P.Types.simple;
	      }
	    }
	  },
	
	  /**
	   * Generates a default getter function for a ProAct.Property instance.
	   * <p>
	   *  Every ProAct.Property instance has a getter and a setter, they can be passed in the constructor, but if left blank,
	   *  this method is used for creating the getter function.
	   * </p>
	   * <p>
	   *  The default getter function uses {@link ProAct.Property#addCaller} method to track the {@link ProAct.currentCaller} listener if set.
	   *  If it is set it is added as a listener to the passed <i>property</i>.
	   * </p>
	   *
	   * @memberof ProAct.Property
	   * @static
	   * @param {ProAct.Property} property
	   *      The ProAct.Property instance to generate a getter function for.
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
	   *  Every ProAct.Property instance has a setter and a getter, they can be passed in the constructor, but if left blank,
	   *  this method is used for creating the setter function.
	   * </p>
	   * <p>
	   *  The default setter function uses {@link ProAct.Property#update} method to update all the listeners for <i>change</i>s for the passed
	   *  <i>property</i>.
	   * </p>
	   * <p>
	   *  It updates the listeners only if the new value of the property is different from the old one (using <i>===</i> for the comparison).
	   * </p>
	   *
	   * @memberof ProAct.Property
	   * @static
	   * @param {ProAct.Property} property
	   *      The ProAct.Property instance to generate a setter function for.
	   * @param {Function} setter
	   *      A setter function for the way of setting the value. It can be skipped if the value should be set using <i>=</i>.
	   * @return {Function}
	   *      The generated setter function.
	   */
	  defaultSetter: function (property, setter) {
	    return function (newVal) {
	      if (property.val === newVal) {
	        return;
	      }
	
	      property.oldVal = property.val;
	      if (setter) {
	        property.val = setter.call(property.proObject, newVal);
	      } else {
	        property.val = P.Observable.transform(property, newVal);
	      }
	
	      if (property.val === null || property.val === undefined) {
	        P.P.reProb(property).update();
	        return;
	      }
	
	      property.update();
	    };
	  },
	
	  /**
	   * Used to define the managed by a ProAct.Property instance field of the passed <i>obj</i>.
	   * <p>
	   *  The field is writable, enumerable and configurable.
	   * </p>
	   *
	   * @memberof ProAct.Property
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
	   *  For example if the initial value of the field was null, the property can be set to be instance of {@link ProAct.NullProperty},
	   *  but if it changes to the number <i>3</i> it can be changed to {@link ProAct.Property} using this method.
	   * </p>
	   * <p>
	   *  The re-definition works by using {@link ProAct.Property#destroy} to destroy the passed <i>property</i> first, and then the
	   *  {@link ProAct.ObjectCore#makeProp} method is called of the {@link ProAct.ObjectCore} of the object the <i>property</i> belongs to.
	   * </p>
	   * <p>
	   *  This way a new ProAct.Property instance is created to replace the passed one.
	   * </p>
	   *
	   * @memberof ProAct.Property
	   * @static
	   * @param {ProAct.Property} property
	   *      The ProAct.Property instance to re-define.
	   * @return {ProAct.Property}
	   *      The new re-defined property.
	   */
	  reProb: function (property) {
	    var po = property.proObject,
	        p = property.property,
	        l = property.listeners.change;
	
	    property.destroy();
	    return po.__pro__.makeProp(p, l);
	  }
	});
	
	ProAct.Property.prototype = P.U.ex(Object.create(P.Observable.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @memberof ProAct.Property
	   * @instance
	   * @constant
	   * @default ProAct.Property
	   */
	  constructor: ProAct.Property,
	
	  /**
	   * Retrieves the {@link ProAct.Property.Types} value of <i>this</i> property.
	   * <p>
	   *  For instances of the base class - ProAct.Property it is {@link ProAct.Property.Types.simple}.
	   * </p>
	   *
	   * @memberof ProAct.Property
	   * @instance
	   * @method type
	   * @return {Number}
	   *      The right type of the property.
	   */
	  type: function () {
	    return P.P.Types.simple;
	  },
	
	  /**
	   * Creates the <i>event</i> to be send to the listeners of this ProAct.Property on update.
	   * <p>
	   *  The <i>event</i> should be an instance of {@link ProAct.Event}.
	   * </p>
	   * <p>
	   *  By default this method returns {@link ProAct.Event.Types.value} event with target the property name and arguments:
	   *  <ul>
	   *    <li>The object this ProAct.Property manages a field for.</li>
	   *    <li>The old value of this property.</li>
	   *    <li>The new value of this property.</li>
	   *  </ul>
	   * </p>
	   *
	   * @memberof ProAct.Property
	   * @instance
	   * @method makeEvent
	   * @default {ProAct.Event} with type {@link ProAct.Event.Types.value}
	   * @param {ProAct.Event} source
	   *      The source event of the event. It can be null
	   * @return {ProAct.Event}
	   *      The event, created.
	   */
	  makeEvent: function (source) {
	    return new P.E(source, this.property, P.E.Types.value, this.proObject, this.oldVal, this.val);
	  },
	
	  /**
	   * Creates the <i>listener</i> of this ProAct.Property.
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
	   *  On value changes the <i><this</i> value is set to the new value using the {@link ProAct.Observable#transform} to transform it.
	   * </p>
	   *
	   * @memberof ProAct.Property
	   * @instance
	   * @method makeListener
	   * @return {Object}
	   *      The <i>listener of this ProAct.Property</i>.
	   */
	  makeListener: function () {
	    if (!this.listener) {
	      var self = this;
	
	      this.listener = {
	        property: self,
	        call: function (newVal) {
	          if (newVal && newVal.type !== undefined && newVal.type === P.E.Types.value && newVal.args.length === 3 && newVal.target) {
	            newVal = newVal.args[0][newVal.target];
	          }
	
	          self.oldVal = self.val;
	          self.val = P.Observable.transform(self, newVal);
	        }
	      };
	    }
	
	    return this.listener;
	  },
	
	  /**
	   * Initializes this property.
	   * <p>
	   *  This method logic is run only if the current state of <i>this</i> is {@link ProAct.States.init}.
	   * </p>
	   * <p>
	   *  First the property is defined as a field in its object, using {@link ProAct.Property.defineProp}.
	   * </p>
	   * <p>
	   *  Then {@link ProAct.Property#afterInit} is called to finish the initialization.
	   * </p>
	   *
	   * @memberof ProAct.Property
	   * @instance
	   * @method init
	   * @see {@link ProAct.Property#afterInit}
	   */
	  init: function () {
	    if (this.state !== P.States.init) {
	      return;
	    }
	
	    P.P.defineProp(this.proObject, this.property, this.get, this.set);
	
	    this.afterInit();
	  },
	
	  /**
	   * Called automatically after initialization of this property.
	   * <p>
	   *  By default it changes the state of <i>this</i> to {@link ProAct.States.ready}.
	   * </p>
	   * <p>
	   *  It can be overridden to define more complex initialization logic.
	   * </p>
	   *
	   * @memberof ProAct.Property
	   * @instance
	   * @method afterInit
	   */
	  afterInit: function () {
	    this.state = P.States.ready;
	  },
	
	  /**
	   * Uses {@link ProAct.currentCaller} to automatically add a new listener to this property if the caller is set.
	   * <p>
	   *  This method is used by the default getter to make every reader of the property a listener to it.
	   * </p>
	   *
	   * @memberof ProAct.Property
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
	   * Destroys this ProAct.Property instance, by making the field it manages to a normal field.
	   * <p>
	   *  The state of <i>this</i> is set to {@link ProAct.States.destroyed}.
	   * </p>
	   *
	   * @memberof ProAct.Property
	   * @instance
	   * @method destroy
	   */
	  destroy: function () {
	    if (this.state === P.States.destroyed) {
	      return;
	    }
	
	    delete this.proObject.__pro__.properties[this.property];
	    this.listeners = undefined;
	    this.oldVal = undefined;
	    this.parent = undefined;
	
	    P.U.defValProp(this.proObject, this.property, true, true, true, this.val);
	    this.get = this.set = this.property = this.proObject = undefined;
	    this.g = this.s = undefined;
	    this.val = undefined;
	    this.state = P.States.destroyed;
	  },
	
	  /**
	   * The <b>toString()</b> method returns a string representing this ProAct.Property.
	   * <p>
	   *  The string representation is the value of <i>this</i> property.
	   * </p>
	   *
	   * @memberof ProAct.Property
	   * @instance
	   * @method toString
	   */
	  toString: function () {
	    return this.val;
	  }
	});
	
	/**
	 * <p>
	 *  Constructs a ProAct.NullProperty. The properties are simple {@link ProAct.Observable}s with state. The null/nil property
	 *  has a state of a null or undefined value.
	 * </p>
	 * <p>
	 *  Null properties are automatically re-defined if their value is set to actual object or data.
	 * </p>
	 * <p>
	 *  ProAct.NullProperty is part of the properties module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.NullProperty
	 * @extends ProAct.Property
	 * @param {Object} proObject
	 *      A plain JavaScript object, holding a null/undefined field, this property should represent.
	 * @param {String} property
	 *      The name of the field of the object, this property should represent.
	 * @see {@link ProAct.ObjectCore}
	 */
	ProAct.NullProperty = P.NP = function (proObject, property) {
	  var self = this,
	      set = P.P.defaultSetter(this),
	      setter = function (newVal) {
	        var result = set.call(self.proObject, newVal),
	            types = P.P.Types,
	            type = types.type(result);
	
	        if (type !== types.nil) {
	          P.P.reProb(self);
	        }
	
	        return result;
	      };
	
	  P.P.call(this, proObject, property, P.P.defaultGetter(this), setter);
	};
	
	ProAct.NullProperty.prototype = P.U.ex(Object.create(P.P.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @memberof ProAct.NullProperty
	   * @instance
	   * @constant
	   * @default ProAct.NullProperty
	   */
	  constructor: ProAct.NullProperty,
	
	  /**
	   * Retrieves the {@link ProAct.Property.Types} value of <i>this</i> property.
	   * <p>
	   *  For ProAct.NullProperty this is {@link ProAct.Property.Types.nil}
	   * </p>
	   *
	   * @memberof ProAct.NullProperty
	   * @instance
	   * @method type
	   * @return {Number}
	   *      The right type of the property.
	   */
	  type: function () {
	    return P.P.Types.nil;
	  }
	});
	
	/**
	 * <p>
	 *  Constructs a ProAct.AutoProperty. The properties are simple {@link ProAct.Observable}s with state. The auto-computed or functional property
	 *  has a state of a Function value.
	 * </p>
	 * <p>
	 *  Auto-computed properties are functions which are turned to {@link ProAct.Property}s by a {@link ProAct.ObjectCore}.
	 * </p>
	 * <p>
	 *  If these functions are reading another fields of ProAct.js objects, they authomatically become dependent on them.
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
	 *  If this object - <i>obj</i> is turned to a reactive ProAct.js object, it becomes a simple object with three fields:
	 *  <pre>
	 *    {
	 *      a: 1,
	 *      b: 2,
	 *      c: -1
	 *    }
	 *  </pre>
	 *  But now <i>c</i> is dependent on <i>a</i> and <i>b</i>, so if <i>a</i> is set to <b>4</b>, <i>obj</i> becomes:
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
	 *    <li>The property is initialized to be lazy, so its state is {@link ProAct.States.init}</li>
	 *    <li>On its first read, the {@link ProAct.currentCaller} is set to the listener of the property, so all the properties read in the function body became observed by it. The value of the property is computed using the original function of the field.</li>
	 *    <li>On this first read the state of the property is updated to {@link ProAct.States.ready}.</li>
	 *    <li>On its following reads it is a simple value, computed from the first read. No re-computations on get.</li>
	 *    <li>If a property, this auto-computed property depends changes, the value of <i>this</i> ProAct.AutoProperty is recomputed.</li>
	 *    <li>Setting the property can be implemented easy, because on set, the original function of the property is called with the new value.</li>
	 *  </ul>
	 * </p>
	 * <p>
	 *  ProAct.AutoProperty can be depend on another ProAct.AutoProperty.
	 * </p>
	 * <p>
	 *  ProAct.AutoProperty is part of the properties module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.AutoProperty
	 * @extends ProAct.Property
	 * @param {Object} proObject
	 *      A plain JavaScript object, holding a field, this property will represent.
	 * @param {String} property
	 *      The name of the field of the object, this property should represent.
	 * @see {@link ProAct.ObjectCore}
	 * @see {@link ProAct.States.init}
	 * @see {@link ProAct.States.ready}
	 */
	ProAct.AutoProperty = P.FP = function (proObject, property) {
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
	
	        self.val = P.Observable.transform(self, self.val);
	        return self.val;
	      };
	
	  P.P.call(this, proObject, property, getter, function () {});
	};
	
	ProAct.AutoProperty.prototype = P.U.ex(Object.create(P.P.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @memberof ProAct.AutoProperty
	   * @instance
	   * @constant
	   * @default ProAct.AutoProperty
	   */
	  constructor: ProAct.AutoProperty,
	
	  /**
	   * Retrieves the {@link ProAct.Property.Types} value of <i>this</i> property.
	   * <p>
	   *  For ProAct.AutoProperty this is {@link ProAct.Property.Types.auto}
	   * </p>
	   *
	   * @memberof ProAct.AutoProperty
	   * @instance
	   * @method type
	   * @return {Number}
	   *      The right type of the property.
	   */
	  type: function () {
	    return P.P.Types.auto;
	  },
	
	  /**
	   * Creates the <i>listener</i> of this ProAct.AutoProperty.
	   * <p>
	   *  This listener turns the observable in a observer.
	   * </p>
	   * <p>
	   *  The listener for ProAct.AutoProperty is an object defining the <i>call</i> method.
	   * </p>
	   * <p>
	   *  It has a <i>property</i> field set to <i>this</i>.
	   * </p>
	   * <p>
	   *  On value changes the <i><this</i> value is set to the value computed by the original function,
	   *  using the {@link ProAct.Observable#transform} to transform it.
	   * </p>
	   *
	   * @memberof ProAct.AutoProperty
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
	        call: function () {
	          self.oldVal = self.val;
	          self.val = P.Observable.transform(self, self.func.call(self.proObject));
	        }
	      };
	    }
	
	    return this.listener;
	  },
	
	  /**
	   * Called automatically after initialization of this property.
	   * <p>
	   *  For ProAct.AutoProperty it does nothing - the real initialization is lazy and is performed on the first read of <i>this</i>.
	   * </p>
	   *
	   * @memberof ProAct.AutoProperty
	   * @instance
	   * @method afterInit
	   */
	  afterInit: function () {}
	});
	
	/**
	 * <p>
	 *  Constructs a ProAct.ObjectProperty. The properties are simple {@link ProAct.Observable}s with state. The object property
	 *  has a state of a JavaScript object value.
	 * </p>
	 * <p>
	 *  The value of ProAct.ObjectProperty is object, turned to reactive ProAct.js object recursively.
	 * </p>
	 * <p>
	 *  On changing the object value to another object the listeners for fields with the same name in the objects, are moved from the old value's fields to the new value's fields.
	 * </p>
	 * <p>
	 *  If set to null or undefined, the property is re-defined, using {@link ProAct.Property.reProb}
	 * </p>
	 * <p>
	 *  ProAct.ObjectProperty is lazy - its object is made reactive on the first read of the property. Its state is set to {@link ProAct.States.ready} on the first read too.
	 * </p>
	 * <p>
	 *  ProAct.ObjectProperty is part of the properties module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.ObjectProperty
	 * @extends ProAct.Property
	 * @param {Object} proObject
	 *      A plain JavaScript object, holding a field, this property will represent.
	 * @param {String} property
	 *      The name of the field of the object, this property should represent.
	 * @see {@link ProAct.ObjectCore}
	 * @see {@link ProAct.States.init}
	 * @see {@link ProAct.States.ready}
	 */
	ProAct.ObjectProperty = P.OP = function (proObject, property) {
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
	
	          self.update();
	        };
	
	    P.P.defineProp(self.proObject, self.property, get, set);
	
	    self.state = P.States.ready;
	    return self.val;
	  };
	
	  P.P.call(this, proObject, property, getter, function () {});
	};
	
	ProAct.ObjectProperty.prototype = P.U.ex(Object.create(P.P.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @memberof ProAct.ObjectProperty
	   * @instance
	   * @constant
	   * @default ProAct.ObjectProperty
	   */
	  constructor: ProAct.ObjectProperty,
	
	  /**
	   * Retrieves the {@link ProAct.Property.Types} value of <i>this</i> property.
	   * <p>
	   *  For ProAct.ObjectProperty this is {@link ProAct.Property.Types.object}
	   * </p>
	   *
	   * @memberof ProAct.ObjectProperty
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
	   *  For ProAct.ObjectProperty it does nothing - the real initialization is lazy and is performed on the first read of <i>this</i>.
	   * </p>
	   *
	   * @memberof ProAct.ObjectProperty
	   * @instance
	   * @method afterInit
	   */
	  afterInit: function () {}
	});
	
	/**
	 * <p>
	 *  Constructs a ProAct.ArrayProperty. The properties are simple {@link ProAct.Observable}s with state. The array property
	 *  has a state of a JavaScript array value.
	 * </p>
	 * <p>
	 *  The value of ProAct.ArrayProperty is array, turned to reactive ProAct.js array - {@link ProAct.Array}.
	 * </p>
	 * <p>
	 *  On changing the array value to another array the listeners for indices/length are moved from the old value to the new value.
	 * </p>
	 * <p>
	 *  If set to null or undefined, the property is re-defined, using {@link ProAct.Property.reProb}
	 * </p>
	 * <p>
	 *  ProAct.ArrayProperty is lazy - its object is made reactive on the first read of the property. Its state is set to {@link ProAct.States.ready} on the first read too.
	 * </p>
	 * <p>
	 *  ProAct.ArrayProperty is part of the properties module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.ArrayProperty
	 * @extends ProAct.Property
	 * @param {Object} proObject
	 *      A plain JavaScript object, holding a field, this property will represent.
	 * @param {String} property
	 *      The name of the field of the object, this property should represent.
	 * @see {@link ProAct.ObjectCore}
	 * @see {@link ProAct.States.init}
	 * @see {@link ProAct.States.ready}
	 */
	ProAct.ArrayProperty = P.AP = function (proObject, property) {
	  var self = this, getter;
	
	  getter = function () {
	    self.addCaller();
	    if (!P.U.isProArray(self.val)) {
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
	
	          if (!P.U.isProArray(self.val)) {
	            self.val = new P.A(self.val);
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
	
	          self.update();
	        };
	
	    P.P.defineProp(self.proObject, self.property, get, set);
	
	    self.state = P.States.ready;
	    return self.val;
	  };
	
	  P.P.call(this, proObject, property, getter, function () {});
	};
	
	ProAct.ArrayProperty.prototype = P.U.ex(Object.create(P.P.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @memberof ProAct.ArrayProperty
	   * @instance
	   * @constant
	   * @default ProAct.ArrayProperty
	   */
	  constructor: ProAct.ArrayProperty,
	
	  /**
	   * Retrieves the {@link ProAct.Property.Types} value of <i>this</i> property.
	   * <p>
	   *  For ProAct.ArrayProperty this is {@link ProAct.Property.Types.array}
	   * </p>
	   *
	   * @memberof ProAct.ArrayProperty
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
	   *  For ProAct.ArrayProperty it does nothing - the real initialization is lazy and is performed on the first read of <i>this</i>.
	   * </p>
	   *
	   * @memberof ProAct.ArrayProperty
	   * @instance
	   * @method afterInit
	   */
	  afterInit: function () {}
	});
	
	/**
	 * <p>
	 *  Constructs a ProAct.Core. The core is an ProAct.Observable which can be used to manage other {@link ProAct.Observable} objects or shells arround ProAct.Observable objects.
	 * </p>
	 * <p>
	 *  For example a shell can be a plain old JavaScript object; The core will be in charge of creating {@link ProAct.Property} for every field of the shell.
	 * </p>
	 * <p>
	 *  The idea of the core is to inject observer-observable capabilities in normal objects.
	 * </p>
	 * <p>
	 *  ProAct.Core is an abstract class, that has a {@link ProAct.States} state. Its initializing logic should be implemented in an extender.
	 * </p>
	 * <p>
	 *  ProAct.Core is used as a parent for the {@link ProAct.Observable}s it manages, so it can be passed as a listener object - defines a <i>call method</i>.
	 * </p>
	 * <p>
	 *  ProAct.Core is part of the core module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.Core
	 * @extends ProAct.Observable
	 * @param {Object} shell
	 *      The shell arrounf this core. This ProAct.Core manages observer-observable behavior for this <i>shell</i> object.
	 * @param {Object} meta
	 *      Optional meta data to be used to define the observer-observable behavior of the <i>shell</i>.
	 * @see {@link ProAct.States}
	 */
	ProAct.Core = P.C = function (shell, meta) {
	  this.shell = shell;
	  this.state = P.States.init;
	  this.meta = meta || {};
	
	  P.Observable.call(this); // Super!
	};
	
	ProAct.Core.prototype = P.U.ex(Object.create(P.Observable.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @memberof ProAct.Core
	   * @instance
	   * @constant
	   * @default ProAct.Core
	   */
	  constructor: ProAct.Core,
	
	  /**
	   * A function to be set to the <i>shell</i> object's <b>p</b> field (if it is configured in @{link ProAct.Configuration}).
	   * <p>
	   *  This function is the link to the this ProAct.Core of the <i>shell</i>. It can be overridden to return different aspects of
	   *  the core depending on parameters passed.
	   * </p>
	   *
	   * @memberof ProAct.Core
	   * @instance
	   * @method value
	   * @default {this}
	   * @return {Object}
	   *      Some aspects of <i>this</i> ProAct.Core.
	   */
	  value: function () {
	    return this;
	  },
	
	  /**
	   * Initializes <i>this</i> ProAct.Core. This method should be called when the core should become active.
	   * <p>
	   *  The main idea of the method is to change the {@link ProAct.States} state of <i>this</i> to {@link ProAct.States.ready}, by
	   *  settuping everything needed by the shell to has observer-observable logic.
	   * </p>
	   * <p>
	   *  The abstract {@link ProAct.Core#setup} method is called for the actual setup. If it throws an error, <i>this</i> state
	   *  is set to {@link ProAct.States.error} and the core stays inactive.
	   * </p>
	   *
	   * @memberof ProAct.Core
	   * @instance
	   * @method prob
	   * @return {ProAct.Core}
	   *      <i>this</i>
	   * @see {@link ProAct.Core#setup}
	   * @see {@link ProAct.States}
	   */
	  prob: function () {
	    var self = this,
	        conf = P.Configuration,
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
	   * Abstract method called by {@link ProAct.Core#prob} for the actual initialization of <i>this</i> core.
	   *
	   * @memberof ProAct.Core
	   * @instance
	   * @abstract
	   * @method setup
	   * @see {@link ProAct.Core#prob}
	   */
	  setup: function () {
	    throw Error('Abstract, implement!');
	  },
	
	  /**
	   * ProAct.Core can be used as a parent listener for other {@link ProAct.Observable}s, so it defines the <i>call</i> method.
	   * <p>
	   *  By default this method calls {@link ProAct.Observable#update} of <i>this</i> with the passed <i>event</i>.
	   * </p>
	   *
	   * @memberof ProAct.Core
	   * @instance
	   * @method call
	   * @param {Object} event
	   *      The value/event that this listener is notified for.
	   * @see {@link ProAct.Observable#update}
	   */
	  call: function (event) {
	    this.update(event);
	  }
	});
	
	
	/**
	 * <p>
	 *  Constructs a ProAct.ObjectCore. ProAct.ObjectCore is a {@link ProAct.Core} that manages all the {@link ProAct.Property} instances for a reactive ProAct.js object.
	 * </p>
	 * <p>
	 *  It is responsible for all the {@link ProAct.Property} instances as well initializing them and deciding which type of property corresponds to which field.
	 * </p>
	 * <p>
	 *  ProAct.ObjectCore is part of the properties module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.ObjectCore
	 * @extends ProAct.Core
	 * @param {Object} object
	 *      The shell objec arround this core. This should be plain JavaScript object.
	 * @param {Object} meta
	 *      Optional meta data to be used to define the observer-observable behavior of the <i>object</i>. For example transformations for its properties.
	 * @see {@link ProAct.Property}
	 */
	ProAct.ObjectCore = P.OC = function (object, meta) {
	  this.properties = {};
	
	  P.C.call(this, object, meta); // Super!
	};
	
	ProAct.ObjectCore.prototype = P.U.ex(Object.create(P.C.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @memberof ProAct.ObjectCore
	   * @instance
	   * @constant
	   * @default ProAct.ObjectCore
	   */
	  constructor: ProAct.ObjectCore,
	
	  /**
	   * A function to be set to the <i>shell</i> object's <b>p</b> field (if it is configured in @{link ProAct.Configuration}).
	   * <p>
	   *  It uses its <i>p</i> argument if it is string to return the right {@link ProAct.Property} for passed field name.
	   * </p>
	   * <p>
	   *  If the <i>p</i> argument is <b>*</b> or empty <i>this</i> ProAct.ObjectCore instance is returned.
	   * </p>
	   *
	   * @memberof ProAct.ObjectCore
	   * @instance
	   * @method value
	   * @param {String} p
	   *      The name of the managed {@link ProAct.Property} to retrieve. It can be set to <b>*</b> or skipped for <i>this</i> itself to be retrieved.
	   * @return {Object}
	   *      Managed {@link ProAct.Property} instance with field name equal to the passed <i>p</i> parameter or <i>this</i>.
	   * @see {@link ProAct.Property}
	   */
	  value: function (p) {
	    if (!p || p === '*') {
	      return this;
	    }
	
	    return this.properties[p];
	  },
	
	  /**
	   * Initializes all the {@link ProAct.Property} instances for the <i>shell</i>of <i>this</i> ProAct.ObjectCore.
	   * <p>
	   *  Using the types of the fields of the <i>shell</i> object the right {@link ProAct.Property} instances are created and stored
	   *  in <i>this</i> using {@link ProAct.ObjectCore#makeProp}.
	   * </p>
	   *
	   * @memberof ProAct.ObjectCore
	   * @instance
	   * @method setup
	   * @see {@link ProAct.ObjectCore#makeProp}
	   */
	  setup: function () {
	    var object = this.shell,
	        property;
	
	    for (property in object) {
	      this.makeProp(property, null, this.meta[property]);
	    }
	  },
	
	  /**
	   * Creates a {@link ProAct.Property} instance for <i>this</i>'s shell.
	   *
	   * @memberof ProAct.ObjectCore
	   * @instance
	   * @method makeProp
	   * @param {String} property
	   *      The name of the property, the name of the field in the <i>shell</i>.
	   * @param {Array} listeners
	   *      Initial listeners for 'change' of the property, can be skipped.
	   * @param {String|Array} meta
	   *      Meta information for the property to create, for example if the meta contains 'noprop', no property is created,
	   *      and the initial value of the field is preserved. The meta is in format of the {@link ProAct.DSL}.
	   * @return {ProAct.Property}
	   *      The newly crated and stored in <i>this</i> property, or null if no property was created.
	   * @throws {Error}
	   *      If there is no field defined in the <i>shell</i> named as the passed <i>property</i>.
	   * @see {@link ProAct.ObjectCore#setup}
	   * @see {@link ProAct.DSL}
	   */
	  makeProp: function (property, listeners, meta) {
	    var object = this.shell,
	        conf = P.Configuration,
	        keyprops = conf.keyprops,
	        keypropList = conf.keypropList,
	        isF = P.U.isFunction,
	        isA = P.U.isArrayObject,
	        isO = P.U.isObject, result;
	
	    if (meta && (meta === 'noprop' || (meta.indexOf && meta.indexOf('noprop') >= 0))) {
	      return null;
	    }
	
	    if (keyprops && keypropList.indexOf(property) !== -1) {
	      throw Error('The property name ' + property + ' is a key word for pro objects! Objects passed to Pro.prob can not contain properties named as keyword properties.');
	      return null;
	    }
	
	    if (object.hasOwnProperty(property) && (object[property] === null || object[property] === undefined)) {
	      result = new P.NP(object, property);
	    } else if (object.hasOwnProperty(property) && !isF(object[property]) && !isA(object[property]) && !isO(object[property])) {
	      result = new P.P(object, property);
	    } else if (object.hasOwnProperty(property) && isF(object[property])) {
	      result = new P.FP(object, property);
	    } else if (object.hasOwnProperty(property) && isA(object[property])) {
	      result = new P.AP(object, property);
	    } else if (object.hasOwnProperty(property) && isO(object[property])) {
	      result = new P.OP(object, property);
	    }
	
	    if (listeners) {
	      this.properties[property].listeners.change = this.properties[property].listeners.change.concat(listeners);
	    }
	
	    if (meta && P.registry) {
	      if (!P.U.isArray(meta)) {
	        meta = [meta];
	      }
	
	      P.registry.setup.apply(P.registry, [result].concat(meta));
	    }
	
	    return result;
	  },
	
	  /**
	   * Sets the value of a managed property. The interesting thing here is that
	   * if the property does not exist this method creates it and stores a new field in the <i>shell</i> object
	   * with the passed <i>value</i>.
	   * <p>
	   *  The new field is reactive.
	   * </p>
	   *
	   * @memberof ProAct.ObjectCore
	   * @instance
	   * @method set
	   * @param {String} property
	   *      The name of the property to update/create.
	   * @param {Object} value
	   *      The value of the property to be set.
	   * @see {@link ProAct.ObjectCore#makeProp}
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
	
	/**
	 * <p>
	 *  Constructs a ProAct.ArrayCore. ProAct.ArrayCore is a {@link ProAct.Core} that manages all the updates/listeners for an ProAct.Array.
	 * </p>
	 * <p>
	 *  It is responsible for updating length or index listeners and adding the right ones on read.
	 * </p>
	 * <p>
	 *  ProAct.ArrayCore is part of the arrays module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.ArrayCore
	 * @extends ProAct.Core
	 * @param {Object} array
	 *      The shell {@link ProAct.Array} arround this core.
	 * @param {Object} meta
	 *      Optional meta data to be used to define the observer-observable behavior of the <i>array</i>.
	 * @see {@link ProAct.Array}
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
	   * @memberof ProAct.ArrayCore
	   * @instance
	   * @constant
	   * @default ProAct.ArrayCore
	   */
	  constructor: ProAct.ArrayCore,
	
	  /**
	   * Generates the initial listeners object.
	   * It is used for resetting all the listeners too.
	   * <p>
	   *  For ProAct.ArrayCore the default listeners object is
	   *  <pre>
	   *    {
	   *      index: [],
	   *      length: []
	   *    }
	   *  </pre>
	   * </p>
	   *
	   * @memberof ProAct.ArrayCore
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
	   *  For ProAct.ArrayCore these are both 'length' and 'index' actions.
	   * </p>
	   *
	   * @memberof ProAct.ArrayCore
	   * @instance
	   * @method defaultActions
	   * @default ['length', 'index']
	   * @return {Array}
	   *      The actions to be used if no actions are provided to action related methods,
	   *      like {@link ProAct.Observable#on}, {@link ProAct.Observable#off}, {@link ProAct.Observable#update}, {@link ProAct.Observable#willUpdate}.
	   */
	  defaultActions: function () {
	    return ['length', 'index'];
	  },
	
	  /**
	   * Creates the <i>event</i> to be send to the listeners on update.
	   * <p>
	   *  By default this method returns {@link ProAct.Event.Types.array} event.
	   * </p>
	   *
	   * @memberof ProAct.ArrayCore
	   * @instance
	   * @method makeEvent
	   * @default {ProAct.Event} with type {@link ProAct.Event.Types.array}
	   * @param {ProAct.Event} source
	   *      The source event of the event. It can be null
	   * @param {Array} eventData
	   *      An array of four elements describing the changes:
	   *      <ol>
	   *        <li>{@link ProAct.Array.Operations} member defining the changing operation - for example {@link ProAct.Array.Operations.add}</li>
	   *        <li>The index on which the chage occures.</li>
	   *        <li>The old values beginning from the index.</li>
	   *        <li>The new values beginning from the index.</li>
	   *      </ol>
	   * @return {ProAct.Event}
	   *      The event.
	   */
	  makeEvent: function (source, eventData) {
	    var op = eventData[0],
	        ind = eventData[1],
	        oldVal = eventData[2],
	        newVal = eventData[3];
	
	    return new P.E(source, this.shell, P.E.Types.array, op, ind, oldVal, newVal);
	  },
	
	  /**
	   * Uses {@link ProAct.currentCaller} to automatically add a new listener to this property if the caller is set.
	   * <p>
	   *  This method is used by the index getters or the length getter to make every reader of the length/index a listener to it.
	   * </p>
	   *
	   * @memberof ProAct.ArrayCore
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
	   * Special update method for updating listeners after a {@link ProAct.Array#splice} call.
	   * <p>
	   *  Depending on the changes the index listeners, the length listeners or both can be notified.
	   * </p>
	   *
	   * @memberof ProAct.ArrayCore
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
	   * @see {@link ProAct.Observable#update}
	   * @see {@link ProAct.Array#splice}
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
	
	    return this.update(null, actions, [op, index, spliced, newItems]);
	  },
	
	  /**
	   * Special update method for updating listeners by comparrison to another array.
	   * <p>
	   *  For every difference between <i>this shell</i>'s array and the passed one, there will be listeners notification.
	   * </p>
	   *
	   * @memberof ProAct.ArrayCore
	   * @instance
	   * @method updateByDiff
	   * @param {Array} array
	   *      The array to compare to.
	   * @return {ProAct.ArrayCore}
	   *      <i>this</i>
	   * @see {@link ProAct.Observable#update}
	   * @see {@link ProAct.Utils.diff}
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
	   *  For the length on every read, the {@link ProAct.currentCaller} is added as a 'length' listener.
	   * </p>
	   * <p>
	   *  For every index on every read, the {@link ProAct.currentCaller} is added as an 'index' listener.
	   *  Listener accessors are defined using {@link ProAct.ArrayCore#defineIndexProp}.
	   * </p>
	   * <p>
	   *  {@link ProAct.ArrayCore#addCaller} is used to retrieve the current caller and add it as the right listener.
	   * </p>
	   * <p>
	   *  Setting values for an index or the length updates the right listeners.
	   * </p>
	   *
	   * @memberof ProAct.ArrayCore
	   * @instance
	   * @method setup
	   * @see {@link ProAct.ArrayCore#addCaller}
	   * @see {@link ProAct.ArrayCore#defineIndexProp}
	   * @see {@link ProAct.currentCaller}
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
	
	      self.update(null, 'length', [pArrayOps.setLength, -1, oldLength, newLength]);
	
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
	   *  For an index on every read, the {@link ProAct.currentCaller} is added as an 'index' listener.
	   * </p>
	   * <p>
	   *  {@link ProAct.ArrayCore#addCaller} is used to retrieve the current caller and add it as the right listener.
	   * </p>
	   * <p>
	   *  Setting values for an index updates the 'index' listeners.
	   * </p>
	   * <p>
	   *  If on the index is reciding an array or an object, it is turned to reactive object/array.
	   * </p>
	   *
	   * @memberof ProAct.ArrayCore
	   * @instance
	   * @method defineIndexProp
	   * @param {Number} i
	   *      The index to define accessor for.
	   * @see {@link ProAct.ArrayCore#addCaller}
	   * @see {@link ProAct.currentCaller}
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
	
	        self.update(null, 'index', [pArrayOps.set, i, oldVal, newVal]);
	      }
	    });
	  }
	});
	
	/**
	 * Creates a wrapper around a plain JavaScript array that is capable of tracking changes on the array and notifying listeners.
	 * <p>
	 *  It has a {@link ProAct.ArrayCore} which it uses to observe the array for changes or to update the array on changes.
	 * </p>
	 * <p>
	 *  ProAct.Array is array-like object, it has all the methods defined in the JavaScript Array class, length property and indices.
	 * </p>
	 * <p>
	 *  ProAct.Array is part of the arrays module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.Array
	 * @extends Array
	 * @param [...]
	 *      I can take an array as a parameter and it becomes reactive wrapper around it.
	 *      It can take a list of arguments which become the wrapped array.
	 *      If nothing is passed it becomes wrapper arround an empty array.
	 * @see {@link ProAct.ArrayCore}
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
	   * @namespace ProAct.Array.Operations
	   */
	  Operations: {
	
	    /**
	     * Represents setting a value to an index of an array.
	     * <pre>
	     *  array[3] = 12;
	     * </pre>
	     *
	     * @memberof ProAct.Array.Operations
	     * @static
	     * @constant
	     */
	    set: 0,
	
	    /**
	     * Represents adding values to array.
	     * <pre>
	     *  array.push(12);
	     *  array.unshift(12);
	     * </pre>
	     *
	     * @memberof ProAct.Array.Operations
	     * @static
	     * @constant
	     */
	    add: 1,
	
	    /**
	     * Represents removing values from array.
	     * <pre>
	     *  array.pop();
	     *  array.shift();
	     * </pre>
	     *
	     * @memberof ProAct.Array.Operations
	     * @static
	     * @constant
	     */
	    remove: 2,
	
	    /**
	     * Represents setting the length of an array.
	     * <pre>
	     *  array.length = 5;
	     * </pre>
	     *
	     * @memberof ProAct.Array.Operations
	     * @static
	     * @constant
	     */
	    setLength: 3,
	
	    /**
	     * Represents reversing the element order in an array.
	     * <pre>
	     *  array.reverse();
	     * </pre>
	     *
	     * @memberof ProAct.Array.Operations
	     * @static
	     * @constant
	     */
	    reverse: 4,
	
	    /**
	     * Represents sorting the elements in an array.
	     * <pre>
	     *  array.sort();
	     * </pre>
	     *
	     * @memberof ProAct.Array.Operations
	     * @static
	     * @constant
	     */
	    sort: 5,
	
	    /**
	     * Represents the powerful <i>splice</i> operation.
	     * <pre>
	     *  array.splice(2, 3, 4, 15, 6);
	     * </pre>
	     *
	     * @memberof ProAct.Array.Operations
	     * @static
	     * @constant
	     */
	    splice: 6,
	  },
	
	  /**
	   * A helper method for filtering an array and notifying the right listeners of the filtered result.
	   * <p>
	   *  This is used if there is an ProAct.Array created by filtering another ProAct.Array. If the original is
	   *  changed, the filtered array should be changed in some cases. So refilter does this - changes the dependent filtered array, using
	   *  {@link ProAct.ArrayCore#updateByDiff}.
	   * </p>
	   *
	   * @memberof ProAct.Array
	   * @static
	   * @param {ProAct.Array} original
	   *      The original array to filter by.
	   * @param {ProAct.Array} filtered
	   *      The array to be filtered - changed by a filter function, applied on the original.
	   * @param {Array} filterArgs
	   *      Arguments of the filtering - filtering function and data.
	   * @see {@link ProAct.ArrayCore#updateByDiff}
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
	   * @memberof ProAct.Array
	   * @instance
	   * @constant
	   * @default ProAct.Array
	   */
	  constructor: ProAct.Array,
	
	  /**
	   * The <b>concat()</b> method returns a new array comprised of this array joined with other array(s) and/or value(s).
	   * <p>
	   *  The result ProAct.Array is dependent on <i>this</i>, so if <i>this</i> changes, the concatenation resut will be updated.
	   * </p>
	   * <p>
	   *  If the argument passed is another ProAct.Array the result array is dependent on it too.
	   * </p>
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method concat
	   * @param [...]
	   *      Arrays and/or values to concatenate to the resulting array.
	   * @return {ProAct.Array}
	   *      A new ProAct.Array consisting of the elements in the <i>this</i> object on which it is called, followed in order by,
	   *      for each argument, the elements of that argument (if the argument is an array) or the argument itself (if the argument is not an array).
	   * @see {@link ProAct.Array.Listeners.leftConcat}
	   * @see {@link ProAct.Array.Listeners.rightConcat}
	   */
	  concat: function () {
	    var res, rightProArray;
	
	    if (arguments.length === 1 && P.U.isProArray(arguments[0])) {
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
	   * The <b>every()</b> method tests whether all elements in the ProAct.Array pass the test implemented by the provided function.
	   * <p>
	   *  This method adds the {@link ProAct.currentCaller} as a listener to both 'index' type and 'length' type of changes.
	   * </p>
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method every
	   * @param {Function} callback
	   *      Function to test for each element.
	   * @param {Object} thisArg
	   *      Value to use as this when executing <i>callback</i>.
	   * @return {Boolean}
	   *      True if all the elements in the <i>this</i> ProAct.Array pass the test implemented by the <i>callback</i>, false otherwise.
	   * @see {@link ProAct.ArrayCore#addCaller}
	   */
	  every: function () {
	    this.core.addCaller();
	
	    return every.apply(this._array, arguments);
	  },
	
	  /**
	   * Does the same as the {@link ProAct.Array#every} method, but the result is a {@link ProAct.Val} depending on changes on the array.
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method pevery
	   * @param {Function} fun
	   *      Function to test for each element.
	   * @param {Object} thisArg
	   *      Value to use as this when executing <i>callback</i>.
	   * @return {ProAct.Val}
	   *      {@link ProAct.Val} with value of true if all the elements in <i>this</i> ProAct.Array pass the test implemented by the <i>fun</i>, false otherwise.
	   * @see {@link ProAct.ArrayCore#addCaller}
	   * @see {@link ProAct.Val}
	   * @see {@link ProAct.Array.Listeners.every}
	   */
	  pevery: function (fun, thisArg) {
	    var val = new P.Val(every.apply(this._array, arguments));
	
	    this.core.on(pArrayLs.every(val, this, arguments));
	
	    return val;
	  },
	
	  /**
	   * The <b>some()</b> method tests whether some element in the array passes the test implemented by the provided function.
	   * <p>
	   *  This method adds the {@link ProAct.currentCaller} as a listener to both 'index' type and 'length' type of changes.
	   * </p>
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method some
	   * @param {Function} callback
	   *      Function to test for each element.
	   * @param {Object} thisArg
	   *      Value to use as this when executing <i>callback</i>.
	   * @return {Boolean}
	   *      True if one or more of the elements in <i>this</i> ProAct.Array pass the test implemented by the <i>callback</i>, false otherwise.
	   * @see {@link ProAct.ArrayCore#addCaller}
	   */
	  some: function () {
	    this.core.addCaller();
	
	    return some.apply(this._array, arguments);
	  },
	
	  /**
	   * Does the same as the {@link ProAct.Array#some} method, but the result is a {@link ProAct.Val} depending on changes on the array.
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method psome
	   * @param {Function} fun
	   *      Function to test for each element.
	   * @param {Object} thisArg
	   *      Value to use as this when executing <i>callback</i>.
	   * @return {ProAct.Val}
	   *      {@link ProAct.Val} with value of true if one or more of the elements in <i>this</i> ProAct.Array pass the test implemented by the <i>fun</i>, false otherwise.
	   * @see {@link ProAct.ArrayCore#addCaller}
	   * @see {@link ProAct.Val}
	   * @see {@link ProAct.Array.Listeners.some}
	   */
	  psome: function (fun, thisArg) {
	    var val = new P.Val(some.apply(this._array, arguments));
	
	    this.core.on(pArrayLs.some(val, this, arguments));
	
	    return val;
	  },
	
	  /**
	   * The <b>forEach()</b> method executes a provided function once per array element.
	   * <p>
	   *  This method adds the {@link ProAct.currentCaller} as a listener to both 'index' type and 'length' type of changes.
	   * </p>
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method forEach
	   * @param {Function} fun
	   *      Function to execute for each element.
	   * @param {Object} thisArg
	   *      Value to use as <i>this</i> when executing <i>callback</i>.
	   * @see {@link ProAct.ArrayCore#addCaller}
	   */
	  forEach: function (fun /*, thisArg */) {
	    this.core.addCaller();
	
	    return forEach.apply(this._array, arguments);
	  },
	
	  /**
	   * The <b>filter()</b> method creates a new ProAct.Array with all elements that pass the test implemented by the provided function.
	   * <p>
	   *  The result ProAct.Array is dependent on <i>this</i>, so if <i>this</i> changes, the filtered resut will be updated.
	   * </p>
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method filter
	   * @param {Function} fun
	   *      Function to test for each element.
	   * @param {Object} thisArg
	   *      Value to use as this when executing <i>fun</i>.
	   * @return {ProAct.Array}
	   *      A new ProAct.Array consisting of the elements in <i>this</i> ProAct.Array that pass the test implemented by <i>fun</i>.
	   * @see {@link ProAct.Array.Listeners.filter}
	   * @see {@link ProAct.Array.reFilter}
	   */
	  filter: function (fun, thisArg) {
	    var filtered = new P.A(filter.apply(this._array, arguments));
	    this.core.on(pArrayLs.filter(filtered, this, arguments));
	
	    return filtered;
	  },
	
	  /**
	   * The <b>map()</b> method creates a new ProAct with the results of calling a provided function on every element in <i>this</i> ProAct.Array.
	   * <p>
	   *  The result ProAct.Array is dependent on <i>this</i>, so if <i>this</i> changes, the mapped resut will be updated.
	   * </p>
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method map
	   * @param {Function} fun
	   *      Function that produces an element of the new ProAct.Array, taking three arguments:
	   *      <ol>
	   *        <li><b>currentValue</b> : The current element being processed in the array.</li>
	   *        <li><b>index</b> : The index of the current element being processed in the array.</li>
	   *        <li><b>array</b> : The array map was called upon.</li>
	   *      </ol>
	   * @param {Object} thisArg
	   *      Value to use as this when executing <i>fun</i>.
	   * @return {ProAct.Array}
	   *      A new ProAct.Array consisting of the elements in <i>this</i> ProAct.Array transformed by <i>fun</i>.
	   * @see {@link ProAct.Array.Listeners.map}
	   */
	  map: function (fun, thisArg) {
	    var mapped = new P.A(map.apply(this._array, arguments));
	    this.core.on(pArrayLs.map(mapped, this, arguments));
	
	    return mapped;
	  },
	
	  /**
	   * The <b>reduce()</b> method applies a function against an accumulator and each value of the ProAct.Array (from left-to-right) has to reduce it to a single value.
	   * <p>
	   *  This method adds the {@link ProAct.currentCaller} as a listener to both 'index' type and 'length' type of changes.
	   * </p>
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method reduce
	   * @param {Function} fun
	   *      Function to execute on each value in the array, taking four arguments:
	   *      <ol>
	   *        <li><b>previousValue</b> : The value previously returned in the last invocation of the <i>fun</i>, or <i>initialValue</i>, if supplied.</li>
	   *        <li><b>currentValue</b> : The current element being processed in the ProAct.Array.</li>
	   *        <li><b>index</b> : The index of the current element being processed in the ProAct.Array.</li>
	   *        <li><b>array</b> : The array reduce was called upon.</li>
	   *      </ol>
	   * @param {Object} initialValue
	   *      Object to use as the first argument to the first call of the <i>fun</i> .
	   * @return {Object}
	   *      The value of the last <i>fun</i> invocation.
	   * @see {@link ProAct.ArrayCore#addCaller}
	   */
	  reduce: function (fun /*, initialValue */) {
	    this.core.addCaller();
	
	    return reduce.apply(this._array, arguments);
	  },
	
	  /**
	   * Does the same as the {@link ProAct.Array#reduce} method, but the result is a {@link ProAct.Val} depending on changes on <i>this</i> ProAct.Array.
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method preduce
	   * @param {Function} fun
	   *      Function to execute on each value in the array, taking four arguments:
	   *      <ol>
	   *        <li><b>previousValue</b> : The value previously returned in the last invocation of the <i>fun</i>, or <i>initialValue</i>, if supplied.</li>
	   *        <li><b>currentValue</b> : The current element being processed in the ProAct.Array.</li>
	   *        <li><b>index</b> : The index of the current element being processed in the ProAct.Array.</li>
	   *        <li><b>array</b> : The array reduce was called upon.</li>
	   *      </ol>
	   * @param {Object} initialValue
	   *      Object to use as the first argument to the first call of the <i>fun</i> .
	   * @return {ProAct.Val}
	   *      {@link ProAct.Val} with value of the last <i>fun</i> invocation.
	   * @see {@link ProAct.ArrayCore#addCaller}
	   * @see {@link ProAct.Val}
	   * @see {@link ProAct.Array.Listeners.reduce}
	   */
	  preduce: function (fun /*, initialValue */) {
	    var val = new P.Val(reduce.apply(this._array, arguments));
	    this.core.on(pArrayLs.reduce(val, this, arguments));
	
	    return val;
	  },
	
	  /**
	   * The <b>reduceRight()</b> method applies a function against an accumulator and each value of the ProAct.Array (from right-to-left) as to reduce it to a single value.
	   * <p>
	   *  This method adds the {@link ProAct.currentCaller} as a listener to both 'index' type and 'length' type of changes.
	   * </p>
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method reduceRight
	   * @param {Function} fun
	   *      Function to execute on each value in the array, taking four arguments:
	   *      <ol>
	   *        <li><b>previousValue</b> : The value previously returned in the last invocation of the <i>fun</i>, or <i>initialValue</i>, if supplied.</li>
	   *        <li><b>currentValue</b> : The current element being processed in the ProAct.Array.</li>
	   *        <li><b>index</b> : The index of the current element being processed in the ProAct.Array.</li>
	   *        <li><b>array</b> : The array reduce was called upon.</li>
	   *      </ol>
	   * @param {Object} initialValue
	   *      Object to use as the first argument to the first call of the <i>fun</i> .
	   * @return {Object}
	   *      The value of the last <i>fun</i> invocation.
	   * @see {@link ProAct.ArrayCore#addCaller}
	   */
	  reduceRight: function (fun /*, initialValue */) {
	    this.core.addCaller();
	
	    return reduceRight.apply(this._array, arguments);
	  },
	
	  /**
	   * Does the same as the {@link ProAct.Array#reduceRight} method, but the result is a {@link ProAct.Val} depending on changes on <i>this</i> ProAct.Array.
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method preduceRight
	   * @param {Function} fun
	   *      Function to execute on each value in the array, taking four arguments:
	   *      <ol>
	   *        <li><b>previousValue</b> : The value previously returned in the last invocation of the <i>fun</i>, or <i>initialValue</i>, if supplied.</li>
	   *        <li><b>currentValue</b> : The current element being processed in the ProAct.Array.</li>
	   *        <li><b>index</b> : The index of the current element being processed in the ProAct.Array.</li>
	   *        <li><b>array</b> : The array reduce was called upon.</li>
	   *      </ol>
	   * @param {Object} initialValue
	   *      Object to use as the first argument to the first call of the <i>fun</i> .
	   * @return {ProAct.Val}
	   *      {@link ProAct.Val} with value of the last <i>fun</i> invocation.
	   * @see {@link ProAct.ArrayCore#addCaller}
	   * @see {@link ProAct.Val}
	   * @see {@link ProAct.Array.Listeners.reduceRight}
	   */
	  preduceRight: function (fun /*, initialValue */) {
	    var val = new P.Val(reduceRight.apply(this._array, arguments));
	    this.core.on(pArrayLs.reduceRight(val, this, arguments));
	
	    return val;
	  },
	
	  /**
	   * The <b>indexOf()</b> method returns the first index at which a given element can be found in the ProAct.Array, or -1 if it is not present.
	   * <p>
	   *  This method adds the {@link ProAct.currentCaller} as a listener to both 'index' type and 'length' type of changes.
	   * </p>
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method indexOf
	   * @param {Object} searchElement
	   *      Element to locate in the ProAct.Array.
	   * @param {Number} fromIndex
	   *      Default: 0 (Entire array is searched)
	   *      <p>
	   *        The index to start the search at.
	   *        If the index is greater than or equal to the ProAct.Array's length, -1 is returned,
	   *        which means the array will not be searched.
	   *        If the provided index value is a negative number,
	   *        it is taken as the offset from the end of the ProAct.Array.
	   *      </p>
	   *      <p>
	   *        Note: if the provided index is negative, the ProAct.Array is still searched from front to back.
	   *        If the calculated index is less than 0, then the whole ProAct.Array will be searched.
	   *      </p>
	   * @return {Number}
	   *      The index of the searched element or '-1' if it is not found in <i>this</i> ProAct.Array.
	   * @see {@link ProAct.ArrayCore#addCaller}
	   */
	  indexOf: function () {
	    this.core.addCaller();
	
	    return indexOf.apply(this._array, arguments);
	  },
	
	  /**
	   * Does the same as the {@link ProAct.Array#indexOf} method, but the result is a {@link ProAct.Val} depending on changes on <i>this</i> ProAct.Array.
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method pindexOf
	   * @param {Object} searchElement
	   *      Element to locate in the ProAct.Array.
	   * @param {Number} fromIndex
	   *      Default: 0 (Entire array is searched)
	   *      <p>
	   *        The index to start the search at.
	   *        If the index is greater than or equal to the ProAct.Array's length, -1 is returned,
	   *        which means the array will not be searched.
	   *        If the provided index value is a negative number,
	   *        it is taken as the offset from the end of the ProAct.Array.
	   *      </p>
	   *      <p>
	   *        Note: if the provided index is negative, the ProAct.Array is still searched from front to back.
	   *        If the calculated index is less than 0, then the whole ProAct.Array will be searched.
	   *      </p>
	   * @return {ProAct.Val}
	   *      A {@link ProAct.Val} instance with value, the index of the searched element or '-1' if it is not found in <i>this</i> ProAct.Array.
	   * @see {@link ProAct.ArrayCore#addCaller}
	   * @see {@link ProAct.Val}
	   * @see {@link ProAct.Array.Listeners.indexOf}
	   */
	  pindexOf: function () {
	    var val = new P.Val(indexOf.apply(this._array, arguments));
	    this.core.on(pArrayLs.indexOf(val, this, arguments));
	
	    return val;
	  },
	
	  /**
	   * The <b>lastIndexOf()</b> method returns the last index at which a given element can be found in the ProAct.Array, or -1 if it is not present.
	   * The ProAct.Array is searched backwards, starting at <i>fromIndex</i>.
	   * <p>
	   *  This method adds the {@link ProAct.currentCaller} as a listener to both 'index' type and 'length' type of changes.
	   * </p>
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method lastIndexOf
	   * @param {Object} searchElement
	   *      Element to locate in the ProAct.Array.
	   * @param {Number} fromIndex
	   *      <p>
	   *        The index at which to start searching backwards.
	   *        Defaults to the ProAct.Array's length, i.e. the whole array will be searched.
	   *        If the index is greater than or equal to the length of the ProAct.Array, the whole ProAct.Array will be searched.
	   *        If negative, it is taken as the offset from the end of the ProAct.Array.
	   *      </p>
	   *      <p>
	   *        Note that even when the index is negative,
	   *        the ProAct.Array is still searched from back to front.
	   *        If the calculated index is less than 0, -1 is returned, i.e. the ProAct.Array will not be searched.
	   *      </p>
	   * @return {Number}
	   *      The index of the searched backwards element or '-1' if it is not found in <i>this</i> ProAct.Array.
	   * @see {@link ProAct.ArrayCore#addCaller}
	   */
	  lastIndexOf: function () {
	    this.core.addCaller();
	
	    return lastIndexOf.apply(this._array, arguments);
	  },
	
	  /**
	   * Does the same as the {@link ProAct.Array#lastIndexOf} method, but the result is a {@link ProAct.Val} depending on changes on <i>this</i> ProAct.Array.
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method plastindexOf
	   * @param {Object} searchElement
	   *      Element to locate in the ProAct.Array.
	   * @param {Number} fromIndex
	   *      <p>
	   *        The index at which to start searching backwards.
	   *        Defaults to the ProAct.Array's length, i.e. the whole array will be searched.
	   *        If the index is greater than or equal to the length of the ProAct.Array, the whole ProAct.Array will be searched.
	   *        If negative, it is taken as the offset from the end of the ProAct.Array.
	   *      </p>
	   *      <p>
	   *        Note that even when the index is negative,
	   *        the ProAct.Array is still searched from back to front.
	   *        If the calculated index is less than 0, -1 is returned, i.e. the ProAct.Array will not be searched.
	   *      </p>
	   * @return {ProAct.Val}
	   *      A {@link ProAct.Val} instance with value, the index of the backwards searched element or '-1' if it is not found in <i>this</i> ProAct.Array.
	   * @see {@link ProAct.ArrayCore#addCaller}
	   * @see {@link ProAct.Val}
	   * @see {@link ProAct.Array.Listeners.lastIndexOf}
	   */
	  plastindexOf: function () {
	    var val = new P.Val(lastIndexOf.apply(this._array, arguments));
	    this.core.on(pArrayLs.lastIndexOf(val, this, arguments));
	
	    return val;
	  },
	
	  /**
	   * The <b>join()</b> method joins all elements of an ProAct.Array into a string.
	   * <p>
	   *  This method adds the {@link ProAct.currentCaller} as a listener to both 'index' type and 'length' type of changes.
	   * </p>
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method join
	   * @param {String} separator
	   *      Specifies a string to separate each element of the ProAct.
	   *      The separator is converted to a string if necessary.
	   *      <p>
	   *       If omitted, the ProAct.Array elements are separated with a comma.
	   *      </p>
	   * @return {String}
	   *      A string representation of all the elements in <i>this</i> ProAct.Array, separated by the provided <i>separator</i>.
	   * @see {@link ProAct.ArrayCore#addCaller}
	   */
	  join: function () {
	    this.core.addCaller();
	
	    return join.apply(this._array, arguments);
	  },
	
	  /**
	   * Does the same as the {@link ProAct.Array#join} method, but the result is a {@link ProAct.Val} depending on changes on <i>this</i> ProAct.Array.
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method pjoin
	   * @param {String} separator
	   *      Specifies a string to separate each element of the ProAct.
	   *      The separator is converted to a string if necessary.
	   *      <p>
	   *       If omitted, the ProAct.Array elements are separated with a comma.
	   *      </p>
	   * @return {ProAct.Val}
	   *      A {@link ProAct.Val} instance with value : string representation of all the elements in <i>this</i> ProAct.Array, separated by the provided <i>separator</i>.
	   * @see {@link ProAct.ArrayCore#addCaller}
	   * @see {@link ProAct.ArrayCore#preduce}
	   * @see {@link ProAct.Val}
	   */
	  pjoin: function (separator) {
	    var reduced = this.preduce(function (i, el) {
	      return i + separator + el;
	    }, ''), res = new P.Val(function () {
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
	   *  This method adds the {@link ProAct.currentCaller} as a listener to both 'index' type and 'length' type of changes.
	   * </p>
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method toLocaleString
	   * @return {String}
	   *      Locale-specific string representing the elements of <i>this</i> ProAct.Array.
	   * @see {@link ProAct.ArrayCore#addCaller}
	   */
	  toLocaleString: function () {
	    this.core.addCaller();
	
	    return toLocaleString.apply(this._array, arguments);
	  },
	
	  /**
	   * The <b>toString()</b> method returns a string representing the specified ProAct.Array and its elements.
	   * The elements are converted to Strings using their toLocaleString methods and these Strings are separated by a locale-specific String (such as a comma ",").
	   * <p>
	   *  This method adds the {@link ProAct.currentCaller} as a listener to both 'index' type and 'length' type of changes.
	   * </p>
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method toString
	   * @return {String}
	   *      A string representing the elements of <i>this</i> ProAct.Array.
	   * @see {@link ProAct.ArrayCore#addCaller}
	   */
	  toString: function () {
	    this.core.addCaller();
	
	    return toString.apply(this._array, arguments);
	  },
	
	  /**
	   * Returns the result of {@link ProAct.Array#toArray}.
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method valueOf
	   * @return {Array}
	   *        This ProAct.Array converted to plain JavaScript array.
	   * @see {@link ProAct.Array#toArray}
	   */
	  valueOf: function () {
	    return this.toArray();
	  },
	
	  /**
	   * The <b>slice()</b> method returns a shallow copy of a portion of <i>this</i> ProAct.Array into a new ProAct.Array object.
	   * <p>
	   *  The result ProAct.Array is dependent on <i>this</i>, so if <i>this</i> changes, the slice resut will be updated.
	   * </p>
	   *
	   * @memberof ProAct.Array
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
	   *      A portion of <i>this</i> ProAct.Array, dependent on it.
	   * @see {@link ProAct.Array.Listeners#slice}
	   */
	  slice: function () {
	    var sliced = new P.A(slice.apply(this._array, arguments));
	    this.core.on(pArrayLs.slice(sliced, this, arguments));
	
	    return sliced;
	  },
	
	  /**
	   * The <b>reverse()</b> method reverses an ProAct.Array in place. The first array element becomes the last and the last becomes the first.
	   * <p>
	   *  This method notifies the 'index' listeners attached to <i>this</i>' {@link ProAct.ArrayCore}.
	   * </p>
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method reverse
	   * @see {@link ProAct.ArrayCore#update}
	   */
	  reverse: function () {
	    if (this._array.length === 0) {
	      return;
	    }
	    var reversed = reverse.apply(this._array, arguments);
	
	    this.core.update(null, 'index', [pArrayOps.reverse, -1, null, null]);
	    return reversed;
	  },
	
	  /**
	   * The <b>sort()</b> method sorts the elements of <i>this</i> ProAct.Array in place and returns the <i>this</i>. The sort is not necessarily stable.
	   * The default sort order is according to string Unicode code points.
	   * <p>
	   *  This method notifies the 'index' listeners attached to <i>this</i>' {@link ProAct.ArrayCore}.
	   * </p>
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method sort
	   * @return {ProAct.Array}
	   *      <i>this</i>
	   * @see {@link ProAct.ArrayCore#update}
	   */
	  sort: function () {
	    if (this._array.length === 0) {
	      return;
	    }
	    var sorted = sort.apply(this._array, arguments),
	        args = arguments;
	
	    this.core.update(null, 'index', [pArrayOps.sort, -1, null, args]);
	    return this;
	  },
	
	  /**
	   * The <b>splice()</b> method changes the content of <i>this</i> ProAct.Array, adding new elements while removing old elements.
	   * <p>
	   *  This method may notify the 'index' listeners or the 'length' listeners, or even the both types of listeners, attached to <i>this</i>' {@link ProAct.ArrayCore}, depending
	   *  on what the splicing does - removing, adding or changing elements (removing and adding).
	   * </p>
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method splice
	   * @param {Number} index
	   *      Index at which to start changing the ProAct.Array.
	   *      If greater than the length of the ProAct.Array, actual starting index will be set to the length of the <i>this</i>.
	   *      If negative, will begin that many elements from the end.
	   * @param {Number} howMany
	   *      An integer indicating the number of old ProAct.Array elements to remove.
	   *      If howMany is 0, no elements are removed. In this case, you should specify at least one new element.
	   *      If howMany is greater than the number of elements left in the ProAct.Array starting at index,
	   *      then all of the elements through the end of the ProAct.Array will be deleted.
	   * @param [...]
	   *      <b>element1, ..., elementN</b>:
	   *      <p>
	   *        The elements to add to the ProAct.Array. If you don't specify any elements, splice simply removes elements from the ProAct.Array.
	   *      </p>
	   * @return {ProAct.Array}
	   *      An ProAct.Array containing the removed elements.
	   *      If only one element is removed, an ProAct.Array of one element is returned.
	   *      If no elements are removed, an empty ProAct.Array is returned.
	   * @see {@link ProAct.ArrayCore#updateSplice}
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
	   * The <b>pop()</b> method removes the last element from an ProAct.Array and returns that element.
	   * <p>
	   *  This method notifies the 'length' listeners, attached to <i>this</i>' {@link ProAct.ArrayCore}.
	   * </p>
	   * <p>
	   *  This method removes the special index accessor of the deleted element's index - the last index.
	   * </p>
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method pop
	   * @return {Object}
	   *      The removed element. If <i>this</i> ProAct.Array is empty the result is undefined.
	   * @see {@link ProAct.ArrayCore#update}
	   */
	  pop: function () {
	    if (this._array.length === 0) {
	      return;
	    }
	    var popped = pop.apply(this._array, arguments),
	        index = this._array.length;
	
	    delete this[index];
	    this.core.update(null, 'length', [pArrayOps.remove, this._array.length, popped, null]);
	
	    return popped;
	  },
	
	  /**
	   * The <b>push()</b> method adds one or more elements to the end of an ProAct.Array and returns the new length of the ProAct.Array.
	   * <p>
	   *  This method notifies the 'length' listeners, attached to <i>this</i>' {@link ProAct.ArrayCore}.
	   * </p>
	   * <p>
	   *  This method defines new index accessors for the elements on the new indexes. So these indexes can be set and read, and
	   *  will attatch listeners to the {@link ProAct.ArrayCore} or update them.
	   * </p>
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method push
	   * @param [...]
	   *      <b>element1, ..., elementN</b> : The elements to add to the end of the array.
	   * @return {Object}
	   *      The new length property of the <i>this</i>.
	   * @see {@link ProAct.ArrayCore#update}
	   * @see {@link ProAct.ArrayCore#defineIndexProp}
	   */
	  push: function () {
	    var vals = arguments, i, ln = arguments.length, index;
	
	    for (i = 0; i < ln; i++) {
	      index = this._array.length;
	      push.call(this._array, arguments[i]);
	      this.core.defineIndexProp(index);
	    }
	
	    this.core.update(null, 'length', [pArrayOps.add, this._array.length - 1, null, slice.call(vals, 0)]);
	
	    return this._array.length;
	  },
	
	  /**
	   * The <b>shift()</b> method removes the first element from an ProAct.Array and returns that element. This method changes the length of the ProAct.Array.
	   * <p>
	   *  This method notifies the 'length' listeners, attached to <i>this</i>' {@link ProAct.ArrayCore}.
	   * </p>
	   * <p>
	   *  This method removes the special index accessor of the deleted element's index - the zero index.
	   * </p>
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method shift
	   * @return {Object}
	   *      The removed element. If <i>this</i> ProAct.Array is empty the result is undefined.
	   * @see {@link ProAct.ArrayCore#update}
	   */
	  shift: function () {
	    if (this._array.length === 0) {
	      return;
	    }
	    var shifted = shift.apply(this._array, arguments),
	        index = this._array.length;
	
	    delete this[index];
	    this.core.update(null, 'length', [pArrayOps.remove, 0, shifted, null]);
	
	    return shifted;
	  },
	
	  /**
	   * The <b>unshift()</b> method adds one or more elements to the beginning of an ProAct.Array and returns the new length of the ProAct.Array.
	   * <p>
	   *  This method notifies the 'length' listeners, attached to <i>this</i>' {@link ProAct.ArrayCore}.
	   * </p>
	   * <p>
	   *  This method defines new index accessors for the elements on the new indexes. So these indexes can be set and read, and
	   *  will attatch listeners to the {@link ProAct.ArrayCore} or update them.
	   * </p>
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method unshift
	   * @param [...]
	   *      <b>element1, ..., elementN</b> : The elements to add to the front of the array.
	   * @return {Object}
	   *      The new length property of the <i>this</i>.
	   * @see {@link ProAct.ArrayCore#update}
	   * @see {@link ProAct.ArrayCore#defineIndexProp}
	   */
	  unshift: function () {
	    var vals = slice.call(arguments, 0), i, ln = arguments.length,
	        array = this._array;
	
	    for (var i = 0; i < ln; i++) {
	      array.splice(i, 0, arguments[i]);
	      this.core.defineIndexProp(array.length - 1);
	    }
	
	    this.core.update(null, 'length', [pArrayOps.add, 0, null, vals]);
	
	    return array.length;
	  },
	
	  /**
	   * Generates an plain array representation of <i>this</i>.
	   * <p>
	   *  The returned array is shallow copy of <i>this</i>' content, so if modified with methods like 'push' or 'pop',
	   *  <i>this</i> content will not be modified
	   * </p>
	   *
	   * @memberof ProAct.Array
	   * @instance
	   * @method toArray
	   * @return {Array}
	   *      An plain JavaScript array representation of <i>this</i>.
	   */
	  toArray: function () {
	    var result = [], i, ar = this._array, ln = ar.length, el,
	        isPA = P.U.isProArray;
	
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
	   * @memberof ProAct.Array
	   * @instance
	   * @method toJSON
	   * @return {String}
	   *      A JSON array representing <i>this</i>.
	   */
	  toJSON: function () {
	    return JSON.stringify(this._array);
	  }
	});
	
	/**
	 * Defines a set of special listeners used to trak {@link ProAct.Array} changes and updating dependent {@link ProAct.Array}s in an optimal way.
	 *
	 * @namespace ProAct.Array.Listeners
	 */
	ProAct.Array.Listeners = P.A.L = pArrayLs = Pro.Array.Listeners || {
	
	  /**
	   * Checks the validity of an event.
	   *
	   * @memberof ProAct.Array.Listeners
	   * @static
	   * @constant
	   * @param {ProAct.Event} event
	   *      The event to check.
	   * @throws {Error}
	   *      If the event is not {@link ProAct.Event.Types.array}
	   */
	  check: function(event) {
	    if (event.type !== P.E.Types.array) {
	      throw Error('Not implemented for non array events');
	    }
	  },
	
	  /**
	   * Generates a listener that can be attached to an {@link ProAct.Array} on which
	   * the method {@link ProAct.Array#concat} is invoked.
	   * <p>
	   *  The result of the {@link ProAct.Array#concat} method is another {@link ProAct.Array}, dependent on the <i>original</i> one.
	   * </p>
	   * <p>
	   *  For example if the original was:
	   *  <pre>
	   *    var a = new ProAct.Array([1, 3, 5]);
	   *  </pre>
	   *  and we invoked {@link ProAct.Array#concat} on it like this:
	   *  <pre>
	   *    var b = a.concat(7, 9); // b is [1, 3, 5, 7, 9]
	   *  </pre>
	   *  The new array - <b>b</b> is dependent on <b>a</b>, so if for example we push something to <b>a</b>, <b>b</b> should be updated:
	   *  <pre>
	   *    a.push(11); // b authomatically should become [1, 3, 5, 11, 7, 9]
	   *  </pre>
	   * </p>
	   * <p>
	   *  The generated listener by this method does this - updates the <i>transformed</i> {@link ProAct.Array}, when the <i>original</i> changes
	   *  and it does it in an optimal way.
	   * </p>
	   *
	   * @memberof ProAct.Array.Listeners
	   * @static
	   * @constant
	   * @param {ProAct.Array} transformed
	   *      The array created as a result of invoking {@link ProAct.Array#concat} on the <i>original</i> {@link ProAct.Array}.
	   * @param {ProAct.Array} original
	   *      The {@link ProAct.Array} on which {@link ProAct.Array#concat} was invoked.
	   * @param {Array} args
	   *      The arguments passed to {@link ProAct.Array#concat}, when it was invoked on the <i>original</i> {@link ProAct.Array}
	   * @return {Function}
	   *      A listener for events from the <i>original</i> {@link ProAct.Array}, updating the <i>transformed</i> {@link ProAct.Array} on
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
	        if (P.U.isProArray(args)) {
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
	   * Generates a listener that can be attached to an {@link ProAct.Array} on which
	   * the method {@link ProAct.Array#concat} is invoked with argument, another {@link ProAct.Array}.
	   * <p>
	   *  The result of the {@link ProAct.Array#concat} method is another {@link ProAct.Array},
	   *  dependent on both the <i>original</i> and the passed as an argument one.
	   * </p>
	   * <p>
	   *  For example if the original was:
	   *  <pre>
	   *    var a = new ProAct.Array([1, 3, 5]);
	   *  </pre>
	   *  and we invoked {@link ProAct.Array#concat} on it like this:
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
	   *  The generated listener by this method does this - updates the <i>transformed</i> {@link ProAct.Array}, when the <i>original</i> changes
	   *  and it does it in an optimal way.
	   * </p>
	   *
	   * @memberof ProAct.Array.Listeners
	   * @static
	   * @constant
	   * @param {ProAct.Array} transformed
	   *      The array created as a result of invoking {@link ProAct.Array#concat} on the <i>original</i> {@link ProAct.Array}.
	   * @param {ProAct.Array} original
	   *      The {@link ProAct.Array} on which {@link ProAct.Array#concat} was invoked.
	   * @param {ProAct.Array} right
	   *      The {@link ProAct.Array} passed as an argument to {@link ProAct.Array#concat}.
	   * @return {Function}
	   *      A listener for events from the <i>right</i> {@link ProAct.Array}, updating the <i>transformed</i> {@link ProAct.Array} on
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
	   * Generates a listener that can be attached to an {@link ProAct.Array} on which
	   * the method {@link ProAct.Array#pevery} is invoked.
	   * <p>
	   *  The result of the {@link ProAct.Array#pevery} method is a {@link ProAct.Val}, dependent on the <i>original</i> array.
	   * </p>
	   * <p>
	   *  For example if the original was:
	   *  <pre>
	   *    var a = new ProAct.Array([1, 3, 5]);
	   *  </pre>
	   *  and we invoked {@link ProAct.Array#pevery} on it like this:
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
	   *  The generated listener by this method does this - updates the <i>val</i> {@link ProAct.Val}, when the <i>original</i> array changes
	   *  and it does it in an optimal way.
	   * </p>
	   *
	   * @memberof ProAct.Array.Listeners
	   * @static
	   * @constant
	   * @param {ProAct.Val} val
	   *      The result of invoking {@link ProAct.Array#pevery} on the <i>original</i> {@link ProAct.Array}.
	   * @param {ProAct.Array} original
	   *      The {@link ProAct.Array} on which {@link ProAct.Array#pevery} was invoked.
	   * @param {Array} args
	   *      The arguments passed to {@link ProAct.Array#pevery}, when it was invoked on the <i>original</i> {@link ProAct.Array}
	   * @return {Function}
	   *      A listener for events from the <i>original</i> {@link ProAct.Array}, updating the <i>val</i> {@link ProAct.Val} on
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
	   * Generates a listener that can be attached to an {@link ProAct.Array} on which
	   * the method {@link ProAct.Array#psome} is invoked.
	   * <p>
	   *  The result of the {@link ProAct.Array#psome} method is a {@link ProAct.Val}, dependent on the <i>original</i> array.
	   * </p>
	   * <p>
	   *  For example if the original was:
	   *  <pre>
	   *    var a = new ProAct.Array([1, 3, 5]);
	   *  </pre>
	   *  and we invoked {@link ProAct.Array#psome} on it like this:
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
	   *  The generated listener by this method does this - updates the <i>val</i> {@link ProAct.Val}, when the <i>original</i> array changes
	   *  and it does it in an optimal way.
	   * </p>
	   *
	   * @memberof ProAct.Array.Listeners
	   * @static
	   * @constant
	   * @param {ProAct.Val} val
	   *      The result of invoking {@link ProAct.Array#psome} on the <i>original</i> {@link ProAct.Array}.
	   * @param {ProAct.Array} original
	   *      The {@link ProAct.Array} on which {@link ProAct.Array#psome} was invoked.
	   * @param {Array} args
	   *      The arguments passed to {@link ProAct.Array#psome}, when it was invoked on the <i>original</i> {@link ProAct.Array}
	   * @return {Function}
	   *      A listener for events from the <i>original</i> {@link ProAct.Array}, updating the <i>val</i> {@link ProAct.Val} on
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
	   * Generates a listener that can be attached to an {@link ProAct.Array} on which
	   * the method {@link ProAct.Array#filter} is invoked.
	   * <p>
	   *  The result of the {@link ProAct.Array#filter} method is another {@link ProAct.Array}, dependent on the <i>original</i> one.
	   * </p>
	   * <p>
	   *  For example if the original was:
	   *  <pre>
	   *    var a = new ProAct.Array([1, 3, 5]);
	   *  </pre>
	   *  and we invoked {@link ProAct.Array#filter} on it like this:
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
	   *  The generated listener by this method does this - updates the <i>filtered</i> {@link ProAct.Array}, when the <i>original</i> changes
	   *  and it does it in an optimal way.
	   * </p>
	   *
	   * @memberof ProAct.Array.Listeners
	   * @static
	   * @constant
	   * @param {ProAct.Array} filtered
	   *      The array created as a result of invoking {@link ProAct.Array#filter} on the <i>original</i> {@link ProAct.Array}.
	   * @param {ProAct.Array} original
	   *      The {@link ProAct.Array} on which {@link ProAct.Array#filter} was invoked.
	   * @param {Array} args
	   *      The arguments passed to {@link ProAct.Array#filter}, when it was invoked on the <i>original</i> {@link ProAct.Array}
	   * @return {Function}
	   *      A listener for events from the <i>original</i> {@link ProAct.Array}, updating the <i>filtered</i> {@link ProAct.Array} on
	   *      every new event, if it is necessary.
	   */
	  filter: function (filtered, original, args) {
	    var fun = args[0], thisArg = args[1];
	    return function (event) {
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
	   * Generates a listener that can be attached to an {@link ProAct.Array} on which
	   * the method {@link ProAct.Array#map} is invoked.
	   * <p>
	   *  The result of the {@link ProAct.Array#map} method is another {@link ProAct.Array}, dependent on the <i>original</i> one.
	   * </p>
	   * <p>
	   *  For example if the original was:
	   *  <pre>
	   *    var a = new ProAct.Array([1, 3, 5]);
	   *  </pre>
	   *  and we invoked {@link ProAct.Array#map} on it like this:
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
	   *  The generated listener by this method does this - updates the <i>mapped</i> {@link ProAct.Array}, when the <i>original</i> changes
	   *  and it does it in an optimal way.
	   * </p>
	   *
	   * @memberof ProAct.Array.Listeners
	   * @static
	   * @constant
	   * @param {ProAct.Array} mapped
	   *      The array created as a result of invoking {@link ProAct.Array#map} on the <i>original</i> {@link ProAct.Array}.
	   * @param {ProAct.Array} original
	   *      The {@link ProAct.Array} on which {@link ProAct.Array#map} was invoked.
	   * @param {Array} args
	   *      The arguments passed to {@link ProAct.Array#map}, when it was invoked on the <i>original</i> {@link ProAct.Array}
	   * @return {Function}
	   *      A listener for events from the <i>original</i> {@link ProAct.Array}, updating the <i>mapped</i> {@link ProAct.Array} on
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
	   * Generates a listener that can be attached to an {@link ProAct.Array} on which
	   * the method {@link ProAct.Array#preduce} is invoked.
	   * <p>
	   *  The result of the {@link ProAct.Array#preduce} method is a {@link ProAct.Val}, dependent on the <i>original</i> array.
	   * </p>
	   * <p>
	   *  For example if the original was:
	   *  <pre>
	   *    var a = new ProAct.Array([1, 3, 5]);
	   *  </pre>
	   *  and we invoked {@link ProAct.Array#preduce} on it like this:
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
	   *  The generated listener by this method does this - updates the <i>val</i> {@link ProAct.Val}, when the <i>original</i> array changes
	   *  and it does it in an optimal way.
	   * </p>
	   *
	   * @memberof ProAct.Array.Listeners
	   * @static
	   * @constant
	   * @param {ProAct.Val} val
	   *      The result of invoking {@link ProAct.Array#preduce} on the <i>original</i> {@link ProAct.Array}.
	   * @param {ProAct.Array} original
	   *      The {@link ProAct.Array} on which {@link ProAct.Array#preduce} was invoked.
	   * @param {Array} args
	   *      The arguments passed to {@link ProAct.Array#preduce}, when it was invoked on the <i>original</i> {@link ProAct.Array}
	   * @return {Function}
	   *      A listener for events from the <i>original</i> {@link ProAct.Array}, updating the <i>val</i> {@link ProAct.Val} on
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
	   * Generates a listener that can be attached to an {@link ProAct.Array} on which
	   * the method {@link ProAct.Array#preduceRight} is invoked.
	   * <p>
	   *  The result of the {@link ProAct.Array#preduceRight} method is a {@link ProAct.Val}, dependent on the <i>original</i> array.
	   * </p>
	   * <p>
	   *  For example if the original was:
	   *  <pre>
	   *    var a = new ProAct.Array([1, 3, 5]);
	   *  </pre>
	   *  and we invoked {@link ProAct.Array#preduceRight} on it like this:
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
	   *  The generated listener by this method does this - updates the <i>val</i> {@link ProAct.Val}, when the <i>original</i> array changes
	   *  and it does it in an optimal way.
	   * </p>
	   *
	   * @memberof ProAct.Array.Listeners
	   * @static
	   * @constant
	   * @param {ProAct.Val} val
	   *      The result of invoking {@link ProAct.Array#preduceRight} on the <i>original</i> {@link ProAct.Array}.
	   * @param {ProAct.Array} original
	   *      The {@link ProAct.Array} on which {@link ProAct.Array#preduceRight} was invoked.
	   * @param {Array} args
	   *      The arguments passed to {@link ProAct.Array#preduceRight}, when it was invoked on the <i>original</i> {@link ProAct.Array}
	   * @return {Function}
	   *      A listener for events from the <i>original</i> {@link ProAct.Array}, updating the <i>val</i> {@link ProAct.Val} on
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
	   * Generates a listener that can be attached to an {@link ProAct.Array} on which
	   * the method {@link ProAct.Array#pindexOf} is invoked.
	   * <p>
	   *  The result of the {@link ProAct.Array#pindexOf} method is a {@link ProAct.Val}, dependent on the <i>original</i> array.
	   * </p>
	   * <p>
	   *  For example if the original was:
	   *  <pre>
	   *    var a = new ProAct.Array([1, 3, 5]);
	   *  </pre>
	   *  and we invoked {@link ProAct.Array#pindexOf} on it like this:
	   *  <pre>
	   *    var val = a.pindexOf(5); // val.v is 2.
	   *  </pre>
	   *  The new value - <b>val</b> is dependent on <b>a</b>, so if for example we reverse <b>a</b>, <b>val</b> should be updated:
	   *  <pre>
	   *    a.reverse(); // val.v authomatically should become 0.
	   *  </pre>
	   * </p>
	   * <p>
	   *  The generated listener by this method does this - updates the <i>val</i> {@link ProAct.Val}, when the <i>original</i> array changes
	   *  and it does it in an optimal way.
	   * </p>
	   *
	   * @memberof ProAct.Array.Listeners
	   * @static
	   * @constant
	   * @param {ProAct.Val} val
	   *      The result of invoking {@link ProAct.Array#pindexOf} on the <i>original</i> {@link ProAct.Array}.
	   * @param {ProAct.Array} original
	   *      The {@link ProAct.Array} on which {@link ProAct.Array#pindexOf} was invoked.
	   * @param {Array} args
	   *      The arguments passed to {@link ProAct.Array#pindexOf}, when it was invoked on the <i>original</i> {@link ProAct.Array}
	   * @return {Function}
	   *      A listener for events from the <i>original</i> {@link ProAct.Array}, updating the <i>val</i> {@link ProAct.Val} on
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
	   * Generates a listener that can be attached to an {@link ProAct.Array} on which
	   * the method {@link ProAct.Array#plastIndexOf} is invoked.
	   * <p>
	   *  The result of the {@link ProAct.Array#plastIndexOf} method is a {@link ProAct.Val}, dependent on the <i>original</i> array.
	   * </p>
	   * <p>
	   *  For example if the original was:
	   *  <pre>
	   *    var a = new ProAct.Array([5, 4, 5, 3]);
	   *  </pre>
	   *  and we invoked {@link ProAct.Array#plastIndexOf} on it like this:
	   *  <pre>
	   *    var val = a.plastIndexOf(5); // val.v is 2.
	   *  </pre>
	   *  The new value - <b>val</b> is dependent on <b>a</b>, so if for example we sort <b>a</b>, <b>val</b> should be updated:
	   *  <pre>
	   *    a.sort(); // val.v authomatically should become 3.
	   *  </pre>
	   * </p>
	   * <p>
	   *  The generated listener by this method does this - updates the <i>val</i> {@link ProAct.Val}, when the <i>original</i> array changes
	   *  and it does it in an optimal way.
	   * </p>
	   *
	   * @memberof ProAct.Array.Listeners
	   * @static
	   * @constant
	   * @param {ProAct.Val} val
	   *      The result of invoking {@link ProAct.Array#plastIndexOf} on the <i>original</i> {@link ProAct.Array}.
	   * @param {ProAct.Array} original
	   *      The {@link ProAct.Array} on which {@link ProAct.Array#plastIndexOf} was invoked.
	   * @param {Array} args
	   *      The arguments passed to {@link ProAct.Array#plastIndexOf}, when it was invoked on the <i>original</i> {@link ProAct.Array}
	   * @return {Function}
	   *      A listener for events from the <i>original</i> {@link ProAct.Array}, updating the <i>val</i> {@link ProAct.Val} on
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
	   * Generates a listener that can be attached to an {@link ProAct.Array} on which
	   * the method {@link ProAct.Array#slice} is invoked.
	   * <p>
	   *  The result of the {@link ProAct.Array#slice} method is another {@link ProAct.Array}, dependent on the <i>original</i> one.
	   * </p>
	   * <p>
	   *  For example if the original was:
	   *  <pre>
	   *    var a = new ProAct.Array([1, 3, 5]);
	   *  </pre>
	   *  and we invoked {@link ProAct.Array#slice} on it like this:
	   *  <pre>
	   *    var b = a.slice(1); // b is [3, 5]
	   *  </pre>
	   *  The new array - <b>b</b> is dependent on <b>a</b>, so if for example we push to <b>a</b>, <b>b</b> should be updated:
	   *  <pre>
	   *    a.push(32); // b authomatically should become [3, 5, 32]
	   *  </pre>
	   * </p>
	   * <p>
	   *  The generated listener by this method does this - updates the <i>sliced</i> {@link ProAct.Array}, when the <i>original</i> changes
	   *  and it does it in an optimal way.
	   * </p>
	   *
	   * @memberof ProAct.Array.Listeners
	   * @static
	   * @constant
	   * @param {ProAct.Array} sliced
	   *      The array created as a result of invoking {@link ProAct.Array#slice} on the <i>original</i> {@link ProAct.Array}.
	   * @param {ProAct.Array} original
	   *      The {@link ProAct.Array} on which {@link ProAct.Array#slice} was invoked.
	   * @param {Array} args
	   *      The arguments passed to {@link ProAct.Array#slice}, when it was invoked on the <i>original</i> {@link ProAct.Array}
	   * @return {Function}
	   *      A listener for events from the <i>original</i> {@link ProAct.Array}, updating the <i>sliced</i> {@link ProAct.Array} on
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
	 * <p>
	 *  Constructs a ProAct.Val. The ProAct.Vals are the simplest ProAct.js reactive objects, they have only one property - 'v' and all their methods,
	 *  extended from {@link ProAct.Observable} delegate to it.
	 * </p>
	 * <p>
	 *  Like every object turned to ProAct.js reactive one, the ProAct.Val has a {@link ProAct.ObjectCore} managing its single {@link ProAct.Property}.
	 * </p>
	 * <p>
	 *  The core can be accessed via:
	 *  <pre>
	 *    var core = v.p();
	 *  </pre>
	 * </p>
	 * <p>
	 *  ProAct.Val is part of the properties module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.Val
	 * @extends ProAct.Observable
	 * @param {Object} val
	 *      The value that will be wrapped and tracked by the ProAct.Val being created.
	 * @param {String} meta
	 *      Meta-data passed to the {@link ProAct.Property} construction logic.
	 * @see {@link ProAct.ObjectCore}
	 * @see {@link ProAct.Property}
	 */
	ProAct.Val = P.V = function (val, meta) {
	  this.v = val;
	
	  if (meta && (P.U.isString(meta) || P.U.isArray(meta))) {
	    meta = {
	      v: meta
	    };
	  }
	
	  P.prob(this, meta);
	};
	
	ProAct.Val.prototype = P.U.ex(Object.create(P.Observable.prototype), {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @memberof ProAct.Val
	   * @instance
	   * @constant
	   * @default ProAct.Val
	   */
	  constructor: ProAct.Val,
	
	  /**
	   * Retrieves the {@link ProAct.Property.Types} value of <i>this</i> {@link ProAct.Property} managing the 'v' field.
	   *
	   * @memberof ProAct.Val
	   * @instance
	   * @method type
	   * @return {Number}
	   *      The right type of the 'v' field's property.
	   * @see {@link ProAct.Property.Types}
	   * @see {@link ProAct.Property#type}
	   */
	  type: function () {
	    return this.__pro__.properties.v.type();
	  },
	
	  /**
	   * Attaches a new listener to the {@link ProAct.Property} managing the 'v' field of <i>this</i>.
	   * The listener may be function or object that defines a <i>call</i> method.
	   *
	   * @memberof ProAct.Val
	   * @instance
	   * @method on
	   * @param {Array|String} actions
	   *      The action/actions to listen for. If this parameter is skipped or null/undefined, the actions from {@link ProAct.Observable#defaultActions} are used.
	   *      <p>
	   *        The actions can be skipped and on their place as first parameter to be passed the <i>listener</i>.
	   *      </p>
	   * @param {Object} listener
	   *      The listener to attach. It must be instance of Function or object with a <i>call</i> method.
	   * @return {ProAct.Val}
	   *      <b>this</b>
	   * @see {@link ProAct.Observable#defaultActions}
	   * @see {@link ProAct.Property}
	   */
	  on: function (action, listener) {
	    this.__pro__.properties.v.on(action, listener);
	    return this;
	  },
	
	  /**
	   * Removes a <i>listener</i> from the {@link ProAct.Property} managing the 'v' field of <i>this</i> for passed <i>action</i>.
	   * <p>
	   *  If this method is called without parameters, all the listeners for all the actions are removed.
	   *  The listeners are reset using {@link ProAct.Observable#defaultListeners}.
	   * </p>
	   *
	   * @memberof ProAct.Val
	   * @instance
	   * @method off
	   * @param {Array|String} actions
	   *      The action/actions to stop listening for. If this parameter is skipped or null/undefined, the actions from {@link ProAct.Observable#defaultActions} are used.
	   *      <p>
	   *        The actions can be skipped and on their place as first parameter to be passed the <i>listener</i>.
	   *      </p>
	   * @param {Object} listener
	   *      The listener to detach. If it is skipped, null or undefined all the listeners are removed.
	   * @return {ProAct.Val}
	   *      <b>this</b>
	   * @see {@link ProAct.Observable#defaultActions}
	   * @see {@link ProAct.Property}
	   */
	  off: function (action, listener) {
	    this.__pro__.properties.v.off(action, listener);
	    return this;
	  },
	
	  /**
	   * Attaches a new error listener to the {@link ProAct.Property} managing the 'v' field of <i>this</i>.
	   * The listener may be function or object that defines a <i>call</i> method.
	   *
	   * @memberof ProAct.Val
	   * @instance
	   * @method onErr
	   * @param {Object} listener
	   *      The listener to attach. It must be instance of Function or object with a <i>call</i> method.
	   * @return {ProAct.Val}
	   *      <b>this</b>
	   * @see {@link ProAct.Val#on}
	   */
	  onErr: function (listener) {
	    this.__pro__.properties.v.onErr(listener);
	    return this;
	  },
	
	  /**
	   * Removes an error <i>listener</i> from the {@link ProAct.Property} managing the 'v' field of <i>this</i>.
	   *
	   * @memberof ProAct.Val
	   * @instance
	   * @method offErr
	   * @param {Object} listener
	   *      The listener to detach. If it is skipped, null or undefined all the listeners are removed.
	   * @return {ProAct.Val}
	   *      <b>this</b>
	   * @see {@link ProAct.Val#onErr}
	   */
	  offErr: function (listener) {
	    this.__pro__.properties.v.offErr(listener);
	    return this;
	  },
	
	  /**
	   * Adds a new <i>transformation</i> to the list of transformations
	   * of the {@link ProAct.Property} managing the 'v' field of <i>this</i>.
	   * <p>
	   *  A transformation is a function or an object that has a <i>call</i> method defined.
	   *  This function or call method should have one argument and to return a transformed version of it.
	   *  If the returned value is {@link ProAct.Observable.BadValue}, the next transformations are skipped and the updating
	   *  value/event becomes - bad value.
	   * </p>
	   * <p>
	   *  Every value/event that updates the {@link ProAct.Property} managing the 'v' field of <i>this</i> will be transformed using the new transformation.
	   * </p>
	   *
	   * @memberof ProAct.Val
	   * @instance
	   * @method transform
	   * @param {Object} transformation
	   *      The transformation to add.
	   * @return {ProAct.Val}
	   *      <b>this</b>
	   * @see {@link ProAct.Observable.transform}
	   */
	  transform: function (transformation) {
	    this.__pro__.properties.v.transform(transformation);
	    return this;
	  },
	
	  /**
	   * Links source {@link ProAct.Observable}s into the {@link ProAct.Property} managing the 'v' field of <i>this</i>.
	   * This means that the property is listening for changes from the <i>sources</i>.
	   *
	   * @memberof ProAct.Val
	   * @instance
	   * @method into
	   * @param [...]
	   *      Zero or more source {@link ProAct.Observables} to set as sources.
	   * @return {ProAct.Val}
	   *      <b>this</b>
	   */
	  into: function () {
	    this.__pro__.properties.v.into.apply(this.__pro__.properties.v, arguments);
	    return this;
	  },
	
	  /**
	   * The reverse of {@link ProAct.Val#into} - sets the {@link ProAct.Property} managing the 'v' field of <i>this</i> as a source
	   * to the passed <i>destination</i> observable.
	   *
	   * @memberof ProAct.Val
	   * @instance
	   * @method out
	   * @param {ProAct.Observable} destination
	   *      The observable to set as source the {@link ProAct.Property} managing the 'v' field of <i>this</i> to.
	   * @return {ProAct.Val}
	   *      <b>this</b>
	   * @see {@link ProAct.Val#into}
	   */
	  out: function (destination) {
	    this.__pro__.properties.v.out(destination);
	    return this;
	  },
	
	  /**
	   * Update notifies all the observers of the {@link ProAct.Property} managing the 'v' field of <i>this</i>.
	   *
	   * @memberof ProAct.Val
	   * @instance
	   * @method update
	   * @param {Object} source
	   *      The source of the update, for example update of {@link ProAct.Observable},
	   *      that the {@link ProAct.Property} managing the 'v' field of <i>this</i> is observing.
	   *      <p>
	   *        Can be null - no source.
	   *      </p>
	   *      <p>
	   *        In the most cases {@link ProAct.Event} is the source.
	   *      </p>
	   * @param {Array|String} actions
	   *      A list of actions or a single action to update the listeners that listen to it.
	   * @param {Array} eventData
	   *      Data to be passed to the event to be created.
	   * @return {ProAct.Val}
	   *      <i>this</i>
	   * @see {@link ProAct.Observable#update}
	   * @see {@link ProAct.Property#makeEvent}
	   * @see {@link ProAct.flow}
	   */
	  update: function (source, actions, eventData) {
	    this.__pro__.properties.v.update(source, actions, eventData);
	    return this;
	  },
	
	  /**
	   * <b>willUpdate()</b> is the method used to notify observers that the {@link ProAct.Property} managing the 'v' field of <i>this</i> will be updated.
	   * <p>
	   *  It uses the {@link ProAct.Observable#defer} to defer the listeners of the listening {@link ProAct.Observable}s.
	   *  The idea is that everything should be executed in a running {@link ProAct.Flow}, so there will be no repetative
	   *  updates.
	   * </p>
	   * <p>
	   *  The update value will come from the {@link ProAct.Property#makeEvent} method and the <i>source</i>
	   *  parameter will be passed to it.
	   * </p>
	   *
	   * @memberof ProAct.Val
	   * @instance
	   * @method willUpdate
	   * @param {Object} source
	   *      The source of the update, for example update of {@link ProAct.Observable},
	   *      that the {@link ProAct.Property} managing the 'v' field of <i>this</i> is observing.
	   *      <p>
	   *        Can be null - no source.
	   *      </p>
	   *      <p>
	   *        In the most cases {@link ProAct.Event} is the source.
	   *      </p>
	   * @param {Array|String} actions
	   *      A list of actions or a single action to update the listeners that listen to it.
	   *      If there is no action provided, the actions from {@link ProAct.Observable#defaultActions} are used.
	   * @param {Array} eventData
	   *      Data to be passed to the event to be created.
	   * @return {ProAct.Val}
	   *      <i>this</i>
	   * @see {@link ProAct.Observable#defer}
	   * @see {@link ProAct.Property#makeEvent}
	   * @see {@link ProAct.Observable#defaultActions}
	   * @see {@link ProAct.flow}
	   */
	  willUpdate: function (source, actions, eventData) {
	    this.__pro__.properties.v.willUpdate(source, actions, eventData);
	    return this;
	  },
	
	  /**
	   * The value set to <i>this</i>' 'v' property. By reaing it using this method, no listeners set to
	   * {@link ProAct.currentCaller} are attached.
	   *
	   * @memberof ProAct.Val
	   * @instance
	   * @method valueOf
	   * @return {Object}
	   *      The actual value set in <i>this</i>.
	   */
	  valueOf: function () {
	    return this.__pro__.properties.v.val;
	  },
	
	  /**
	   * A string representation of the value set to <i>this</i>' 'v' property.
	   * By reaing it using this method, no listeners set to {@link ProAct.currentCaller} are attached.
	   *
	   * @memberof ProAct.Val
	   * @instance
	   * @method toString
	   * @return {Object}
	   *      A string representation of the actual value set in <i>this</i>.
	   */
	  toString: function () {
	    return this.valueOf().toString();
	  }
	});
	
	/**
	 * The {@link ProAct.prob} method is the entry point for creating reactive values in ProAct.js
	 * <p>
	 *  If the value is Number/String/Boolean/null/undefined or Function a new {@link ProAct.Val} is created woth value, set
	 *  to the passed <i>object</i> value. The <i>meta</i>-data passed is used in the creation process.
	 * </p>
	 * <p>
	 *  If the passed <i>object</i> is an array, the result of this method is a new {@link ProAct.Array} with content,
	 *  the passed array <i>object</i>
	 * </p>
	 * <p>
	 *  If the <i>object</i> passed is a plain JavaScript object the result of this function is reactive version of the
	 *  <i>object</i> with {@link ProAct.ObjectCore} holding its {@link ProAct.Property}s.
	 * </p>
	 *
	 * @method prob
	 * @memberof ProAct
	 * @static
	 * @param {Object} object
	 *      The object/value to make reactive.
	 * @param {Object|String} meta
	 *      Meta-data used to help in the reactive object creation.
	 * @return {Object}
	 *      Reactive representation of the passed <i>object</i>.
	 */
	ProAct.prob = function (object, meta) {
	  var core, property,
	      isAr = P.U.isArray;
	
	  if (object === null || (!P.U.isObject(object) && !isAr(object))) {
	    return new P.V(object, meta);
	  }
	
	  if (P.U.isArray(object)) {
	    return new P.A(object);
	  }
	
	  core = new P.OC(object, meta);
	  P.U.defValProp(object, '__pro__', false, false, false, core);
	
	  core.prob();
	
	  return object;
	};
	
	/**
	 * <p>
	 *  Constructs a ProAct.Registry. It is used to store/create objects that can be referenced or configured using the {@link ProAct.DSL}.
	 * </p>
	 * <p>
	 *  ProAct.Registry is part og the DSL module of ProAct.js.
	 * </p>
	 *
	 * @class ProAct.Registry
	 */
	ProAct.Registry = P.R = function () {
	  this.providers = {};
	};
	
	ProAct.Registry.prototype = rProto = {
	
	  /**
	   * Reference to the constructor of this object.
	   *
	   * @memberof ProAct.Registry
	   * @instance
	   * @constant
	   * @default ProAct.Registry
	   */
	  constructor: ProAct.Registry,
	
	  /**
	   * Registers a {@link ProAct.Registry.Provider} for the passed <i>namespace</i> in the registry.
	   *
	   * @memberof ProAct.Registry
	   * @instance
	   * @method register
	   * @param {String} namespace
	   *      The namespace to register the <i>provider</i> in.
	   * @param {ProAct.Registry.Provider} provider
	   *      The {@link ProAct.Registry.Provider} to register.
	   * @return {ProAct.Registers}
	   *      <i>this</i>
	   * @throws {Error}
	   *      If a {@link ProAct.Registry.Provider} is already registered for the passed <i>namespace</i>.
	   * @see {@link ProAct.Registry.Provider}
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
	   * Retrieves the right {@link ProAct.Registry.Provider} using the <i>name</i> of stored
	   * in <i>this</i> ProAct.Registry object, or the <i>name</i> of an object to be stored
	   *
	   * @memberof ProAct.Registry
	   * @instance
	   * @method getProviderByName
	   * @param {String} name
	   *      The name of storable object.
	   *      <p>
	   *        It must be in the format '{namespace}:{key}'.
	   *      </p>
	   *      <p>
	   *        Here the namespace is the namespace the {@link ProAct.Registry.Provider} manages.
	   *      </p>
	   * @return {Array}
	   *      The first element in the result is the {@link ProAct.Registry.Provider} or undefined if not found.
	   *      <p>
	   *        The second one is the <b>key</b> at which an object is stored or will be stored in the provider.
	   *      </p>
	   *      <p>
	   *        The third element is an array with options for storing/creating an object passed to the provider using
	   *        the <i>name</i> string.
	   *      </p>
	   * @see {@link ProAct.Registry.Provider}
	   */
	  getProviderByName: function (name) {
	    var parts = name.split(':');
	
	    return [this.providers[parts[0]], parts[1], parts.slice(2)];
	  },
	
	  /**
	   * Configures an object to be stored using {@link ProAct.DSL} passed through <i>options</i> and DSL arguments.
	   * <p>
	   *  Example usage:
	   * </p>
	   * <p>
	   *  A {@link ProAct.Stream} is passed to the registry for setup with DSL data.
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
	   *  This means that a {@link ProAct.Stream} stored in <i>this</i> registry by the key 'foo' should be set
	   *  as a source to the passed as the <i>object</i> parameter simple {@link ProAct.Stream}.
	   * </p>
	   * <p>
	   *  It also means that for every value comming in the <i>object</i> parameter's stream there should be mapping of negativity and
	   *  only even values should be passed to it.
	   * </p>
	   * <p>
	   *  So if we trigger in the 'foo' stream the value of <b>4</b> in our stream we will get <b>-4</b>, and if we trigger 5, we won't get anything.
	   * </p>
	   *
	   * @memberof ProAct.Registry
	   * @instance
	   * @method setup
	   * @param {Object} object
	   *      The object to setup.
	   * @param {String|Object} options
	   *      A {@link ProAct.DSL} data object or string used to setup the object.
	   * @param {Array} args
	   *      Arguments to be used by the {@link ProAct.DSL#run} method while configuring the passed <i>object</i>.
	   * @return {Object}
	   *      Ready to strore object.
	   * @see {@link ProAct.DSL}
	   * @see {@link ProAct.DSL#run}
	   */
	  setup: function (object, options, args) {
	    return dsl.run.apply(null, [object, options, this].concat(args));
	  },
	
	  /**
	   * Creates a new object and stores it in <i>this</i> registry, using the right provider for the creation
	   * and configuring it using the DSL passed through the <i>options</i> parameter.
	   * <p>
	   *  {@link ProAct.Registry#getProviderByName} is used to locate the right provider to create the object with.
	   * </p>
	   * <p>
	   *  {@link ProAct.Registry#setup} is used to setup the newly created object using the {@link ProAct.DSL}
	   * </p>
	   * <p>
	   *  The idea of this method is to create and configure {@link ProAct.Observable} objects.
	   * </p>
	   *
	   * @memberof ProAct.Registry
	   * @instance
	   * @method make
	   * @param {String} name
	   *      Name of the object to create and store.
	   *      <p>
	   *        It must be in the format '{namespace}:{key}'
	   *      </p>
	   * @param {String|Object} options
	   *      A {@link ProAct.DSL} data object or string used to setup the object to be created.
	   * @param [...]
	   *      <b>Arguments</b> to be used by the {@link ProAct.DSL#run} method while configuring the newly created <i>object</i>.
	   * @return {Object}
	   *      The newly created, stored and configured object, or null if there was no {@link ProAct.Registry.Provider} register for its type.
	   * @see {@link ProAct.DSL}
	   * @see {@link ProAct.Registry#getProviderByName}
	   * @see {@link ProAct.Registry#setup}
	   * @see {@link ProAct.Observable}
	   */
	  make: function (name, options) {
	    var args = slice.call(arguments, 2),
	        p = this.getProviderByName(name),
	        observable;
	
	    if (p[0]) {
	      observable = p[0].make.apply(p[0], [p[1], p[2]].concat(args));
	      return this.setup(observable, options, args);
	    }
	    return null;
	  },
	
	  /**
	   * Stores an object  in <i>this</i> registry, using the right provider to configure it using the DSL passed through the <i>options</i> parameter.
	   * <p>
	   *  {@link ProAct.Registry#getProviderByName} is used to locate the right provider to store the object to.
	   * </p>
	   *
	   * @memberof ProAct.Registry
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
	   *      A {@link ProAct.DSL} data object or string used to setup the object to be stored (optional).
	   * @param [...]
	   *      <b>Arguments</b> to be used by the {@link ProAct.DSL#run} method while configuring the <i>object</i>.
	   * @return {Object}
	   *      The stored and configured object, or null if there was no {@link ProAct.Registry.Provider} register for its type.
	   * @see {@link ProAct.DSL}
	   * @see {@link ProAct.Registry#getProviderByName}
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
	   *  {@link ProAct.Registry#getProviderByName} is used to locate the right provider to retrieve the object from.
	   * </p>
	   *
	   * @memberof ProAct.Registry
	   * @instance
	   * @method get
	   * @param {String} name
	   *      Name of the object to find.
	   *      <p>
	   *        It must be in the format '{namespace}:{key}'
	   *      </p>
	   * @return {Object}
	   *      The stored object, or null if there was no {@link ProAct.Registry.Provider} register for its type or no object registered for the passed <i>name</i>.
	   * @see {@link ProAct.Registry#getProviderByName}
	   */
	  get: function (name) {
	    var p = this.getProviderByName(name);
	
	    if (p[0]) {
	      return p[0].get(p[1]);
	    }
	    return null;
	  },
	
	  /**
	   * Helper method for transforming an array of keys of stored items in <i>this</i> ProAct.Registry to an array of the actual items.
	   * <p>
	   *  Mainly used by the {@link ProAct.DSL} logic.
	   * </p>
	   *
	   * @memberof ProAct.Registry
	   * @instance
	   * @method toObjectArray
	   * @param {Array} array
	   *      Array of string keys to objects stored in <i>this</i> registry to be retrieved using {@link ProAct.Registry#toObject}.
	   *      <p>
	   *        If object is not stored on some key, the key itself is returned in the same possition in the result array.
	   *      </p>
	   * @return {Array}
	   *      Of the retrieved objects, in the same order as the keys.
	   * @see {@link ProAct.Registry#toObject}
	   * @see {@link ProAct.DSL}
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
	   * Helper method for transforming a key of stored item in <i>this</i> ProAct.Registry to the actual item or returning the key, if
	   * the item is not found in the ProAct.Registry.
	   * <p>
	   *  Mainly used by the {@link ProAct.DSL} logic.
	   * </p>
	   *
	   * @memberof ProAct.Registry
	   * @instance
	   * @method toObject
	   * @param {String|Object} data
	   *      Key of strored object or something else. If the key is valid and there is something stored on it, the stored object is retrieved.
	   *      <p>
	   *        If there is nothing stored for this <i>data</i>, the <i>data</i> itself is returned.
	   *      </p>
	   * @return {Object}
	   *      Stored object, if found using the passed <i>data</i> or the <i>data</i> itself.
	   * @see {@link ProAct.DSL}
	   * @see {@link ProAct.Registry#get}
	   */
	  toObject: function (data) {
	    if (P.U.isString(data)) {
	      var result = this.get(data);
	      return result ? result : data;
	    }
	
	    return data;
	  }
	};
	
	/**
	 * Contains {@link ProAct.DSl} operation logic definitions.
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
	 * @namespace ProAct.OpStore
	 */
	ProAct.OpStore = {
	
	  /**
	   * Default operation definitions, that can be used by most of the operations to be defined.
	   *
	   * @memberof ProAct.OpStore
	   * @static
	   * @constant
	   */
	  all: {
	
	    /**
	     * Can generate a simple operation definition.
	     * <p>
	     *  It is used for defining all the simple operations, like <i>map</i> or <i>filter</i>.
	     * </p>
	     *
	     * @memberof ProAct.OpStore.all
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
	     * @see {@link ProAct.DSl.predefined}
	     */
	    simpleOp: function(name, sym) {
	      return {
	        sym: sym,
	        match: function (op) {
	          return op.substring(0, sym.length) === sym;
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
	              if (arg.charAt(0) === '$') {
	                arg = realArguments[parseInt(arg.substring(1), 10) - 1];
	              } else if (predefined && arg.charAt(0) === '&') {
	                i = arg.lastIndexOf('&');
	                k = arg.substring(0, i);
	                if (predefined[k]) {
	                  arg = predefined[k].call(null, arg.substring(i + 1));
	                }
	              } else if (predefined && predefined[arg]) {
	                arg = predefined[arg];
	
	                if (P.U.isArray(arg)) {
	                  opArguments = opArguments.concat(arg);
	                  arg = undefined;
	                }
	              }
	
	              if (arg !== undefined) {
	                opArguments.push(arg);
	              }
	            }
	          }
	
	          actionObject[name] = opArguments;
	
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
	
	          return object[name].apply(object, args);
	        }
	      };
	    }
	  }
	};
	opStoreAll = P.OpStore.all;
	
	/**
	 * Contains implementation of the ProAct.js DSL.
	 * <p>
	 *  The idea of the DSL is to define {@link ProAct.Observable}s and their dependencies on each other in a declarative and simple way.
	 * </p>
	 * <p>
	 *  The {@link ProAct.Registry} is used to store these observables.
	 * </p>
	 * <p>
	 *  For example if we want to have a stream configured to write in a property, it is very easy done using the DSL:
	 *  <pre>
	 *    ProAct.registry.prob('val', 0, '<<(s:data)');
	 *  </pre>
	 *  This tells the {@link ProAct.Registry} to create a {@link ProAct.Val} with the value of zero, and to point the previously,
	 *  stored 'data' stream to it.
	 * </p>
	 *
	 * @namespace ProAct.DSL
	 */
	ProAct.DSL = {
	
	  /**
	   * A separator which can be used to separate multiple DSL expressions in one string.
	   *
	   * @memberof ProAct.DSL
	   * @static
	   * @constant
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
	   * @namespace ProAct.DSL.ops
	   * @memberof ProAct.DSL
	   * @static
	   * @see {@link ProAct.OpStore}
	   */
	  ops: {
	
	    /**
	     * DSL operation for defining sources of {@link ProAct.Observable}s.
	     * <p>
	     *  For example
	     *  <pre>
	     *    '<<(s:bla)'
	     *  </pre>
	     *  means that the source of the targed of the DSL should be a stream stored in the {@link ProAct.Registry} by the key 'bla'.
	     * </p>
	     * <p>
	     *  or
	     *  <pre>
	     *    '<<($1)'
	     *  </pre>
	     *  means that the source of the targed of the DSL should be an {@link ProAct.Observable} passed to the {@link ProAct.Dsl.run}
	     *  method as the first argument after the targed object, the DSL data and the registry.
	     * </p>
	     *
	     * @memberof ProAct.DSL.ops
	     * @static
	     * @constant
	     * @see {@link ProAct.OpStore}
	     * @see {@link ProAct.Registry}
	     * @see {@link ProAct.Observable}
	     * @see {@link ProAct.DSL.run}
	     */
	    into: opStoreAll.simpleOp('into', '<<'),
	
	    /**
	     * DSL operation for setting the targed of the DSL as sources of another {@link ProAct.Observable}s.
	     * <p>
	     *  For example
	     *  <pre>
	     *    '>>(s:bla)'
	     *  </pre>
	     *  means that the targed of the DSL should become a source for a stream stored in the {@link ProAct.Registry} by the key 'bla'.
	     * </p>
	     * <p>
	     *  or
	     *  <pre>
	     *    '>>($1)'
	     *  </pre>
	     *  means that the targed of the DSL should become a source for an {@link ProAct.Observable} passed to the {@link ProAct.Dsl.run}
	     *  method as the first argument after the targed object, the DSL data and the registry.
	     * </p>
	     *
	     * @memberof ProAct.DSL.ops
	     * @static
	     * @constant
	     * @see {@link ProAct.OpStore}
	     * @see {@link ProAct.Registry}
	     * @see {@link ProAct.Observable}
	     * @see {@link ProAct.DSL.run}
	     */
	    out: opStoreAll.simpleOp('out', '>>'),
	
	    /**
	     * DSL operation for attaching listener to the target {@link ProAct.Observable} of the DSL.
	     * <p>
	     *  For example
	     *  <pre>
	     *    '@(f:bla)'
	     *  </pre>
	     *  means that listener function, stored in the {@link ProAct.Registry} as 'bla'
	     *  should be attached as a listener to the targed {@link ProAct.Observable} of the DSL.
	     * </p>
	     *
	     * @memberof ProAct.DSL.ops
	     * @static
	     * @constant
	     * @see {@link ProAct.OpStore}
	     * @see {@link ProAct.Registry}
	     * @see {@link ProAct.Observable}
	     * @see {@link ProAct.DSL.run}
	     */
	    on: opStoreAll.simpleOp('on', '@'),
	
	    /**
	     * DSL operation for adding mapping to the target {@link ProAct.Observable} of the DSL.
	     * <p>
	     *  For example
	     *  <pre>
	     *    'map(f:bla)'
	     *  </pre>
	     *  means that mapping function, stored in the {@link ProAct.Registry} as 'bla'
	     *  should be mapped to the targed {@link ProAct.Observable} of the DSL.
	     * </p>
	     * <p>
	     *  or
	     *  <pre>
	     *    'map($2)'
	     *  </pre>
	     *  means that mapping function passed to the {@link ProAct.Dsl.run}
	     *  method as the second argument after the targed object, the DSL data and the registry
	     *  should be mapped to the targed {@link ProAct.Observable} of the DSL.
	     * </p>
	     *
	     * @memberof ProAct.DSL.ops
	     * @static
	     * @constant
	     * @see {@link ProAct.OpStore}
	     * @see {@link ProAct.Registry}
	     * @see {@link ProAct.Observable}
	     * @see {@link ProAct.DSL.run}
	     */
	    mapping: opStoreAll.simpleOp('mapping', 'map'),
	
	    /**
	     * DSL operation for adding filters to the target {@link ProAct.Observable} of the DSL.
	     * <p>
	     *  For example
	     *  <pre>
	     *    'filter(f:bla)'
	     *  </pre>
	     *  means that filtering function, stored in the {@link ProAct.Registry} as 'bla'
	     *  should be add as filter to the targed {@link ProAct.Observable} of the DSL.
	     * </p>
	     * <p>
	     *  or
	     *  <pre>
	     *    'filter($1)'
	     *  </pre>
	     *  means that filtering function passed to the {@link ProAct.Dsl.run}
	     *  method as the first argument after the targed object, the DSL data and the registry
	     *  should be added as filter to the targed {@link ProAct.Observable} of the DSL.
	     * </p>
	     *
	     * @memberof ProAct.DSL.ops
	     * @static
	     * @constant
	     * @see {@link ProAct.OpStore}
	     * @see {@link ProAct.Registry}
	     * @see {@link ProAct.Observable}
	     * @see {@link ProAct.DSL.run}
	     */
	    filtering: opStoreAll.simpleOp('filtering', 'filter'),
	
	    /**
	     * DSL operation for adding accumulation to the target {@link ProAct.Observable} of the DSL.
	     * <p>
	     *  For example
	     *  <pre>
	     *    'acc($1, f:bla)'
	     *  </pre>
	     *  means that accumulating function, stored in the {@link ProAct.Registry} as 'bla'
	     *  should be added as accumulation to the targed {@link ProAct.Observable} of the DSL,
	     *  and the first argument passed to {@link ProAct.DSL.run} after the targed object, the DSL data and the registry should
	     *  be used as initial value for the accumulation.
	     * </p>
	     *
	     * @memberof ProAct.DSL.ops
	     * @static
	     * @constant
	     * @see {@link ProAct.OpStore}
	     * @see {@link ProAct.Registry}
	     * @see {@link ProAct.Observable}
	     * @see {@link ProAct.DSL.run}
	     */
	    accumulation: opStoreAll.simpleOp('accumulation', 'acc')
	  },
	
	  /**
	   * A set of predefined operations to be used by the DSL.
	   *
	   * @namespace ProAct.DSL.predefined
	   * @memberof ProAct.DSL
	   * @static
	   * @see {@link ProAct.DSL.ops}
	   */
	  predefined: {
	
	    /**
	     * A set of predefined mapping operations to be used by the DSL.
	     *
	     * @namespace ProAct.DSL.predefined.mapping
	     * @memberof ProAct.DSL.predefined
	     * @static
	     * @see {@link ProAct.DSL.ops.map}
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
	       * @memberof ProAct.DSL.predefined.mapping
	       * @static
	       * @method
	       * @see {@link ProAct.DSL.ops.map}
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
	       * @memberof ProAct.DSL.predefined.mapping
	       * @static
	       * @method
	       * @see {@link ProAct.DSL.ops.map}
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
	       * @memberof ProAct.DSL.predefined.mapping
	       * @static
	       * @method
	       * @see {@link ProAct.DSL.ops.map}
	       */
	      'sqrt': function (el) { return Math.sqrt(el); },
	
	      /**
	       * Mapping operation for turning an object to a decimal Number - integer.
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
	       * @memberof ProAct.DSL.predefined.mapping
	       * @static
	       * @method
	       * @see {@link ProAct.DSL.ops.map}
	       */
	      'int': function (el) { return parseInt(el, 10); },
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
	      }
	    },
	    filtering: {
	      'odd': function (el) { return el % 2 !== 0; },
	      'even': function (el) { return el % 2 === 0; },
	      '+': function (el) { return el >= 0; },
	      '-': function (el) { return el <= 0; }
	    },
	    accumulation: {
	      '+': [0, function (x, y) { return x + y; }],
	      '*': [1, function (x, y) { return x * y; }],
	      '+str': ['', function (x, y) { return x + y; }],
	    }
	  },
	  optionsFromString: function (optionString) {
	    return dsl.optionsFromArray.apply(null, [optionString.split(dsl.separator)].concat(slice.call(arguments, 1)));
	  },
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
	  run: function (observable, options, registry) {
	    var isS = P.U.isString,
	        args = slice.call(arguments, 3),
	        option, i, ln, opType;
	
	    if (options && isS(options)) {
	      options = dsl.optionsFromString.apply(null, [options].concat(args));
	    }
	
	    if (options && options instanceof P.Observable) {
	      options = {into: options};
	    }
	
	    if (options && options.order) {
	      ln = options.order.length;
	      for (i = 0; i < ln; i++) {
	        option = options.order[i];
	        if (opType = dslOps[option]) {
	          if (registry) {
	            options[option] = registry.toObjectArray(options[option]);
	          }
	
	          opType.action(observable, options);
	          delete options[option];
	        }
	      }
	    }
	
	    for (opType in dslOps) {
	      if (options && (option = options[opType])) {
	        options[opType] = registry.toObjectArray(option);
	      }
	      opType = dslOps[opType];
	      opType.action(observable, options);
	    }
	
	    return observable;
	  }
	};
	
	dsl = P.DSL;
	dslOps = dsl.ops;
	
	P.U.ex(ProAct.Registry, {
	  Provider: function () {
	    this.stored = {};
	  },
	  StreamProvider: function () {
	    P.R.Provider.call(this);
	  },
	  FunctionProvider: function () {
	    Pro.Registry.Provider.call(this);
	  },
	  ProObjectProvider: function () {
	    Pro.Registry.Provider.call(this);
	  }
	});
	
	Pro.Registry.Provider.prototype = {
	  constructor: Pro.Registry.Provider,
	  make: function (key, options) {
	    var provided, args = slice.call(arguments, 1);
	    this.stored[key] = provided = this.provide.apply(this, args);
	    return provided;
	  },
	  store: function (key, func, options) { return this.stored[key] = func; },
	  get: function (key) { return this.stored[key]; },
	  del: function(key) {
	    var deleted = this.get(key);
	    delete this.stored[key];
	    return deleted;
	  },
	  registered: function (registry) {},
	  types: {
	    basic: function () { throw new Error('Abstract: implement!'); }
	  },
	  provide: function (options) {
	    if (options) {
	      var type = options[0],
	          regexp, matched, args,
	          argumentData = slice.call(arguments, 1);
	      if (type) {
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
	
	Pro.Registry.StreamProvider.prototype = Pro.U.ex(Object.create(Pro.Registry.Provider.prototype), {
	  constructor: Pro.Registry.StreamProvider,
	  registered: function (registry) {
	    registry.s = registry.stream = Pro.U.bind(this, this.get);
	  },
	  types: {
	    basic: function () { return new Pro.Stream(); },
	    delayed: function (args) { return new Pro.DelayedStream(parseInt(args[0], 10)); },
	    size: function (args) { return new Pro.SizeBufferedStream(parseInt(args[0], 10)); },
	    debouncing: function (args) { return new Pro.DebouncingStream(parseInt(args[0], 10)); },
	    throttling: function (args) { return new Pro.ThrottlingStream(parseInt(args[0], 10)); }
	  }
	});
	
	Pro.Registry.FunctionProvider.prototype = Pro.U.ex(Object.create(Pro.Registry.Provider.prototype), {
	  constructor: Pro.Registry.FunctionProvider
	});
	
	Pro.Registry.ProObjectProvider.prototype = Pro.U.ex(Object.create(Pro.Registry.Provider.prototype), {
	  constructor: Pro.Registry.ProObjectProvider,
	  registered: function (registry) {
	    registry.po = registry.proObject = Pro.U.bind(this, this.get);
	    registry.prob = P.U.bind(this, function (key, val, meta) {
	      return this.make(key, null, val, meta);
	    });
	  },
	  types: {
	    basic: function (options, value, meta) {
	      return Pro.prob(value, meta);
	    }
	  }
	});
	
	streamProvider = new Pro.Registry.StreamProvider();
	functionProvider = new Pro.Registry.FunctionProvider();
	proObjectProvider = new Pro.Registry.ProObjectProvider();
	
	Pro.registry = new Pro.Registry()
	  .register('s', streamProvider)
	  .register('po', proObjectProvider)
	  .register('obj', proObjectProvider)
	  .register('f', functionProvider)
	  .register('l', functionProvider);
	
	return Pro;
}));