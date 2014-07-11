/**
 * <p>
 *  Creates a queue of {@link ProAct.Queue}s. The order of these sub-queues is used
 *  to determine the order in which they will be dequed.
 * </p>
 * <p>
 *  The idea of this class is to have different queues for the different layers
 *  of an application. That way lower level actions will always execuded before higher level.
 * </p>
 * <p>
 *  If a higher level queue enques actions in lower level one, the action flow returns stops and returns
 *  from the lower level one.
 * </p>
 * <p>
 *  The {@link ProAct.Queues#go} method deques all the actions from all the queues and executes them in the right
 *  order, using their priorities and queue order.
 * </p>
 * <p>
 *  A ProAct.Queues can be used to setup very complex the action flow.
 *  ProAct.js uses it with only one queue - 'proq' to create an action flow if something changes.
 * </p>
 *
 * TODO We need to pass before, after and error callbacks here too. ~meddle@2014-07-10
 *
 * @class ProAct.Queues
 * @param {Array} queueNames
 *      Array with the names of the sub-queues. The size of this array determines
 *      the number of the sub-queues.
 * @param {Object} options
 *    Various options for the ProAct.Queues.
 *    <p>Available options:</p>
 *    <ul>
 *      <li>queue - An options object containing options to be passed to all the sub-queues. For more information see {@link ProAct.Queue}.</li>
 *    </ul>
 * @see {@link ProAct.Queue}
 * @see {@link ProAct.Flow}
 */
ProAct.Queues = P.QQ = function (queueNames, options) {
  if (!queueNames) {
    queueNames = ['proq'];
  }

  this.queueNames = queueNames;
  this.options = options || {};

  this._queues = {};

  var i, ln = this.queueNames.length;
  for (i = 0; i < ln; i++) {
    this._queues[this.queueNames[i]] = new P.Q(this.queueNames[i], this.options.queue);
  }
};

P.QQ.prototype = {

  /**
   * Reference to the constructor of this object.
   *
   * @memberof ProAct.Queues
   * @instance
   * @constant
   * @type {Object}
   * @default ProAct.Queues
   */
  constructor: ProAct.Queues,

  /**
   * Checks if this ProAct.Queues is empty.
   *
   * @memberof ProAct.Queues
   * @instance
   * @method isEmpty
   * @return {Boolean}
   *      True if there are no actions in any of the sub-queues.
   */
  isEmpty: function () {
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
  },

  /**
   * Pushes an action to a sub-queue.
   * This method can enque the same action multiple times and always with priority of '1'.
   * <p>
   *  ProAct.Queues#defer, ProAct.Queues#enque and ProAct.Queues#add are aliases of this method.
   * </p>
   *
   * @memberof ProAct.Queues
   * @instance
   * @method push
   * @param {String} queueName
   *      The name of the queue to enque the action in.
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
   *      The action to enque.
   *      <p>
   *        If there is no context and the action is passed in place of the context,
   *        this parameter can hold the arguments of the action.
   *      </p>
   * @param {Array} args
   *      Arguments to be passed to the action when it is executed.
   * @see {@link ProAct.Queue#push}
   */
  push: function (queueName, context, action, args) {
    if (queueName && !P.U.isString(queueName)) {
      args = action;
      action = context;
      context = queueName;
      queueName = this.queueNames[0];
    }
    if (!queueName) {
      queueName = this.queueNames[0];
    }

    var queue = this._queues[queueName];
    if (queue) {
      queue.push(context, action, args);
    }
  },

  /**
   * Pushes an action to a sub-queue only once.
   * <p>
   *  If the action is pushed for the second time using this method, instead of
   *  adding it to the sub-queue, its priority goes up and its arguments are updated.
   *  This means that this action will be executed after all the other actions, pushed only once.
   * </p>
   * <p>
   *  ProAct.Queues#deferOnce, ProAct.Queues#enqueOnce and ProAct.Queues#addOnce are aliases of this method.
   * </p>
   *
   * @memberof ProAct.Queues
   * @instance
   * @method pushOnce
   * @param {String} queueName
   *      The name of the queue to enque the action in.
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
   *      The action to enque.
   *      <p>
   *        If there is no context and the action is passed in place of the context,
   *        this parameter can hold the arguments of the action.
   *      </p>
   * @param {Array} args
   *      Arguments to be passed to the action when it is executed.
   * @see {@link ProAct.Queue#pushOnce}
   */
  pushOnce: function (queueName, context, action, args) {
    if (queueName && !P.U.isString(queueName)) {
      args = action;
      action = context;
      context = queueName;
      queueName = this.queueNames[0];
    }
    if (!queueName) {
      queueName = this.queueNames[0];
    }

    var queue = this._queues[queueName];
    if (queue) {
      queue.pushOnce(context, action, args);
    }
  },

  /**
   * Starts the action flow.
   * <p>
   *  Executes the actions in all the  sub-queues in the order they were enqued, but also uses the priorities
   *  to execute these with numerically higher priority after these with numerically lower priority.
   * </p>
   * <p>
   *  If some of the actions in the third queue pushes new actions to the second queue, the action flow returns
   *  to the second queue again and then continues through all the queues.
   * </p>
   * <p>
   *  ProAct.Queues#run and ProAct.Queues#flush are aliases of this method.
   * </p>
   *
   * @memberof ProAct.Queues
   * @instance
   * @method go
   * @param {String} queueName
   *      The name of the queue to begin from. Can be null and defaults to the first sub-queue.
   * @see {@link ProAct.Queues#push}
   * @see {@link ProAct.Queues#pushOnce}
   */
  go: function (queueName) {
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

      if ((prevQueueIndex = this._probePrevIndex(currentQueueIndex)) !== -1) {
        currentQueueIndex = prevQueueIndex;
        continue goloop;
      }

      currentQueueIndex = currentQueueIndex + 1;
    }
  },
  _probePrevIndex: function (startIndex) {
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
  }
};

P.QQ.prototype.defer = P.QQ.prototype.enque = P.QQ.prototype.add = P.QQ.prototype.push;
P.QQ.prototype.deferOnce = P.QQ.prototype.enqueOnce = P.QQ.prototype.addOnce = P.QQ.prototype.pushOnce;
P.QQ.prototype.flush = P.QQ.prototype.run = P.QQ.prototype.go;
