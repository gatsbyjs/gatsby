import _ from "lodash"

const isTypeSupported = (data: unknown): boolean => {
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

const omitUndefined = (data: any): any => {
  const isPlainObject = _.isPlainObject(data)
  if (isPlainObject) {
    return _.pickBy(data, p => p !== undefined)
  }

  return data.filter(p => p !== undefined)
}

export const sanitizeNode = (
  data: any,
  isNode: boolean = true,
  path: Set<string> = new Set()
): any => {
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
      returnData[key] = sanitizeNode(o, false, path)

      if (returnData[key] !== o) {
        anyFieldChanged = true
      }
    })

    if (anyFieldChanged) {
      data = omitUndefined(returnData)
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
