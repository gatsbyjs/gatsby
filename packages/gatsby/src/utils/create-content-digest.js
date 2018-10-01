const crypto = require(`crypto`)

/**
 * createContentDigest() Encrypts a String using md5 hash of hexadecimal digest.
 *
 * @param {String} data - A JSON string representing the input data
 *
 * @return {String} - The content digest
 */
const createContentDigest = data =>
  crypto
    .createHash(`md5`)
    .update(data)
    .digest(`hex`)

module.exports = createContentDigest
