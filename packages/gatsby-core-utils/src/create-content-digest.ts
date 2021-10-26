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
  crypto.createHash(`md5`).update(input).digest(`hex`)

/**
 * Hashes an input using md5 hash of hexadecimal digest.
 *
 * @param input The input to encrypt
 * @return The content digest
 */

export const createContentDigest = (
  input: BinaryLike | string | any
): string => {
  if (typeof input === `object` && !Buffer.isBuffer(input)) {
    if (`internal` in input) {
      return hasher.hash({
        ...input,
        internal: {
          ...input.internal,
          // Remove auto-generated fields that'd prevent
          // creating a consistent contentDigest.
          contentDigest: undefined,
          owner: undefined,
          fieldOwners: undefined,
          ignoreType: undefined,
          counter: undefined,
        },
        fields: undefined,
      })
    } else {
      return hasher.hash(input)
    }
  }

  return hashPrimitive(input)
}
