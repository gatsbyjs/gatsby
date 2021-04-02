const { basename } = require(`node:path`)
const { upperFirst, camelCase } = require(`lodash`)

exports.typeNameFromDir = ({ node }) =>
  upperFirst(camelCase(`${basename(node.dir)} ${node.extension}`))

exports.typeNameFromFile = ({ node }) =>
  upperFirst(camelCase(`${node.name} ${node.extension}`))
