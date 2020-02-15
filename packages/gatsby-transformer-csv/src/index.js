const path = require(`path`)
const _ = require(`lodash`)

exports.typeNameFromDir = ({ node }) =>
  _.upperFirst(_.camelCase(`${path.basename(node.dir)} ${node.extension}`))

exports.typeNameFromFile = ({ node }) =>
  _.upperFirst(_.camelCase(`${node.name} ${node.extension}`))
