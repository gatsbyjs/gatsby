const _ = require(`lodash`)

const seenNames = new Map()

module.exports = function createTypeName(name) {
  const cameledName = _.camelCase(name)
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
