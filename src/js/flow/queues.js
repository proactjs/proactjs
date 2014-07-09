Pro.Queues = function (queueNames, options) {
  if (!queueNames) {
    queueNames = ['proq'];
  }

  this.queueNames = queueNames;
  this.options = options || {};

  this._queues = {};

  var i, length = this.queueNames.length;
  for (i = 0; i < length; i++) {
    this._queues[this.queueNames[i]] = new Pro.Queue(this.queueNames[i], this.options.queue);
  }
};

Pro.Queues.prototype = {};

Pro.Queues.prototype.isEmpty = function () {
  var queues = this._queues,
      names = this.queueNames,
      length = names.length,
      i, currentQueueName, currentQueue;

  for (i = 0; i < length; i++) {
    currentQueueName = names[i];
    currentQueue = queues[currentQueueName];

    if (!currentQueue.isEmpty()) {
      return false;
    }
  }

  return true;
};

Pro.Queues.prototype.push = function (queueName, obj, method, args) {
  if (queueName && !Pro.Utils.isString(queueName)) {
    args = method;
    method = obj;
    obj = queueName;
    queueName = this.queueNames[0];
  }
  if (!queueName) {
    queueName = this.queueNames[0];
  }

  var queue = this._queues[queueName];
  if (queue) {
    queue.push(obj, method, args);
  }
};

Pro.Queues.prototype.pushOnce = function (queueName, obj, method, args) {
  if (queueName && !Pro.Utils.isString(queueName)) {
    args = method;
    method = obj;
    obj = queueName;
    queueName = this.queueNames[0];
  }
  if (!queueName) {
    queueName = this.queueNames[0];
  }

  var queue = this._queues[queueName];
  if (queue) {
    queue.pushOnce(obj, method, args);
  }
};

Pro.Queues.prototype.go = function (queueName) {
  var currentQueueIndex = 0,
      queues = this._queues,
      names = this.queueNames,
      i, length = this.queueNames.length,
      currentQueueName, currentQueue,
      prevQueueIndex;

  if (queueName) {
    for (i = 0; i < length; i++) {
      if (names[i] === queueName) {
        currentQueueIndex = i;
      }
    }
  }

  goloop:
  while (currentQueueIndex < length) {
    currentQueueName = names[currentQueueIndex];
    currentQueue = queues[currentQueueName];

    currentQueue.go(true);

    if ((prevQueueIndex = this.probePrevIndex(currentQueueIndex)) !== -1) {
      currentQueueIndex = prevQueueIndex;
      continue goloop;
    }

    currentQueueIndex = currentQueueIndex + 1;
  }

};

Pro.Queues.prototype.probePrevIndex = function (startIndex) {
  var queues = this._queues,
      names = this.queueNames,
      i, currentQueueName, currentQueue;

  for (i = 0; i <= startIndex; i++) {
    currentQueueName = names[i];
    currentQueue = queues[currentQueueName];

    if (!currentQueue.isEmpty()) {
      return i;
    }
  }

  return -1;
};
