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
ProAct.Event = function (source, target, type) {
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
