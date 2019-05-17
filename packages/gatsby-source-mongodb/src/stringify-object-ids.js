const ObjectID = require(`mongodb`).ObjectID

module.exports = function stringifyObjectIds(val) {
  if (val instanceof ObjectID) {
    return val.toHexString()
  } else if (typeof val === `object`) {
    if (Array.isArray(val)) {
      return val.map(el => stringifyObjectIds(el))
    } else {
      const keys = Object.keys(val)
      return keys.reduce((obj, key) => {
        obj[key] = stringifyObjectIds(val[key])
        return obj
      }, {})
    }
  } else {
    return val
  }
}
