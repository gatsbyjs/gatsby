const { reportConflict } = require(`./type-conflict-reporter`)
const {
  createSelector,
  getUniqueValues,
  getUniqueValuesBy,
  isDate,
} = require(`../utils`)

const getType = value => {
  switch (typeof value) {
    case `number`:
      return `number`
    case `string`:
      return isDate(value) ? `date` : `string`
    case `boolean`:
      return `boolean`
    case `object`:
      if (value === null) return null
      if (value instanceof Date) return `date`
      if (Array.isArray(value)) {
        const values = value.filter(v => v != null)
        if (!values.length) return null
        return `[${getUniqueValues(values.map(getType)).join(`,`)}]`
      }
      if (!Object.keys(value)) return null
      return `object`
    default:
      return null
  }
}

const getExampleObject = (nodes, prefix) => {
  const allKeys = nodes.reduce(
    (acc, node) =>
      Object.keys(node).forEach(key => !acc.has(key) && acc.add(key)) || acc,
    new Set()
  )

  const exampleValue = Array.from(allKeys).reduce((acc, key) => {
    const entries = nodes
      .map(node => {
        const value = node[key]
        const type = getType(value)
        return type && { value, type, parent: node }
      })
      .filter(Boolean)

    const selector = createSelector(prefix, key)

    const types = getUniqueValuesBy(entries, entry => entry.type)
    if (!types.length) return acc
    if (types.length > 1 || types[0].type.includes(`,`)) {
      // FIXME: if(!isMixOfDateAndString)
      //
      reportConflict(selector, types)
      return acc
    }

    // TODO: This whole thing could be prettier!
    let { value /*, type */ } = entries[0]
    let arrayWrappers = 0
    let exampleFieldValue
    while (Array.isArray(value)) {
      value = value[0]
      arrayWrappers++
    }
    if (value && typeof value === `object`) {
      const objects = entries.reduce((acc, entry) => {
        let { value } = entry
        if (arrayWrappers) {
          let arrays = arrayWrappers - 1
          while (arrays--) value = value[0]
        }
        return acc.concat(value)
      }, [])
      const exampleObject = getExampleObject(objects, selector)
      if (!Object.keys(exampleObject).length) return acc
      exampleFieldValue = exampleObject
    } else {
      // TODO: prefer float! or do it in inferType?
      exampleFieldValue = value
    }
    while (arrayWrappers--) {
      exampleFieldValue = [exampleFieldValue]
    }
    acc[key] = exampleFieldValue

    return acc
  }, {})

  return exampleValue
}

// const cache = new Map()

const getExampleValue = ({ nodes, typeName }) => {
  // if (cache.has(typeName)) {
  //   return cache.get(typeName)
  // }
  const exampleValue = getExampleObject(nodes, typeName)
  // cache.set(typeName, exampleValue)
  return exampleValue
}

module.exports = {
  getExampleValue,
}
