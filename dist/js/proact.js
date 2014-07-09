;(function (pro) {
	if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = pro();
	} else {
		window.Pro = pro();
	}
}(function() {
	var Pro = {},
	    arrayProto = Array.prototype,
	    concat = arrayProto.concat,
	    every = arrayProto.every,
	    filter = arrayProto.filter,
	    forEach = arrayProto.forEach,
	    indexOf = arrayProto.indexOf,
	    join = arrayProto.join,
	    lastIndexOf = arrayProto.lastIndexOf,
	    map = arrayProto.map,
	    pop = arrayProto.pop,
	    push = arrayProto.push,
	    reduce = arrayProto.reduce,
	    reduceRight = arrayProto.reduceRight,
	    reverse = arrayProto.reverse,
	    shift = arrayProto.shift,
	    slice = arrayProto.slice,
	    some = arrayProto.some,
	    sort = arrayProto.sort,
	    splice = arrayProto.splice,
	    toLocaleString = arrayProto.toLocaleString,
	    toString = arrayProto.toString,
	    unshift = arrayProto.unshift,
	    pArray, pArrayOps, pArrayProto, pArrayLs,
	    rProto,
	    dsl, dslOps,
	    opStoreAll,
	    streamProvider, functionProvider;
	
	Pro.States = {
	  init: 1,
	  ready: 2,
	  destroyed: 3,
	  error: 4
	};
	
	Pro.Utils = Pro.U = {
	  isFunction: function (property) {
	    return typeof(property) === 'function';
	  },
	  isString: function (property) {
	    return typeof(property) === 'string';
	  },
	  isObject: function (property) {
	    return typeof(property) === 'object';
	  },
	  isEmptyObject: function (object) {
	    var property;
	    for (property in object) {
	      if (object.hasOwnProperty(property)) {
	        return false;
	      }
	    }
	    return true;
	  },
	  isError: function (property) {
	    return property !== null && Pro.U.isObject(property) && property.message && Object.prototype.toString.apply(property) === '[object Error]';
	  },
	  isArray: function (property) {
	    return Pro.U.isObject(property) && Object.prototype.toString.call(property) === '[object Array]';
	  },
	  isProArray: function (property) {
	    return property !== null && Pro.U.isObject(property) && Pro.U.isArray(property._array) && property.length !== undefined;
	  },
	  isArrayObject: function (property) {
	    return Pro.U.isArray(property) || Pro.U.isProArray(property);
	  },
	  isProObject: function (property) {
	    return property && Pro.U.isObject(property) && property.__pro__ !== undefined && Pro.U.isObject(property.__pro__.properties);
	  },
	  isProVal: function (property) {
	    return Pro.U.isProObject(property) && property.__pro__.properties.v !== undefined;
	  },
	  ex: function(destination, source) {
	    var p;
	    for (p in source) {
	      if (source.hasOwnProperty(p)) {
	        destination[p] = source[p];
	      }
	    }
	    return destination;
	  },
	  bind: function (ctx, func) {
	    return function () {
	      return func.apply(ctx, arguments);
	    };
	  },
	  contains: function (array, value) {
	    array.indexOf(value) !== -1;
	  },
	  remove: function (array, value) {
	    var i = array.indexOf(value);
	    if (i > -1) {
	      array.splice(i, 1);
	    }
	  },
	  diff: function (array1, array2) {
	    var i, e1, e2,
	        index = -1,
	        l1 = array1.length,
	        l2 = array2.length,
	        diff = {};
	
	    if (l1 >= l2) {
	      for (i = 0; i < l2; i++) {
	        e1 = array1[i];
	        e2 = array2[i];
	
	        if (e1 !== e2) {
	          if (index === -1) {
	            index = i;
	          }
	          diff[index] = diff[index] || {o: [], n: []};
	          diff[index].o.push(e1);
	          diff[index].n.push(e2);
	        } else {
	          index = -1;
	        }
	      }
	
	      if (index === -1) {
	        index = i;
	      }
	      diff[index] = diff[index] || {o: [], n: []};
	      for (; i < l1; i++) {
	        e1 = array1[i];
	        diff[index].o.push(e1);
	      }
	    } else if (l2 > l1) {
	      diff = Pro.U.diff(array2, array1)
	      for (i in diff) {
	        el1 = diff[i];
	        el2 = el1.n;
	        el1.n = el1.o;
	        el1.o = el2;
	      }
	    }
	
	    return diff;
	  },
	  defValProp: function (obj, prop, enumerable, configurable, writable, val) {
	    try {
	      Object.defineProperty(obj, prop, {
	        enumerable: enumerable,
	        configurable: configurable,
	        writable: writable,
	        value: val
	      });
	    } catch (e) {
	      obj[prop] = val;
	    }
	  }
	};
	
	Pro.Configuration = {
	  keyprops: true,
	  keypropList: ['p']
	};
	
	Pro.N = function () {};
	
	Pro.currentCaller = null;
	
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
	
	Pro.Observable = function (transforms) {
	  this.listeners = [];
	  this.errListeners = [];
	  this.sources = [];
	
	  this.listener = null;
	  this.errListener = null;
	
	  this.transforms = transforms ? transforms : [];
	
	  this.parent = null;
	};
	
	Pro.U.ex(Pro.Observable, {
	  BadValue: {},
	  transform: function (observable, val) {
	    var i, t = observable.transforms, ln = t.length;
	    for (i = 0; i < ln; i++) {
	      val = t[i].call(observable, val);
	      if (val === Pro.Observable.BadValue) {
	        break;
	      }
	    }
	
	    return val;
	  }
	});
	
	Pro.Observable.prototype = {
	  constructor: Pro.Observable,
	
	  makeListener: function () {
	    return null;
	  },
	
	  makeErrListener: function () {
	    return null;
	  },
	
	  makeEvent: function (source) {
	    return new Pro.Event(source, this, Pro.Event.Types.value);
	  },
	
	  on: function (action, callback, callbacks) {
	    if (!Pro.U.isString(action)) {
	      callback = action;
	    }
	
	    if (Pro.U.isArray(callbacks)) {
	      callbacks.push(callback);
	    } else {
	      this.listeners.push(callback);
	    }
	
	    return this;
	  },
	
	  off: function (action, callback, callbacks) {
	    if (!action && !callback) {
	      if (Pro.U.isArray(callbacks)) {
	        callbacks.length = 0;
	      } else {
	        this.listeners = [];
	      }
	      return;
	    }
	    if (!Pro.U.isString(action)) {
	      callback = action;
	    }
	
	    if (Pro.U.isArray(callbacks)) {
	      Pro.U.remove(callbacks, callback);
	    } else {
	      Pro.U.remove(this.listeners, callback);
	    }
	
	    return this;
	  },
	
	  onErr: function (action, callback) {
	    return this.on(action, callback, this.errListeners);
	  },
	
	  offErr: function (action, callback) {
	    return this.off(action, callback, this.errListeners);
	  },
	
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
	
	  out: function (destination) {
	    destination.into(this);
	
	    return this;
	  },
	
	  offSource: function (source) {
	    Pro.U.remove(this.sources, source);
	    source.off(this.listener);
	    source.offErr(this.errListener);
	
	    return this;
	  },
	
	  transform: function (transformation) {
	    this.transforms.push(transformation);
	    return this;
	  },
	
	  mapping: function (f) {
	    return this.transform(f)
	  },
	
	  filtering: function(f) {
	    var _this = this;
	    return this.transform(function (val) {
	      if (f.call(_this, val)) {
	        return val;
	      }
	      return Pro.Observable.BadValue;
	    });
	  },
	
	  accumulation: function (initVal, f) {
	    var _this = this, val = initVal;
	    return this.transform(function (newVal) {
	      val = f.call(_this, val, newVal)
	      return val;
	    });
	  },
	
	  map: Pro.N,
	  filter: Pro.N,
	  accumulate: Pro.N,
	
	  reduce: function (initVal, f) {
	    return new Pro.Val(initVal).into(this.accumulate(initVal, f));
	  },
	
	  update: function (source, callbacks) {
	    if (this.listeners.length === 0 && this.errListeners.length === 0 && this.parent === null) {
	      return this;
	    }
	
	    var observable = this;
	    if (!Pro.flow.isRunning()) {
	      Pro.flow.run(function () {
	        observable.willUpdate(source, callbacks);
	      });
	    } else {
	      observable.willUpdate(source, callbacks);
	    }
	    return this;
	  },
	
	  willUpdate: function (source, callbacks) {
	    var i, listener,
	        listeners = Pro.U.isArray(callbacks) ? callbacks : this.listeners,
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
	    if (Pro.U.isFunction(callback)) {
	      Pro.flow.pushOnce(callback, [event]);
	    } else {
	      Pro.flow.pushOnce(callback, callback.call, [event]);
	    }
	    return this;
	  }
	};
	
	Pro.Event = function (source, target, type) {
	  this.source = source;
	  this.target = target;
	  this.type = type;
	  this.args = slice.call(arguments, 3);
	};
	
	Pro.Event.Types = {
	  value: 0,
	  array: 1,
	  close: 2,
	  error: 3
	};
	
	Pro.Stream = function (source, transforms) {
	  Pro.Observable.call(this, transforms);
	
	  if (source) {
	    this.into(source);
	  }
	};
	
	Pro.Stream.prototype = Pro.U.ex(Object.create(Pro.Observable.prototype), {
	  constructor: Pro.Stream,
	  makeEvent: function (source) {
	    return source;
	  },
	  makeListener: function (source) {
	    if (!this.listener) {
	      var stream = this;
	      this.listener = function (event) {
	        stream.trigger(event, true);
	      };
	    }
	
	    return this.listener;
	  },
	  makeErrListener: function (source) {
	    if (!this.errListener) {
	      var stream = this;
	      this.errListener = function (error) {
	        stream.triggerErr(error);
	      };
	    }
	
	    return this.errListener;
	  },
	  defer: function (event, callback) {
	    if (callback.property) {
	      Pro.Observable.prototype.defer.call(this, event, callback);
	      return;
	    }
	
	    if (Pro.Utils.isFunction(callback)) {
	      Pro.flow.push(callback, [event]);
	    } else {
	      Pro.flow.push(callback, callback.call, [event]);
	    }
	  },
	  trigger: function (event, useTransformations) {
	    if (useTransformations === undefined) {
	      useTransformations = true;
	    }
	    return this.go(event, useTransformations);
	  },
	  triggerErr: function (err) {
	    return this.update(err, this.errListeners);
	  },
	  go: function (event, useTransformations) {
	    var i, tr = this.transforms, ln = tr.length;
	
	    if (useTransformations) {
	      try {
	        event = Pro.Observable.transform(this, event);
	      } catch (e) {
	        this.triggerErr(e);
	        return this;
	      }
	    }
	
	    if (event === Pro.Observable.BadValue) {
	      return this;
	    }
	
	    return this.update(event);
	  },
	  map: function (f) {
	    return new Pro.Stream(this).mapping(f);
	  },
	  filter: function (f) {
	    return new Pro.Stream(this).filtering(f);
	  },
	  accumulate: function (initVal, f) {
	    return new Pro.Stream(this).accumulation(initVal, f);
	  },
	  merge: function (stream) {
	    return new Pro.Stream().into(this, stream);
	  }
	});
	
	Pro.U.ex(Pro.Flow.prototype, {
	  errStream: function () {
	    if (!this.errStreamVar) {
	      this.errStreamVar = new Pro.Stream();
	    }
	
	    return this.errStreamVar;
	  }
	});
	
	Pro.BufferedStream = function (source, transforms, size, delay) {
	  Pro.Stream.call(this, source, transforms);
	  this.buffer = [];
	};
	
	Pro.BufferedStream.prototype = Pro.U.ex(Object.create(Pro.Stream.prototype), {
	  flush: function () {
	    var _this = this, i, b = this.buffer, ln = b.length;
	    Pro.flow.run(function () {
	      for (i = 0; i < ln; i+= 2) {
	        _this.go(b[i], b[i+1]);
	      }
	      _this.buffer = [];
	    });
	  }
	});
	Pro.BufferedStream.prototype.constructor = Pro.BufferedStream;
	
	Pro.SizeBufferedStream = function (source, transforms, size) {
	  if (arguments.length === 1 && typeof source === 'number') {
	    size = source;
	    source = null;
	  } else if (arguments.length === 2 && typeof transforms === 'number') {
	    size = transforms;
	    transforms = null;
	  }
	  Pro.BufferedStream.call(this, source, transforms);
	
	  if (!size) {
	    throw new Error('SizeBufferedStream must contain size!');
	  }
	
	  this.size = size;
	};
	
	Pro.SizeBufferedStream.prototype = Pro.U.ex(Object.create(Pro.BufferedStream.prototype), {
	  trigger: function (event, useTransformations) {
	    this.buffer.push(event, useTransformations);
	
	    if (this.size !== null && (this.buffer.length / 2) === this.size) {
	      this.flush();
	    }
	  }
	});
	Pro.SizeBufferedStream.prototype.constructor = Pro.SizeBufferedStream;
	
	Pro.U.ex(Pro.Stream.prototype, {
	  bufferit: function (size) {
	    return new Pro.SizeBufferedStream(this, size);
	  }
	});
	
	Pro.DelayedStream = function (source, transforms, delay) {
	  if (typeof source === 'number') {
	    delay = source;
	    source = null;
	  } else if (Pro.U.isObject(source) && typeof transforms === 'number') {
	    delay = transforms;
	    transforms = null;
	  }
	  Pro.BufferedStream.call(this, source, transforms);
	
	  this.delayId = null;
	  this.setDelay(delay);
	};
	
	Pro.DelayedStream.prototype = Pro.U.ex(Object.create(Pro.BufferedStream.prototype), {
	  trigger: function (event, useTransformations) {
	    this.buffer.push(event, useTransformations);
	  },
	  cancelDelay: function () {
	    if (this.delayId !== null){
	      clearInterval(this.delayId);
	      this.delayId = null;
	    }
	  },
	  setDelay: function (delay) {
	    this.delay = delay;
	    this.cancelDelay();
	
	    if (!this.delay) {
	      return;
	    }
	
	    var _this = this;
	    this.delayId = setInterval(function () {
	      _this.flush();
	    }, this.delay);
	  }
	});
	Pro.DelayedStream.prototype.constructor = Pro.DelayedStream;
	
	Pro.U.ex(Pro.Stream.prototype, {
	  delay: function (delay) {
	    return new Pro.DelayedStream(this, delay);
	  }
	});
	
	Pro.ThrottlingStream = function (source, transforms, delay) {
	  Pro.DelayedStream.call(this, source, transforms, delay);
	};
	
	Pro.ThrottlingStream.prototype = Pro.U.ex(Object.create(Pro.DelayedStream.prototype), {
	  trigger: function (event, useTransformations) {
	    this.buffer = [];
	    this.buffer.push(event, useTransformations);
	  }
	});
	Pro.ThrottlingStream.prototype.constructor = Pro.ThrottlingStream;
	
	Pro.U.ex(Pro.Stream.prototype, {
	  throttle: function (delay) {
	    return new Pro.ThrottlingStream(this, delay);
	  }
	});
	
	Pro.DebouncingStream = function (source, transforms, delay) {
	  Pro.DelayedStream.call(this, source, transforms, delay);
	};
	
	Pro.DebouncingStream.prototype = Pro.U.ex(Object.create(Pro.DelayedStream.prototype), {
	  trigger: function (event, useTransformations) {
	    this.buffer = [];
	    this.cancelDelay();
	    this.setDelay(this.delay);
	    this.buffer.push(event, useTransformations);
	  }
	});
	Pro.DebouncingStream.prototype.constructor = Pro.DebouncingStream;
	
	Pro.U.ex(Pro.Stream.prototype, {
	  debounce: function (delay) {
	    return new Pro.DebouncingStream(this, delay);
	  }
	});
	
	Pro.Array = pArray = function () {
	  if (arguments.length === 0) {
	    this._array = [];
	  } else if (arguments.length === 1 && Pro.U.isArray(arguments[0])) {
	    this._array = arguments[0];
	  } else {
	    this._array = slice.call(arguments);
	  }
	
	  this.indexListeners = [];
	  this.lastIndexCaller = null;
	  this.lengthListeners = [];
	  this.lastLengthCaller = null;
	
	  var _this = this, getLength, setLength, i, oldLength;
	
	  getLength = function () {
	    _this.addCaller('length');
	
	    return _this._array.length;
	  };
	
	  setLength = function (newLength) {
	    if (_this._array.length === newLength) {
	      return;
	    }
	
	    oldLength = _this._array.length;
	    _this._array.length = newLength;
	
	    _this.update(pArrayOps.setLength, -1, oldLength, newLength);
	
	    return newLength;
	  };
	
	  Object.defineProperty(this, 'length', {
	    configurable: false,
	    enumerable: true,
	    get: getLength,
	    set: setLength
	  });
	  Object.defineProperty(this, '__pro__', {
	    enumerable: false,
	    configurable: false,
	    writeble: false,
	    value: {}
	  });
	  this.__pro__.state = Pro.States.init;
	
	  try {
	    for (i = 0; i < this._array.length; i++) {
	      this.defineIndexProp(i);
	    }
	
	    this.__pro__.state = Pro.States.ready;
	  } catch (e) {
	    this.__pro__.state = Pro.States.error;
	    throw e;
	  }
	};
	
	Pro.U.ex(pArray, {
	  Operations: {
	    set: 0,
	    add: 1,
	    remove: 2,
	    setLength: 3,
	    reverse: 4,
	    sort: 5,
	    splice: 6,
	
	    isIndexOp: function (op) {
	      return op === this.set || op === this.reverse || op === this.sort;
	    }
	  },
	  reFilter: function (original, filtered, filterArgs) {
	    var oarr = filtered._array;
	
	    filtered._array = filter.apply(original._array, filterArgs);
	    filtered.updateByDiff(oarr);
	  }
	});
	pArrayOps = pArray.Operations;
	
	Pro.Array.prototype = pArrayProto = Pro.U.ex(Object.create(arrayProto), {
	  constructor: Pro.Array,
	  on: function (action, listener) {
	    if (!Pro.U.isString(action)) {
	      listener = action;
	      action = 'change';
	    }
	
	    if (action === 'change') {
	      this.lengthListeners.push(listener);
	      this.indexListeners.push(listener);
	    } else if (action === 'lengthChange') {
	      this.lengthListeners.push(listener);
	    } else if (action === 'indexChange') {
	      this.indexListeners.push(listener);
	    }
	  },
	  off: function (action, listener) {
	    if (!Pro.U.isString(action)) {
	      listener = action;
	      action = 'change';
	    }
	
	    if (action === 'change') {
	      Pro.U.remove(listener, this.lengthListeners);
	      Pro.U.remove(listener, this.indexListeners);
	    } else if (action === 'lengthChange') {
	      Pro.U.remove(listener, this.lengthListeners);
	    } else if (action === 'indexChange') {
	      Pro.U.remove(listener, this.indexListeners);
	    }
	  },
	  addCaller: function (type) {
	    if (!type) {
	      this.addCaller('index');
	      this.addCaller('length');
	      return;
	    }
	    var caller = Pro.currentCaller,
	        capType = type.charAt(0).toUpperCase() + type.slice(1),
	        lastCallerField = 'last' + capType + 'Caller',
	        lastCaller = this[lastCallerField],
	        listeners = this[type + 'Listeners'];
	
	    if (caller && lastCaller !== caller && !Pro.U.contains(listeners, caller)) {
	      this.on(type + 'Change', caller);
	      this[lastCallerField] = caller;
	    }
	  },
	  defineIndexProp: function (i) {
	    var proArray = this,
	        array = proArray._array,
	        oldVal,
	        isA = Pro.U.isArray,
	        isO = Pro.U.isObject,
	        isF = Pro.U.isFunction;
	
	    if (isA(array[i])) {
	      new Pro.ArrayProperty(array, i);
	    } else if (isF(array[i])) {
	    } else if (array[i] === null) {
	    } else if (isO(array[i])) {
	      new Pro.ObjectProperty(array, i);
	    }
	
	    Object.defineProperty(this, i, {
	      enumerable: true,
	      configurable: true,
	      get: function () {
	        proArray.addCaller('index');
	
	        return array[i];
	      },
	      set: function (newVal) {
	        if (array[i] === newVal) {
	          return;
	        }
	
	        oldVal = array[i];
	        array[i] = newVal;
	
	        proArray.update(pArrayOps.set, i, oldVal, newVal);
	      }
	    });
	  },
	  makeEvent: function (op, ind, oldVal, newVal, source) {
	    return new Pro.Event(source, this,
	                         Pro.Event.Types.array, op, ind, oldVal, newVal);
	  },
	  willUpdate: function (op, ind, oldVal, newVal) {
	    var listeners = pArrayOps.isIndexOp(op) ? this.indexListeners : this.lengthListeners;
	
	    this.willUpdateListeners(listeners, op, ind, oldVal, newVal);
	  },
	  update: function (op, ind, oldVal, newVal) {
	    var _this = this;
	    if (Pro.flow.isRunning()) {
	      this.willUpdate(op, ind, oldVal, newVal);
	    } else {
	      Pro.flow.run(function () {
	        _this.willUpdate(op, ind, oldVal, newVal);
	      });
	    }
	  },
	  willUpdateSplice: function (index, spliced, newItems) {
	    var listeners, op = pArrayOps.splice;
	
	    if (!spliced || !newItems || (spliced.length === 0 && newItems.length === 0)) {
	      return;
	    }
	
	    if (spliced.length === newItems.length) {
	      listeners = this.indexListeners;
	    } else if (!newItems.length || !spliced.length) {
	      listeners = this.lengthListeners;
	    } else {
	      listeners = this.lengthListeners.concat(this.indexListeners);
	    }
	
	    this.willUpdateListeners(listeners, op, index, spliced, newItems);
	  },
	  updateSplice: function (index, sliced, newItems) {
	    var _this = this;
	    if (Pro.flow.isRunning()) {
	      this.willUpdateSplice(index, sliced, newItems);
	    } else {
	      Pro.flow.run(function () {
	        _this.willUpdateSplice(index, sliced, newItems);
	      });
	    }
	  },
	  willUpdateListeners: function (listeners, op, ind, oldVal, newVal) {
	    var length = listeners.length, i, listener,
	        event = this.makeEvent(op, ind, oldVal, newVal);
	
	    for (i = 0; i < length; i++) {
	      listener = listeners[i];
	
	      if (Pro.U.isFunction(listener)) {
	        Pro.flow.pushOnce(listener, [event]);
	      } else {
	        Pro.flow.pushOnce(listener, listener.call, [event]);
	      }
	
	      if (listener.property) {
	        listener.property.update(event);
	      }
	    }
	  },
	  updateByDiff: function (array) {
	    var _this = this,
	        j, diff = Pro.U.diff(array, this._array), cdiff;
	
	    for (j in diff) {
	      cdiff = diff[j];
	      if (cdiff) {
	        _this.updateSplice(j, cdiff.o, cdiff.n);
	      }
	    }
	  },
	  concat: function () {
	    var res, rightProArray;
	
	    if (arguments.length === 1 && Pro.U.isProArray(arguments[0])) {
	      rightProArray = arguments[0];
	      arguments[0] = rightProArray._array;
	    }
	
	    res = new Pro.Array(concat.apply(this._array, arguments));
	    if (rightProArray) {
	      this.on(pArrayLs.leftConcat(res, this, rightProArray));
	      rightProArray.on(pArrayLs.rightConcat(res, this, rightProArray));
	    } else {
	      this.on(pArrayLs.leftConcat(res, this, slice.call(arguments, 0)));
	    }
	
	    return res;
	  },
	  every: function () {
	    this.addCaller();
	
	    return every.apply(this._array, arguments);
	  },
	  pevery: function (fun, thisArg) {
	    var val = new Pro.Val(every.apply(this._array, arguments));
	
	    this.on(pArrayLs.every(val, this, arguments));
	
	    return val;
	  },
	  some: function () {
	    this.addCaller();
	
	    return some.apply(this._array, arguments);
	  },
	  psome: function (fun, thisArg) {
	    var val = new Pro.Val(some.apply(this._array, arguments));
	
	    this.on(pArrayLs.some(val, this, arguments));
	
	    return val;
	  },
	  forEach: function (fun /*, thisArg */) {
	    this.addCaller();
	
	    return forEach.apply(this._array, arguments);
	  },
	  filter: function (fun, thisArg) {
	    var filtered = new Pro.Array(filter.apply(this._array, arguments));
	    this.on(pArrayLs.filter(filtered, this, arguments));
	
	    return filtered;
	  },
	  map: function (fun, thisArg) {
	    var mapped = new Pro.Array(map.apply(this._array, arguments));
	    this.on(pArrayLs.map(mapped, this, arguments));
	
	    return mapped;
	  },
	  reduce: function (fun /*, initialValue */) {
	    this.addCaller();
	
	    return reduce.apply(this._array, arguments);
	  },
	  preduce: function (fun /*, initialValue */) {
	    var val = new Pro.Val(reduce.apply(this._array, arguments));
	    this.on(pArrayLs.reduce(val, this, arguments));
	
	    return val;
	  },
	  reduceRight: function (fun /*, initialValue */) {
	    this.addCaller();
	
	    return reduceRight.apply(this._array, arguments);
	  },
	  preduceRight: function (fun /*, initialValue */) {
	    var val = new Pro.Val(reduceRight.apply(this._array, arguments));
	    this.on(pArrayLs.reduceRight(val, this, arguments));
	
	    return val;
	  },
	  indexOf: function () {
	    this.addCaller();
	
	    return indexOf.apply(this._array, arguments);
	  },
	  pindexOf: function () {
	    var val = new Pro.Val(indexOf.apply(this._array, arguments));
	    this.on(pArrayLs.indexOf(val, this, arguments));
	
	    return val;
	  },
	  lastIndexOf: function () {
	    this.addCaller();
	
	    return lastIndexOf.apply(this._array, arguments);
	  },
	  plastindexOf: function () {
	    var val = new Pro.Val(lastIndexOf.apply(this._array, arguments));
	    this.on(pArrayLs.lastIndexOf(val, this, arguments));
	
	    return val;
	  },
	  join: function () {
	    this.addCaller();
	
	    return join.apply(this._array, arguments);
	  },
	  pjoin: function (separator) {
	    var reduced = this.preduce(function (i, el) {
	      return i + separator + el;
	    }, ''), res = new Pro.Val(function () {
	      if (!reduced.v) {
	        return '';
	      }
	      return reduced.v.substring(1);
	    });
	    return res;
	  },
	  toLocaleString: function () {
	    this.addCaller();
	
	    return toLocaleString.apply(this._array, arguments);
	  },
	  toString: function () {
	    this.addCaller();
	
	    return toString.apply(this._array, arguments);
	  },
	  valueOf: function () {
	    return this.toArray();
	  },
	  slice: function () {
	    var sliced = new Pro.Array(slice.apply(this._array, arguments));
	    this.on(pArrayLs.slice(sliced, this, arguments));
	
	    return sliced;
	  },
	  reverse: function () {
	    if (this._array.length === 0) {
	      return;
	    }
	    var reversed = reverse.apply(this._array, arguments), _this = this;
	
	    _this.update(pArrayOps.reverse, -1, null, null);
	    return reversed;
	  },
	  sort: function () {
	    if (this._array.length === 0) {
	      return;
	    }
	    var sorted = sort.apply(this._array, arguments), _this = this,
	        args = arguments;
	
	    _this.update(pArrayOps.sort, -1, null, args);
	    return sorted;
	  },
	  splice: function (index, howMany) {
	    var oldLn = this._array.length,
	        spliced = splice.apply(this._array, arguments),
	        ln = this._array.length, delta,
	        _this = this, newItems = slice.call(arguments, 2);
	
	    index = !~index ? ln - index : index
	    howMany = (howMany == null ? ln - index : howMany) || 0;
	
	    if (newItems.length > howMany) {
	      delta = newItems.length - howMany;
	      while (delta--) {
	        this.defineIndexProp(oldLn++);
	      }
	    } else if (howMany > newItems.length) {
	      delta = howMany - newItems.length;
	      while (delta--) {
	        delete this[--oldLn];
	      }
	    }
	
	    _this.updateSplice(index, spliced, newItems);
	    return new Pro.Array(spliced);
	  },
	  pop: function () {
	    if (this._array.length === 0) {
	      return;
	    }
	    var popped = pop.apply(this._array, arguments),
	        _this = this, index = this._array.length;
	
	    delete this[index];
	    _this.update(pArrayOps.remove, _this._array.length, popped, null);
	
	    return popped;
	  },
	  push: function () {
	    var vals = arguments, i, ln = arguments.length, index,
	        _this = this;
	
	    for (i = 0; i < ln; i++) {
	      index = this._array.length;
	      push.call(this._array, arguments[i]);
	      this.defineIndexProp(index);
	    }
	
	    _this.update(pArrayOps.add, _this._array.length - 1, null, slice.call(vals, 0));
	
	    return this._array.length;
	  },
	  shift: function () {
	    if (this._array.length === 0) {
	      return;
	    }
	    var shifted = shift.apply(this._array, arguments),
	        _this = this, index = this._array.length;
	
	    delete this[index];
	    _this.update(pArrayOps.remove, 0, shifted, null);
	
	    return shifted;
	  },
	  unshift: function () {
	    var vals = slice.call(arguments, 0), i, ln = arguments.length,
	        array = this._array,
	        _this = this;
	    for (var i = 0; i < ln; i++) {
	      array.splice(i, 0, arguments[i]);
	      this.defineIndexProp(array.length - 1);
	    }
	
	    _this.update(pArrayOps.add, 0, null, vals);
	
	    return array.length;
	  },
	  toArray: function () {
	    var result = [], i, ar = this._array, ln = ar.length, el,
	        isPA = Pro.U.isProArray;
	
	    for (i = 0; i < ln; i++) {
	      el = ar[i];
	      if (isPA(el)) {
	        el = el.toArray();
	      }
	
	      result.push(el);
	    }
	
	    return result;
	  },
	  toJSON: function () {
	    return JSON.stringify(this._array);
	  }
	});
	
	Pro.Array.Listeners = pArrayLs = Pro.Array.Listeners || {
	  check: function(event) {
	    if (event.type !== Pro.Event.Types.array) {
	      throw Error('Not implemented for non array events');
	    }
	  },
	  leftConcat: function (transformed, original, args) {
	    return function (event) {
	      pArrayLs.check(event);
	      var op    = event.args[0],
	          ind   = event.args[1],
	          ov    = event.args[2],
	          nv    = event.args[3],
	          argln = args.length,
	          nvs, toAdd;
	      if (op === pArrayOps.set) {
	        transformed[ind] = nv;
	      } else if (op === pArrayOps.add) {
	        nvs = slice.call(nv, 0);
	        if (ind === 0) {
	          pArrayProto.unshift.apply(transformed, nvs);
	        } else {
	          pArrayProto.splice.apply(transformed, [transformed._array.length - argln, 0].concat(nvs));
	        }
	      } else if (op === pArrayOps.remove) {
	        if (ind === 0) {
	          pArrayProto.shift.call(transformed, ov);
	        } else {
	          pArrayProto.splice.apply(transformed, [transformed._array.length - argln - 1, 1]);
	        }
	      } else if (op === pArrayOps.setLength) {
	        nvs = ov -nv;
	        if (nvs > 0) {
	          pArrayProto.splice.apply(transformed, [nv, nvs]);
	        } else {
	          toAdd = [ov, 0];
	          toAdd.length = 2 - nvs;
	          pArrayProto.splice.apply(transformed, toAdd);
	        }
	      } else if (op === pArrayOps.reverse || op === pArrayOps.sort) {
	        nvs = transformed._array;
	        if (Pro.Utils.isProArray(args)) {
	          toAdd = args._array;
	        } else {
	          toAdd = args;
	        }
	        transformed._array = concat.apply(original._array, toAdd);
	        transformed.updateByDiff(nvs);
	      } else if (op === pArrayOps.splice) {
	        pArrayProto.splice.apply(transformed, [ind, ov.length].concat(nv));
	      }
	    };
	  },
	  rightConcat: function (transformed, original, right) {
	    return function (event) {
	      pArrayLs.check(event);
	      var op    = event.args[0],
	          ind   = event.args[1],
	          ov    = event.args[2],
	          nv    = event.args[3],
	          oln   = original._array.length,
	          nvs;
	      if (op === pArrayOps.set) {
	        transformed[oln + ind] = nv;
	      } else if (op === pArrayOps.add) {
	        if (ind === 0) {
	          pArrayProto.splice.apply(transformed, [oln, 0].concat(nv));
	        } else {
	          pArrayProto.push.apply(transformed, nv);
	        }
	      } else if (op === pArrayOps.remove) {
	        if (ind === 0) {
	          pArrayProto.splice.call(transformed, oln, 1);
	        } else {
	          pArrayProto.pop.call(transformed, ov);
	        }
	      } else if (op === pArrayOps.setLength) {
	        transformed.length = oln + nv;
	      } else if (op === pArrayOps.reverse || op === pArrayOps.sort) {
	        nvs = transformed._array;
	        transformed._array = concat.apply(original._array, right._array);
	        transformed.updateByDiff(nvs);
	      } else if (op === pArrayOps.splice) {
	        pArrayProto.splice.apply(transformed, [ind + oln, ov.length].concat(nv));
	      }
	    };
	  },
	  every: function (val, original, args) {
	    var fun = args[0], thisArg = args[1];
	    return function (event) {
	      pArrayLs.check(event);
	      var op  = event.args[0],
	          ind = event.args[1],
	          ov  = event.args[2],
	          nv  = event.args[3],
	          ev;
	      if (op === pArrayOps.set) {
	        ev = fun.call(thisArg, nv);
	        if (val.valueOf() === true && !ev) {
	          val.v = false;
	        } else if (val.valueOf() === false && ev) {
	          val.v = every.apply(original._array, args);
	        }
	      } else if (op === pArrayOps.add) {
	        if (val.valueOf() === true) {
	          val.v = every.call(nv, fun, thisArg);
	        }
	      } else if (op === pArrayOps.remove) {
	        if (val.valueOf() === false && !fun.call(thisArg, ov)) {
	          val.v = every.apply(original._array, args);
	        }
	      } else if (op === pArrayOps.setLength) {
	        if (val.valueOf() === false) {
	          val.v = every.apply(original._array, args);
	        }
	      } else if (op === pArrayOps.splice) {
	        if (val.valueOf() === true) {
	          val.v = every.call(nv, fun, thisArg);
	        } else if (every.call(nv, fun, thisArg) && !every.call(ov, fun, thisArg)) {
	          val.v = every.apply(original._array, args);
	        }
	      }
	    };
	  },
	  some: function (val, original, args) {
	    var fun = args[0], thisArg = args[1];
	    return function (event) {
	      pArrayLs.check(event);
	      var op  = event.args[0],
	          ind = event.args[1],
	          ov  = event.args[2],
	          nv  = event.args[3],
	          sv;
	      if (op === pArrayOps.set) {
	        sv = fun.call(thisArg, nv);
	        if (val.valueOf() === false && sv) {
	          val.v = true;
	        } else if (val.valueOf() === true && !sv) {
	          val.v = some.apply(original._array, args);
	        }
	      } else if (op === pArrayOps.add) {
	        if (val.valueOf() === false) {
	          val.v = some.call(nv, fun, thisArg);
	        }
	      } else if (op === pArrayOps.remove) {
	        if (val.valueOf() === true && fun.call(thisArg, ov)) {
	          val.v = some.apply(original._array, args);
	        }
	      } else if (op === pArrayOps.setLength) {
	        if (val.valueOf() === true) {
	          val.v = some.apply(original._array, args);
	        }
	      } else if (op === pArrayOps.splice) {
	        if (val.valueOf() === false) {
	          val.v = some.call(nv, fun, thisArg);
	        } else if (some.call(ov, fun, thisArg) && !some.call(nv, fun, thisArg)) {
	          val.v = some.apply(original._array, args);
	        }
	      }
	    };
	  },
	  filter: function (filtered, original, args) {
	    var fun = args[0], thisArg = args[1];
	    return function (event) {
	      pArrayLs.check(event);
	      var op  = event.args[0],
	          ind = event.args[1],
	          ov  = event.args[2],
	          nv  = event.args[3],
	          napply, oapply, oarr,
	          nvs, fnvs, j, ln, diff;
	
	      if (op === pArrayOps.set) {
	        napply = fun.call(thisArg, nv);
	        oapply = fun.call(thisArg, ov);
	
	        if (oapply === true || napply === true) {
	          pArray.reFilter(original, filtered, args);
	        }
	      } else if (op === pArrayOps.add) {
	        fnvs = [];
	        nvs = slice.call(nv, 0);
	        ln = nvs.length;
	        if (ind === 0) {
	          j = ln - 1;
	          while(j >= 0) {
	            if (fun.apply(thisArg, [nvs[j], j, original._array])) {
	              fnvs.unshift(nvs[j]);
	            }
	            j--;
	          }
	
	          if (fnvs.length) {
	            pArrayProto.unshift.apply(filtered, fnvs);
	          }
	        } else {
	          j = 0;
	          while(j < ln) {
	            if (fun.apply(thisArg, [nvs[j], original._array.length - (ln - j), original._array])) {
	              fnvs.push(nvs[j]);
	            }
	            j++;
	          }
	
	          if (fnvs.length) {
	            pArrayProto.push.apply(filtered, fnvs);
	          }
	        }
	      } else if (op === pArrayOps.remove) {
	        if (fun.apply(thisArg, [ov, ind, original._array])) {
	          if (ind === 0) {
	            filtered.shift();
	          } else {
	            filtered.pop();
	          }
	        }
	      } else if (op === pArrayOps.setLength) {
	        pArray.reFilter(original, filtered, args);
	      } else if (op === pArrayOps.reverse) {
	        filtered.reverse();
	      } else if (op === pArrayOps.sort) {
	        pArrayProto.sort.apply(filtered, nv);
	      } else if (op === pArrayOps.splice) {
	        pArray.reFilter(original, filtered, args);
	      }
	    };
	  },
	  map: function (mapped, original, args) {
	    var fun = args[0], thisArg = args[1];
	    return function (event) {
	      pArrayLs.check(event);
	      var op  = event.args[0],
	          ind = event.args[1],
	          ov  = event.args[2],
	          nv  = event.args[3],
	          nvs, j, ln, mnvs;
	      if (op === pArrayOps.set) {
	        mapped[ind] = fun.call(thisArg, nv);
	      } else if (op === pArrayOps.add) {
	        mnvs = [];
	        nvs = slice.call(nv, 0);
	        ln = nvs.length;
	        if (ind === 0) {
	          j = ln - 1;
	          while(j >= 0) {
	            mnvs[j] = fun.apply(thisArg, [nvs[j], j, original._array]);
	            j--;
	          }
	
	          pArrayProto.unshift.apply(mapped, mnvs);
	        } else {
	          j = 0;
	          while(j < ln) {
	            mnvs[j] = fun.apply(thisArg, [nvs[j], original._array.length - (ln - j), original._array]);
	            j++;
	          }
	
	          pArrayProto.push.apply(mapped, mnvs);
	        }
	      } else if (op === pArrayOps.remove) {
	        if (ind === 0) {
	          mapped.shift();
	        } else {
	          mapped.pop();
	        }
	      } else if (op === pArrayOps.setLength) {
	        mapped.length = nv;
	      } else if (op === pArrayOps.reverse) {
	        mapped.reverse();
	      } else if (op === pArrayOps.sort) {
	        pArrayProto.sort.apply(mapped, nv);
	      } else if (op === pArrayOps.splice) {
	        mnvs = [];
	        j = 0;
	        while (j < nv.length) {
	          mnvs[j] = fun.apply(thisArg, [nv[j], (j + ind), original._array]);
	          j++;
	        }
	
	        pArrayProto.splice.apply(mapped, [
	          ind,
	          ov.length
	        ].concat(mnvs));
	      }
	    };
	  },
	  reduce: function (val, original, args) {
	    var oldLn = original._array.length, fun = args[0];
	    return function (event) {
	      pArrayLs.check(event);
	      var op  = event.args[0],
	          ind = event.args[1],
	          ov  = event.args[2],
	          nv  = event.args[3];
	      if ((op === pArrayOps.add && ind !== 0) ||
	         (op === pArrayOps.splice && ind >= oldLn && ov.length === 0)) {
	        val.v = reduce.apply(nv, [fun, val.valueOf()]);
	      } else {
	        val.v = reduce.apply(original._array, args);
	      }
	      oldLn = original._array.length;
	    };
	  },
	  reduceRight: function (val, original, args) {
	    var fun = args[0];
	    return function (event) {
	      pArrayLs.check(event);
	      var op  = event.args[0],
	          ind = event.args[1],
	          ov  = event.args[2],
	          nv  = event.args[3];
	      if ((op === pArrayOps.add && ind === 0) ||
	         (op === pArrayOps.splice && ind === 0 && ov.length === 0)) {
	        val.v = reduceRight.apply(nv, [fun, val.valueOf()]);
	      } else {
	        val.v = reduceRight.apply(original._array, args);
	      }
	    };
	  },
	  indexOf: function (val, original, args) {
	    var what = args[0], fromIndex = args[1], hasFrom = !!fromIndex;
	    return function (event) {
	      pArrayLs.check(event);
	      var op  = event.args[0],
	          ind = event.args[1],
	          ov  = event.args[2],
	          nv  = event.args[3],
	          v = val.valueOf(),
	          nvi, i;
	
	      if (op === pArrayOps.set) {
	        if (ov === what) {
	          val.v = indexOf.apply(original._array, args);
	        } else if (nv === what && (ind < v || v === -1) && (!hasFrom || ind >= fromIndex)) {
	          val.v = ind;
	        }
	      } else if (op === pArrayOps.add) {
	        nvi = nv.indexOf(what);
	        if (ind === 0) {
	          if (nvi !== -1 && (!hasFrom || ind >= fromIndex)) {
	            val.v = nvi;
	          } else if (v !== -1) {
	            val.v = v + nv.length;
	          }
	        } else if (v === -1 &&  (!hasFrom || ind >= fromIndex)) {
	          if (nvi !== -1) {
	            val.v = ind;
	          }
	        }
	      } else if (op === pArrayOps.remove) {
	        if (v !== -1) {
	          if (ind === 0) {
	            if (ov === what && !hasFrom) {
	              val.v = indexOf.apply(original._array, args);
	            } else {
	              val.v = v - 1;
	            }
	          } else if (what === ov) {
	            val.v = -1;
	          }
	        }
	      } else if (op === pArrayOps.setLength && nv <= v) {
	        val.v = -1;
	      } else if (op === pArrayOps.reverse || op === pArrayOps.sort) {
	        val.v = indexOf.apply(original._array, args);
	      } else if (op === pArrayOps.splice) {
	        nvi = nv.indexOf(what);
	        i = nvi + ind;
	        if (ind <= v) {
	          if (nvi !== -1 && i < v && (!hasFrom || fromIndex <= i)) {
	            val.v = i;
	          } else if (nv.length !== ov.length && ov.indexOf(what) === -1) {
	            v = v + (nv.length - ov.length);
	            if (!hasFrom || v >= fromIndex) {
	              val.v = v;
	            } else {
	              val.v = indexOf.apply(original._array, args);
	            }
	          } else {
	            val.v = indexOf.apply(original._array, args);
	          }
	        } else if (v === -1 && nvi !== -1) {
	          val.v = i;
	        }
	      }
	    };
	  },
	  lastIndexOf: function (val, original, args) {
	    var what = args[0], fromIndex = args[1], hasFrom = !!fromIndex;
	    return function (event) {
	      pArrayLs.check(event);
	      var op  = event.args[0],
	          ind = event.args[1],
	          ov  = event.args[2],
	          nv  = event.args[3],
	          v = val.valueOf(),
	          nvi, i;
	
	      if (op === pArrayOps.set) {
	        if (ov === what) {
	          val.v = lastIndexOf.apply(original._array, args);
	        } else if (nv === what && (ind > v || v === -1) && (!hasFrom || ind <= fromIndex)) {
	          val.v = ind;
	        }
	      } else if (op === pArrayOps.add) {
	        nvi = nv.indexOf(what);
	        if (ind === 0) {
	          if (nvi !== -1 && v === -1 && (!hasFrom || ind <= fromIndex)) {
	            val.v = nvi;
	          } else if (v !== -1) {
	            val.v = v + nv.length;
	          }
	        } else if (nvi !== -1 && (!hasFrom || (ind + nvi) <= fromIndex)) {
	          val.v = ind + nvi;
	        }
	      } else if (op === pArrayOps.remove) {
	        if (v !== -1) {
	          if (ind === 0) {
	            val.v = v - 1;
	          } else if (what === ov) {
	            val.v = lastIndexOf.apply(original._array, args);
	          }
	        }
	      } else if (op === pArrayOps.splice || op === pArrayOps.reverse || op === pArrayOps.sort || (op === pArrayOps.setLength && nv < ov)) {
	        val.v = lastIndexOf.apply(original._array, args);
	      }
	    };
	  },
	  slice: function (sliced, original, args) {
	    var s = args[0], e = args[1], hasEnd = !!e;
	    return function (event) {
	      pArrayLs.check(event);
	      var op  = event.args[0],
	          ind = event.args[1],
	          ov  = event.args[2],
	          nv  = event.args[3],
	          osl;
	      if (op === pArrayOps.set) {
	        if (ind >= s && (!hasEnd || ind < e)) {
	          sliced[ind - s] = nv;
	        }
	      } else {
	        osl = sliced._array;
	        sliced._array = slice.apply(original._array, args);
	        sliced.updateByDiff(osl);
	      }
	    };
	  }
	};
	
	Pro.Property = function (proObject, property, getter, setter) {
	  var _this = this;
	
	  Object.defineProperty(this, 'proObject', {
	    enumerable: false,
	    configurable: true,
	    writeble: true,
	    value: proObject
	  });
	  this.property = property;
	
	  if (!this.proObject['__pro__']) {
	    this.proObject['__pro__'] = {};
	  }
	  this.proObject['__pro__'].properties = this.proObject['__pro__'].properties || {};
	  this.proObject['__pro__'].properties[property] = this;
	
	  this.get = getter || Pro.Property.DEFAULT_GETTER(this);
	  this.set = setter || Pro.Property.DEFAULT_SETTER(this);
	
	  this.oldVal = null;
	  this.val = proObject[property];
	
	  this.state = Pro.States.init;
	  this.g = this.get;
	  this.s = this.set;
	
	  Pro.Observable.call(this); // Super!
	  this.parent = this.proObject.__pro__;
	
	  this.init();
	};
	
	Pro.U.ex(Pro.Property, {
	  Types: {
	    simple: 0, // strings, booleans and numbers
	    auto: 1, // functions - dependent
	    object: 2, // references Pro objects
	    array: 3, // arrays
	    nil: 4, // nulls
	
	    type: function (value) {
	      if (value === null) {
	        return Pro.Property.Types.nil;
	      } else if (Pro.U.isFunction(value)) {
	        return Pro.Property.Types.auto;
	      } else if (Pro.U.isArray(value)) {
	        return Pro.Property.Types.array;
	      } else if (Pro.U.isObject(value)) {
	        return Pro.Property.Types.object;
	      } else {
	        return Pro.Property.Types.simple;
	      }
	    }
	  },
	  DEFAULT_GETTER: function (property) {
	    return function () {
	      property.addCaller();
	
	      return property.val;
	    };
	  },
	  DEFAULT_SETTER: function (property, setter) {
	    return function (newVal) {
	      if (property.val === newVal) {
	        return;
	      }
	
	      property.oldVal = property.val;
	      if (setter) {
	        property.val = setter.call(property.proObject, newVal);
	      } else {
	        property.val = Pro.Observable.transform(property, newVal);
	      }
	
	      if (property.val === null || property.val === undefined) {
	        Pro.Property.reProb(property).update();
	        return;
	      }
	
	      property.update();
	    };
	  },
	  defineProp: function (obj, prop, get, set) {
	    Object.defineProperty(obj, prop, {
	      get: get,
	      set: set,
	      enumerable: true,
	      configurable: true
	    });
	  },
	  reProb: function (property) {
	    var po = property.proObject,
	        p = property.property,
	        l = property.listeners;
	
	    property.destroy();
	    return po.__pro__.makeProp(p, l);
	  }
	});
	
	Pro.Property.prototype = Pro.U.ex(Object.create(Pro.Observable.prototype), {
	  constructor: Pro.Property,
	  type: function () {
	    return Pro.Property.Types.simple;
	  },
	  makeEvent: function (source) {
	    return new Pro.Event(source, this.property, Pro.Event.Types.value, this.proObject, this.oldVal, this.val);
	  },
	  makeListener: function () {
	    if (!this.listener) {
	      var _this = this;
	      this.listener = {
	        property: _this,
	        call: function (newVal) {
	          if (newVal && newVal.type !== undefined && newVal.type === Pro.Event.Types.value && newVal.args.length === 3 && newVal.target) {
	            newVal = newVal.args[0][newVal.target];
	          }
	
	          _this.oldVal = _this.val;
	          _this.val = Pro.Observable.transform(_this, newVal);
	        }
	      };
	    }
	
	    return this.listener;
	  },
	  init: function () {
	    if (this.state !== Pro.States.init) {
	      return;
	    }
	
	    Pro.Property.defineProp(this.proObject, this.property, this.get, this.set);
	
	    this.afterInit();
	  },
	  afterInit: function () {
	    this.state = Pro.States.ready;
	  },
	  addCaller: function () {
	    var _this = this,
	        caller = Pro.currentCaller;
	
	    if (caller && caller.property !== this) {
	      this.on(caller);
	    }
	  },
	  destroy: function () {
	    if (this.state === Pro.States.destroyed) {
	      return;
	    }
	
	    delete this.proObject['__pro__'].properties[this.property];
	    this.listeners = undefined;
	    this.oldVal = undefined;
	    this.parent = undefined;
	
	    Object.defineProperty(this.proObject, this.property, {
	      value: this.val,
	      enumerable: true,
	      configurable: true
	    });
	    this.get = this.set = this.property = this.proObject = undefined;
	    this.g = this.s = undefined;
	    this.val = undefined;
	    this.state = Pro.States.destroyed;
	  },
	  toString: function () {
	    return this.val;
	  }
	});
	
	Pro.NullProperty = function (proObject, property) {
	  var _this = this,
	      set = Pro.Property.DEFAULT_SETTER(this),
	      setter = function (newVal) {
	        var result = set.call(_this.proObject, newVal),
	            types = Pro.Property.Types,
	            type = types.type(result);
	
	        if (type !== types.nil) {
	          Pro.Property.reProb(_this);
	        }
	
	        return result;
	      };
	
	  Pro.Property.call(this, proObject, property, Pro.Property.DEFAULT_GETTER(this), setter);
	};
	
	Pro.NullProperty.prototype = Pro.U.ex(Object.create(Pro.Property.prototype), {
	  constructor: Pro.NullProperty,
	
	  type: function () {
	    return Pro.Property.Types.nil;
	  }
	});
	
	Pro.AutoProperty = function (proObject, property) {
	  this.func = proObject[property];
	
	  var _this = this,
	      getter = function () {
	        _this.addCaller();
	        var oldCaller = Pro.currentCaller,
	            get = Pro.Property.DEFAULT_GETTER(_this),
	            set = Pro.Property.DEFAULT_SETTER(_this, function (newVal) {
	              return _this.func.call(_this.proObject, newVal);
	            }),
	            args = arguments,
	            autoFunction;
	
	        Pro.currentCaller = _this.makeListener();
	
	        autoFunction = function () {
	          _this.val = _this.func.apply(_this.proObject, args);
	        };
	        Pro.flow.run(function () {
	          Pro.flow.pushOnce(autoFunction);
	        });
	
	        Pro.currentCaller = oldCaller;
	
	        Pro.Property.defineProp(_this.proObject, _this.property, get, set);
	
	        _this.state = Pro.States.ready;
	
	        _this.val = Pro.Observable.transform(_this, _this.val);
	        return _this.val;
	      };
	
	  Pro.Property.call(this, proObject, property, getter, function () {});
	};
	
	Pro.AutoProperty.prototype = Pro.U.ex(Object.create(Pro.Property.prototype), {
	  constructor: Pro.AutoProperty,
	  type: function () {
	    return Pro.Property.Types.auto;
	  },
	  makeListener: function () {
	    if (!this.listener) {
	      var _this = this;
	      this.listener = {
	        property: _this,
	        call: function () {
	          _this.oldVal = _this.val;
	          _this.val = Pro.Observable.transform(_this, _this.func.call(_this.proObject));
	        }
	      };
	    }
	
	    return this.listener;
	  },
	  afterInit: function () {}
	});
	
	Pro.ObjectProperty = function (proObject, property) {
	  var _this = this, getter;
	
	  getter = function () {
	    _this.addCaller();
	    if (!_this.val.__pro__) {
	      Pro.prob(_this.val);
	    }
	
	    var get = Pro.Property.DEFAULT_GETTER(_this),
	        set = function (newVal) {
	          if (_this.val == newVal) {
	            return;
	          }
	
	          _this.oldVal = _this.val;
	          _this.val = newVal;
	
	          if (_this.val === null || _this.val === undefined) {
	            Pro.Property.reProb(_this).update();
	            return _this;
	          }
	
	          if (_this.oldVal) {
	            if (!_this.val.__pro__) {
	              Pro.prob(_this.val);
	            }
	
	            var oldProps = _this.oldVal.__pro__.properties,
	                newProps = _this.val.__pro__.properties,
	                oldPropName, oldProp, newProp, oldListeners, newListeners,
	                i, j, oldListenersLength, newListenersLength,
	                toAdd, toRemove = [], toRemoveLength;
	
	            for (oldPropName in oldProps) {
	              if (oldProps.hasOwnProperty(oldPropName)) {
	                newProp = newProps[oldPropName];
	                if (!newProp) {
	                  continue;
	                }
	                newListeners = newProp.listeners;
	
	                oldProp = oldProps[oldPropName];
	                oldListeners = oldProp.listeners;
	                oldListenersLength = oldListeners.length;
	
	                for (i = 0; i < oldListenersLength; i++) {
	                  toAdd = true;
	                  for (j = 0; j < newListenersLength; j++) {
	                    if (oldListeners[i] == newListeners[j]) {
	                      toAdd = false;
	                    }
	                  }
	                  if (toAdd) {
	                    newProp.on(oldListeners[i]);
	                    toRemove.push(i);
	                  }
	                }
	
	                toRemoveLength = toRemove.length;
	                for (i = 0; i < toRemoveLength; i++) {
	                  oldListeners.splice[toRemove[i], 1];
	                }
	                toRemove = [];
	              }
	            }
	          }
	
	          _this.update();
	        };
	
	    Pro.Property.defineProp(_this.proObject, _this.property, get, set);
	
	    _this.state = Pro.States.ready;
	    return _this.val;
	  };
	
	  Pro.Property.call(this, proObject, property, getter, function () {});
	};
	
	Pro.ObjectProperty.prototype = Pro.U.ex(Object.create(Pro.Property.prototype), {
	  constructor: Pro.ObjectProperty,
	  type: function () {
	    return Pro.Property.Types.object;
	  },
	  afterInit: function () {}
	});
	
	Pro.ArrayProperty = function (proObject, property) {
	  var _this = this, getter;
	
	  getter = function () {
	    _this.addCaller();
	    if (!Pro.Utils.isProArray(_this.val)) {
	      _this.val = new Pro.Array(_this.val);
	    }
	
	    var get = Pro.Property.DEFAULT_GETTER(_this),
	        set = function (newVal) {
	          if (_this.val == newVal || _this.val.valueOf() == newVal) {
	            return;
	          }
	
	          _this.oldVal = _this.val;
	          _this.val = newVal;
	
	          if (_this.val === null || _this.val === undefined) {
	            Pro.Property.reProb(_this).update();
	            return _this;
	          }
	
	          if (!Pro.Utils.isProArray(_this.val)) {
	            _this.val = new Pro.Array(_this.val);
	          }
	
	          if (_this.oldVal) {
	            var i, listener,
	                toRemove = [], toRemoveLength,
	                oldIndListeners = _this.oldVal.indexListeners,
	                oldIndListenersLn = oldIndListeners.length,
	                newIndListeners = _this.val.indexListeners,
	                oldLenListeners = _this.oldVal.lengthListeners,
	                oldLenListenersLn = oldLenListeners.length,
	                newLenListeners = _this.val.lengthListeners;
	
	            for (i = 0; i < oldIndListenersLn; i++) {
	              listener = oldIndListeners[i];
	              if (listener.property && listener.property.proObject === _this.proObject) {
	                newIndListeners.push(listener);
	                toRemove.push(i);
	              }
	            }
	            toRemoveLength = toRemove.length;
	            for (i = 0; i < toRemoveLength; i++) {
	              oldIndListeners.splice[toRemove[i], 1];
	            }
	            toRemove = [];
	
	            for (i = 0; i < oldLenListenersLn; i++) {
	              listener = oldLenListeners[i];
	              if (listener.property && listener.property.proObject === _this.proObject) {
	                newLenListeners.push(listener);
	                toRemove.push(i);
	              }
	            }
	            toRemoveLength = toRemove.length;
	            for (i = 0; i < toRemoveLength; i++) {
	              oldLenListeners.splice[toRemove[i], 1];
	            }
	            toRemove = [];
	          }
	
	          _this.update();
	        };
	
	    Pro.Property.defineProp(_this.proObject, _this.property, get, set);
	
	    _this.state = Pro.States.ready;
	    return _this.val;
	  };
	
	  Pro.Property.call(this, proObject, property, getter, function () {});
	};
	
	Pro.ArrayProperty.prototype = Pro.U.ex(Object.create(Pro.Property.prototype), {
	  constructor: Pro.ArrayProperty,
	  type: function () {
	    return Pro.Property.Types.array;
	  },
	  afterInit: function () {}
	});
	
	Pro.Core = function (object, meta) {
	  this.object = object;
	  this.properties = {};
	  this.state = Pro.States.init;
	  this.meta = meta || {};
	
	  Pro.Observable.call(this); // Super!
	};
	
	Pro.Core.prototype = Pro.U.ex(Object.create(Pro.Observable.prototype), {
	  constructor: Pro.Core,
	  prob: function () {
	    var _this = this, object = this.object,
	        conf = Pro.Configuration,
	        keyprops = conf.keyprops,
	        keypropList = conf.keypropList;
	
	    try {
	      for (property in object) {
	        this.makeProp(property, null, this.meta[property]);
	      }
	
	      if (keyprops && keypropList.indexOf('p') !== -1) {
	        Pro.U.defValProp(object, 'p', false, false, false, function (p) {
	          if (!p || p === '*') {
	            return _this;
	          }
	
	          return _this.properties[p];
	        });
	      }
	
	      this.state = Pro.States.ready;
	    } catch (e) {
	      this.state = Pro.States.error;
	      throw e;
	    }
	
	    return this;
	  },
	  call: function (event) {
	    this.update(event);
	  },
	  makeProp: function (property, listeners, meta) {
	    var object = this.object,
	        conf = Pro.Configuration,
	        keyprops = conf.keyprops,
	        keypropList = conf.keypropList,
	        isF = Pro.Utils.isFunction,
	        isA = Pro.Utils.isArrayObject,
	        isO = Pro.Utils.isObject, result;
	
	    if (meta && (meta === 'noprop' || (meta.indexOf && meta.indexOf('noprop') >= 0))) {
	      return;
	    }
	
	    if (keyprops && keypropList.indexOf(property) !== -1) {
	      throw Error('The property name ' + property + ' is a key word for pro objects! Objects passed to Pro.prob can not contain properties named as keyword properties.');
	      return;
	    }
	
	    if (object.hasOwnProperty(property) && (object[property] === null || object[property] === undefined)) {
	      result = new Pro.NullProperty(object, property);
	    } else if (object.hasOwnProperty(property) && !isF(object[property]) && !isA(object[property]) && !isO(object[property])) {
	      result = new Pro.Property(object, property);
	    } else if (object.hasOwnProperty(property) && isF(object[property])) {
	      result = new Pro.AutoProperty(object, property);
	    } else if (object.hasOwnProperty(property) && isA(object[property])) {
	      result = new Pro.ArrayProperty(object, property);
	    } else if (object.hasOwnProperty(property) && isO(object[property])) {
	      result = new Pro.ObjectProperty(object, property);
	    }
	
	    if (listeners) {
	      this.properties[property].listeners = this.properties[property].listeners.concat(listeners);
	    }
	
	    if (meta && Pro.registry) {
	      if (!Pro.U.isArray(meta)) {
	        meta = [meta];
	      }
	
	      Pro.registry.setup.apply(Pro.registry, [result].concat(meta));
	    }
	
	    return result;
	  },
	  set: function (property, value) {
	    var object = this.object;
	
	    object[property] = value;
	    if (this.properties[property]) {
	      return;
	    }
	
	    this.makeProp(property);
	  }
	});
	
	Pro.Val = function (val) {
	  this.v = val;
	
	  Pro.prob(this);
	};
	
	Pro.Val.prototype = Pro.U.ex(Object.create(Pro.Observable.prototype), {
	  type: function () {
	    return this.__pro__.properties.v.type();
	  },
	  on: function (action, listener) {
	    this.__pro__.properties.v.on(action, listener);
	    return this;
	  },
	  off: function (action, listener) {
	    this.__pro__.properties.v.off(action, listener);
	    return this;
	  },
	  onErr: function (action, listener) {
	    this.__pro__.properties.v.onErr(action, listener);
	    return this;
	  },
	  offErr: function (action, listener) {
	    this.__pro__.properties.v.offErr(action, listener);
	    return this;
	  },
	  transform: function (transformation) {
	    this.__pro__.properties.v.transform(transformation);
	    return this;
	  },
	  into: function (observable) {
	    this.__pro__.properties.v.into(observable);
	    return this;
	  },
	  out: function (observable) {
	    this.__pro__.properties.v.out(observable);
	    return this;
	  },
	  update: function (source) {
	    this.__pro__.properties.v.update(source);
	    return this;
	  },
	  willUpdate: function (source) {
	    this.__pro__.properties.v.willUpdate(source);
	    return this;
	  },
	  valueOf: function () {
	    return this.__pro__.properties.v.val;
	  },
	  toString: function () {
	    return this.valueOf().toString();
	  }
	});
	
	Pro.prob = function (object, meta) {
	  var core, property,
	      isAr = Pro.Utils.isArray;
	
	  if (object === null || (!Pro.U.isObject(object) && !isAr(object))) {
	    return new Pro.Val(object);
	  }
	
	  if (isAr(object)) {
	    return new Pro.Array(object);
	  }
	
	  core = new Pro.Core(object, meta);
	  Object.defineProperty(object, '__pro__', {
	    enumerable: false,
	    configurable: false,
	    writeble: false,
	    value: core
	  });
	
	  core.prob();
	
	  return object;
	};
	
	Pro.Registry = Pro.R = function () {
	  this.providers = {};
	};
	
	Pro.Registry.prototype = rProto = {
	  constructor: Pro.Registry,
	  register: function (namespace, provider) {
	    if (this.providers[namespace]) {
	      throw new Error(namespace + 'is already registered in this registry.');
	    }
	    this.providers[namespace] = provider;
	    if (provider.registered) {
	      provider.registered(this);
	    }
	    return this;
	  },
	  make: function (name, options) {
	    var args = slice.call(arguments, 2),
	        p = this.getProviderByName(name),
	        observable;
	
	    if (p[0]) {
	      observable = p[0].make.apply(p[0], [p[1], p[2]].concat(args));
	      return this.setup(observable, options, args);
	    }
	    return null;
	  },
	  setup: function (object, options, args) {
	    return dsl.run.apply(null, [object, options, this].concat(args));
	  },
	  store: function (name, object, options) {
	    var args = slice.call(arguments, 2),
	        p = this.getProviderByName(name);
	
	    if (p[0]) {
	      return p[0].store.apply(p[0], [p[1], object, p[2]].concat(args));
	    }
	    return null;
	  },
	  get: function (name) {
	    var p = this.getProviderByName(name);
	
	    if (p[0]) {
	      return p[0].get(p[1]);
	    }
	    return null;
	  },
	  getProviderByName: function (name) {
	    var parts = name.split(':');
	
	    return [this.providers[parts[0]], parts[1], parts.slice(2)];
	  },
	  toObjectArray: function (array) {
	    var _this = this;
	    if (!Pro.U.isArray(array)) {
	      return this.toObject(array);
	    }
	    return map.call(array, function (el) {
	      return _this.toObject(el);
	    });
	  },
	  toObject: function (data) {
	    if (Pro.U.isString(data)) {
	      var result = this.get(data);
	      return result ? result : data;
	    }
	
	    return data;
	  }
	};
	
	Pro.U.ex(Pro.Registry, {
	  Provider: function () {
	    this.stored = {};
	  },
	  StreamProvider: function () {
	    Pro.Registry.Provider.call(this);
	  },
	  FunctionProvider: function () {
	    Pro.Registry.Provider.call(this);
	  }
	});
	
	Pro.Registry.Provider.prototype = {
	  constructor: Pro.Registry.Provider,
	  make: function (key, options) {
	    var stream;
	    this.stored[key] = stream = this.provide(options);
	    return stream;
	  },
	  store: function (key, func, options) { return this.stored[key] = func; },
	  get: function (key) { return this.stored[key]; },
	  del: function(key) {
	    var deleted = this.get(key);
	    delete this.stored[key];
	    return deleted;
	  },
	  registered: function (registry) {},
	  types: {
	    basic: function () { throw new Error('Abstract: implement!'); }
	  },
	  provide: function (options) {
	    var type = options[0], regexp, matched, args;
	    if (type) {
	      regexp = new RegExp("(\\w*)\\(([\\s\\S]*)\\)");
	      matched = regexp.exec(type);
	      args = matched[2];
	      if (args) {
	        args = args.split(',');
	      }
	      type = matched[1];
	      if (type && this.types[type]) {
	        return this.types[type].call(this, args);
	      }
	    }
	
	    return this.types.basic(options);
	  }
	};
	
	Pro.Registry.StreamProvider.prototype = Pro.U.ex(Object.create(Pro.Registry.Provider.prototype), {
	  constructor: Pro.Registry.StreamProvider,
	  registered: function (registry) {
	    registry.s = registry.stream = Pro.U.bind(this, this.get);
	  },
	  types: {
	    basic: function () { return new Pro.Stream(); },
	    delayed: function (args) { return new Pro.DelayedStream(parseInt(args[0], 10)); },
	    size: function (args) { return new Pro.SizeBufferedStream(parseInt(args[0], 10)); },
	    debouncing: function (args) { return new Pro.DebouncingStream(parseInt(args[0], 10)); },
	    throttling: function (args) { return new Pro.ThrottlingStream(parseInt(args[0], 10)); }
	  }
	});
	
	Pro.Registry.FunctionProvider.prototype = Pro.U.ex(Object.create(Pro.Registry.Provider.prototype), {
	  constructor: Pro.Registry.FunctionProvider
	});
	
	streamProvider = new Pro.Registry.StreamProvider();
	functionProvider = new Pro.Registry.FunctionProvider();
	
	Pro.registry = new Pro.Registry()
	  .register('s', streamProvider)
	  .register('f', functionProvider)
	  .register('l', functionProvider);
	
	Pro.OpStore = {
	  all: {
	    simpleOp: function(name, sym) {
	      return {
	        sym: sym,
	        match: function (op) {
	          return op.substring(0, sym.length) === sym;
	        },
	        toOptions: function (actionObject, op) {
	          var reg = new RegExp(dslOps[name].sym + "(\\w*)\\(([\\s\\S]*)\\)"),
	              matched = reg.exec(op),
	              action = matched[1], args = matched[2],
	              opArguments = [],
	              realArguments = slice.call(arguments, 2),
	              predefined = dsl.predefined[name],
	              arg, i , ln, k;
	          if (action) {
	            opArguments.push(action);
	          }
	
	          if (args) {
	            args = args.split(',');
	            ln = args.length;
	            for (i = 0; i < ln; i++) {
	              arg = args[i].trim();
	              if (arg.charAt(0) === '$') {
	                arg = realArguments[parseInt(arg.substring(1), 10) - 1];
	              } else if (predefined && arg.charAt(0) === '&') {
	                i = arg.lastIndexOf('&');
	                k = arg.substring(0, i);
	                if (predefined[k]) {
	                  arg = predefined[k].call(null, arg.substring(i + 1));
	                }
	              } else if (predefined && predefined[arg]) {
	                arg = predefined[arg];
	              }
	              opArguments.push(arg);
	            }
	          }
	
	          actionObject[name] = opArguments;
	
	          actionObject.order = actionObject.order || [];
	          actionObject.order.push(name);
	        },
	        action: function (object, actionObject) {
	          if (!actionObject || !actionObject[name]) {
	            return object;
	          }
	
	          var args = actionObject[name];
	          if (!Pro.U.isArray(args)) {
	            args = [args];
	          }
	
	          return object[name].apply(object, args);
	        }
	      };
	    }
	  }
	};
	opStoreAll = Pro.OpStore.all;
	
	Pro.DSL = {
	  separator: '|',
	  ops: {
	    into: opStoreAll.simpleOp('into', '<<'),
	    out: opStoreAll.simpleOp('out', '>>'),
	    on: opStoreAll.simpleOp('on', '@'),
	    mapping: opStoreAll.simpleOp('mapping', 'map'),
	    filtering: opStoreAll.simpleOp('filtering', 'filter'),
	    accumulation: opStoreAll.simpleOp('accumulation', 'acc')
	  },
	  predefined: {
	    mapping: {
	      '-': function (el) { return -el; },
	      'pow': function (el) { return el * el; },
	      'sqrt': function (el) { return Math.sqrt(el); },
	      'int': function (el) { return parseInt(el, 10); },
	      '&.': function (arg) {
	        return function (el) {
	          var p = el[arg];
	          if (!p) {
	            return el;
	          } else if (Pro.U.isFunction(p)) {
	            return p.call(el);
	          } else {
	            return p;
	          }
	        };
	      }
	    },
	    filtering: {
	      'odd': function (el) { return el % 2 !== 0; },
	      'even': function (el) { return el % 2 === 0; },
	      '+': function (el) { return el >= 0; },
	      '-': function (el) { return el <= 0; }
	    },
	    accumulation: {
	      '+': [0, function (x, y) { return x + y; }],
	      '*': [1, function (x, y) { return x * y; }],
	      '+str': ['', function (x, y) { return x + y; }],
	    }
	  },
	  optionsFromString: function (optionString) {
	    return dsl.optionsFromArray.apply(null, [optionString.split(dsl.separator)].concat(slice.call(arguments, 1)));
	  },
	  optionsFromArray: function (optionArray) {
	    var result = {}, i, ln = optionArray.length,
	        ops = Pro.R.ops, op, opType;
	    for (i = 0; i < ln; i++) {
	      op = optionArray[i];
	      for (opType in Pro.DSL.ops) {
	        opType = Pro.DSL.ops[opType];
	        if (opType.match(op)) {
	          opType.toOptions.apply(opType, [result, op].concat(slice.call(arguments, 1)));
	          break;
	        }
	      }
	    }
	    return result;
	  },
	  run: function (observable, options, registry) {
	    var isS = Pro.U.isString,
	        args = slice.call(arguments, 3),
	        option, i, ln, opType;
	
	    if (options && isS(options)) {
	      options = dsl.optionsFromString.apply(null, [options].concat(args));
	    }
	
	    if (options && options instanceof Pro.Observable) {
	      options = {into: options};
	    }
	
	    if (options && options.order) {
	      ln = options.order.length;
	      for (i = 0; i < ln; i++) {
	        option = options.order[i];
	        if (opType = dslOps[option]) {
	          if (registry) {
	            options[option] = registry.toObjectArray(options[option]);
	          }
	
	          opType.action(observable, options);
	          delete options[option];
	        }
	      }
	    }
	
	    for (opType in dslOps) {
	      if (options && (option = options[opType])) {
	        options[opType] = registry.toObjectArray(option);
	      }
	      opType = dslOps[opType];
	      opType.action(observable, options);
	    }
	
	    return observable;
	  }
	};
	
	dsl = Pro.DSL;
	dslOps = dsl.ops;
	
	return Pro;
}));