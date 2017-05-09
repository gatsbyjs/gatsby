// @flow
const _ = require(`lodash`)
const flatten = require(`flat`)

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
export const extractFieldExamples = (nodes: any[]) => {
  // $FlowFixMe
  return _.mergeWith({}, ...nodes, (obj, next) => {
    if (!_.isArray(obj || next)) return
    let array = [].concat(obj, next).filter(v => v != null)

    if (!array.length) return null

    // primitive values don't get merged further, just take the first item
    if (!_.isObject(array[0])) {
      return array.slice(0, 1)
    }

    return [extractFieldExamples(array)]
  })
}

export const buildFieldEnumValues = (nodes: any[]) => {
  const enumValues = {}
  const values = flatten(extractFieldExamples(nodes), {
    maxDepth: 3,
    safe: true, // don't flatten arrays.
  })
  Object.keys(values).forEach(field => {
    if (values[field] == null) return
    enumValues[field.replace(/\./g, `___`)] = { field }
  })

  return enumValues
}
