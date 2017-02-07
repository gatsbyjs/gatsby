import _ from 'lodash'
const path = require(`path`)

const pathChunkName = (path) => {
  const name = path === `/` ? `index` : _.kebabCase(path)
  return `path---${name}`
}

const layoutComponentChunkName = (directory, componentPath) => {
  const name = path.relative(directory, componentPath)
  return `page-component---${_.kebabCase(name)}`
}

exports.pathChunkName = pathChunkName
exports.layoutComponentChunkName = layoutComponentChunkName
