import _ from "lodash"

import type { IGatsbyNode } from "../redux/types"
import type { GatsbyIterable } from "../datastore/common/iterable"

type data = IGatsbyNode | GatsbyIterable<IGatsbyNode>

/**
 * @param {Object|Array} data
 * @returns {Object|Array} data without undefined values
 */
type omitUndefined = (data: data) => Partial<data>

const omitUndefined: omitUndefined = data => {
  const isPlainObject = _.isPlainObject(data)
  if (isPlainObject) {
    return _.pickBy(data, p => p !== undefined)
  }

  return (data as GatsbyIterable<IGatsbyNode>).filter(p => p !== undefined)
}

/**
 * @param {*} data
 * @return {boolean}
 */
type isTypeSupported = (data: data) => boolean

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

/**
 * Make data serializable
 * @param {(Object|Array)} data to sanitize
 * @param {boolean} isNode = true
 * @param {Set<string>} path = new Set
 */

type sanitizeNode = (
  data: data,
  isNode?: boolean,
  path?: Set<unknown>
) => data | undefined

const sanitizeNode: sanitizeNode = (data, isNode = true, path = new Set()) => {
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
      returnData[key] = sanitizeNode(o as data, false, path)

      if (returnData[key] !== o) {
        anyFieldChanged = true
      }
    })

    if (anyFieldChanged) {
      data = omitUndefined(returnData as data) as data
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

export default sanitizeNode
