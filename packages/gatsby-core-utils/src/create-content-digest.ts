import crypto, { type BinaryLike } from "node:crypto"
import objectHash from "node-object-hash"

const hasher = objectHash.hasher({
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

function hashPrimitive(input: BinaryLike | string): string {
  return crypto.createHash(`md5`).update(input).digest(`hex`)
}

/**
 * Hashes an input using md5 hash of hexadecimal digest.
 *
 * @param input The input to encrypt
 * @return The content digest
 */

export function createContentDigest(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input: BinaryLike | string | any,
): string {
  if (typeof input === `object` && !Buffer.isBuffer(input)) {
    return hasher.hash(input)
  }

  return hashPrimitive(input)
}
