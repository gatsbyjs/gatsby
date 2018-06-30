const convertHrtime = require(`convert-hrtime`)
const _ = require(`lodash`)
const treeify = require(`treeify`)

let root = {
  ROOT: process.hrtime(),
}

const profile = ({ name, start, parent }) => {
  const span = convertHrtime(process.hrtime(start))
  let path = parent ? `${parent}.${name}` : name
  let currentValue = _.get(root, path)
  if (_.isObject(currentValue)) {
    path = `${path}.ROOT`
    currentValue = _.get(root, path)
  }
  const newValue = currentValue
    ? currentValue + span.milliseconds
    : span.milliseconds
  // if (name === `run-query`) {
  // console.log({
  // path,
  // span: span.milliseconds,
  // newValue,
  // })
  // }
  root = _.set(root, path, newValue)
}

global._PROFILE = profile
module.exports = profile

const labelify = (object, rootValue) =>
  _.mapKeys(object, (value, key, o) => {
    const currentValue = _.isObject(value) ? value.ROOT : value
    return `${key}: ${currentValue}ms | ${(
      (currentValue / rootValue) *
      100
    ).toFixed(2) + `%`}`
  })

process.on(`exit`, () => {
  root.ROOT = convertHrtime(process.hrtime(root.ROOT)).milliseconds
  root = labelify(root, root.ROOT)
  for (var prop in root) {
    if (_.isObject(root[prop]) && root[prop].ROOT) {
      const rootValue = root[prop].ROOT
      delete root[prop].ROOT
      root[prop] = labelify(root[prop], rootValue)
    }
  }
  console.log(``)
  console.log(`===PROFILE===`)
  console.log(treeify.asTree(root))
})
