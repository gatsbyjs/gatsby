// @flow
const _ = require(`lodash`)
const flatten = require(`flat`)
const typeOf = require(`type-of`)

const createKey = require(`./create-key`)

const INVALID_VALUE = Symbol(`INVALID_VALUE`)
const isDefined = v => v != null

const isSameType = (a, b) => a == null || b == null || typeOf(a) === typeOf(b)

const isEmptyObjectOrArray = (obj: any) => {
  let isEmpty = false

  if (obj === INVALID_VALUE) {
    return true
    // Simple "is object empty" check.
  } else if (_.isObject(obj) && _.isEmpty(obj)) {
    return true
  } else if (_.isObject(obj)) {
    return _.every(obj, (value, key) => {
      if (!isDefined(value)) {
        return true
      } else if (_.isObject(value)) {
        return isEmptyObjectOrArray(value)
      } else {
        return false
      }
    })
  }
}

/**
 * Takes an array of source nodes and returns a pristine
 * example that can be used to infer types.
 *
 * Arrays are flattened to either: `null` for empty or sparse arrays or a
 * an array of a sigle merged example. e.g:
 *
 *  - ['red'], ['blue', 'yellow'] -> ['red']
 *  - [{ color: 'red'}, { color: 'blue', ht: 5 }] -> [{ color: 'red', ht: 5 }]
 *
 * @param {*Nodes} args
 */
const extractFieldExamples = (nodes: any[]) =>
  // $FlowFixMe
  _.mergeWith({}, ...nodes, (obj, next, key, o, s, stack) => {
    if (obj === INVALID_VALUE) return obj

    // TODO: if you want to support infering Union types this should be handled
    // differently. Maybe merge all like types into examples for each type?
    // e.g. union: [1, { foo: true }, ['brown']] -> Union Int|Object|List
    if (!isSameType(obj, next)) return INVALID_VALUE

    if (!_.isArray(obj || next)) {
      if (obj === null) return next
      if (next === null) return obj
      return
    }

    let array = [].concat(obj, next).filter(isDefined)

    if (!array.length) return null

    // primitive values don't get merged further, just take the first item
    if (!_.isObject(array[0])) {
      return array.slice(0, 1)
    }
    let merged = extractFieldExamples(array)
    return isDefined(merged) ? [merged] : null
  })

const buildFieldEnumValues = (nodes: any[]) => {
  const enumValues = {}
  const values = flatten(extractFieldExamples(nodes), {
    maxDepth: 3,
    safe: true, // don't flatten arrays.
  })
  Object.keys(values).forEach(field => {
    if (values[field] == null) return
    enumValues[createKey(field)] = { field }
  })

  return enumValues
}

module.exports = {
  INVALID_VALUE,
  extractFieldExamples,
  buildFieldEnumValues,
  isEmptyObjectOrArray,
}
