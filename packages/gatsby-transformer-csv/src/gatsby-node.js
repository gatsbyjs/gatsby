const Promise = require(`bluebird`)
const csv = require(`csvtojson`)
const _ = require(`lodash`)

const { typeNameFromFile } = require(`./index`)

const convertToJson = (data, options) =>
  new Promise((res, rej) => {
    csv(options)
      .fromString(data)
      .on(`end_parsed`, jsonData => {
        if (!jsonData) {
          rej(`CSV to JSON conversion failed!`)
        }
        res(jsonData)
      })
  })

async function onCreateNode(
  { node, actions, loadNodeContent, createNodeId, createContentDigest },
  pluginOptions
) {
  const { createNode, createParentChildLink } = actions

  // Destructure out our custom options
  const { typeName, nodePerFile, extensions, ...options } = pluginOptions || {}

  // Filter out unwanted content
  const filterExtensions = extensions ?? [`csv`]
  if (!filterExtensions.includes(node.extension)) {
    return
  }

  // Load file contents
  const content = await loadNodeContent(node)

  // Parse
  let parsedContent = await convertToJson(content, options)

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
  function transformObject(obj, i) {
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

    createNode(csvNode)
    createParentChildLink({ parent: node, child: csvNode })
  }

  if (_.isArray(parsedContent)) {
    if (pluginOptions && nodePerFile) {
      if (pluginOptions && _.isString(nodePerFile)) {
        transformObject({ [nodePerFile]: parsedContent }, 0)
      } else {
        transformObject({ items: parsedContent }, 0)
      }
    } else {
      _.each(parsedContent, (obj, i) => {
        transformObject(obj, i)
      })
    }
  }

  return
}

exports.onCreateNode = onCreateNode
