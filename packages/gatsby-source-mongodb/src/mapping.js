const camelCase = require(`lodash.camelcase`)
const isString = require(`lodash.isstring`)

module.exports = function (node, key, text, mediaType, createContentDigest) {
  const str = isString(text) ? text : ` `
  const id = `${node.id}${key}MappingNode`
  const mappingNode = {
    id: id,
    parent: node.id,
    [key]: str,
    children: [],
    internal: {
      type: camelCase(`${node.internal.type} ${key} MappingNode`),
      mediaType: mediaType,
      content: str,
      contentDigest: createContentDigest(str),
    },
  }

  node.children = node.children.concat([mappingNode.id])

  return mappingNode
}
