const parseXml = require(`xml-parser`)
const _ = require(`lodash`)

async function onCreateNode({
  node,
  actions,
  loadNodeContent,
  createNodeId,
  createContentDigest,
}) {
  const { createNode, createParentChildLink } = actions

  // We only care about XML content.
  if (![`application/xml`, `text/xml`].includes(node.internal.mediaType)) {
    return
  }
  const rawXml = await loadNodeContent(node)
  const parsedXml = parseXml(rawXml)
  const nodeArray = parsedXml.root.children.map((obj, i) => {
    if (obj.children) {
      obj.xmlChildren = obj.children
      delete obj.children
    }
    return {
      ...obj,
      id: obj.attributes.id
        ? obj.attributes.id
        : createNodeId(`${node.id} [${i}] >>> XML`),
      parent: node.id,
      children: [],
      internal: {
        contentDigest: createContentDigest(obj),
        type: _.upperFirst(_.camelCase(`${node.name} xml`)),
      },
    }
  })

  _.each(nodeArray, j => {
    createNode(j)
    createParentChildLink({ parent: node, child: j })
  })
  return
}

exports.onCreateNode = onCreateNode
