ProAct.ArrayCore = P.AC = function (array, meta) {
  P.C.call(this, array, meta); // Super!

  this.listeners.index = [];
  this.listeners.length = [];
};

ProAct.ArrayCore.prototype = P.U.ex(Object.create(P.C.prototype), {
  constructor: ProAct.ArrayCore,
  setup: function () {
    var array = this.shell,
        ln = array._array.length,
        i;

    for (i = 0; i < ln; i++) {
      array.defineIndexProp(i);
    }
  }
});

