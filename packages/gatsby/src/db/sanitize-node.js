const _ = require(`lodash`)

/**
 * Make data serializable
 * @param {(Object|Array)} data to sanitize
 * @param {boolean} isNode = true
 * @param {Set<string>} path = new Set
 */
const sanitizeNode = (data, isNode = true, path = new Set()) => {
  const isPlainObject = _.isPlainObject(data)

  if (isPlainObject || _.isArray(data)) {
    path.add(data)

    const returnData = isPlainObject ? {} : []
    let anyFieldChanged = false
    _.each(data, (o, key) => {
      if (path.has(o)) return

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

    path.add(data)

    // arrays and plain objects are supported - no need to to sanitize
    return data
  }

  if (!isTypeSupported(data)) {
    return undefined
  } else {
    path.add(data)
    return data
  }
}

/**
 * @param {Object|Array} data
 * @returns {Object|Array} data without undefined values
 */
const omitUndefined = data => {
  const isPlainObject = _.isPlainObject(data)
  if (isPlainObject) {
    return _.pickBy(data, p => p !== undefined)
  }

  return data.filter(p => p !== undefined)
}

/**
 * @param {*} data
 * @return {boolean}
 */
const isTypeSupported = data => {
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

module.exports = sanitizeNode
