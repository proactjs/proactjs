/**
 * @module proact-core
 */

/**
 * <p>
 *  Constructs a ProAct.Core. The core is an {{#crossLink "ProAct.Actor"}}{{/crossLink}} which can be used to manage other {@link ProAct.Actor} objects or groups many ProAct.Actor objects.
 * </p>
 * <p>
 *  For example a shell can be a plain old JavaScript object; The core will be in charge of creating dynamic properties for every field of the shell.
 * </p>
 * <p>
 *  The idea of the core is to inject observer-observable capabilities in normal objects, or just group many observables.
 * </p>
 * <p>
 *  `ProAct.Core` is an abstract class, that has a {{#crossLink "ProAct.States"}}{{/crossLink}} state. Its initializing logic should be implemented in an extender.
 * </p>
 * <p>
 *  ProAct.Core is used as a parent for the {{#crossLink "ProAct.Actor"}}{{/crossLink}}s it manages, so it can be passed as a listener object - defines a <i>call method</i>.
 * </p>
 * <p>
 *  ProAct.Core is part of the core module of ProAct.js.
 * </p>
 *
 * TODO Maybe should be renamed to something else? For example ActorGroup or ActorTroupe, or maybe ActorManager :).
 *
 * @class ProAct.Core
 * @extends ProAct.Actor
 * @param {Object} shell
 *      The shell arrounf this core. This ProAct.Core manages observer-observable behavior for this <i>shell</i> object.
 * @param {Object} meta
 *      Optional meta data to be used to define the observer-observable behavior of the <i>shell</i>.
 */
function Core (shell, meta) {
  this.shell = shell;
  this.state = P.States.init;
  this.meta = meta || {};
  this.queueName = (this.meta.p && this.meta.p.queueName &&
                    P.U.isString(this.meta.p.queueName)) ? this.meta.p.queueName : null;

  P.Actor.call(this, this.queueName); // Super!
}
ProAct.Core = P.C = Core;

ProAct.Core.prototype = P.U.ex(Object.create(P.Actor.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @property constructor
   * @type ProAct.Core
   * @final
   * @for ProAct.Core
   */
  constructor: ProAct.Core,

  /**
   * A function to be set to the <i>shell</i> object's <b>p</b> field (if it is configured in {{#crossLink "ProAct.Configuration"}}{{/crossLink}}.
   * <p>
   *  This function is the link to the this ProAct.Core of the <i>shell</i>.
   *  It can be overridden to return different aspects of the core depending on parameters passed.
   * </p>
   *
   * @for ProAct.Core
   * @instance
   * @method value
   * @default {this}
   * @return {Object}
   *      Some aspects of <i>this</i> `ProAct.Core`.
   */
  value: function () {
    return this;
  },

  /**
   * Initializes <i>this</i> ProAct.Core. This method should be called when the core should become active.
   * <p>
   *  The main idea of the method is to change the {{#crossLink "ProAct.States"}}{{/crossLink}}
   *  state of <i>this</i> to {{#crossLink "ProAct.States/ready:property"}}{{/crossLink}}, by
   *  settuping everything needed by the shell to has observer-observable logic.
   * </p>
   * <p>
   *  The abstract {{#crossLink "ProAct.Core/setup:method"}}{{/crossLink}} method is called for the actual setup.
   *  If it throws an error, <i>this</i> state is set to {{#crossLink "ProAct.States/error:property"}}{{/crossLink}}
   *  and the core stays inactive.
   * </p>
   *
   * @for ProAct.Core
   * @instance
   * @method prob
   * @return {ProAct.Core} <i>this</i>
   */
  prob: function () {
    var self = this,
        conf = ProAct.Configuration,
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
   * Abstract method called by {{#crossLink "ProAct.Core/prob:method"}}{{/crossLink}}
   * for the actual initialization of <i>this</i> core.
   *
   * By default it throws an exception.
   *
   * @for ProAct.Core
   * @instance
   * @abstract
   * @method setup
   */
  setup: function () {
    throw Error('Abstract, implement!');
  },

  /**
   * `ProAct.Core` can be used as a parent listener for its managed
   * {{#crossLink "ProAct.Actor"}}{{/crossLink}}s, so it defines the <i>call</i> method.
   * <p>
   *  By default this method calls {{#crossLink "ProAct.ActorUtil/update:method"}}{{/crossLink}}
   *  with <i>this</i> and the passed <i>event</i>.
   * </p>
   *
   * @for ProAct.Core
   * @instance
   * @method call
   * @param {Object} event
   *      The value/event that this listener is notified for.
   */
  call: function (event) {
    ActorUtil.update.call(this, event);
  }
});

