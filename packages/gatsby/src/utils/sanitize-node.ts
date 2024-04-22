// eslint-disable-next-line @typescript-eslint/naming-convention
import _ from "lodash"

import type { IGatsbyNode, IGatsbyPage } from "../redux/types"

// export type Data = IGatsbyNode | Array<IGatsbyNode>

type OmitUndefined = (
  data: IGatsbyNode,
) => Partial<IGatsbyNode> | Array<Partial<IGatsbyNode>> | undefined

/**
 * @param {Object|Array} data
 * @returns {Object|Array} data without undefined values
 */
const omitUndefined: OmitUndefined = function omitUndefined(
  data: IGatsbyNode | Array<IGatsbyNode>,
): Partial<IGatsbyNode> | Array<Partial<IGatsbyNode>> | undefined {
  if (_.isPlainObject(data)) {
    return _.pickBy(data, Boolean) as Partial<IGatsbyNode>
  }

  if (Array.isArray(data)) {
    return data.filter(Boolean)
  }

  return undefined
}

type isTypeSupported = (data: IGatsbyPage | IGatsbyNode) => boolean

/**
 * @param {*} data
 * @return {boolean} Boolean if type is supported
 */
const isTypeSupported: isTypeSupported = function isTypeSupported(
  data: IGatsbyPage | IGatsbyNode,
) {
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
  data: IGatsbyNode | IGatsbyPage,
  isNode?: boolean | undefined,
  path?: Set<IGatsbyNode | IGatsbyPage> | undefined,
) => IGatsbyNode | IGatsbyPage | undefined

/**
 * Make data serializable
 * @param {IGatsbyNode | undefined} data to sanitize
 * @param {boolean | undefined} isNode = true
 * @param {Set<string> | undefined} path = new Set
 */
export const sanitizeNode: sanitizeNode = function sanitizeNode(
  data: IGatsbyNode | IGatsbyPage,
  isNode: boolean | undefined = true,
  path: Set<IGatsbyNode | IGatsbyPage> | undefined = new Set<IGatsbyNode>(),
): IGatsbyNode | IGatsbyPage | undefined {
  const isPlainObject = _.isPlainObject(data)
  const isArray = _.isArray(data)

  if (isPlainObject || isArray) {
    if (path.has(data)) return data
    path.add(data)

    const returnData = isPlainObject
      ? ({} as IGatsbyNode)
      : ([] as Array<IGatsbyNode>)
    let anyFieldChanged = false

    // _.each is a "Collection" method and thus objects with "length" property are iterated as arrays
    const hasLengthProperty = isPlainObject
      ? Object.prototype.hasOwnProperty.call(data, `length`)
      : false
    let lengthProperty
    if (hasLengthProperty) {
      lengthProperty = (data as IGatsbyNode).length
      delete (data as IGatsbyNode).length
    }

    _.each(data, (value, key) => {
      if (isNode && key === `internal`) {
        returnData[key] = value
        return
      }
      returnData[key] = sanitizeNode(value as IGatsbyNode, false, path)

      if (returnData[key] !== value) {
        anyFieldChanged = true
      }
    })

    if (hasLengthProperty) {
      ;(data as IGatsbyNode).length = lengthProperty
      returnData.length = sanitizeNode(
        lengthProperty as IGatsbyNode,
        false,
        path,
      )
      if (returnData.length !== lengthProperty) {
        anyFieldChanged = true
      }
    }

    if (anyFieldChanged) {
      data = omitUndefined(returnData as IGatsbyNode) as IGatsbyNode
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
