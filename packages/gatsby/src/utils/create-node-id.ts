import uuidv5 from "uuid/v5"
import report from "gatsby-cli/lib/reporter"

const seedConstant = `638f7a53-c567-4eca-8fc1-b23efb1cfb2b`

/**
 * createNodeId() Generate UUID
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
      `Parameter passed to createNodeId must be a String or Number (got ${typeof id})`
    )
  }

  return uuidv5(id, uuidv5(namespace, seedConstant))
}
