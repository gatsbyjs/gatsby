import crypto, { BinaryLike } from "crypto"
import objectHash from "node-object-hash"

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

const hashPrimitive = (input: BinaryLike | string): string =>
  crypto
    .createHash(`md5`)
    .update(input)
    .digest(`hex`)

const createContentDigest = (
  input: BinaryLike | string | Parameters<typeof hasher.hash>[0]
): string => {
  if (typeof input === `object`) {
    return hasher.hash(input)
  }

  return hashPrimitive(input)
}

export default createContentDigest
