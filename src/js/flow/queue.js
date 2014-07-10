/**
 * <p>
 *   Creates a queue of actions or action queue.
 * </p>
 * <p>
 *  The idea of the action queues is to decide the order of the actions pushed into them.
 *  For example if an action should be executed only once, but is pushed for a second time,
 *  it is moved in the end of the queue and its parameters are updated.
 * </p>
 * <p>
 *  The ProAct.Queue is a priority queue, meaning every action has a numeric priority.
 *  The actions with the numerically lowest priority are with highes prority when executed.
 * </p>
 * <p>
 *  The {@link ProAct.Queue#go} method deques all the actions from the queue and executes them in the right
 *  order, using their priorities.
 * </p>
 * <p>
 *  A Pro.Queue can be used to setup the action flow - the order of the actions must be executed.
 *  ProAct.js uses it to create an action flow if something changes.
 * </p>
 *
 * TODO Default name should be extracted to a constant. ~meddle@2014-07-10
 *
 * @class ProAct.Queue
 * @param {String} name
 *    The name of the queue, every ProAct.Queue must have a name.
 *    The default value of the name is 'proq'. {@link ProAct.Queues} uses the names to manage its queues.
 * @param {Object} options
 *    Various options for the queue.
 *    <p>Available options:</p>
 *    <ul>
 *      <li>before - A callback called before each call of {@link ProAct.Queue#go}.</li>
 *      <li>after - A callback called after each call of {@link ProAct.Queue#go}.</li>
 *      <li>err - A callback called every time an error is thrown.</li>
 *    </ul>
 * @see {@link ProAct.Queues}
 */
ProAct.Queue = P.Q = function (name, options) {
  this.name = name || 'proq';
  this.options = options || {};

  this._queue = [];
};

/**
 * Executes the passed <i>action</i>.
 *
 * @function runAction
 * @memberof ProAct.Queue
 * @static
 * @param {Pro.Queue} queue
 *      The queue managing the action to execute.
 * @param {Object} context
 *      The context in which the action should be executed.
 *      <p>
 *        The action is a normal JavaScript function and the context is the object
 *        that should be bound to <i>this</i> when calling it.
 *      </p>
 *      <p>
 *        It can be null or undefined.
 *      </p>
 * @param {Function} action
 *      The action to execute.
 * @param {Array} args
 *      The parameters to be passed to the action.
 * @param {Function} errHandler
 *      It is called if an error is thrown when executing the action.
 *      <p>
 *        It can be null if the error should be catched from the outside.
 *      </p>
 */
ProAct.Queue.runAction = function (queue, context, action, args, errHandler) {
  if (args && args.length > 0) {
    if (errHandler) {
      try {
        action.apply(context, args);
      } catch (e) {
        errHandler(queue, e);
      }
    } else {
      action.apply(context, args);
    }
  } else {
    if (errHandler) {
      try {
        action.call(context);
      } catch(e) {
        errHandler(queue, e);
      }
    } else {
      action.call(context);
    }
  }
};

P.Q.prototype = {

  /**
   * Reference to the constructor of this object.
   *
   * @memberof ProAct.Queue
   * @instance
   * @constant
   * @type {Object}
   * @default ProAct.Queue
   */
  constructor: ProAct.Queue,

  /**
   * Retrieves the lenght of this ProAct.Queue.
   *
   * @memberof ProAct.Queue
   * @instance
   * @method length
   * @return {Number}
   *      The number of actions queued in this queue.
   */
  length: function () {
    return this._queue.length / 4;
  },

  /**
   * Checks if this ProAct.Queue is empty.
   *
   * @memberof ProAct.Queue
   * @instance
   * @method isEmpty
   * @return {Boolean}
   *      True if there are no actions in this queue.
   */
  isEmpty: function () {
    return this.length() === 0;
  },

  /**
   * Pushes an action to this queue.
   * This method can enque the same action multiple times and always with priority of '1'.
   * <p>
   *  ProAct.Queue#defer, ProAct.Queue#enque and ProAct.Queue#add are aliases of this method.
   * </p>
   *
   * @memberof ProAct.Queue
   * @instance
   * @method push
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
   */
  push: function (context, action, args) {
    if (context && P.U.isFunction(context)) {
      args = action;
      action = context;
      context = null;
    }

    this._queue.push(context, action, args, 1);
  },

  /**
   * Pushes an action to this queue only once.
   * <p>
   *  If the action is pushed for the second time using this method, instead of
   *  adding it to the queue, it priority is goes up and its arguments are updated.
   *  This means that this action will be executed after all the other actions, pushed only once.
   * </p>
   * <p>
   *  ProAct.Queue#deferOnce, ProAct.Queue#enqueOnce and ProAct.Queue#addOnce are aliases of this method.
   * </p>
   *
   * @memberof ProAct.Queue
   * @instance
   * @method pushOnce
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
   * @see {@link ProAct.Queue.push}
   */
  pushOnce: function (context, action, args) {
    if (context && Pro.Utils.isFunction(context)) {
      args = action;
      action = context;
      context = null;
    }

    var queue = this._queue, current, currentMethod,
        i, length = queue.length;

    for (i = 0; i < length; i += 4) {
      current = queue[i];
      currentMethod = queue[i + 1];

      if (current === context && currentMethod === action) {
        queue[i + 2] = args;
        queue[i + 3] = queue[i + 3] + 1;
        return;
      }
    }

    this.push(context, action, args);
  },

  /**
   * Starts the action flow.
   * <p>
   *  Executes the actions in this queue in the order they were enqued, but also uses the priorities
   *  to execute these with numerically higher priority after these with numerically lower priority.
   * </p>
   * <p>
   *  If some of the actions enques new actions in this queue and the parameter <i>once</i> is set to false
   *  this method is recursively called executing the new actions.
   * </p>
   * <p>
   *  ProAct.Queue#run is alias of this method.
   * </p>
   *
   * @memberof ProAct.Queue
   * @instance
   * @method go
   * @param {Boolean} once
   *      True if 'go' should not be called for actions generated by the executed ones.
   * @see {@link ProAct.Queue.push}
   * @see {@link ProAct.Queue.pushOnce}
   */
  go: function (once) {
    var queue = this._queue,
        options = this.options,
        runs = this.runs,
        length = queue.length,
        before = options && options.before,
        after = options && options.after,
        err = options && options.err,
        i, l = length, going = true, priority = 1,
        tl = l,
        obj, method, args, prio;

    if (length && before) {
      before(this);
    }

    while (going) {
      going = false;
      l = tl;
      for (i = 0; i < l; i += 4) {
        obj = queue[i];
        method = queue[i + 1];
        args = queue[i + 2];
        prio = queue[i + 3];

        if (prio === priority) {
          Pro.Queue.runAction(this, obj, method, args, err);
        } else if (prio > priority) {
          going = true;
          tl = i + 4;
        }
      }
      priority = priority + 1;
    }

    if (length && after) {
      after(this);
    }

    if (queue.length > length) {
      this._queue = queue.slice(length);

      if (!once) {
        this.go();
      }
    } else {
      this._queue.length = 0;
    }
  }
};

P.Q.prototype.defer = P.Q.prototype.enque = P.Q.prototype.add = P.Q.prototype.push;
P.Q.prototype.deferOnce = P.Q.prototype.enqueOnce = P.Q.prototype.addOnce = P.Q.prototype.pushOnce;
P.Q.prototype.run = P.Q.prototype.go;
