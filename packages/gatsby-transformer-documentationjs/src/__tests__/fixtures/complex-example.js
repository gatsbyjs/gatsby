/**
 * Description of callback type
 * @callback CallbackType
 * @param {string} message A message to split
 * @returns {string[]} Split message
 */

/**
 * More complex example
 */
exports.complex = {
  /**
   * Description of object type
   * @typedef {Object} ObjectType
   * @property {Promise<any>} ready Returns promise that resolves when instance is ready to use
   * @property {Object} nested This is nested object
   * @property {string} nested.foo This is field in nested object
   * @property {number} [nested.optional] This is optional field in nested object
   * @property {CallbackType} nested.callback This is function in nested object
   */

  /**
   * Description of function
   * @type {(ObjectType|Object)}
   */
  object: {
    ready: new Promise(),
    nested: {
      foo: `bar`,
      callback: message => {
        return message.split(`,`)
      }
    }
  }
}
