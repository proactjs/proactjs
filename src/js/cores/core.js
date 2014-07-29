/**
 * <p>
 *  Constructs a ProAct.Core. The core is an ProAct.Observable which can be used to manage other {@link ProAct.Observable} objects or shells arround ProAct.Observable objects.
 * </p>
 * <p>
 *  For example a shell can be a plain old JavaScript object; The core will be in charge of creating {@link ProAct.Property} for every field of the shell.
 * </p>
 * <p>
 *  The idea of the core is to inject observer-observable capabilities in normal objects.
 * </p>
 * <p>
 *  ProAct.Core is an abstract class, that has a {@link ProAct.States} state. Its initializing logic should be implemented in an extender.
 * </p>
 * <p>
 *  ProAct.Core is used as a parent for the {@link ProAct.Observable}s it manages, so it can be passed as a listener object - defines a <i>call method</i>.
 * </p>
 * <p>
 *  ProAct.Core is part of the core module of ProAct.js.
 * </p>
 *
 * @class ProAct.Core
 * @extends ProAct.Observable
 * @param {Object} shell
 *      The shell arrounf this core. This ProAct.Core manages observer-observable behavior for this <i>shell</i> object.
 * @param {Object} meta
 *      Optional meta data to be used to define the observer-observable behavior of the <i>shell</i>.
 * @see {@link ProAct.States}
 */
ProAct.Core = P.C = function (shell, meta) {
  this.shell = shell;
  this.state = P.States.init;
  this.meta = meta || {};

  P.Observable.call(this); // Super!
};

ProAct.Core.prototype = P.U.ex(Object.create(P.Observable.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @memberof ProAct.Core
   * @instance
   * @constant
   * @default ProAct.Core
   */
  constructor: ProAct.Core,

  /**
   * A function to be set to the <i>shell</i> object's <b>p</b> field (if it is configured in @{link ProAct.Configuration}).
   * <p>
   *  This function is the link to the this ProAct.Core of the <i>shell</i>. It can be overridden to return different aspects of
   *  the core depending on parameters passed.
   * </p>
   *
   * @memberof ProAct.Core
   * @instance
   * @method value
   * @default {this}
   * @return {Object}
   *      Some aspects of <i>this</i> ProAct.Core.
   */
  value: function () {
    return this;
  },

  /**
   * Initializes <i>this</i> ProAct.Core. This method should be called when the core should become active.
   * <p>
   *  The main idea of the method is to change the {@link ProAct.States} state of <i>this</i> to {@link ProAct.States.ready}, by
   *  settuping everything needed by the shell to has observer-observable logic.
   * </p>
   * <p>
   *  The abstract {@link ProAct.Core#setup} method is called for the actual setup. If it throws an error, <i>this</i> state
   *  is set to {@link ProAct.States.error} and the core stays inactive.
   * </p>
   *
   * @memberof ProAct.Core
   * @instance
   * @method prob
   * @return {ProAct.Core}
   *      <i>this</i>
   * @see {@link ProAct.Core#setup}
   * @see {@link ProAct.States}
   */
  prob: function () {
    var self = this,
        conf = P.Configuration,
        keyprops = conf.keyprops,
        keypropList = conf.keypropList;

    try {
      this.setup();

      if (keyprops && keypropList.indexOf('p') !== -1) {
        P.U.defValProp(this.shell, 'p', false, false, false, P.U.bind(this, this.value));
      }

      this.state = P.States.ready;
    } catch (e) {
      this.state = P.States.error;
      throw e;
    }

    return this;
  },

  /**
   * Abstract method called by {@link ProAct.Core#prob} for the actual initialization of <i>this</i> core.
   *
   * @memberof ProAct.Core
   * @instance
   * @abstract
   * @method setup
   * @see {@link ProAct.Core#prob}
   */
  setup: function () {
    throw Error('Abstract, implement!');
  },

  /**
   * ProAct.Core can be used as a parent listener for other {@link ProAct.Observable}s, so it defines the <i>call</i> method.
   * <p>
   *  By default this method calls {@link ProAct.Observable#update} of <i>this</i> with the passed <i>event</i>.
   * </p>
   *
   * @memberof ProAct.Core
   * @instance
   * @method call
   * @param {Object} event
   *      The value/event that this listener is notified for.
   * @see {@link ProAct.Observable#update}
   */
  call: function (event) {
    this.update(event);
  }
});

