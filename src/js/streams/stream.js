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
