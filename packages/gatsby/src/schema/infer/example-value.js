const { reportConflict } = require(`./type-conflict-reporter`)
const {
  createSelector,
  getUniqueValues,
  getUniqueValuesBy,
  is32bitInteger,
  isDate,
  isDefined,
  isObject,
} = require(`../utils`)

const isMixOfDatesAndStrings = (types, arrayWrappers) => {
  const acc = new Set()
  types.every(type => {
    let arrays = arrayWrappers
    while (arrays--) {
      if (type.startsWith(`[`)) {
        type = type.slice(1, -1)
      } else {
        return false
      }
    }
    type.split(`,`).forEach(t => acc.add(t))
    return true
  })
  return acc.size === 2 && acc.has(`date`) && acc.has(`string`)
}

const findFloat = entries => {
  let result
  const find = numbers =>
    numbers.some(value => {
      const number = typeof value === `object` ? value.value : value
      return Array.isArray(number)
        ? find(number)
        : !is32bitInteger(number) && (result = number)
    })
  find(entries)
  return result
}

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
      if (value instanceof String) return `string`
      if (Array.isArray(value)) {
        const uniqueValues = getUniqueValues(
          value.map(getType).filter(isDefined)
        )
        return uniqueValues.length ? `[${uniqueValues.join(`,`)}]` : null
      }
      if (!Object.keys(value).length) return null
      return `object`
    default:
      return null
  }
}

const getExampleObject = (nodes, prefix, ignoreFields = []) => {
  const allKeys = nodes.reduce(
    (acc, node) =>
      Object.keys(node).forEach(
        key => key && !ignoreFields.includes(key) && acc.add(key)
      ) || acc,
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

    const entriesByType = getUniqueValuesBy(entries, entry => entry.type)
    if (!entriesByType.length) return acc

    // TODO: This whole thing could be prettier!

    let { value, type } = entriesByType[0]
    let arrayWrappers = 0
    while (Array.isArray(value)) {
      value = value[0]
      arrayWrappers++
    }

    if (entriesByType.length > 1 || type.includes(`,`)) {
      if (
        isMixOfDatesAndStrings(
          entriesByType.map(entry => entry.type),
          arrayWrappers
        )
      ) {
        value = `String`
      } else {
        reportConflict(selector, entriesByType)
        return acc
      }
    }

    let exampleFieldValue
    if (isObject(value)) {
      const objects = entries.reduce((acc, entry) => {
        let { value } = entry
        let arrays = arrayWrappers - 1
        while (arrays-- > 0) value = value[0]
        return acc.concat(value)
      }, [])
      const exampleObject = getExampleObject(objects, selector)
      if (!Object.keys(exampleObject).length) return acc
      exampleFieldValue = exampleObject
    } else {
      // FIXME: Why not simply treat every number as float (instead of looping through all values again)?
      exampleFieldValue =
        (typeof value === `number` && findFloat(entries)) || value
      // exampleFieldValue = value === `number` ? 0.1 : value
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
// const clearExampleValueCache = () => cache.clear()

const getExampleValue = ({ nodes, typeName, ignoreFields }) => {
  // if (cache.has(typeName)) {
  //   return cache.get(typeName)
  // }
  const exampleValue = getExampleObject(nodes, typeName, ignoreFields)
  // cache.set(typeName, exampleValue)
  return exampleValue
}

module.exports = {
  getExampleValue,
  // clearExampleValueCache,
}
