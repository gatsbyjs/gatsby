import { isPlainObject, pickBy, isArray, each } from "es-toolkit/compat"

import type { IGatsbyNode } from "../redux/types"
import type { GatsbyIterable } from "../datastore/common/iterable"

type Data = IGatsbyNode | GatsbyIterable<IGatsbyNode>

type OmitUndefined = (data: Data) => Partial<Data>

/**
 * @param {Object|Array} data
 * @returns {Object|Array} data without undefined values
 */
const omitUndefined: OmitUndefined = data => {
  const isPlainObjectCheck = isPlainObject(data)
  if (isPlainObjectCheck) {
    return pickBy(data, p => p !== undefined)
  }

  return (data as GatsbyIterable<IGatsbyNode>).filter(p => p !== undefined)
}

type isTypeSupported = (data: Data) => boolean

/**
 * @param {*} data
 * @return {boolean} Boolean if type is supported
 */
const isTypeSupported: isTypeSupported = data => {
  if (data === null) {
    return true
  }

  const type = typeof data
  const isSupported =
    type === `number` ||
    type === `string` ||
    type === `boolean` ||
    data instanceof Date

  return isSupported
}

type sanitizeNode = (
  data: Data,
  isNode?: boolean,
  path?: Set<unknown>
) => Data | undefined

/**
 * Make data serializable
 * @param {(Object|Array)} data to sanitize
 * @param {boolean} isNode = true
 * @param {Set<string>} path = new Set
 */
export const sanitizeNode: sanitizeNode = (
  data,
  isNode = true,
  path = new Set()
) => {
  const isPlainObjectCheck = isPlainObject(data)
  const isArrayCheck = isArray(data)

  if (isPlainObjectCheck || isArrayCheck) {
    if (path.has(data)) return data
    path.add(data)

    const returnData = isPlainObjectCheck
      ? ({} as IGatsbyNode)
      : ([] as Array<IGatsbyNode>)
    let anyFieldChanged = false

    // each is a "Collection" method and thus objects with "length" property are iterated as arrays
    const hasLengthProperty = isPlainObjectCheck
      ? Object.prototype.hasOwnProperty.call(data, `length`)
      : false
    let lengthProperty
    if (hasLengthProperty) {
      lengthProperty = (data as IGatsbyNode).length
      delete (data as IGatsbyNode).length
    }

    each(data, (value, key) => {
      if (isNode && key === `internal`) {
        returnData[key] = value
        return
      }
      returnData[key] = sanitizeNode(value as Data, false, path)

      if (returnData[key] !== value) {
        anyFieldChanged = true
      }
    })

    if (hasLengthProperty) {
      ;(data as IGatsbyNode).length = lengthProperty
      returnData.length = sanitizeNode(lengthProperty as Data, false, path)
      if (returnData.length !== lengthProperty) {
        anyFieldChanged = true
      }
    }

    if (anyFieldChanged) {
      data = omitUndefined(returnData as Data) as Data
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
