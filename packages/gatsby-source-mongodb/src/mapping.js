<<<<<<< HEAD
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
=======
const camelCase = require(`lodash.camelcase`)
const isString = require(`lodash.isstring`)
const crypto = require(`crypto`)

module.exports = function(node, key, text, mediaType, createNode) {
  const str = isString(text) ? text : ` `
>>>>>>> 888c124d24aea36a57086d096154ecacf44f0980
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
