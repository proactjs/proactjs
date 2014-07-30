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
