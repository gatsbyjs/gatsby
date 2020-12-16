/**
 * A pretty cool jsdoc example
 * @param {string} paramName A nice crispy apple
 * @example
 * const apple = require('apple')
 * apple()
 */
exports.apple = paramName => {
  console.log(`hi`)
}

/**
 * A js doc with multiple examples, some of them with caption
 * @example
 * const pear = require('pear')
 * pear()
 * @example <caption>How to async pear</caption>
 * const pear = require('pear')
 * await pear()
 */
exports.pear = paramName => {
  console.log(`bye`)
}
