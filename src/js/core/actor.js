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
 *        {@link ProAct.flow} is used.
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
