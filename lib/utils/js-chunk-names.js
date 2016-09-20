import _ from 'lodash'
const path = require(`path`)

const pathChunkName = (path) => {
  const name = path === `/` ? `index` : _.kebabCase(path)
  return `path---${name}`
}

const layoutComponentChunkName = (componentPath) => {
  const name = path.basename(componentPath, path.extname(componentPath))
  return `page-template---${_.kebabCase(name)}`
}

exports.pathChunkName = pathChunkName
exports.layoutComponentChunkName = layoutComponentChunkName
