ProAct.Core = P.C = function (shell, meta) {
  this.shell = shell;
  this.state = P.States.init;
  this.meta = meta || {};
  this.properties = {};

  P.Observable.call(this); // Super!
};

ProAct.Core.prototype = P.U.ex(Object.create(P.Observable.prototype), {
  constructor: ProAct.Core,
  prob: function () {
    var self = this,
        conf = P.Configuration,
        keyprops = conf.keyprops,
        keypropList = conf.keypropList;

    try {
      this.setup();

      if (keyprops && keypropList.indexOf('p') !== -1) {
        P.U.defValProp(this.shell, 'p', false, false, false, function (p) {
          if (!p || p === '*') {
            return self;
          }

          return self.properties[p];
        });
      }

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

