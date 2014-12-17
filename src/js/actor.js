ActorUtil = {
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
 * <p>
 *  Constructs a ProAct.Actor. It can be used both as observer and observable.
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
 * </p>
 *
 * @class ProAct.Actor
 * @param {String} queueName
 *      The name of the queue all the updates should be pushed to.
 *      <p>
 *        If this parameter is null/undefined the default queue of
 *        {@link ProAct.flow} is used.
 *      </p>
 *      <p>
 *        If this parameter is not a string it is used as the
 *        <i>transforms</i>.
 *      </p>
 * @param {Array} transforms
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
   * @memberof ProAct.Actor
   * @type Object
   * @static
   * @constant
   */
  BadValue: {},

  /**
   * A constant defining closing or ending events.
   *
   * @memberof ProAct.Actor
   * @type Object
   * @static
   * @constant
   */
  Close: {},

  /**
   * Transforms the passed <i>val</i> using the ProAct.Actor#transforms of the passed <i>actor</i>.
   *
   * @function transforms
   * @memberof ProAct.Actor
   * @static
   * @param {ProAct.Actor} actor
   *      The ProAct.Actor which transformations should be used.
   * @param {Object} val
   *      The value to transform.
   * @return {Object}
   *      The transformed value.
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
   * @memberof ProAct.Actor
   * @instance
   * @constant
   * @default ProAct.Actor
   */
  constructor: ProAct.Actor,

  /**
   * Initializes this actor.
   * <p>
   *  This method logic is run only if the current state of <i>this</i> is {@link ProAct.States.init}.
   * </p>
   * <p>
   *  Then {@link ProAct.Actor#afterInit} is called to finish the initialization.
   * </p>
   *
   * @memberof ProAct.Actor
   * @instance
   * @method init
   * @see {@link ProAct.Actor#doInit}
   * @see {@link ProAct.Actor#afterInit}
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
   * @memberof ProAct.Actor
   * @instance
   * @method doInit
   * @see {@link ProAct.Actor#init}
   */
  doInit: function () {},

  /**
   * Called automatically after initialization of this actor.
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

  close: function () {
    if (this.state === P.States.closed) {
      return;
    }
    return ActorUtil.update.call(this, P.Actor.Close, 'close');
  },

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
   * @memberof ProAct.Actor
   * @instance
   * @abstract
   * @method beforeDestroy
   * @see {@link ProAct.Actor#destroy}
   */
  beforeDestroy: function () {
  },

  /**
   * Frees additional resources.
   *
   * @memberof ProAct.Actor
   * @instance
   * @abstract
   * @method doDestroy
   * @see {@link ProAct.Actor#destroy}
   */
  doDestroy: function () {
  },

  /**
   * Destroys this ProAct.Actor instance.
   * <p>
   *  The state of <i>this</i> is set to {@link ProAct.States.destroyed}.
   * </p>
   *
   * @memberof ProAct.Actor
   * @instance
   * @method destroy
   */
  destroy: function () {
    if (this.state === P.States.destroyed) {
      return;
    }

    this.beforeDestroy();
    this.doDestroy();

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
   * Checks if <i>this</i> can be closed.
   * <p>
   *  Defaults to return true.
   * </p>
   *
   * @memberof ProAct.Actor
   * @instance
   * @method canClose
   */
  canClose: function () {
    return true;
  },

  /**
   * Generates the initial listeners object. It can be overridden for alternative listeners collections.
   * It is used for resetting all the listeners too.
   *
   * @memberof ProAct.Actor
   * @instance
   * @method defaultListeners
   * @return {Object}
   *      A map containing the default listeners collections.
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
   * @memberof ProAct.Actor
   * @instance
   * @method defaultActions
   * @default 'change'
   * @return {Array|String}
   *      The actions to be used if no actions are provided to action related methods,
   *      like {@link ProAct.Actor#on}, {@link ProAct.Actor#off}, {@link ProAct.Actor#update}, {@link ProAct.Actor#willUpdate}.
   */
  defaultActions: function () {
    return 'change';
  },

  /**
   * Creates the <i>listener</i> of this actor.
   * Every actor should have one listener that should pass to other actors.
   * <p>
   *  This listener turns the actor in a observer.
   * </p>
   * <p>
   *  Should be overriden with specific listener, by default it returns null.
   * </p>
   *
   * @memberof ProAct.Actor
   * @instance
   * @abstract
   * @method makeListener
   * @default null
   * @return {Object}
   *      The <i>listener of this observer</i>.
   */
  makeListener: P.N,

  /**
   * Creates the <i>error listener</i> of this actor.
   * Every actor should have one error listener that should pass to other actors.
   * <p>
   *  This listener turns the actor in a observer for errors.
   * </p>
   * <p>
   *  Should be overriden with specific listener, by default it returns null.
   * </p>
   *
   * @memberof ProAct.Actor
   * @instance
   * @abstract
   * @method makeErrListener
   * @default null
   * @return {Object}
   *      The <i>error listener of this observer</i>.
   */
  makeErrListener: P.N,

  /**
   * Creates the <i>closing listener</i> of this actor.
   * Every actor should have one closing listener that should pass to other actors.
   * <p>
   *  This listener turns the actor in a observer for closing events.
   * </p>
   * <p>
   *  Should be overriden with specific listener, by default it returns null.
   * </p>
   *
   * @memberof ProAct.Actor
   * @instance
   * @abstract
   * @method makeCloseListener
   * @default null
   * @return {Object}
   *      The <i>closing listener of this observer</i>.
   */
  makeCloseListener: P.N,

  /**
   * Creates the <i>event</i> to be send to the listeners on update.
   * <p>
   *  The <i>event</i> should be an instance of {@link ProAct.Event}.
   * </p>
   * <p>
   *  By default this method returns {@link ProAct.Event.Types.value} event.
   * </p>
   *
   * @memberof ProAct.Actor
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
   * Attaches a new listener to this ProAct.Actor.
   * The listener may be function or object that defines a <i>call</i> method.
   *
   * @memberof ProAct.Actor
   * @instance
   * @method on
   * @param {Array|String} actions
   *      The action/actions to listen for. If this parameter is skipped or null/undefined, the actions from {@link ProAct.Actor#defaultActions} are used.
   *      <p>
   *        The actions can be skipped and on their place as first parameter to be passed the <i>listener</i>.
   *      </p>
   * @param {Object} listener
   *      The listener to attach. It must be instance of Function or object with a <i>call</i> method.
   * @return {ProAct.Actor}
   *      <b>this</b>
   * @see {@link ProAct.Actor#defaultActions}
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
   *  The listeners are reset using {@link ProAct.Actor#defaultListeners}.
   * </p>
   *
   * @memberof ProAct.Actor
   * @instance
   * @method off
   * @param {Array|String} actions
   *      The action/actions to stop listening for. If this parameter is skipped or null/undefined, the actions from {@link ProAct.Actor#defaultActions} are used.
   *      <p>
   *        The actions can be skipped and on their place as first parameter to be passed the <i>listener</i>.
   *      </p>
   * @param {Object} listener
   *      The listener to detach. If it is skipped, null or undefined all the listeners are removed from this actor.
   * @return {ProAct.Actor}
   *      <b>this</b>
   * @see {@link ProAct.Actor#on}
   * @see {@link ProAct.Actor#defaultActions}
   * @see {@link ProAct.Actor#defaultListeners}
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
   * The listener may be function or object that defines a <i>call</i> method.
   *
   * @memberof ProAct.Actor
   * @instance
   * @method onErr
   * @param {Object} listener
   *      The listener to attach. It must be instance of Function or object with a <i>call</i> method.
   * @return {ProAct.Actor}
   *      <b>this</b>
   * @see {@link ProAct.Actor#on}
   */
  onErr: function (listener) {
    return this.on('error', listener);
  },

  /**
   * Removes an error <i>listener</i> from the passed <i>action</i>.
   *
   * @memberof ProAct.Actor
   * @instance
   * @method offErr
   * @param {Object} listener
   *      The listener to detach. If it is skipped, null or undefined all the listeners are removed from this actor.
   * @return {ProAct.Actor}
   *      <b>this</b>
   * @see {@link ProAct.Actor#onErr}
   */
  offErr: function (listener) {
    return this.off('error', listener);
  },

  onClose: function (listener) {
    return this.on('close', listener);
  },

  offClose: function (listener) {
    return this.off('close', listener);
  },

  onAll: function (listener) {
    return this.on(listener).onClose(listener).onErr(listener);
  },

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
   *  The listeners from {@link ProAct.Actor#makeListener} and {@link ProAct.Actor#makeErrListener} are used.
   * </p>
   *
   * @memberof ProAct.Actor
   * @instance
   * @method into
   * @param [...]
   *      Zero or more source ProAct.Actors to set as sources.
   * @return {ProAct.Actor}
   *      <b>this</b>
   * @see {@link ProAct.Actor#makeListener}
   * @see {@link ProAct.Actor#makeErrListener}
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
   * The reverse of {@link ProAct.Actor#into} - sets <i>this actor</i> as a source
   * to the passed <i>destination</i> actor.
   *
   * @memberof ProAct.Actor
   * @instance
   * @method out
   * @param {ProAct.Actor} destination
   *      The actor to set as source <i>this</i> to.
   * @return {ProAct.Actor}
   *      <b>this</b>
   * @see {@link ProAct.Actor#into}
   */
  out: function (destination) {
    destination.into(this);

    return this;
  },

  /**
   * Adds a new <i>transformation</i> to the list of transformations
   * of <i>this actor</i>.
   * <p>
   *  A transformation is a function or an object that has a <i>call</i> method defined.
   *  This function or call method should have one argument and to return a transformed version of it.
   *  If the returned value is {@link ProAct.Actor.BadValue}, the next transformations are skipped and the updating
   *  value/event becomes - bad value.
   * </p>
   * <p>
   *  Every value/event that updates <i>this actor</i> will be transformed using the new transformation.
   * </p>
   *
   * @memberof ProAct.Actor
   * @instance
   * @method transform
   * @param {Object} transformation
   *      The transformation to add.
   * @return {ProAct.Actor}
   *      <b>this</b>
   * @see {@link ProAct.Actor.transform}
   */
  transform: function (transformation) {
    this.transforms.push(transformation);
    return this;
  },

  transformStored: function (transformation, type) {
    if (P.registry && P.U.isString(transformation)) {
      P.DSL.run(this, type + '(' + transformation + ')', P.registry);
      return this;
    }

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
   * @memberof ProAct.Actor
   * @instance
   * @method mapping
   * @param {Object} mappingFunction
   *      Function or object with a <i>call method</i> to use as map function.
   * @return {ProAct.Actor}
   *      <b>this</b>
   * @see {@link ProAct.Actor#transform}
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
   * @memberof ProAct.Actor
   * @instance
   * @method filtering
   * @param {Object} filteringFunction
   *      The filtering function or object with a call method, should return boolean.
   * @return {ProAct.Actor}
   *      <b>this</b>
   * @see {@link ProAct.Actor#transform}
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
   * @memberof ProAct.Actor
   * @instance
   * @method accumulation
   * @param {Object} initVal
   *      Initial value for the accumulation. For example '0' for sum.
   * @param {Object} accumulationFunction
   *      The function to accumulate.
   * @return {ProAct.Actor}
   *      <b>this</b>
   * @see {@link ProAct.Actor#transform}
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
   * @memberof ProAct.Actor
   * @instance
   * @abstract
   * @method map
   * @param {Object} mappingFunction
   *      Function or object with a <i>call method</i> to use as map function.
   * @return {ProAct.Actor}
   *      A new ProAct.Actor instance with the <i>mapping</i> applied.
   * @see {@link ProAct.Actor#mapping}
   */
  map: P.N,

  /**
   * Creates a new ProAct.Actor instance with source <i>this</i> and filtering
   * the passed <i>filtering function</i>.
   * <p>
   *  Should be overridden with creating the right actor.
   * </p>
   *
   * @memberof ProAct.Actor
   * @instance
   * @abstract
   * @method filter
   * @param {Object} filteringFunction
   *      The filtering function or object with a call method, should return boolean.
   * @return {ProAct.Actor}
   *      A new ProAct.Actor instance with the <i>filtering</i> applied.
   * @see {@link ProAct.Actor#filtering}
   */
  filter: P.N,

  /**
   * Creates a new ProAct.Actor instance with source <i>this</i> and accumulation
   * the passed <i>accumulation function</i>.
   * <p>
   *  Should be overridden with creating the right actor.
   * </p>
   *
   * @memberof ProAct.Actor
   * @instance
   * @abstract
   * @method accumulate
   * @param {Object} initVal
   *      Initial value for the accumulation. For example '0' for sum.
   * @param {Object} accumulationFunction
   *      The function to accumulate.
   * @return {ProAct.Actor}
   *      A new ProAct.Actor instance with the <i>accumulation</i> applied.
   * @see {@link ProAct.Actor#accumulation}
   */
  accumulate: P.N,

  /**
   * Generates a new {@link ProAct.Property} containing the state of an accumulations.
   * <p>
   *  The value will be updated with every update coming to this actor.
   * </p>
   *
   * @memberof ProAct.Actor
   * @instance
   * @method reduce
   * @param {Object} initVal
   *      Initial value for the accumulation. For example '0' for sum.
   * @param {Object} accumulationFunction
   *      The function to accumulate.
   * @return {ProAct.Property}
   *      A {@link ProAct.Property} instance observing <i>this</i> with the accumulation applied.
   * @see {@link ProAct.Actor#accumulate}
   * @see {@link ProAct.Property}
   */
  reduce: function (initVal, accumulationFunction) {
    return P.P.value(initVal).into(this.accumulate(initVal, accumulationFunction));
  },


  /**
   * Defers a ProAct.Actor listener.
   * <p>
   *  By default this means that the listener is put into active {@link ProAct.Flow} using it's
   *  {@link ProAct.Flow#pushOnce} method, but it can be overridden.
   * </p>
   *
   * @memberof ProAct.Actor
   * @instance
   * @method defer
   * @param {Object} event
   *      The event/value to pass to the listener.
   * @param {Object} listener
   *      The listener to defer. It should be a function or object defining the <i>call</i> method.
   * @return {ProAct.Actor}
   *      <i>this</i>
   * @see {@link ProAct.Actor#makeListener}
   * @see {@link ProAct.flow}
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
 * <p>
 *  Constructs a ProAct.Observable. It can be used both as observer and actor.
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
 * @deprecated since version 1.1.1. Use {@link ProAct.Actor} instead.
 * @see {@link ProAct.Actor}
 */
ProAct.Observable = ProAct.Actor;
