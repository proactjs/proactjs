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
   * Generates function wrapper around a normal function which sets
   * the {@link ProAct.ArrayCore#indexListener} of the index calling the function.
   * <p>
   *  This is used if the array is complex - contains other ProAct.js objects, and there should be special
   *  updates for their elements/properties.
   * </p>
   *
   * @memberof ProAct.ArrayCore
   * @instance
   * @method actionFunction
   * @param {Function} fun
   *      The source function.
   * @return {Function}
   *      The action function wrapper.
   * @see {@link ProAct.ArrayCore#indexListener}
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
   * @memberof ProAct.ArrayCore
   * @instance
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
   * Creates the <i>listener</i> of this ProAct.ArrayCore.
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
   * @memberof ProAct.Actor
   * @instance
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
   *      like {@link ProAct.Actor#on}, {@link ProAct.Actor#off}, {@link ProAct.Actor#update}, {@link ProAct.Actor#willUpdate}.
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
   * @see {@link ProAct.Actor#update}
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

    return ActorUtil.update.call(this, null, actions, [op, index, spliced, newItems]);
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
   * @see {@link ProAct.Actor#update}
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
