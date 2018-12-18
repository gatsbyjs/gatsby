const _ = require(`lodash`)

const seenNames = new Map()

const typeNameRestriction = /^[_a-zA-Z][_a-zA-Z0-9]*$/

module.exports = function createTypeName(name) {
  let cameledName = _.camelCase(name)

  // camelCasing will ensure that name is build from just alphanumeric
  // characters, but we still need to ensure that type name
  // doesn't start with number (graphql resitriction)
  if (!cameledName.match(typeNameRestriction)) {
    cameledName = `_` + cameledName
  }

  if (seenNames.has(cameledName)) {
    seenNames.set(cameledName, seenNames.get(cameledName) + 1)
    return `${cameledName}_${seenNames.get(cameledName)}`
  } else {
    seenNames.set(cameledName, 1)
    return cameledName
  }
}

module.exports.clearTypeNames = () => {
  seenNames.clear()
}
