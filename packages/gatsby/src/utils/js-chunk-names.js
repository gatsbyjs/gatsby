import _ from "lodash"
const path = require(`path`)
const { store } = require(`../redux`)

const pathChunkName = path => {
  const name = path === `/` ? `index` : _.kebabCase(path)
  return `path---${name}`
}

const layoutComponentChunkName = componentPath => {
  const program = store.getState().program
  let directory = `/`
  if (program && program.directory) {
    directory = program.directory
  }
  const name = path.relative(directory, componentPath)
  return `component---${_.kebabCase(name)}`
}

exports.pathChunkName = pathChunkName
exports.layoutComponentChunkName = layoutComponentChunkName
