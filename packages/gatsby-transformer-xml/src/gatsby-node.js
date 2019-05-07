const util = require(`util`)
const xml2js = require(`xml2js`)
const _ = require(`lodash`)

function transformNode(obj) {
  return {
    name: obj[`#name`],
    attributes: obj.$ || {},
    content: obj._ || ``,
    xmlChildren: obj.children ? obj.children.map(transformNode) : [],
  }
}

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
  const parser = new xml2js.Parser({
    explicitChildren: true,
    preserveChildrenOrder: true,
    childkey: 'children',
    explicitRoot: false,
  });
  const parsedXml = await util.promisify(parser.parseString)(rawXml)
  const nodeArray = parsedXml.children.map((obj, i) => ({
    ...transformNode(obj),
    id: obj.$.id
      ? obj.$.id
      : createNodeId(`${node.id} [${i}] >>> XML`),
    parent: node.id,
    children: [],
    internal: {
      contentDigest: createContentDigest(obj),
      type: _.upperFirst(_.camelCase(`${node.name} xml`)),
    },
  }))

  _.each(nodeArray, j => {
    createNode(j)
    createParentChildLink({ parent: node, child: j })
  })
  return
}

exports.onCreateNode = onCreateNode
