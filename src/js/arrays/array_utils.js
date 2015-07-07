ProAct.ArrayUtils = Pro.AU = {

  /**
   * Checks if the passed value is instance of the {{#crossLink "ProAct.Array"}}{{/crossLink}} type or not.
   *
   * @method isProArray
   * @param {Object} value The value to check.
   * @return {Boolean} True if the passed `value` is a ProAct.Array instance.
   */
  isProArray: function (value) {
    return value !== null && P.U.isObject(value) && P.U.isArray(value._array) && value.length !== undefined;
  },

  /**
   * Checks if the passed value is a valid array-like object or not.
   * Array like objects in ProAct.js are plain JavaScript arrays and {{#crossLink "ProAct.Array"}}{{/crossLink}}s.
   *
   * @method isArrayObject
   * @param {Object} value The value to check.
   * @return {Boolean} True if the passed `value` is an Array or ProAct.Array instance.
   */
  isArrayObject: function (value) {
    return P.U.isArray(value) || P.ArrayUtils.isProArray(value);
  }

};
