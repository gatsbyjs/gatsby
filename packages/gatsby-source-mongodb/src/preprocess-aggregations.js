/**
 * Filters out empty or wrong formatted aggregations.
 * Re-formats unnamed aggregations (shorthand format) into named format.
 * ```
 * {
 *  'collection_1' : {
 *    'aggregation_1': [ … ],
 *    'aggregation_2': [ … ],
 *  },
 *  'collection_2' : {
 *    'aggregation_1': [ … ],
 *  },
 *  …
 * }
 * ```
 * See tests for more information about exact behavior.
 */
module.exports = function preprocessAggregations(aggregations) {
  const isNonEmptyObject = (o) => !!o && typeof o === 'object' && !!Object.keys(o).length
  const isArray = (a) => !!a && Array.isArray(a)

  return Object.entries(aggregations)
    // Filter out illegal collection-keys (empty values or non-objects)
    .filter(([_, value]) => {
      if (!isNonEmptyObject(value) && !isArray(value)) return false
      return true
    })
    // Filter out illegal aggregation-keys (non-arrays)
    .map(([key, value]) => {
      if (!isArray(value)) {
        value = Object.entries(value)
          .filter(([_, childValue]) => isArray(childValue))
          .reduce((acc, [childKey, childValue]) => ({ ...acc, [childKey]: childValue }), {})
        if (!Object.keys(value).length) return null
      }
      return [key, value]
    })
    // Filter out collection-keys with only incorrect aggregations
    .filter(Boolean)
    // Re-build & format object
    .reduce((acc, [key, value]) => {
      if (isArray(value)) {
        value = {
          'aggregation': value
        }
      }
      return { ...acc, [key]: value }
    }, {})
}
