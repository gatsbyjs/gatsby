const toml = require(`toml`)
const _ = require(`lodash`)
const crypto = require(`crypto`)
const uuidv5 = require(`uuid/v5`)

const seedConstant = `fd0d46f9-cd86-4c38-8f3e-fb623a5c2696`
const createId = (id) =>
  uuidv5(id, uuidv5(`toml`, seedConstant))

async function onCreateNode({ node, actions, loadNodeContent }) {
  const { createNode, createParentChildLink } = actions
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

  const newNode = {
    ...parsedContent,
    id: createId(parsedContent.id ? parsedContent.id : `${node.id} >>> TOML`),
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
