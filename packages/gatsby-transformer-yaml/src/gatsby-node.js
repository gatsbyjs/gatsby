const { load: loadYaml } = require(`js-yaml`)
const { upperFirst, camelCase, isPlainObject } = require(`lodash`)
const { basename } = require(`node:path`)

function shouldOnCreateNode({ node }) {
  return node.internal.mediaType === `text/yaml`
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
      return upperFirst(camelCase(`${node.internal.type} Yaml`))
    } else if (isArray) {
      return upperFirst(camelCase(`${node.name} Yaml`))
    } else {
      return upperFirst(camelCase(`${basename(node.dir)} Yaml`))
    }
  }

  function transformObject(obj, id, type) {
    const yamlNode = {
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
      yamlNode[`yamlId`] = obj.id
    }
    createNode(yamlNode)
    createParentChildLink({ parent: node, child: yamlNode })
  }

  const { createNode, createParentChildLink } = actions

  const content = await loadNodeContent(node)
  const parsedContent = loadYaml(content)

  if (Array.isArray(parsedContent)) {
    parsedContent.forEach((obj, i) => {
      transformObject(
        obj,
        createNodeId(`${node.id} [${i}] >>> YAML`),
        getType({ node, object: obj, isArray: true })
      )
    })
  } else if (isPlainObject(parsedContent)) {
    transformObject(
      parsedContent,
      createNodeId(`${node.id} >>> YAML`),
      getType({ node, object: parsedContent, isArray: false })
    )
  }
}

exports.shouldOnCreateNode = shouldOnCreateNode
exports.onCreateNode = onCreateNode
