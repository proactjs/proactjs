'use strict';

beforeEach(function() {
  ProAct.currentCaller = null;

  P.PP.clearProviders();
  P.PP.registerProvider(new P.NullPropertyProvider());
  P.PP.registerProvider(new P.SimplePropertyProvider());
  P.PP.registerProvider(new P.AutoPropertyProvider());
  P.PP.registerProvider(new P.ArrayPropertyProvider());
  P.PP.registerProvider(new P.ObjectPropertyProvider());
});
