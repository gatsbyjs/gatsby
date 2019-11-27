const objectHash = require(`node-object-hash`)

const objectHasher = objectHash({
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
const ObjectHasherWithArraySorting = objectHash({
  coerce: false,
  alg: `md5`,
  enc: `hex`,
  sort: true,
})

/**
 * @type {import('../index').createContentDigest}
 */
const createContentDigest = (input, options = {}) => {
  const hasher = options.sortArrays
    ? ObjectHasherWithArraySorting
    : objectHasher

  return hasher.hash(input)
}

module.exports = createContentDigest
