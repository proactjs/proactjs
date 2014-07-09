Pro.Flow = function (queueNames, options) {
  if (!queueNames) {
    queueNames = ['proq'];
  }

  this.queueNames = queueNames;
  this.options = options || {};

  this.flowInstance = null;
  this.flowInstances = [];

  this.pauseMode = false;
};

Pro.Flow.prototype = {
  constructor: Pro.Flow,
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
