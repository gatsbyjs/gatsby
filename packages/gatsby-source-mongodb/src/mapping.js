const _ = require(`lodash`)

module.exports = function(
  node,
  key,
  text,
  mediaType,
  createNode,
  createContentDigest
) {
  const str = _.isString(text) ? text : ` `
  const id = `${node.id}${key}MappingNode`
  const mappingNode = {
    id: id,
    parent: node.id,
    [key]: str,
    children: [],
    internal: {
      type: _.camelCase(`${node.internal.type} ${key} MappingNode`),
      mediaType: mediaType,
      content: str,
      contentDigest: createContentDigest(str),
    },
  }

  node.children = node.children.concat([mappingNode.id])

  return mappingNode
}
