// @flow
const _ = require(`lodash`)
const flatten = require(`flat`)
const typeOf = require(`type-of`)
const invariant = require(`invariant`)

const createKey = require(`./create-key`)
const { typeConflictReporter } = require(`./type-conflict-reporter`)

import type { TypeEntry } from "./type-conflict-reporter"

type ExampleValue = Object

const INVALID_VALUE = Symbol(`INVALID_VALUE`)
const isDefined = v => v != null

const isEmptyObjectOrArray = (obj: any): boolean => {
  if (obj === INVALID_VALUE) {
    return true
  } else if (_.isDate(obj)) {
    return false
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

const isScalar = val => !_.isObject(val) || val instanceof Date

const extractTypes = value => {
  if (Array.isArray(value)) {
    const uniqueTypes = _.uniq(
      value.filter(isDefined).map(item => extractTypes(item).type)
    ).sort()
    return {
      type: `array<${uniqueTypes.join(`|`)}>`,
      arrayTypes: uniqueTypes,
    }
  } else {
    const type = typeOf(value)
    return {
      type,
      arrayTypes: [],
    }
  }
}

const getExampleScalarFromArray = values =>
  _.reduce(
    values,
    (value, nextValue) => {
      // Prefer floats over ints as they're more specific.
      if (value && _.isNumber(value) && !_.isInteger(value)) {
        return value
      } else if (value === null) {
        return nextValue
      } else {
        return value
      }
    },
    null
  )

const extractFromEntries = (
  entries: TypeEntry[],
  selector: string,
  key: string
): ?mixed => {
  const entriesOfUniqueType = _.uniqBy(entries, entry => entry.type)

  if (entriesOfUniqueType.length == 0) {
    // skip if no defined types
    return null
  } else if (
    entriesOfUniqueType.length > 1 ||
    entriesOfUniqueType[0].arrayTypes.length > 1
  ) {
    // there is multiple types or array of multiple types
    if (selector) {
      typeConflictReporter.addConflict(selector, entriesOfUniqueType)
    }
    return INVALID_VALUE
  }

  // Now we have entries of single type, we can merge them
  const values = entries.map(entry => entry.value)

  const exampleValue = entriesOfUniqueType[0].value

  if (isScalar(exampleValue)) {
    return getExampleScalarFromArray(values)
  } else if (_.isObject(exampleValue)) {
    if (Array.isArray(exampleValue)) {
      const concatanedItems = [].concat(...values)
      // Linked node arrays don't get reduced further as we
      // want to preserve all the linked node types.
      if (key.includes(`___NODE`)) {
        return concatanedItems
      }

      return extractFromArrays(concatanedItems, entries, selector)
    } else if (_.isPlainObject(exampleValue)) {
      return extractFieldExamples(values, selector)
    }
  }
  // unsuported object
  return INVALID_VALUE
}

const extractFromArrays = (values, entries: TypeEntry[], selector: string) => {
  const filteredItems = values.filter(isDefined)
  if (filteredItems.length === 0) {
    return null
  }
  if (isScalar(filteredItems[0])) {
    return [getExampleScalarFromArray(filteredItems)]
  }

  const flattenEntries: TypeEntry[] = _.flatten(
    entries.map(entry => {
      invariant(
        Array.isArray(entry.value),
        `this is validated in the previous call`
      )

      return entry.value.map(value => {
        return {
          value,
          parent: entry.parent,
          ...extractTypes(value),
        }
      })
    })
  )

  const arrayItemExample = extractFromEntries(
    flattenEntries,
    `${selector}[]`,
    ``
  )
  if (!isDefined(arrayItemExample) || arrayItemExample === INVALID_VALUE) {
    return INVALID_VALUE
  }

  return [arrayItemExample]
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
const extractFieldExamples = (
  nodes: any[],
  selector: string,
  ignoreFields?: string[] = []
): ExampleValue => {
  // get list of keys in all nodes
  const allKeys = _(nodes)
    .flatMap(_.keys)
    .uniq()

  const example = {}
  for (let key of allKeys) {
    if (ignoreFields.includes(key)) continue
    const nextSelector = selector ? `${selector}.${key}` : key

    const nodeWithValues = nodes.filter(node => {
      if (!node) return false

      const value = node[key]
      if (_.isObject(value)) {
        return !isEmptyObjectOrArray(value)
      } else {
        return isDefined(value)
      }
    })

    // we want to keep track of nodes as we need it to get origin of data
    const entries = nodeWithValues.map(node => {
      const value = node[key]
      return {
        value,
        parent: node,
        ...extractTypes(value),
      }
    })

    const value = extractFromEntries(entries, nextSelector, key)
    if (!isDefined(value)) continue

    example[key] = value
  }

  return example
}

const buildFieldEnumValues = (options: ExampleValueOptions) => {
  const enumValues = {}
  const values = flatten(getExampleValues(options), {
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

let typeExampleValues: Map<string, Object> = new Map()

const clearTypeExampleValues = () => {
  typeExampleValues.clear()
  typeConflictReporter.clearConflicts()
}

type ExampleValueOptions = {
  nodes: Object[],
  typeName?: string,
  ignoreFields?: string[],
}

const getExampleValues = ({
  nodes,
  typeName,
  ignoreFields,
}: ExampleValueOptions): ExampleValue => {
  const cachedValue = typeName && typeExampleValues.get(typeName)

  // if type is defined and is in example value cache return it
  if (cachedValue) return cachedValue

  // if nodes were passed extract field example from it
  if (nodes && nodes.length > 0) {
    const exampleValue = extractFieldExamples(
      nodes,
      typeName || ``,
      ignoreFields
    )
    // if type is set - cache results
    if (typeName) typeExampleValues.set(typeName, exampleValue)
    return exampleValue
  }

  return {}
}

// extract a list of field names
// nested objects get flattened to "outer___inner" which will be converted back to
// "outer.inner" by run-sift
const extractFieldNames = (nodes: Object[]) => {
  const values = flatten(
    getExampleValues({
      nodes,
      typeName: _.get(nodes[0], `internal.type`),
    }),
    {
      maxDepth: 3,
      safe: true, // don't flatten arrays.
      delimiter: `___`,
    }
  )

  return Object.keys(values)
}

module.exports = {
  INVALID_VALUE,
  buildFieldEnumValues,
  extractFieldNames,
  isEmptyObjectOrArray,
  clearTypeExampleValues,
  getExampleValues,
}
