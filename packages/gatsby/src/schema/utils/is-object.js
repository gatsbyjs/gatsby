const isObject = value =>
  value &&
  typeof value === `object` &&
  !Array.isArray(value) &&
  !(value instanceof Date)

module.exports = isObject
