const toml = require(`toml`)
const _ = require(`lodash`)

function shouldOnCreateNode({ node }) {
  // Filter out non-toml content
  // Currently TOML files are considered null in 'mime-db'
  // Hence the extension test instead of mediaType test
  return node.extension === `toml`
}

async function onCreateNode({
  node,
  actions,
  loadNodeContent,
  createNodeId,
  createContentDigest,
}) {
  const { createNode, createParentChildLink } = actions

  // Load TOML contents
  const content = await loadNodeContent(node)
  // Parse
  const parsedContent = toml.parse(content)

  // This version suffers from:
  // 1) More TOML files -> more types
  // 2) Different files with the same name creating conflicts
  const contentDigest = createContentDigest(parsedContent)

  const newNode = {
    ...parsedContent,
    id: parsedContent.id
      ? parsedContent.id
      : createNodeId(`${node.id} >>> TOML`),
    children: [],
    parent: node.id,
    internal: {
      contentDigest,

      // Use the relative filepath as "type"
      type: _.upperFirst(_.camelCase(node.relativePath)),
    },
  }

  createNode(newNode)
  createParentChildLink({ parent: node, child: newNode })
  return
}

exports.shouldOnCreateNode = shouldOnCreateNode
exports.onCreateNode = onCreateNode
