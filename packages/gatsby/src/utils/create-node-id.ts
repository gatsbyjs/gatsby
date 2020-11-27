import uuidv5 from "uuid/v5"
import report from "gatsby-cli/lib/reporter"

const seedConstant = `638f7a53-c567-4eca-8fc1-b23efb1cfb2b`

// This cache prevents duplicate calls to uuid which is relevant for certain cases
const unprefixedCache: Map<string, string> = new Map()
// ns -> name -> uuid
const namespacedCache: Map<string, Map<string, string>> = new Map([
  [``, unprefixedCache],
])

/**
 * Generate a unique id that is consistent, deterministic, and fast while resulting in predictably short hashes.
 *
 * Some characteristics for this id:
 *
 * - The value of the `id` should not mean anything (it is "ours")
 * - The value does not need to be encrypted
 * - The value must be unique within our system (as little collision risk as possible on small ascii inputs)
 * - The value needs to be deterministic (same input always results in same output)
 * - The conversion needs to be fast
 * - The result should be predictably short as it may be used in urls
 *
 * High level this step is meant to prevent people from using our `id` to have meaning in their site and it's meant
 * to make sure the id ends up being short, whatever the input size was.
 *
 * Note: UUID is relatively slow because it calls into the native crypto library to generate SHA-1 hashes.
 *       We do need the low collision rate of SHA-1 so we use a local (global) cache to speed up repetitive calls
 *
 * @param {String | Number} id - A string of arbitrary length
 * @param {String} namespace - Namespace to use for UUID
 *
 * @return {String} - UUID
 */
export function createNodeId(id: string | number, namespace: string): string {
  if (typeof id === `number`) {
    id = id.toString()
  } else if (typeof id !== `string`) {
    report.panic(
      `The \`id\` parameter passed to createNodeId must be a String or Number (got ${typeof id})`
    )
  } else if (typeof namespace !== `string`) {
    report.panic(
      `The \`namespace\` parameter passed to createNodeId must be a String (got ${typeof namespace})`
    )
  }

  let nsHash = unprefixedCache.get(namespace)
  if (!nsHash) {
    nsHash = uuidv5(namespace, seedConstant) as string
    unprefixedCache.set(namespace, nsHash)
  }

  // Calling uuid is relatively expensive because it calls into crypto for sha1.
  // We use a local map to cache calls with the same ns+id pair, which helps a lot.
  let nsCache = namespacedCache.get(namespace)
  if (!nsCache) {
    nsCache = new Map()
    namespacedCache.set(namespace, nsCache)
  }

  let hash = nsCache.get(id)
  if (hash) {
    return hash
  }

  hash = uuidv5(id, nsHash) as string
  nsCache.set(id, hash)
  return hash
}
