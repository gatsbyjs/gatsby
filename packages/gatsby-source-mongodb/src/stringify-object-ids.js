const ObjectID = require(`mongodb`).ObjectID

module.exports = function stringifyObjectIds(val) {
  if (val instanceof ObjectID) {
    return val.toHexString()
  } else if (Array.isArray(val)) {
    return val.map(el => stringifyObjectIds(el))
  } else if (val && val.constructor === Object) {
    const keys = Object.keys(val)
    return keys.reduce((obj, key) => {
      obj[key] = stringifyObjectIds(val[key])
      return obj
    }, {})
  } else {
    return val
  }
}
