const parseXml = require(`xml-parser`)
const _ = require(`lodash`)

function shouldOnCreateNode({ node }) {
  // We only care about XML content.
  return [`application/xml`, `text/xml`].includes(node.internal.mediaType)
}

async function onCreateNode({
  node,
  actions,
  loadNodeContent,
  createNodeId,
  createContentDigest,
}) {
  const { createNode, createParentChildLink } = actions

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

exports.shouldOnCreateNode = shouldOnCreateNode
exports.onCreateNode = onCreateNode
