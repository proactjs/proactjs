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

    this.update(null, actions, [op, index, spliced, newItems]);
  },

  updateByDiff: function (array) {
    var j, diff = P.U.diff(array, this.shell._array), cdiff;

    for (j in diff) {
      cdiff = diff[j];
      if (cdiff) {
        this.updateSplice(j, cdiff.o, cdiff.n);
      }
    }
  },

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
