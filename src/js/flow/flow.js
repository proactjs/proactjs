/**
 * The `proact-flow` provides executing functions in the right order in time.
 * Function execution can be deferred, there are priorities and turns.
 *
 * @module proact-flow
 * @main proact-flow
 */

/**
 * <p>
 *  Constructs the action flow of the ProAct.js; An action flow is a set of actions
 *  executed in the reactive environment, which order is determined by the dependencies
 *  between the reactive properties. The action flow puts on motion the data flow in the reactive
 *  ecosystem. Every change on a property triggers an action flow, which triggers the data flow.
 * </p>
 *  ProAct.Flow is inspired by the Ember's Backburner.js (https://github.com/ebryn/backburner.js).
 *  The defferences are the priority queues and some other optimizations like the the 'once' argument of the {{#crossLink "ProAct.Queue/go:method"}}{{/crossLink}} method.
 *  It doesn't include debouncing and timed defer of actions for now.
 * <p>
 *  ProAct.Flow is used to solve many of the problems in the reactive programming, for example the diamond problem.
 * </p>
 * <p>
 *  It can be used for other purposes too, for example to run rendering in a rendering queue, after all of the property updates.
 * </p>
 * <p>
 *  `ProAct.Flow`, {{#crossLink "ProAct.Queues"}}{{/crossLink}} and {{#crossLink "ProAct.Queue"}}{{/crossLink}} together form the `proact-flow` module of ProAct.
 * </p>
 *
 * TODO ProAct.Flow#start and ProAct.Flow#stop are confusing names - should be renamed to something like 'init' and 'exec'.
 *
 * @constructor
 * @class ProAct.Flow
 * @param {Array} queueNames
 *      Array with the names of the sub-queues of the {{#crossLink "ProAct.Queues"}}{{/crossLink}}es of the flow. The size of this array determines
 *      the number of the sub-queues.
 * @param {Object} options
 *    Various options for the ProAct.Flow.
 *    <p>Available options:</p>
 *    <ul>
 *      <li>start - A callback that will be called every time when the action flow starts.</li>
 *      <li>stop - A callback that will be called every time when the action flow ends.</li>
 *      <li>err - A callback that will be called if an error is thrown in the action flow.</li>
 *      <li>flowInstance - Options object for the current flow instance. The flow instances are of the class {{#crossLink "ProAct.Queues"}}{{/crossLink}}.</li>
 *    </ul>
 */
ProAct.Flow = P.F = function (queueNames, options) {
  this.setQueues(queueNames);

  this.options = options || {};

  this.flowInstance = null;
  this.flowInstances = [];

  this.pauseMode = false;

  try {
    Object.defineProperty(this, 'closingQueue', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: new ProAct.Queue('closing')
    });
  } catch (e) {
    this.closingQueue = new ProAct.Queue('closing');
  }
};

P.F.prototype = {

  /**
   * Reference to the constructor of this object.
   *
   * @property constructor
   * @type ProAct.Flow
   * @final
   * @for ProAct.Flow
   */
  constructor: ProAct.Flow,

  /**
   * Puts the `ProAct.Flow` in running mode, meaning actions can be defered in it.
   * <p>
   *  It creates a new flow instance - instance of {{#crossLink "ProAct.Queues"}}{{/crossLink}} and
   *  if there was a running instance, it is set to be the previous inctance.
   * </p>
   * <p>
   *  If a <i>start</i> callback was passed when this `ProAct.Flow` was being created,
   *  it is called with the new flow instance.
   * </p>
   * <p>
   *  `begin` is alias of this method.
   * </p>
   *
   * @for ProAct.Flow
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

    this.flowInstance = new P.Queues(queueNames, options.flowInstance);

    if (start) {
      start(this.flowInstance);
    }
  },

  /**
   * Appends a new queue name to the list of <i>this</i>' queues.
   * <p>
   *  When a new <i>flowInstance</i> is created the updated list will be used.
   * </p>
   *
   * @for ProAct.Flow
   * @instance
   * @method addQueue
   * @param {String} queueName
   *      The queue name to add.
   */
  addQueue: function (queueName) {
    this.queueNames.push(queueName);
  },

  /**
   * Sets the queue names of <i>this</i> flow.
   * <p>
   *  When a new <i>flowInstance</i> is created the new list will be used.
   * </p>
   *
   * @for ProAct.Flow
   * @instance
   * @method setQueues
   * @param {Array} queueNames
   *      Array with the names of the sub-queues of the {{#crossLink "ProAct.Queues"}}{{/crossLink}}es of the flow.
   *      The size of this array determines the number of the sub-queues.
   */
  setQueues: function (queueNames) {
    if (!queueNames) {
      queueNames = ['proq'];
    }
    this.queueNames = queueNames;
  },

  /**
   * Starts an action flow consisting of all the actions defered after the
   * last call of {{#crossLink "ProAct.Flow/start:method"}}{{/crossLink}} and then stops the `ProAct.Flow`.
   *
   * <p>
   *  If there is a current action flow instance, it is flushed, using the
   *  {{#crossLink "ProAct.Queues/go:method"}}{{/crossLink}} method.
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
   *  `end` is an alias for this method.
   * </p>
   *
   * @for ProAct.Flow
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
        this.closingQueue.go();
      }
    }
  },

  /**
   * Puts the flow in <i>pause mode</i>.
   * When the flow is paused actions that should be defered to be run in it
   * are skipped.
   *
   * @for ProAct.Flow
   * @instance
   * @method pause
   */
  pause: function () {
    this.pauseMode = true;
  },

  /**
   * Resumes the action flow if it is paused.
   * The flow becomes active again and actions can be pushed into it.
   *
   * @for ProAct.Flow
   * @instance
   * @method resume
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
   *  `go` and `flush` are aliases of this method.
   * </p>
   *
   * @for ProAct.Flow
   * @instance
   * @method run
   * @param {Object} context
   *      The value of <i>this</i> bound to the <i>callback</i> when it is executed.
   * @param {Function} callback
   *      The callback that will be invoked in a new running `ProAct.Flow`.
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
          if (!e.fromFlow) {
            e.fromFlow = true;
            err(e);
          } else {
            throw e;
          }
        }
      } else {
        callback.call(context);
      }
    } finally {
      this.stop();
    }
  },

  /**
   * Checks if there is an active {{#crossLink "ProAct.Queues"}}{{/crossLink}} instance in this `ProAct.Flow`.
   *
   * TODO This should be named 'isActive'.
   *
   * @for ProAct.Flow
   * @instance
   * @method isRunning
   */
  isRunning: function () {
    return this.flowInstance !== null && this.flowInstance !== undefined;
  },

  /**
   * Checks if this `ProAct.Flow` is paused.
   *
   * @for ProAct.Flow
   * @instance
   * @method isPaused
   */
  isPaused: function () {
    return this.isRunning() && this.pauseMode;
  },

  /**
   * Pushes an action to the flow.
   * This method can defer in the flow the same action multiple times.
   * <p>
   *  `defer`, `enque` and `add` are aliases of this method.
   * </p>
   * <p>
   *  If the flow is paused, the action will not be defered.
   * </p>
   *
   * TODO Errors should be put in constants!
   *
   * @for ProAct.Flow
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
   *  `deferOnce`, `enqueOnce` and `addOnce` are aliases of this method.
   * </p>
   * <p>
   *  If the flow is paused, the action will not be defered.
   * </p>
   *
   * @for ProAct.Flow
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
   * @throws {Error} <i>Not in running flow!</i>, if there is no action flow instance.
   */
  pushOnce: function (queueName, context, action, args) {
    if (!this.flowInstance) {
      throw new Error('Not in running flow!');
    }
    if (!this.isPaused()) {
      this.flowInstance.pushOnce(queueName, context, action, args);
    }
  },

  pushClose: function (context, action, args) {
    this.closingQueue.pushOnce(context, action, args);
  }
};

/**
 * The {{#crossLink "ProAct.Flow"}}{{/crossLink}} instance used by ProAct's property updates by default.
 * <p>
 *  It defines only one queue - the default one <i>proq</i>.
 * </p>
 * <p>
 *  Override this instance if you are creating a framework or toolset over ProAct.js.
 * </p>
 *
 * @property flow
 * @type ProAct.Flow
 * @for ProAct
 * @final
 */
ProAct.flow = new ProAct.Flow(['proq'], {
  err: function (e) {
    console.log(e);
  },
  flowInstance: {
    queue: {
      err: function (queue, e) {
        e.queue = queue;
        console.log(e);
      }
    }
  }
});

P.F.prototype.begin = P.F.prototype.start;
P.F.prototype.end = P.F.prototype.stop;
P.F.prototype.defer = P.F.prototype.enque = P.F.prototype.add = P.F.prototype.push;
P.F.prototype.deferOnce = P.F.prototype.enqueOnce = P.F.prototype.addOnce = P.F.prototype.pushOnce;
P.F.prototype.flush = P.F.prototype.go = P.F.prototype.run;
