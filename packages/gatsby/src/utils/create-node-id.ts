import uuidv5 from "uuid/v5"
import XXH from "xxhashjs"

import report from "gatsby-cli/lib/reporter"

const SEED = 61773236 // "gezellig" (arbitrary seed)
const seedConstant = `638f7a53-c567-4eca-8fc1-b23efb1cfb2b`

/**
 * Generate a unique id that is consistent, deterministic, and fast while resulting in predictably short hashes.
 *
 * Some characteristics for this id:
 *
 * - The value of the `id` should not mean anything (it is "ours")
 * - The value does not need to be encrypted
 * - The value must be unique within our system (as little collision risk as possible on small ascii inputs)
 * - The value needs to be deterministic (same input always results in same output)
 * - The conversion needs to be fast (we used to use uuid, which called into crytpo for sha1, but it was super slow)
 * - The result should be predictably short as it may be used in urls
 *
 * High level this step is meant to prevent people from using our `id` to have meaning in their site and it's meant
 * to make sure the id ends up being short, whatever the input size was.
 *
 * For a long time, v2 used a regular UUID for this purpose. But creating UUIDs is slow due to calling into the native
 * crypto libraries. You can opt-in to using XXHash instead through an env flag (`GATSBY_EXPERIMENTAL_ID_XXHASH`) which
 * will be faster. But it might affect your site if you happen to use your id for slugs, for example. Ideally you
 * wouldn't and this change wouldn't be noticable to you.
 *
 * Relevant for XXH:
 * - https://github.com/pierrec/js-xxhash
 * - https://github.com/Cyan4973/xxHash
 * - https://github.com/Cyan4973/xxHash/wiki/Collision-ratio-comparison#collision-study
 * - https://github.com/Cyan4973/xxHash/wiki/Collision-ratio-comparison#testing-64-bit-hashes-on-small-inputs-
 *
 * @param {String | Number} id - A string of arbitrary length
 * @param {String} [namespace] - Namespace to use for UUID
 *
 * @return {String}
 */
export function createNodeId(
  id: string | number,
  namespace: string = ``
): string {
  if (typeof id === `number`) {
    id = id.toString()
  } else if (typeof id !== `string`) {
    report.panic(
      `Parameter passed to createNodeId must be a String or Number (got ${typeof id})`
    )
  }

  if (process.env.GATSBY_EXPERIMENTAL_ID_XXHASH) {
    const ns = namespace ? XXH.h32(namespace, SEED).toString(16) : ``
    const val = XXH.h32(id, SEED).toString(16)

    return `${ns}${val}`
  }

  return uuidv5(id, uuidv5(namespace, seedConstant))
}
