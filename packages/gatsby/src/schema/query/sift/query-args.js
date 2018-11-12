const { makeRe } = require(`micromatch`)

const { isObject } = require(`../../utils`)

const prepareQueryArgs = filterFields =>
  Object.entries(filterFields).reduce((acc, [key, value]) => {
    if (isObject(value)) {
      acc[key] = prepareQueryArgs(value)
    } else {
      switch (key) {
        case `regex`:
          // NOTE: `value` must conform to the rules for the RegExp constructor,
          // e.g. use '\\w' not '\w'.
          acc[`$regex`] = new RegExp(value)
          break
        case `glob`:
          acc[`$regex`] = makeRe(value)
          break
        default:
          acc[`$${key}`] = value
      }
    }
    return acc
  }, {})

const dropQueryOperators = filterFields =>
  Object.entries(filterFields).reduce((acc, [key, value]) => {
    if (isObject(value) && isObject(Object.values(value)[0])) {
      acc[key] = dropQueryOperators(value)
    } else {
      acc[key] = true
    }
    return acc
  }, {})

module.exports = {
  dropQueryOperators,
  prepareQueryArgs,
}
