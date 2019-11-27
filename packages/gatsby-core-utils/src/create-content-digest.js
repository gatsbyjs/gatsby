const objectHash = require(`node-object-hash`)

const hasher = objectHash({
  coerce: false,
  alg: `md5`,
  enc: `hex`,
  sort: {
    map: true,
    object: true,
    array: false,
    set: false,
  },
})

/**
 * @type {import('../index').createContentDigest}
 */
const createContentDigest = input => hasher.hash(input)

module.exports = createContentDigest
