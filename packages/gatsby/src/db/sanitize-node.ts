import _ from "lodash"
import { Node } from "gatsby"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ObjectOrArray = Record<string, any> | Array<any> | Node

/**
 * Removes undefined keys from and Object or Array
 */
const omitUndefined = <T extends ObjectOrArray>(data: T): T => {
  const isPlainObject = _.isPlainObject(data)
  if (isPlainObject) {
    return _.pickBy(data, p => p !== undefined) as T
  }

  return data.filter(p => p !== undefined)
}

const isTypeSupported = (data: unknown): boolean => {
  if (data === null) {
    return true
  }

  const type = typeof data
  return (
    type === `number` ||
    type === `string` ||
    type === `boolean` ||
    data instanceof Date
  )
}

/**
 * Make data serializable
 */
export function sanitizeNode<T extends Node>(
  data: T,
  isNode: boolean = true,
  path: Set<T> = new Set()
): T | undefined {
  const isPlainObject = _.isPlainObject(data)

  if (isPlainObject || _.isArray(data)) {
    if (path.has(data)) return data
    path.add(data)

    const returnData = isPlainObject ? {} : []
    let anyFieldChanged = false
    _.each(data, (o, key) => {
      if (isNode && key === `internal`) {
        returnData[key] = o
        return
      }
      returnData[key] = sanitizeNode(o as T, false, path)

      if (returnData[key] !== o) {
        anyFieldChanged = true
      }
    })

    if (anyFieldChanged) {
      data = omitUndefined(returnData) as T
    }

    // arrays and plain objects are supported - no need to to sanitize
    return data
  }

  if (!isTypeSupported(data)) {
    return undefined
  } else {
    return data
  }
}
