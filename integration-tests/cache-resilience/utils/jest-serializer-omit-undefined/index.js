const _ = require(`lodash`)

module.exports = {
  test(value) {
    if (!_.isPlainObject(value)) {
      return false
    }

    return Object.values(value).some(val => typeof val === `undefined`)
  },
  print(value, serialize) {
    const normalizedValue = {}
    Object.entries(value).forEach(([key, val]) => {
      if (typeof val !== `undefined`) {
        normalizedValue[key] = val
      }
    })
    return serialize(normalizedValue)
  },
}
