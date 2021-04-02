const { upperFirst, camelCase, isPlainObject } = require(`lodash`)
const { basename } = require(`node:path`)

function shouldOnCreateNode({ node }) {
  // We only care about JSON content.
  return node.internal.mediaType === `application/json`
}

async function onCreateNode(
  { node, actions, loadNodeContent, createNodeId, createContentDigest },
  pluginOptions
) {
  function getType({ node, object, isArray }) {
    if (pluginOptions && typeof pluginOptions.typeName === `function`) {
      return pluginOptions.typeName({ node, object, isArray })
    } else if (
      pluginOptions &&
      pluginOptions.typeName &&
      typeof pluginOptions.typeName.valueOf() === `string`
    ) {
      return pluginOptions.typeName
    } else if (node.internal.type !== `File`) {
      return upperFirst(camelCase(`${node.internal.type} Json`))
    } else if (isArray) {
      return upperFirst(camelCase(`${node.name} Json`))
    } else {
      return upperFirst(camelCase(`${basename(node.dir)} Json`))
    }
  }

  async function transformObject(obj, id, type) {
    const jsonNode = {
      ...obj,
      id,
      children: [],
      parent: node.id,
      internal: {
        contentDigest: createContentDigest(obj),
        type,
      },
    }
    if (obj.id) {
      jsonNode[`jsonId`] = obj.id
    }
    await createNode(jsonNode)
    createParentChildLink({ parent: node, child: jsonNode })
  }

  const { createNode, createParentChildLink } = actions

  const content = await loadNodeContent(node)
  let parsedContent
  try {
    parsedContent = JSON.parse(content)
  } catch {
    const hint = node.absolutePath
      ? `file ${node.absolutePath}`
      : `in node ${node.id}`
    throw new Error(`Unable to parse JSON: ${hint}`)
  }

  if (Array.isArray(parsedContent)) {
    for (let i = 0, l = parsedContent.length; i < l; i++) {
      const obj = parsedContent[i]

      await transformObject(
        obj,
        createNodeId(`${node.id} [${i}] >>> JSON`),
        getType({ node, object: obj, isArray: true })
      )
    }
  } else if (isPlainObject(parsedContent)) {
    await transformObject(
      parsedContent,
      createNodeId(`${node.id} >>> JSON`),
      getType({ node, object: parsedContent, isArray: false })
    )
  }
}

exports.shouldOnCreateNode = shouldOnCreateNode
exports.onCreateNode = onCreateNode
