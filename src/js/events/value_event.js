function ValueEvent (source, target) {
  var type = ProAct.Event.Types.value,
      args = slice.call(arguments, 2);
  ProAct.Event.apply(this, [source, target, type].concat(args));

  this.object = args[0];
  this.oldVal = args[1];
  this.newVal = args[2];
}

ProAct.ValueEvent = P.VE = ValueEvent;

ValueEvent.prototype = P.U.ex(Object.create(ProAct.Event.prototype), {
  constructor: ValueEvent,
  fromVal: function () {
    if (this.object && this.object.__pro__ &&
        this.object.__pro__.properties[this.target].type() === P.P.Types.auto) {
      return this.object.__pro__.properties[this.target].oldVal;
    }

    return this.oldVal;
  },

  toVal: function () {
    if (this.object && this.object.__pro__ &&
        this.object.__pro__.properties[this.target].type() === P.P.Types.auto) {
      return this.object.__pro__.properties[this.target].val;
    }

    return this.newVal;
  }
});

