Pro.Queue = function (name, options) {
  this.name = name || 'proq';
  this.options = options || {};

  this._queue = [];
};

Pro.Queue.runAction = function (queue, context, action, args, errHandler) {
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

Pro.U.ex(Pro.Queue.prototype, {
  constructor: Pro.Queue,
  length: function () {
    return this._queue.length / 4;
  },
  isEmpty: function () {
    return this.length() === 0;
  },
  push: function (obj, method, args) {
    if (obj && Pro.Utils.isFunction(obj)) {
      args = method;
      method = obj;
      obj = null;
    }

    this._queue.push(obj, method, args, 1);
  },
  pushOnce: function (obj, method, args) {
    if (obj && Pro.Utils.isFunction(obj)) {
      args = method;
      method = obj;
      obj = null;
    }

    var queue = this._queue, current, currentMethod,
        i, length = queue.length;

    for (i = 0; i < length; i += 4) {
      current = queue[i];
      currentMethod = queue[i + 1];

      if (current === obj && currentMethod === method) {
        queue[i + 2] = args;
        queue[i + 3] = queue[i + 3] + 1;
        return;
      }
    }

    this.push(obj, method, args);
  },
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
});
