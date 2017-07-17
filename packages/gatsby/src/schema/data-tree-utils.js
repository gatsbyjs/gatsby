// @flow
const _ = require(`lodash`)
const flatten = require(`flat`)
const typeOf = require(`type-of`)

const createKey = require(`./create-key`)

const INVALID_VALUE = Symbol(`INVALID_VALUE`)
const isDefined = v => v != null

const isSameType = (a, b) => a == null || b == null || typeOf(a) === typeOf(b)
const areAllSameType = list =>
  list.every((current, i) => {
    let prev = i ? list[i - 1] : undefined
    return isSameType(prev, current)
  })

const isEmptyObjectOrArray = (obj: any): boolean => {
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
  return false
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
  _.mergeWith(
    _.isArray(nodes[0]) ? [] : {},
    ...nodes,
    (obj, next, key, po, pn, stack) => {
      if (obj === INVALID_VALUE) return obj

      // TODO: if you want to support infering Union types this should be handled
      // differently. Maybe merge all like types into examples for each type?
      // e.g. union: [1, { foo: true }, ['brown']] -> Union Int|Object|List
      if (!isSameType(obj, next)) return INVALID_VALUE

      if (!_.isArray(obj || next)) {
        // Prefer floats over ints as they're more specific.
        if (obj && _.isNumber(obj) && !_.isInteger(obj)) return obj
        if (obj === null) return next
        if (next === null) return obj
        return undefined
      }

      let array = [].concat(obj, next).filter(isDefined)

      if (!array.length) return null
      if (!areAllSameType(array)) return INVALID_VALUE

      // Linked node arrays don't get reduced further as we
      // want to preserve all the linked node types.
      if (_.includes(key, `___NODE`)) {
        return array
      }

      // primitive values don't get merged further, just take the first item
      if (!_.isObject(array[0])) return array.slice(0, 1)
      let merged = extractFieldExamples(array)
      return isDefined(merged) ? [merged] : null
    }
  )

const buildFieldEnumValues = (nodes: any[]) => {
  const enumValues = {}
  const values = flatten(extractFieldExamples(nodes), {
    maxDepth: 3,
    safe: true, // don't flatten arrays.
    delimiter: `___`,
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
