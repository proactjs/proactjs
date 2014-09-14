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

P.U.ex(ProAct.Event, {

  /**
   * Factory method for creating of new ProAct.Events with ease.
   * <p>
   *  NOTE: For now only works with arrays, because creating array events required a lot of code.
   * </p>
   *
   * @memberof ProAct.Event
   * @static
   * @param {ProAct.Event} source
   *      If there is an event that coused this event - it is the source. Can be null - no source.
   * @param {Object} target
   *      The thing that triggered this event.
   * @param {ProAct.Event.Types|String} type
   *      The type of the event. Can be string for ease.
   *      For now this method supports only {@link ProAct.Event.Types.array} events.
   *      It is possible to pass the string 'array' for type.
   * @param {Array} data
   *      Arguments of the event.
   * @return {ProAct.Event}
   *      The new event.
   * @see {@link ProAct.Event.makeArray}
   */
  make: function (source, target, type, data) {
    if (type === 'array' || type === P.E.Types.array) {
      return P.E.makeArray(data[0], data.slice(1));
    }
  },

  /**
   * Factory method for creating of new ProAct.Events of type ProAct.Event.Types.array  with ease.
   * <p>
   *  NOTE: For now only array modifying events can be created - remove and splice (you can trigger a value for add).
   * </p>
   *
   * @memberof ProAct.Event
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
   * @memberof ProAct.Event
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
