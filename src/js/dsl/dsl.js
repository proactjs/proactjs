/**
 * @module proact-dsl
 */

/**
 * Contains {{#crossLink "ProAct.DSL"}}{{/crossLink}} operation logic definitions.
 * <p>
 *  Every operation has
 *  <ol>
 *    <li><b>sym</b> - A symbol used to identify the right operation in a DSL string or object.</li>
 *    <li><b>match method</b> - A method used for identifying the operation, usually it uses the <i>sym</i></li>
 *    <li>
 *      <b>toOptions</b> - A method which is able to turn a DSL string with the operation,
 *      into an actual array of options containing all the functions to be executed by the DSL and their arguments.
 *    </li>
 *    <li><b>action</b> - The operation logic. The options object of the above method should be passed to it, as well as the targed on which the DSL should be run.</li>
 *  </ol>
 * </p>
 *
 * @namespace ProAct
 * @class OpStore
 * @static
 */
ProAct.OpStore = {

  all: {

    /**
     * Can generate a simple operation definition.
     * <p>
     *  It is used for defining all the simple operations, like <i>map</i> or <i>filter</i>.
     * </p>
     *
     * @for ProAct.OpStore.all
     * @static
     * @param {String} name
     *      The name of the operation to define.
     * @param {String} sym
     *      The symbol of the operation that shoul dbe used to identify it from within a DSL string.
     * @return {Object}
     *      <ol>
     *        <li><b>sym</b> - The symbol used to identify the operation in a DSL string or object.</li>
     *        <li><b>match method</b> - A method using the <i>sym</i> for identifying the operation in a DSL string.</li>
     *        <li>
     *          <b>toOptions</b> - A method which is able to turn a DSL string with the operation,
     *          into the actual array of options containing all the functions to be executed by the DSL and their arguments.
     *          <p>
     *            This method is able to fetch predefined operation functions.
     *          </p>
     *        </li>
     *        <li>
     *          <b>action</b> - The operation logic.
     *          The options object of the above method should be passed to it, as well as the targed on which the DSL should be run.
     *          <p>
     *            It just calls method named as the passed <i>name</i> parameter on the targed <i>object</i>, passing it as arguments,
     *            the argument array generated from the <i>toOptions</i> method.
     *          </p>
     *        </li>
     *      </ol>
     */
    simpleOp: function(name, sym) {
      return {
        sym: sym,
        match: function (op) {
          return op.substring(0, sym.length) === sym;
        },
        setupArgument: function (arg, realArguments, predefined, opArguments) {
          var i, k, ln, actions;
          if (arg.charAt(0) === '$') {
            arg = realArguments[parseInt(arg.substring(1), 10) - 1];
          } else if (predefined && arg.charAt(0) === '&') {
            i = arg.lastIndexOf('&');
            k = arg.substring(0, i);
            if (predefined[k]) {
              arg = predefined[k].call(null, arg.substring(i + 1));
            }
          } else if (predefined && arg.charAt(0) === '!') {
            arg = this.setupArgument(arg.substring(1), realArguments, predefined, opArguments);
            if (arg) {
              k = arg;
              arg = function () {
                return !k.apply(null, arguments);
              };
            }
          } else if (predefined && predefined[arg]) {
            arg = predefined[arg];

            if (P.U.isArray(arg)) {
              opArguments.push.apply(opArguments, arg);
              arg = undefined;
            }
          }

          return arg;
        },
        toOptions: function (actionObject, op) {
          var reg = new RegExp(dslOps[name].sym + "(\\w*)\\(([\\s\\S]*)\\)"),
              matched = reg.exec(op),
              action = matched[1], args = matched[2],
              opArguments = [],
              realArguments = slice.call(arguments, 2),
              predefined = dsl.predefined[name],
              arg, i , ln, k;
          if (action) {
            opArguments.push(action);
          }

          if (args) {
            args = args.split(',');
            ln = args.length;
            for (i = 0; i < ln; i++) {
              arg = args[i].trim();
              arg = this.setupArgument(arg, realArguments, predefined, opArguments);

              if (arg !== undefined) {
                opArguments.push(arg);
              }
            }
          }

          if (!actionObject[name]) {
            actionObject[name] = opArguments;
          } else {
            if (!P.U.isArray(actionObject[name][0])) {
              actionObject[name] = [actionObject[name], opArguments];
            } else {
              actionObject[name].push(opArguments);
            }
          }

          actionObject.order = actionObject.order || [];
          actionObject.order.push(name);
        },
        action: function (object, actionObject) {
          if (!actionObject || !actionObject[name]) {
            return object;
          }

          var args = actionObject[name];
          if (!P.U.isArray(args)) {
            args = [args];
          }

          if (name === 'accumulation' && P.U.isArray(args[0]) && args[0].length == 2 && P.U.isFunction(args[0][1])) {
            args = args[0];
          }

          return object[name].apply(object, args);
        }
      };
    }
  }
};
opStoreAll = P.OpStore.all;

/**
 * Contains implementation of the `ProAct.js DSL`.
 * <p>
 *  The idea of the DSL is to define {{#crossLink "ProAct.Actor"}}{{/crossLink}}s and their dependencies on each other in a declarative and simple way.
 * </p>
 * <p>
 *  The {{#crossLink "ProAct.Registry"}}{{/crossLink}} is used to store these actors.
 * </p>
 * <p>
 *  For example if we want to have a stream configured to write in a property, it is very easy done using the DSL:
 *  <pre>
 *    ProAct.registry.prob('val', 0, '<<(s:data)');
 *  </pre>
 *  This tells the {{#crossLink "ProAct.Registry"}}{{/crossLink}} to create a {{#crossLink "ProAct.Property"}}{{/crossLink}} with the value of zero, and to point the previously,
 *  stored 'data' stream to it.
 * </p>
 *
 * @namespace ProAct
 * @class DSL
 * @static
 */
ProAct.DSL = {

  /**
   * A separator which can be used to separate multiple DSL expressions in one string.
   *
   * @for ProAct.DSL
   * @type String
   * @property separator
   * @final
   */
  separator: '|',

  /**
   * The operation definitions of the DSL.
   * <p>
   *  All of the available and executable operations defined in the ProAct.DSL.
   * </p>
   * <p>
   *  Users of ProAct.js can add their own operation to it.
   *  <pre>
   *    ProAct.DSL.ops.myOp = ProAct.OpStore.all.simpleOp('foo', 'foo');
   *  </pre>
   * </p>
   *
   * @namespace ProAct.DSL
   * @class ops
   * @static
   */
  ops: {

    /**
     * DSL operation for defining sources of {{#crossLink "ProAct.Actor"}}{{/crossLink}}s.
     * <p>
     *  For example
     *  <pre>
     *    '<<(s:bla)'
     *  </pre>
     *  means that the source of the targed of the DSL should be a stream stored in the {{#crossLink "ProAct.Registry"}}{{/crossLink}} by the key 'bla'.
     * </p>
     * <p>
     *  or
     *  <pre>
     *    '<<($1)'
     *  </pre>
     *  means that the source of the targed of the DSL should be an {{#crossLink "ProAct.Actor"}}{{/crossLink}} passed to the {{#crossLink "ProAct.DSL/run:method"}}{{/crossLink}}
     *  method as the first argument after the targed object, the DSL data and the registry.
     * </p>
     *
     * @for ProAct.DSL.ops
     * @final
     * @property into
     * @type Object
     */
    into: opStoreAll.simpleOp('into', '<<'),

    /**
     * DSL operation for setting the targed of the DSL as sources of another {{#crossLink "ProAct.Actor"}}{{/crossLink}}s.
     * <p>
     *  For example
     *  <pre>
     *    '>>(s:bla)'
     *  </pre>
     *  means that the targed of the DSL should become a source for a stream stored in the {{#crossLink "ProAct.Registry"}}{{/crossLink}} by the key 'bla'.
     * </p>
     * <p>
     *  or
     *  <pre>
     *    '>>($1)'
     *  </pre>
     *  means that the targed of the DSL should become a source for an {{#crossLink "ProAct.Actor"}}{{/crossLink}} passed to the {{#crossLink "ProAct.DSL/run:method"}}{{/crossLink}}
     *  method as the first argument after the targed object, the DSL data and the registry.
     * </p>
     *
     * @for ProAct.DSL.ops
     * @final
     * @property out
     * @type Object
     */
    out: opStoreAll.simpleOp('out', '>>'),

    /**
     * DSL operation for attaching listener to the target {{#crossLink "ProAct.Actor"}}{{/crossLink}} of the DSL.
     * <p>
     *  For example
     *  <pre>
     *    '@(f:bla)'
     *  </pre>
     *  means that listener function, stored in the {{#crossLink "ProAct.Registry"}}{{/crossLink}} as 'bla'
     *  should be attached as a listener to the targed {{#crossLink "ProAct.Actor"}}{{/crossLink}} of the DSL.
     * </p>
     *
     * @for ProAct.DSL.ops
     * @final
     * @property on
     * @type Object
     */
    on: opStoreAll.simpleOp('on', '@'),

    /**
     * DSL operation for adding mapping to the target {{#crossLink "ProAct.Actor"}}{{/crossLink}} of the DSL.
     * <p>
     *  For example
     *  <pre>
     *    'map(f:bla)'
     *  </pre>
     *  means that mapping function, stored in the {{#crossLink "ProAct.Registry"}}{{/crossLink}} as 'bla'
     *  should be mapped to the targed {{#crossLink "ProAct.Actor"}}{{/crossLink}} of the DSL.
     * </p>
     * <p>
     *  or
     *  <pre>
     *    'map($2)'
     *  </pre>
     *  means that mapping function passed to the {{#crossLink "ProAct.DSL/run:method"}}{{/crossLink}}
     *  method as the second argument after the targed object, the DSL data and the registry
     *  should be mapped to the targed {{#crossLink "ProAct.Actor"}}{{/crossLink}} of the DSL.
     * </p>
     *
     * @for ProAct.DSL.ops
     * @final
     * @property mapping
     * @type Object
     */
    mapping: opStoreAll.simpleOp('mapping', 'map'),

    /**
     * DSL operation for adding filters to the target {{#crossLink "ProAct.Actor"}}{{/crossLink}} of the DSL.
     * <p>
     *  For example
     *  <pre>
     *    'filter(f:bla)'
     *  </pre>
     *  means that filtering function, stored in the {{#crossLink "ProAct.Registry"}}{{/crossLink}} as 'bla'
     *  should be add as filter to the targed {{#crossLink "ProAct.Actor"}}{{/crossLink}} of the DSL.
     * </p>
     * <p>
     *  or
     *  <pre>
     *    'filter($1)'
     *  </pre>
     *  means that filtering function passed to the {{#crossLink "ProAct.DSL/run:method"}}{{/crossLink}}
     *  method as the first argument after the targed object, the DSL data and the registry
     *  should be added as filter to the targed {{#crossLink "ProAct.Actor"}}{{/crossLink}} of the DSL.
     * </p>
     *
     * @for ProAct.DSL.ops
     * @final
     * @property filtering
     * @type Object
     */
    filtering: opStoreAll.simpleOp('filtering', 'filter'),

    /**
     * DSL operation for adding accumulation to the target {{#crossLink "ProAct.Actor"}}{{/crossLink}} of the DSL.
     * <p>
     *  For example
     *  <pre>
     *    'acc($1, f:bla)'
     *  </pre>
     *  means that accumulating function, stored in the {{#crossLink "ProAct.Registry"}}{{/crossLink}} as 'bla'
     *  should be added as accumulation to the targed {{#crossLink "ProAct.Actor"}}{{/crossLink}} of the DSL,
     *  and the first argument passed to {{#crossLink "ProAct.DSL/run:method"}}{{/crossLink}} after the targed object, the DSL data and the registry should
     *  be used as initial value for the accumulation.
     * </p>
     *
     * @for ProAct.DSL.ops
     * @final
     * @property accumulation
     * @type Object
     */
    accumulation: opStoreAll.simpleOp('accumulation', 'acc')
  },

  /**
   * A set of predefined operations to be used by the DSL.
   *
   * @namespace ProAct.DSL
   * @class predefined
   * @static
   */
  predefined: {

    /**
     * A set of predefined mapping operations to be used by the DSL.
     *
     * @class mapping
     * @namespace ProAct.DSL.predefined
     * @static
     */
    mapping: {

      /**
       * Mapping operation for changing the sign of a number to the oposite.
       * <p>
       *  For example 4 becomes -4 and -5 becomes 5.
       * </p>
       * <p>
       *  Usage in a DSL expression:
       *  <pre>
       *    map(-)
       *  </pre>
       * </p>
       *
       * @for ProAct.DSL.predefined.mapping
       * @final
       * @static
       * @method -
       * @param {Number} n
       *      The number which will have its sign inverted.
       * @return {Number}
       *      The same number as `n`, but with opposite sign.
       */
      '-': function (el) { return -el; },

      /**
       * Mapping operation for computing the square of a number.
       * <p>
       *  For example 4 becomes 16.
       * </p>
       * <p>
       *  Usage in a DSL expression:
       *  <pre>
       *    map(pow)
       *  </pre>
       * </p>
       *
       * @for ProAct.DSL.predefined.mapping
       * @static
       * @method pow
       * @param {Number} n
       *      The number to power.
       * @return {Number}
       *      The square of `n`.
       */
      'pow': function (el) { return el * el; },

      /**
       * Mapping operation for computing the square root of a number.
       * <p>
       *  For example 4 becomes 2.
       * </p>
       * <p>
       *  Usage in a DSL expression:
       *  <pre>
       *    map(sqrt)
       *  </pre>
       * </p>
       *
       * @for ProAct.DSL.predefined.mapping
       * @static
       * @method sqrt
       * @param {Number} n
       *      The number to compute the square root for.
       * @return {Number}
       *      The square root of `n`.
       */
      'sqrt': function (el) { return Math.sqrt(el); },

      /**
       * Mapping operation for turning an string to a decimal Number - integer.
       * <p>
       *  For example '4' becomes 4.
       * </p>
       * <p>
       *  Usage in a DSL expression:
       *  <pre>
       *    map(int)
       *  </pre>
       * </p>
       *
       * @for ProAct.DSL.predefined.mapping
       * @static
       * @method int
       * @param {String} str
       *      The string to convert to integer.
       * @return {Number}
       *      The integer representation of `str`.
       */
      'int': function (el) { return parseInt(el, 10); },

      /**
       * Mapping operation for calling a method of an object.
       * <p>
       *  Usage in a DSL expression:
       *  <pre>
       *    map(&.&go)
       *  </pre>
       *  This will call the 'target.go' method and use its result.
       * </p>
       *
       * @for ProAct.DSL.predefined.mapping
       * @static
       * @method &.
       * @param {String} methodName
       *      The method name to call.
       * @return {Object}
       *      The result of the method call.
       */
      '&.': function (arg) {
        return function (el) {
          var p = el[arg];
          if (!p) {
            return el;
          } else if (P.U.isFunction(p)) {
            return p.call(el);
          } else {
            return p;
          }
        };
      },

      /**
       * Mapping operation for turning value in an
       * ProAct.Array pop event.
       * <p>
       *  Usage in a DSL expression:
       *  <pre>
       *    map(pop)
       *  </pre>
       * </p>
       *
       * @for ProAct.DSL.predefined.mapping
       * @static
       * @method pop
       * @return {Event}
       *      Pop event.
       */
      pop: function () {
        return P.E.simple('array', 'pop');
      },

      /**
       * Mapping operation for turning value in an
       * ProAct.Array shift event.
       * <p>
       *  Usage in a DSL expression:
       *  <pre>
       *    map(shift)
       *  </pre>
       * </p>
       *
       * @for ProAct.DSL.predefined.mapping
       * @static
       * @method shift
       * @return {Event}
       *      Shift event.
       */
      shift: function () {
        return P.E.simple('array', 'shift');
      },

      /**
       * Mapping operation for turning value event in its value.
       * <p>
       *  Usage in a DSL expression:
       *  <pre>
       *    map(eventToVal)
       *  </pre>
       * </p>
       *
       * @for ProAct.DSL.predefined.mapping
       * @static
       * @method eventToVal
       * @param {Event} event
       *      The value event to get the new value from.
       * @return {Object}
       *      The value.
       */
      eventToVal: function (event) {
        return event.args[0][event.target];
      },

      /**
       * Maps anything to the constant true.
       * <p>
       *  Usage in a DSL expression:
       *  <pre>
       *    map(true)
       *  </pre>
       * </p>
       *
       * @for ProAct.DSL.predefined.mapping
       * @static
       * @method true
       * @param {Object} value
       *      Arbitrary value.
       * @return {Boolean}
       *      Just the `true` constant.
       */
      'true': function (event) {
        return true;
      },

      /**
       * Toggles a boolean value. If the value is `true` it becomes `false` and vice versa.
       * <p>
       *  Usage in a DSL expression:
       *  <pre>
       *    map(!)
       *  </pre>
       * </p>
       *
       * @for ProAct.DSL.predefined.mapping
       * @static
       * @method !
       * @param {Boolean} value
       *      A boolean value.
       * @return {Boolean}
       *      The opposite of `value`.
       */
      '!': function (value) {
        return !value;
      },

      /**
       * Adds the current time to the object value, called upon
       * If the value is not an object (for example it is a Number), it is returned as it is.
       *
       * <p>
       *  Usage in a DSL expression:
       *  <pre>
       *    map(time)
       *  </pre>
       * </p>
       *
       * @for ProAct.DSL.predefined.mapping
       * @static
       * @method time
       * @param {Object} value
       *      The object to modify with time.
       * @return {Object}
       *      The modified value.
       */
      'time': function (value) {
        if (P.U.isObject(value)) {
          value.time = new Date().getTime();
        }
        return value;
      }
    },

    /**
     * A set of predefined filtering operations to be used by the DSL.
     *
     * @class filtering
     * @namespace ProAct.DSL.predefined
     * @static
     */
    filtering: {

      /**
       * Filtering operation for filtering only odd Numbers.
       * <p>
       *  Usage in a DSL expression:
       *  <pre>
       *    filter(odd)
       *  </pre>
       * </p>
       *
       * @for ProAct.DSL.predefined.filtering
       * @static
       * @method odd
       * @param {Number} n
       *      The number to check if it is odd.
       * @return {Boolean}
       *      True, if the number is odd.
       */
      'odd': function (el) { return el % 2 !== 0; },

      /**
       * Filtering operation for filtering only even Numbers.
       * <p>
       *  Usage in a DSL expression:
       *  <pre>
       *    filter(even)
       *  </pre>
       * </p>
       *
       * @for ProAct.DSL.predefined.filtering
       * @static
       * @method even
       * @param {Number} n
       *      The number to check if it is even.
       * @return {Boolean}
       *      True, if the number is even.
       */
      'even': function (el) { return el % 2 === 0; },

      /**
       * Filtering operation for filtering only positive Numbers.
       * <p>
       *  Usage in a DSL expression:
       *  <pre>
       *    filter(+)
       *  </pre>
       * </p>
       *
       * @for ProAct.DSL.predefined.filtering
       * @static
       * @method +
       * @param {Number} n
       *      The number to check if it is positive.
       * @return {Boolean}
       *      True, if the number is positive or zero.
       */
      '+': function (el) { return el >= 0; },

      /**
       * Filtering operation for filtering only negative Numbers.
       * <p>
       *  Usage in a DSL expression:
       *  <pre>
       *    filter(-)
       *  </pre>
       * </p>
       *
       * @for ProAct.DSL.predefined.filtering
       * @static
       * @method -
       * @param {Number} n
       *      The number to check if it is negative.
       * @return {Boolean}
       *      True, if the number is negative or zero.
       */
      '-': function (el) { return el <= 0; },

      /**
       * Flitering operation for using a method of an object as a filter.
       * <p>
       *  Usage in a DSL expression:
       *  <pre>
       *    filter(&.&boolFunc)
       *  </pre>
       *  This will call the 'target.boolFunc' method and use its result as a filter.
       * </p>
       *
       * @for ProAct.DSL.predefined.filtering
       * @static
       * @method &.
       * @param {String} methodName
       *      The name of the method to use for filtering.
       * @return {Boolean}
       *      The result of the method call.
       */
      '&.': function (arg) {
        return function (el) {
          if (this.action) {
            return this.action.call(this.context, el);
          }

          var p = el[arg];
          if (!p) {
            return el;
          } else if (P.U.isFunction(p)) {
            this.action = p;
            this.context = el;
          } else {
            return p;
          }
        };
      },

      /**
       * Filtering operation for filtering only values different from undefined.
       * <p>
       *  Usage in a DSL expression:
       *  <pre>
       *    filter(defined)
       *  </pre>
       * </p>
       *
       * @for ProAct.DSL.predefined.filtering
       * @static
       * @method defined
       * @param {Event} event
       *      The value event to check if its value is defined.
       * @return {Boolean}
       *      True if the value in the event is not `undefined`.
       */
      defined: function (event) {
        return event.args[0][event.target] !== undefined;
      },

      /**
       * Filtering operation for filtering only events
       * that have null/undefined as a source.
       * <p>
       *  Usage in a DSL expression:
       *  <pre>
       *    filter(originalEvent)
       *  </pre>
       * </p>
       *
       * @for ProAct.DSL.predefined.filtering
       * @static
       * @method originalEvent
       * @param {Event} event
       *      The value event to check if it has a source or not.
       * @return {Boolean}
       *      True if the `event` passed has no source.
       */
      originalEvent: function (event) {
        return event.source === undefined || event.source === null;
      },

      /**
       * Filtering operation for passing everything.
       * <p>
       *  Usage in a DSL expression:
       *  <pre>
       *    filter(all)
       *  </pre>
       * </p>
       *
       * @for ProAct.DSL.predefined.filtering
       * @static
       * @method all
       * @param {Object} val
       *      Anything.
       * @return {Boolean}
       *      True.
       */
      all: function () {
        return true;
      }
    },

    /**
     * A set of predefined accumulation operations to be used by the DSL.
     *
     * @class accumulation
     * @namespace ProAct.DSL.predefined
     * @static
     */
    accumulation: {

      /**
       * Accumulation operation representing a sum of numbers.
       * <p>
       *  Usage in a DSL expression:
       *  <pre>
       *    acc(+)
       *  </pre>
       * </p>
       *
       * @for ProAct.DSL.predefined.accumulation
       * @static
       * @property +
       * @type Array
       */
      '+': [0, function (x, y) { return x + y; }],

      /**
       * Accumulation operation representing a product of numbers.
       * <p>
       *  Usage in a DSL expression:
       *  <pre>
       *    acc(*)
       *  </pre>
       * </p>
       *
       * @for ProAct.DSL.predefined.accumulation
       * @static
       * @constant
       * @property *
       * @type Array
       */
      '*': [1, function (x, y) { return x * y; }],

      /**
       * Accumulation operation representing string concatenation.
       * <p>
       *  Usage in a DSL expression:
       *  <pre>
       *    acc(+str)
       *  </pre>
       * </p>
       *
       * @for ProAct.DSL.predefined.accumulation
       * @static
       * @property +str
       * @type Array
       */
      '+str': ['', function (x, y) { return x + y; }],
    }
  },

  /**
   * Defines a new predefined function to be reused in the DSL.
   *
   * For example:
   * ```
   *   ProAct.DSL.defPredefined('filter', 'enter', function (event) {
   *    return event.keyCode === 13;
   *   });
   *
   * ```
   * creates a new `filtering` function, which can be used like this:
   * ```
   *   actor2 = actor1.filter('enter');
   * ```
   * the `actor2` in this case will recieve only the events with keyCode of `13`.
   *
   * @for ProAct.DSL
   * @static
   * @method defPredefined
   * @param {String} type
   *      One of the three -> `mapping`, `filtering` and `accumulation` types.
   * @param {String} id
   *      The identificator of the predefined function to be passed to trasfromation or filtering operations.
   * @param {Function|Array} operation
   *      The implementation of the operation.
   */
  defPredefined: function(type, id, operation) {
    if (type === 'm' || type === 'map') {
      type = 'mapping';
    }
    if (type === 'f' || type === 'filter') {
      type = 'filtering';
    }
    if (type === 'a' || type === 'acc' || type === 'accumulate') {
      type = 'accumulation';
    }

    ProAct.DSL.predefined[type][id] = operation;
  },

  /**
   * Extracts DSL actions and options from a string.
   * <p>
   *  Splits the passed <i>optionString</i> using {{#crossLink "ProAct.DSL/separator:property"}}{{/crossLink}} as saparator
   *  and calls {{#crossLink "ProAct.DSL/optionsFromArray:method"}}{{/crossLink}} on the result.
   * </p>
   *
   * @for ProAct.DSL
   * @static
   * @method optionsFromString
   * @param {String} optionString
   *      The string to use to extract options from.
   * @param [...]
   *      Parameters for the extracted actions/functions/operations.
   *      <p>
   *        For example if the string contains 'map($1)', the first argument passed after the <i>optionString</i> argument
   *        is passed to the 'map' operation.
   *      </p>
   * @return {Object}
   *      Object containing operations as fields and options(arguments) for these operations as values.
   *      <p>
   *        'map($1)|filter(+)|@($2)' becomes:
   *        <pre>
   *          {
   *            mapping: {first-argument-to-this-function-after-the-optionString-arg},
   *            filtering: ProAct.DSL.predefined.filtering['+'],
   *            on: {second-argument-to-this-function-after-the-optionString-arg}
   *          }
   *        </pre>
   *      </p>
   */
  optionsFromString: function (optionString) {
    return dsl.optionsFromArray.apply(null, [optionString.split(dsl.separator)].concat(slice.call(arguments, 1)));
  },

  /**
   * Extracts DSL actions and options from an array of strings.
   * <p>
   *  Example <i>optionArray</i> is ['map($1)', 'filter(+)', @($2)'] and it will become options object of functions and arguments to
   *  be applied on a target {{#crossLink "ProAct.Actor"}}{{/crossLink}} passed to the {{#crossLink "ProAct.DSL/run:method"}}{{/crossLink}} method.
   * </p>
   *
   * @for ProAct.DSL
   * @static
   * @method optionsFromArray
   * @param {Array} optionArray
   *      The array of strings to use to extract options from.
   * @param [...]
   *      Parameters for the extracted actions/functions/operations.
   *      <p>
   *        For example if the array contains 'map($1)', the first argument passed after the <i>optionArray</i> argument
   *        is passed to the 'map' operation.
   *      </p>
   * @return {Object}
   *      Object containing operations as fields and options(arguments) for these operations as values.
   *      <p>
   *        ['map($1)', 'filter(+)', @($2)'] becomes:
   *        <pre>
   *          {
   *            mapping: {first-argument-to-this-function-after-the-optionString-arg},
   *            filtering: ProAct.DSL.predefined.filtering['+'],
   *            on: {second-argument-to-this-function-after-the-optionString-arg}
   *          }
   *        </pre>
   *      </p>
   */
  optionsFromArray: function (optionArray) {
    var result = {}, i, ln = optionArray.length,
        ops = P.R.ops, op, opType;
    for (i = 0; i < ln; i++) {
      op = optionArray[i];
      for (opType in P.DSL.ops) {
        opType = P.DSL.ops[opType];
        if (opType.match(op)) {
          opType.toOptions.apply(opType, [result, op].concat(slice.call(arguments, 1)));
          break;
        }
      }
    }
    return result;
  },

  /**
   * Configures an {{#crossLink "ProAct.Actor"}}{{/crossLink}} using the DSL passed with the <i>options</i> argument.
   * <p>
   *  Uses the passed {{#crossLink "ProAct.Registry"}}{{/crossLink}} to read stored values from.
   * </p>
   *
   * @for ProAct.DSL
   * @static
   * @method
   * @param {ProAct.Actor} actor
   *      The target of the DSL operations.
   * @param {ProAct.Actor|String|Object} options
   *      The DSL formatted options to be used for the configuration.
   *      <p>
   *        If the value of this parameter is instance of {{#crossLink "ProAct.Actor"}}{{/crossLink}} it is set as a source to the <i>target actor</i>.
   *      </p>
   *      <p>
   *        If the value ot this parameter is String - {{#crossLink "ProAct.DSL/optionsFromString:method"}}{{/crossLink}} is used to be turned to an options object.
   *      </p>
   *      <p>
   *        If the values of this parameter is object, it is used to configure the <i>targed actor</i>.
   *      </p>
   *      <p>
   *        The format of the object should be something like:
   *        <pre>
   *          {
   *            dsl-operation: function|array-of-functions-and-arguments,
   *            dsl-operation: function|array-of-functions-and-arguments,
   *            dsl-operation: function|array-of-functions-and-arguments,
   *            ...
   *          }
   *        </pre>
   *      </p>
   * @param {ProAct.Registry} registry
   *      The registry to read stored values for the DSL operations.
   *      <p>
   *        For example if there is 'map(f:foo)', the mapping function is read from the registry at the key 'foo'.
   *      </p>
   * @param [...]
   *      Parameters for the DSL operations.
   *      <p>
   *        For example if the array contains 'map($1)', the first argument passed after the <i>actor</i>, <i>options</i> and <i>registry</i> arguments
   *        is passed to the 'map' operation.
   *      </p>
   * @return {ProAct.Actor}
   *      The configured actor.
   */
  run: function (actor, options, registry) {
    var isS = P.U.isString,
        args = slice.call(arguments, 3),
        option, i, ln, opType, oldOption,
        multiple = {};

    if (options && isS(options)) {
      options = dsl.optionsFromString.apply(null, [options].concat(args));
    }

    if (options && options instanceof P.Actor) {
      options = {into: options};
    }

    if (options && options.order) {
      ln = options.order.length;
      for (i = 0; i < ln; i++) {
        option = options.order[i];
        if (opType = dslOps[option]) {
          if (registry) {
            if (options.order.indexOf(option) !== options.order.lastIndexOf(option)) {
              if (multiple[option] === undefined) {
                multiple[option] = -1;
              }
              multiple[option] = multiple[option] + 1;
              oldOption = options[option];
              options[option] = options[option][multiple[option]];
            }
            options[option] = registry.toObjectArray(options[option]);
          }

          opType.action(actor, options);
          if (oldOption) {
            options[option] = oldOption;
            oldOption = undefined;

            if (multiple[option] >= options[option].length - 1) {
              delete options[option];
            }
          } else {
            delete options[option];
          }
        }
      }
    }

    for (opType in dslOps) {
      if (options && (option = options[opType])) {
        options[opType] = registry.toObjectArray(option);
      }
      opType = dslOps[opType];
      opType.action(actor, options);
    }

    return actor;
  }
};

dsl = P.DSL;
dslOps = dsl.ops;
