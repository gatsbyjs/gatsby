const { kebabCase } = require(`lodash`)
const path = require(`path`)
const kebabHash = require(`kebab-hash`)
const { store } = require(`../redux`)

const generatePathChunkName = path => {
  const name = path === `/` ? `index` : kebabHash(path)
  return `path---${name}`
}

const generateComponentChunkName = componentPath => {
  const program = store.getState().program
  let directory = `/`
  if (program && program.directory) {
    directory = program.directory
  }
  const name = path.relative(directory, componentPath)
  return `component---${kebabCase(name)}`
}

exports.generatePathChunkName = generatePathChunkName
exports.generateComponentChunkName = generateComponentChunkName
