const csv = require(`csvtojson`)
const _ = require(`lodash`)

const { typeNameFromFile } = require(`./index`)

const convertToJson = (data, options) =>
  csv(options)
    .fromString(data)
    .then(jsonData => jsonData, new Error(`CSV to JSON conversion failed!`))

function shouldOnCreateNode({ node }, pluginOptions = {}) {
  const { extension } = node
  const { extensions } = pluginOptions

  return extensions ? extensions.includes(extension) : extension === `csv`
}

async function onCreateNode(
  { node, actions, loadNodeContent, createNodeId, createContentDigest },
  pluginOptions
) {
  const { createNode, createParentChildLink } = actions

  // Destructure out our custom options
  const { typeName, nodePerFile, ...options } = pluginOptions || {}

  // Load file contents
  const content = await loadNodeContent(node)

  // Parse
  const parsedContent = await convertToJson(content, options)

  // Generate the type
  function getType({ node, object }) {
    if (pluginOptions && _.isFunction(typeName)) {
      return pluginOptions.typeName({ node, object })
    } else if (pluginOptions && _.isString(typeName)) {
      return _.upperFirst(_.camelCase(typeName))
    } else {
      return typeNameFromFile({ node })
    }
  }

  // Generate the new node
  async function transformObject(obj, i) {
    const csvNode = {
      ...obj,
      id:
        obj.id ??
        createNodeId(`${node.id} [${i}] >>> ${node.extension.toUpperCase()}`),
      children: [],
      parent: node.id,
      internal: {
        contentDigest: createContentDigest(obj),
        // TODO make choosing the "type" a lot smarter. This assumes
        // the parent node is a file.
        // PascalCase
        type: getType({ node, object: parsedContent }),
      },
    }

    await createNode(csvNode)
    createParentChildLink({ parent: node, child: csvNode })
  }

  if (_.isArray(parsedContent)) {
    if (pluginOptions && nodePerFile) {
      if (pluginOptions && _.isString(nodePerFile)) {
        await transformObject({ [nodePerFile]: parsedContent }, 0)
      } else {
        await transformObject({ items: parsedContent }, 0)
      }
    } else {
      for (let i = 0, l = parsedContent.length; i < l; i++) {
        const obj = parsedContent[i]
        await transformObject(obj, i)
      }
    }
  }

  return
}

exports.shouldOnCreateNode = shouldOnCreateNode
exports.onCreateNode = onCreateNode
