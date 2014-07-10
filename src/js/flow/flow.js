/**
 * <p>
 *  Constructs the action flow of the ProAct.js; An action flow is a set of actions
 *  executed in the reactive environment, which order is determined by the dependencies
 *  between the reactive properties. The action flow puts on motion the data flow in the reactive
 *  ecosystem. Every change on a property triggers an action flow, which triggers the data flow.
 * </p>
 *  ProAct.Flow is a simple fork of the [Ember's Backburner.js]{@link https://github.com/ebryn/backburner.js}.
 *  The different things are the priority queues and some optimizations. It doesn't include debouncing and timed defer of actions.
 * <p>
 *  ProAct.Flow is used to solve many of the problems in the reactive programming, for example the diamond problem.
 * </p>
 * <p>
 *  It can be used for other purposes too, for exmple to run rendering in a rendering queue, after all of the property updates.
 * </p>
 * <p>
 *  ProAct.Flow, {@link ProAct.Queues} and {@link ProAct.Queue} together form the ActiveFlow module of ProAct.
 * </p>
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
   * Starts the action flow.
   * <p>
   *  It creates a new flow instance - instance of {@link ProAct.Queues} and
   *  if there was a running instance, it is set to be the previous inctance.
   * </p>
   * <p>
   *  If a <i>start</i> callback was passed when this ProAct.Flow was being created,
   *  it is called with the new flow instance.
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
  pause: function () {
    this.pauseMode = true;
  },
  resume: function () {
    this.pauseMode = false;
  },
  run: function (obj, method) {
    var options = this.options,
        err = options.err;

    this.start();
    if (!method) {
      method = obj;
      obj = null;
    }

    try {
      if (err) {
        try {
          method.call(obj);
        } catch (e) {
          err(e);
        }
      } else {
        method.call(obj);
      }
    } finally {
      this.stop();
    }
  },
  isRunning: function () {
    return this.flowInstance !== null && this.flowInstance !== undefined;
  },
  isPaused: function () {
    return this.isRunning() && this.pauseMode;
  },
  push: function (queueName, obj, method, args) {
    if (!this.flowInstance) {
      throw new Error('Not in running flow!');
    }
    if (!this.isPaused()) {
      this.flowInstance.push(queueName, obj, method, args);
    }
  },
  pushOnce: function (queueName, obj, method, args) {
    if (!this.flowInstance) {
      throw new Error('Not in running flow!');
    }
    if (!this.isPaused()) {
      this.flowInstance.pushOnce(queueName, obj, method, args);
    }
  }
};

Pro.flow = new Pro.Flow(['proq'], {
  err: function (e) {
    if (Pro.flow.errStream()) {
      Pro.flow.errStream().triggerErr(e);
    } else {
      console.log(e);
    }
  },
  flowInstance: {
    queue: {
      err: function (queue, e) {
        if (Pro.flow.errStream()) {
          Pro.flow.errStream().triggerErr(e);
        } else {
          console.log(e);
        }
      }
    }
  }
});
