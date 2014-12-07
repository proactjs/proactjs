'use strict';

var res;
beforeEach(function() {
  ProAct.currentCaller = null;

  P.PP.clearProviders();
  P.PP.registerProvider(new P.ProxyPropertyProvider());
  P.PP.registerProvider(new P.SimplePropertyProvider());
  P.PP.registerProvider(new P.AutoPropertyProvider());
  P.PP.registerProvider(new P.ArrayPropertyProvider());
  P.PP.registerProvider(new P.ObjectPropertyProvider());

  ProAct.flow = new ProAct.Flow(['proq'], {
    err: function (e) {
      if (P.flow.errStream) {
        P.flow.errStream().triggerErr(e);
      } else {
        console.log(e);
      }
    },
    flowInstance: {
      queue: {
        err: function (queue, e) {
          e.queue = queue;
          if (P.flow.errStream) {
            P.flow.errStream().triggerErr(e);
          } else {
            console.log(e);
          }
        }
      }
    }
  });

  res = [];
});

function resultListener (v) {
  res.push(v);
}

