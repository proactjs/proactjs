/**
 * <p>
 *  Constructs a ProAct.Val. The ProAct.Vals are the simplest ProAct.js reactive objects, they have only one property - 'v' and all their methods,
 *  extended from {@link ProAct.Actor} delegate to it.
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
 * @extends ProAct.Actor
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

ProAct.Val.prototype = P.U.ex(Object.create(P.Actor.prototype), {

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
   *      The action/actions to listen for. If this parameter is skipped or null/undefined, the actions from {@link ProAct.Actor#defaultActions} are used.
   *      <p>
   *        The actions can be skipped and on their place as first parameter to be passed the <i>listener</i>.
   *      </p>
   * @param {Object} listener
   *      The listener to attach. It must be instance of Function or object with a <i>call</i> method.
   * @return {ProAct.Val}
   *      <b>this</b>
   * @see {@link ProAct.Actor#defaultActions}
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
   *  The listeners are reset using {@link ProAct.Actor#defaultListeners}.
   * </p>
   *
   * @memberof ProAct.Val
   * @instance
   * @method off
   * @param {Array|String} actions
   *      The action/actions to stop listening for. If this parameter is skipped or null/undefined, the actions from {@link ProAct.Actor#defaultActions} are used.
   *      <p>
   *        The actions can be skipped and on their place as first parameter to be passed the <i>listener</i>.
   *      </p>
   * @param {Object} listener
   *      The listener to detach. If it is skipped, null or undefined all the listeners are removed.
   * @return {ProAct.Val}
   *      <b>this</b>
   * @see {@link ProAct.Actor#defaultActions}
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
   *  If the returned value is {@link ProAct.Actor.BadValue}, the next transformations are skipped and the updating
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
   * @see {@link ProAct.Actor.transform}
   */
  transform: function (transformation) {
    this.__pro__.properties.v.transform(transformation);
    return this;
  },

  /**
   * Links source {@link ProAct.Actor}s into the {@link ProAct.Property} managing the 'v' field of <i>this</i>.
   * This means that the property is listening for changes from the <i>sources</i>.
   *
   * @memberof ProAct.Val
   * @instance
   * @method into
   * @param [...]
   *      Zero or more source {@link ProAct.Actors} to set as sources.
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
   * @param {ProAct.Actor} destination
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
   *      The source of the update, for example update of {@link ProAct.Actor},
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
   * @see {@link ProAct.Actor#update}
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
   *  It uses the {@link ProAct.Actor#defer} to defer the listeners of the listening {@link ProAct.Actor}s.
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
   *      The source of the update, for example update of {@link ProAct.Actor},
   *      that the {@link ProAct.Property} managing the 'v' field of <i>this</i> is observing.
   *      <p>
   *        Can be null - no source.
   *      </p>
   *      <p>
   *        In the most cases {@link ProAct.Event} is the source.
   *      </p>
   * @param {Array|String} actions
   *      A list of actions or a single action to update the listeners that listen to it.
   *      If there is no action provided, the actions from {@link ProAct.Actor#defaultActions} are used.
   * @param {Array} eventData
   *      Data to be passed to the event to be created.
   * @return {ProAct.Val}
   *      <i>this</i>
   * @see {@link ProAct.Actor#defer}
   * @see {@link ProAct.Property#makeEvent}
   * @see {@link ProAct.Actor#defaultActions}
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
