'use strict';

var errs;
beforeEach(function() {
  ProAct.currentCaller = null;

  P.PP.clearProviders();
  P.PP.registerProvider(new P.ProxyPropertyProvider());
  P.PP.registerProvider(new P.SimplePropertyProvider());
  P.PP.registerProvider(new P.AutoPropertyProvider());
  P.PP.registerProvider(new P.ArrayPropertyProvider());
  P.PP.registerProvider(new P.ObjectPropertyProvider());

  errs = [];
  ProAct.flow = new ProAct.Flow(['proq'], {
    err: function (e) {
      errs.push(e);
    },
    flowInstance: {
      queue: {
        err: function (queue, e) {
          e.queue = queue;
          errs.push(e);
        }
      }
    }
  });

  ProAct.Actor.prototype.update = ProAct.ActorUtil.update;
});


