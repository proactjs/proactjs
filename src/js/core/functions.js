/**
 * @module proact-core
 */

/**
 * A `ProbProvider` provides a way for creating a ProAct implementation,
 * using raw data.
 *
 * For example such a provider can provide a way to create an
 * {{#crossLink "ProAct.Actor"}}{{/crossLink}} from a plain JavaScript object.
 *
 * @class ProAct.ProbProvider
 * @constructor
 */
function ProbProvider () {
};

ProAct.ProbProvider = ProbProvider;

ProbProvider.prototype = {

  /**
   * Reference to the constructor of this object.
   *
   * @property constructor
   * @type ProAct.ProbProvider
   * @final
   * @for ProAct.ProbProvider
   */
  constructor: ProbProvider,

  /**
   * Used to check if this `ProAct.ProbProvider` is compliant with the passed data.
   *
   * Abstract - must be implemented by an extender.
   *
   * @for ProAct.ProbProvider
   * @abstract
   * @instance
   * @method filter
   * @param {Object} data
   *      The data to check.
   * @param {Object|String} meta
   *      Meta-data used to help in filtering.
   * @return {Boolean}
   *      If <i>this</i> provider is compliant with the passed data.
   */
  filter: function (data, meta) {
    throw new Error('Implement!');
  },

  /**
   * Creates a reactive object from the passed data
   *
   * Abstract - must be implemented by an extender.
   *
   * @for ProAct.ProbProvider
   * @abstract
   * @instance
   * @method provide
   * @param {Object} data
   *      The data to use as a source for the object.
   * @param {Object|String} meta
   *      Meta-data used to help when creating.
   * @return {Object}
   *      A reactive representation of the data.
   */
  provide: function (data, meta) {
    throw new Error('Implement!');
  }
};

(function (P) {
  var providers = [];

  P.U.ex(P.ProbProvider, {


    /**
     * Registers a `ProAct.ProbProvider`.
     *
     * The provider is appended in the end of the list of `ProAct.ProbProvider`s.
     *
     * @for ProAct.ProbProvider
     * @method register
     * @static
     * @param {ProAct.ProbProvider} provider
     *      The `ProAct.ProbProvider` to register.
     */
    register: function (provider) {
      providers.push(provider);
    },

    /**
     * Provides a reactive representation of passed simple data.
     *
     * @for ProAct.ProbProvider
     * @static
     * @param {Object} data
     *      The data for which to try and provide a reactive object representation.
     * @param {String|Object} meta
     *      Meta information to be used for filtering and configuration of the reactive object to be provided.
     * @return {Object}
     *      A reactive object provided by registered provider, or null if there is no compliant provider.
     */
    provide: function (data, meta) {
      var ln = providers.length,
          result = null,
          provider = null,
          i;

      for (i = 0; i < ln; i++) {
        provider = providers[i];
        if (provider.filter(data, meta)) {
          break;
        } else {
          provider = null;
        }
      }

      if (provider) {
        result = provider.provide(data, meta);
      }

      return result;
    }
  });
}(P));

/**
 * The `ProAct.prob` method is the entry point for creating reactive values in ProAct.js
 *
 * TODO More docs
 *
 * @for ProAct
 * @method prob
 * @static
 * @param {Object} object
 *      The object/value to make reactive.
 * @param {Object|String} meta
 *      Meta-data used to help in the reactive object creation.
 * @return {Object}
 *      Reactive representation of the passed <i>object</i>.
 */
function prob (object, meta) {
  return ProbProvider.provide(object, meta);
}
ProAct.prob = prob;

