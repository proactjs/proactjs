ProAct.Core = P.C = function (shell, meta) {
  this.shell = shell;
  this.state = P.States.init;
  this.meta = meta || {};

  P.Observable.call(this); // Super!
};

ProAct.Core.prototype = P.U.ex(Object.create(P.Observable.prototype), {
  constructor: ProAct.Core,
  prob: function () {
    try {
      this.setup();
      this.state = P.States.ready;
    } catch (e) {
      this.state = P.States.error;
      throw e;
    }

    return this;
  },
  setup: function () {
    throw Error('Abstract, implement!');
  },
  call: function (event) {
    this.update(event);
  }
});

