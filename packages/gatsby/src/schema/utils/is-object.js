const isObject = value =>
  value &&
  typeof value === `object` &&
  !Array.isArray(value) &&
  !(value instanceof Date) &&
  !(value instanceof String)

module.exports = isObject
