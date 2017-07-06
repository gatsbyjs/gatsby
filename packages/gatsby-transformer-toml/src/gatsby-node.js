const toml = require(`toml`)
const _ = require(`lodash`)
const crypto = require(`crypto`)

async function onCreateNode({ node, boundActionCreators, loadNodeContent }) {
  const { createNode, createParentChildLink } = boundActionCreators
  // Filter out non-toml content
  // Currently TOML files are considered 'application/octet-stream' in 'mime-db'
  // Hence the extension test instead of mediaType test
  if (node.extension !== `toml`) {
    return
  }
  // Load TOML contents
  const content = await loadNodeContent(node)
  // Parse
  const parsedContent = toml.parse(content)

  // This version suffers from:
  // 1) More TOML files -> more types
  // 2) Different files with the same name creating conflicts
  const parsedContentStr = JSON.stringify(parsedContent)
  const contentDigest = crypto
    .createHash(`md5`)
    .update(parsedContentStr)
    .digest(`hex`)

  const newNode =  {
    ...parsedContent,
    id: parsedContent.id ? parsedContent.id : `${node.id} >>> TOML`,
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

exports.onCreateNode = onCreateNode
