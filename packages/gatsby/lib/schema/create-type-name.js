const _ = require(`lodash`)

const seenNames = {}

export default function createTypeName(name) {
  const cameledName = _.camelCase(name)
  if (seenNames[cameledName]) {
    seenNames[cameledName] += 1
    return `${cameledName}_${seenNames[cameledName]}`
  } else {
    seenNames[cameledName] = 1
    return cameledName
  }
}
