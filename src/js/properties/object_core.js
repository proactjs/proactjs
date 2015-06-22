/**
 * @module proact-properties
 */

/**
 * <p>
 *  Constructs a `ProAct.ObjectCore`.
 *  `ProAct.ObjectCore` is a {{#crossLink "ProAct.Core"}}{{/crossLink}} that manages all the
 *  {{#crossLink "ProAct.Property"}}{{/crossLink}} instances for a reactive ProAct.js object.
 * </p>
 * <p>
 *  It is responsible for all the {{#crossLink "ProAct.Property"}}{{/crossLink}} instances as well as
 *  initializing them and deciding which type of property corresponds to which field.
 * </p>
 * <p>
 *  `ProAct.ObjectCore` is part of the proact-properties module of ProAct.js.
 * </p>
 *
 * ```
 *  
 *  var object = {
 *    a: 4,
 *    b: 5,
 *    c: function () {
 *      return this.a + this.b;
 *    }
 *  };
 *  var core = new ProAct.ObjectCore(object);
 *
 *  console.log(object.c); // 9
 *
 *  object.a = 1;
 *  console.log(object.c); // 6
 *
 *  console.log(core.value('c')); // 6
 *
 *  core.set('b', 2));
 *  console.log(object.b); // 2
 *  console.log(object.c); // 3
 * ```
 *
 * @class ProAct.ObjectCore
 * @extends ProAct.Core
 * @constructor
 * @param {Object} object
 *      The shell objec arround this core. This should be plain JavaScript object.
 * @param {Object} meta
 *      Optional meta data to be used to define the observer-observable behavior of the <i>object</i>.
 *      For example transformations for its properties.
 */
function ObjectCore (object, meta) {
  this.properties = {};

  P.C.call(this, object, meta); // Super!
};
ProAct.ObjectCore = P.OC = ObjectCore;

ProAct.ObjectCore.prototype = P.U.ex(Object.create(P.C.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @property constructor
   * @type ProAct.ObjectCore
   * @final
   * @for ProAct.ObjectCore
   */
  constructor: ProAct.ObjectCore,

  /**
   * A function to be set to the <i>shell</i> object's <b>p</b> field (if it is configured in {{#crossLink "ProAct.Configuration"}}{{/crossLink}}).
   * <p>
   *  It uses its <i>p</i> argument if it is string to return the right {{#crossLink "ProAct.Property"}}{{/crossLink}} for passed field name.
   * </p>
   * <p>
   *  If the <i>p</i> argument is <b>*</b> or empty <i>this</i> `ProAct.ObjectCore` instance is returned.
   * </p>
   *
   * ```
   *  core.value('a'); // returns the shell's 'a' value - shell.a.
   *  core.value('*'); // returns this.
   *  core.value(); // returns this.
   * ```
   *
   * @for ProAct.ObjectCore
   * @instance
   * @method value
   * @param {String} p
   *      The name of the managed {{#crossLink "ProAct.Property"}}{{/crossLink}} to retrieve.
   *      It can be set to <b>*</b> or skipped for <i>this</i> itself to be retrieved.
   * @return {Object}
   *      Managed {{#crossLink "ProAct.Property"}}{{/crossLink}} instance with field name equal to the passed <i>p</i> parameter or <i>this</i>.
   */
  value: function (p) {
    if (!p || p === '*') {
      return this;
    }

    return this.properties[p];
  },

  /**
   * Initializes all the {{#crossLink "ProAct.Property"}}{{/crossLink}} instances for the <i>shell</i>of <i>this</i> ProAct.ObjectCore.
   * <p>
   *  Using the types of the fields of the <i>shell</i> object the right {{#crossLink "ProAct.Property"}}{{/crossLink}} instances are created and stored
   *  in <i>this</i> using {{#crossLink "ProAct.Configuration/makeProp:method"}}{{/crossLink}}.
   * </p>
   *
   * @for ProAct.ObjectCore
   * @protected
   * @instance
   * @method setup
   */
  setup: function () {
    var object = this.shell,
        property;

    for (property in object) {
      this.makeProp(property, null, this.meta[property]);
    }
  },

  /**
   * Creates a {{#crossLink "ProAct.Property"}}{{/crossLink}} instance for <i>this</i>'s shell.
   *
   * ```
   *  var shell = {a: 3};
   *  var core = new ProAct.Core(shell);
   *
   *  shell.b = function () { return this.a + 5; };
   *  core.makeProp('b');
   *
   *  console.log(shell.b); // 8
   *
   *  shell.a = 5;
   *  console.log(shell.b); // 10
   * ```
   *
   * @for ProAct.ObjectCore
   * @instance
   * @method makeProp
   * @param {String} property
   *      The name of the property, the name of the field in the <i>shell</i>.
   * @param {Array} listeners
   *      Initial listeners for 'change' of the property, can be skipped.
   * @param {String|Array} meta
   *      Meta information for the property to create, for example if the meta contains 'noprop', no property is created,
   *      and the initial value of the field is preserved. The meta is in format of the {{#crossLink "ProAct.DSL"}}{{/crossLink}}.
   * @return {ProAct.Property}
   *      The newly crated and stored in <i>this</i> property, or null if no property was created.
   * @throws {Error}
   *      If there is no field defined in the <i>shell</i> named as the passed <i>property</i>.
   */
  makeProp: function (property, listeners, meta) {
    var object = this.shell,
        conf = ProAct.Configuration,
        keyprops = conf.keyprops,
        keypropList = conf.keypropList,
        isF = P.U.isFunction,
        isA = P.U.isArrayObject,
        isO = P.U.isObject,
        result;

    if (meta && (meta === 'noprop' || (meta.indexOf && meta.indexOf('noprop') >= 0))) {
      return null;
    }

    if (keyprops && keypropList.indexOf(property) !== -1) {
      throw Error('The property name ' + property + ' is a key word for pro objects! Objects passed to ProAct.prob can not contain properties named as keyword properties.');
      return null;
    }

    if (object.hasOwnProperty(property)) {
      result = P.PP.provide(this.queueName, object, property, meta);
    }

    if (!result) {
      return null;
    }

    if (listeners) {
      this.properties[property].listeners.change = this.properties[property].listeners.change.concat(listeners);
    }

    if (meta && P.registry) {
      if (!P.U.isArray(meta)) {
        meta = [meta];
      }

      if (!(meta[0] instanceof ProAct.Property)) {
        P.registry.setup.apply(P.registry, [result].concat(meta));
      }
    }

    return result;
  },

  /**
   * Sets the value of a managed property. The interesting thing here is that
   * if the property does not exist this method creates it and stores a new field in the <i>shell</i> object
   * with the passed <i>value</i>.
   * <p>
   *  The new field is reactive.
   * </p>
   *
   * ```
   *  var shell = {a: 3};
   *  var core = new ProAct.Core(shell);
   *
   *  core.set('b', function () { return this.a + 5; });
   *
   *  console.log(shell.b); // 8
   *
   *  shell.a = 5;
   *  console.log(shell.b); // 10
   * ```
   *
   * @for ProAct.ObjectCore
   * @instance
   * @method set
   * @param {String} property
   *      The name of the property to update/create.
   * @param {Object} value
   *      The value of the property to be set.
   */
  set: function (property, value) {
    var object = this.shell;

    object[property] = value;
    if (this.properties[property]) {
      return;
    }

    this.makeProp(property);
  }
});

function ObjectProbProvider () {
};

ObjectProbProvider.prototype = P.U.ex(Object.create(P.ProbProvider.prototype), {
  constructor: ObjectProbProvider,
  filter: function (data, meta) {
    return P.U.isObject(data) && !P.U.isArray(data);
  },
  provide: function (data, meta) {
    var core = new P.OC(data, meta);
    P.U.defValProp(data, '__pro__', false, false, false, core);

    core.prob();

    return data;
  }
});

P.ProbProvider.register(new ObjectProbProvider());
