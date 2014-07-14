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
 * TODO listeners must be divided to types in one hash map.
 *
 * @class ProAct.Observable
 * @param {Array} transforms
 *      A list of transformation to be used on all incoming chages.
 */
ProAct.Observable = function (transforms) {
  this.listeners = [];
  this.errListeners = [];
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
   * @type {Object}
   * @default ProAct.Observable
   */
  constructor: ProAct.Observable,

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
   * @method makeListener
   * @default null
   * @return {Object}
   *      The <i>listener of this observer</i>.
   */
  makeListener: function () {
    return null;
  },

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
   * @method makeErrListener
   * @default null
   * @return {Object}
   *      The <i>error listener of this observer</i>.
   */
  makeErrListener: function () {
    return null;
  },

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
   * TODO The action is not used here, ProAct.Observable#listeners should be a set of collections. ~meddle@2014-07-12
   *
   * @memberof ProAct.Observable
   * @instance
   * @method on
   * @param {String} action
   *      The action to listen for. It is the default action if it is empty or skipped.
   *      <p>
   *        The action can be skipped and on its place as first parameter to be passed the <i>listener</i>.
   *      </p>
   * @param {Object} listener
   *      The listener to attach. It must be instance of Function or object with a <i>call</i> method.
   * @param {Array} listeners
   *      By default the listener is attached to the ProAct.Observable#listeners collection.
   *      This behavior can be changed by passing another collection here.
   * @return {ProAct.Observable}
   *      <b>this</b>
   */
  on: function (action, listener, listeners) {
    if (!P.U.isString(action)) {
      listener = action;
    }

    if (P.U.isArray(listeners)) {
      listeners.push(listener);
    } else {
      this.listeners.push(listener);
    }

    return this;
  },

  /**
   * Removes a <i>listener</i> from the passed <i>action</i>.
   *
   * @memberof ProAct.Observable
   * @instance
   * @method off
   * @param {String} action
   *      The action to stop listening for. It is the default action if it is empty or skipped.
   *      <p>
   *        The action can be skipped and on its place as first parameter to be passed the <i>listener</i>.
   *      </p>
   * @param {Object} listener
   *      The listener to detach. If it is skipped, null or undefined all the listeners are removed from this observable.
   * @param {Array} listeners
   *      By default the listener is detached from the ProAct.Observable#listeners collection.
   *      This behavior can be changed by passing another collection here.
   * @return {ProAct.Observable}
   *      <b>this</b>
   * @see {@link ProAct.Observable#on}
   */
  off: function (action, listener, listeners) {
    if (!action && !listener) {
      if (P.U.isArray(listeners)) {
        listeners.length = 0;
      } else {
        this.listeners = [];
      }
      return;
    }
    if (!P.U.isString(action)) {
      listener = action;
    }

    if (P.U.isArray(listeners)) {
      P.U.remove(listeners, listener);
    } else {
      P.U.remove(this.listeners, listener);
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
   * @param {String} action
   *      The action to listen for errors. It is the default action if it is empty or skipped.
   *      <p>
   *        The action can be skipped and on its place as first parameter to be passed the <i>listener</i>.
   *      </p>
   * @param {Object} listener
   *      The listener to attach. It must be instance of Function or object with a <i>call</i> method.
   * @return {ProAct.Observable}
   *      <b>this</b>
   * @see {@link ProAct.Observable#on}
   */
  onErr: function (action, listener) {
    return this.on(action, listener, this.errListeners);
  },

  /**
   * Removes an error <i>listener</i> from the passed <i>action</i>.
   *
   * @memberof ProAct.Observable
   * @instance
   * @method offErr
   * @param {String} action
   *      The action to stop listening for errors. It is the default action if it is empty or skipped.
   *      <p>
   *        The action can be skipped and on its place as first parameter to be passed the <i>listener</i>.
   *      </p>
   * @param {Object} listener
   *      The listener to detach. If it is skipped, null or undefined all the listeners are removed from this observable.
   * @return {ProAct.Observable}
   *      <b>this</b>
   * @see {@link ProAct.Observable#onErr}
   */
  offErr: function (action, listener) {
    return this.off(action, listener, this.errListeners);
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
   *  If the returned value is ProAct.Observable.BadValue, the next transformations are skipped and the updating
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
   * @param {Object} filteringFunction
   *      The filtering function or object with a call method, should return boolean.
   * @return {ProAct.Observable}
   *      <b>this</b>
   * @see {@link ProAct.Observable#transform}
   */
  accumulation: function (initVal, f) {
    var _this = this, val = initVal;
    return this.transform(function (newVal) {
      val = f.call(_this, val, newVal)
      return val;
    });
  },

  map: P.N,
  filter: P.N,
  accumulate: P.N,

  reduce: function (initVal, f) {
    return new P.Val(initVal).into(this.accumulate(initVal, f));
  },

  update: function (source, callbacks) {
    if (this.listeners.length === 0 && this.errListeners.length === 0 && this.parent === null) {
      return this;
    }

    var observable = this;
    if (!P.flow.isRunning()) {
      P.flow.run(function () {
        observable.willUpdate(source, callbacks);
      });
    } else {
      observable.willUpdate(source, callbacks);
    }
    return this;
  },

  willUpdate: function (source, callbacks) {
    var i, listener,
        listeners = P.U.isArray(callbacks) ? callbacks : this.listeners,
        length = listeners.length,
        event = this.makeEvent(source);

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

  defer: function (event, callback) {
    if (P.U.isFunction(callback)) {
      P.flow.pushOnce(callback, [event]);
    } else {
      P.flow.pushOnce(callback, callback.call, [event]);
    }
    return this;
  }
};
