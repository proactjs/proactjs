/**
 * <p>
 *  Constructs the action flow of the ProAct.js; An action flow is a set of actions
 *  executed in the reactive environment, which order is determined by the dependencies
 *  between the reactive properties. The action flow puts on motion the data flow in the reactive
 *  ecosystem. Every change on a property triggers an action flow, which triggers the data flow.
 * </p>
 *  ProAct.Flow is inspired by the [Ember's Backburner.js]{@link https://github.com/ebryn/backburner.js}.
 *  The defferences are the priority queues and some other optimizations like the the 'once' argument of the {@link ProAct.Queue#go} method.
 *  It doesn't include debouncing and timed defer of actions for now.
 * <p>
 *  ProAct.Flow is used to solve many of the problems in the reactive programming, for example the diamond problem.
 * </p>
 * <p>
 *  It can be used for other purposes too, for example to run rendering in a rendering queue, after all of the property updates.
 * </p>
 * <p>
 *  ProAct.Flow, {@link ProAct.Queues} and {@link ProAct.Queue} together form the ActionFlow module of ProAct.
 * </p>
 *
 * TODO ProAct.Flow#start and ProAct.Flow#stop are confusing names - should be renamed to something like 'init' and 'exec'.
 *
 * @class ProAct.Flow
 * @param {Array} queueNames
 *      Array with the names of the sub-queues of the {@link ProAct.Queues}es of the flow. The size of this array determines
 *      the number of the sub-queues.
 * @param {Object} options
 *    Various options for the ProAct.Flow.
 *    <p>Available options:</p>
 *    <ul>
 *      <li>start - A callback that will be called every time when the action flow starts.</li>
 *      <li>stop - A callback that will be called every time when the action flow ends.</li>
 *      <li>err - A callback that will be called if an error is thrown in the action flow.</li>
 *      <li>flowInstance - Options object for the current flow instance. The flow instances are @{link ProAct.Queues}es.</li>
 *    </ul>
 * @see {@link ProAct.Queues}
 * @see {@link ProAct.Queue}
 */
ProAct.Flow = P.F = function (queueNames, options) {
  if (!queueNames) {
    queueNames = ['proq'];
  }

  this.queueNames = queueNames;
  this.options = options || {};

  this.flowInstance = null;
  this.flowInstances = [];

  this.pauseMode = false;
};

P.F.prototype = {

  /**
   * Reference to the constructor of this object.
   *
   * @memberof ProAct.Flow
   * @instance
   * @constant
   * @type {Object}
   * @default ProAct.Flow
   */
  constructor: ProAct.Flow,

  /**
   * Puts the ProAct.Flow in running mode, meaning actions can be defered in it.
   * <p>
   *  It creates a new flow instance - instance of {@link ProAct.Queues} and
   *  if there was a running instance, it is set to be the previous inctance.
   * </p>
   * <p>
   *  If a <i>start</i> callback was passed when this ProAct.Flow was being created,
   *  it is called with the new flow instance.
   * </p>
   * <p>
   *  ProAct.Flow.begin is alias of this method.
   * </p>
   *
   * @memberof ProAct.Flow
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

    this.flowInstance = new Pro.Queues(queueNames, options.flowInstance);

    if (start) {
      start(this.flowInstance);
    }
  },

  /**
   * Starts an action flow consisting of all the actions defered after the
   * last call of {@link ProAct.Flow#start} and then stops the ProAct.Flow.
   *
   * <p>
   *  If there is a current action flow instance, it is flushed, using the
   *  {@link ProAct.Queues#go} method.
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
   *  ProAct.Flow#end is an alias for this method.
   * </p>
   *
   * @memberof ProAct.Flow
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
      }
    }
  },

  /**
   * Puts the flow in <i>pause mode</i>.
   * When the flow is paused actions that should be defered to be run in it
   * are skipped.
   *
   * @memberof ProAct.Flow
   * @instance
   * @method pause
   * @see {@link ProAct.Flow#push}
   * @see {@link ProAct.Flow#pushOnce}
   */
  pause: function () {
    this.pauseMode = true;
  },

  /**
   * Resumes the action flow if it is paused.
   * The flow becomes active again and actions can be pushed into it.
   *
   * @memberof ProAct.Flow
   * @instance
   * @method resume
   * @see {@link ProAct.Flow#pause}
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
   *  ProAct.Flow#go and ProAct.Flow#flush are aliases of this method.
   * </p>
   *
   * @memberof ProAct.Flow
   * @instance
   * @method run
   * @param {Object} context
   *      The value of <i>this</i> bound to the <i>callback</i> when it is executed.
   * @param {Function} callback
   *      The callback that will be invoked in a new running ProAct.Flow.
   * @see {@link ProAct.Flow#start}
   * @see {@link ProAct.Flow#stop}
   * @see {@link ProAct.Flow#push}
   * @see {@link ProAct.Flow#pushOnce}
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
          err(e);
        }
      } else {
        callback.call(context);
      }
    } finally {
      this.stop();
    }
  },

  /**
   * Checks if there is an active {@link ProAct.Queues} instance in this ProAct.Flow.
   *
   * TODO This should be named 'isActive'.
   *
   * @memberof ProAct.Flow
   * @instance
   * @method isRunning
   * @see {@link ProAct.Flow#start}
   * @see {@link ProAct.Flow#stop}
   */
  isRunning: function () {
    return this.flowInstance !== null && this.flowInstance !== undefined;
  },

  /**
   * Checks if this ProAct.Flow is paused.
   *
   * @memberof ProAct.Flow
   * @instance
   * @method isPaused
   * @see {@link ProAct.Flow#pause}
   * @see {@link ProAct.Flow#resume}
   */
  isPaused: function () {
    return this.isRunning() && this.pauseMode;
  },

  /**
   * Pushes an action to the flow.
   * This method can defer in the flow the same action multiple times.
   * <p>
   *  ProAct.Flow#defer, ProAct.Flow#enque and ProAct.Flow#add are aliases of this method.
   * </p>
   * <p>
   *  If the flow is paused, the action will not be defered.
   * </p>
   *
   * TODO Errors should be put in constants!
   *
   * @memberof ProAct.Flow
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
   * @see {@link ProAct.Queues#push}
   * @see {@link ProAct.Flow#isPaused}
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
   *  ProAct.Flow#deferOnce, ProAct.Flow#enqueOnce and ProAct.Flow#addOnce are aliases of this method.
   * </p>
   * <p>
   *  If the flow is paused, the action will not be defered.
   * </p>
   *
   * @memberof ProAct.Flow
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
   * @see {@link ProAct.Queues#pushOnce}
   * @see {@link ProAct.Flow#isPaused}
   * @throws {Error} <i>Not in running flow!</i>, if there is no action flow instance.
   */
  pushOnce: function (queueName, context, action, args) {
    if (!this.flowInstance) {
      throw new Error('Not in running flow!');
    }
    if (!this.isPaused()) {
      this.flowInstance.pushOnce(queueName, context, action, args);
    }
  }
};

/**
 * The {@link ProAct.Flow} instance used by ProAct's property updates by default.
 * <p>
 *  It defines only one queue - the default one <i>proq</i>.
 * </p>
 * <p>
 *   It has default error callback that outputs errors to the {@link ProAct.flow.errStream}, if defined.
 * </p>
 * <p>
 *  Override this instance if you are creating a framework or toolset over ProAct.js.
 * </p>
 *
 * @type ProAct.Flow
 * @memberof ProAct
 * @static
 */
ProAct.flow = new ProAct.Flow(['proq'], {
  err: function (e) {
    if (P.flow.errStream) {
      P.flow.errStream().triggerErr(e);
    } else {
      console.log(e);
    }
  },
  flowInstance: {
    queue: {
      err: function (queue, e) {
        if (P.flow.errStream) {
          P.flow.errStream().triggerErr(e);
        } else {
          console.log(e);
        }
      }
    }
  }
});

P.F.prototype.begin = P.F.prototype.start;
P.F.prototype.end = P.F.prototype.stop;
P.F.prototype.defer = P.F.prototype.enque = P.F.prototype.add = P.F.prototype.push;
P.F.prototype.deferOnce = P.F.prototype.enqueOnce = P.F.prototype.addOnce = P.F.prototype.pushOnce;
P.F.prototype.flush = P.F.prototype.go = P.F.prototype.run;
