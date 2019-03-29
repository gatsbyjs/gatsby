const jsYaml = require(`js-yaml`)
const _ = require(`lodash`)
const path = require(`path`)

async function onCreateNode({
  node,
  actions,
  loadNodeContent,
  createNodeId,
  createContentDigest,
}) {
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
    createNode(yamlNode)
    createParentChildLink({ parent: node, child: yamlNode })
  }

  const { createNode, createParentChildLink } = actions

  if (node.internal.mediaType !== `text/yaml`) {
    return
  }

  const content = await loadNodeContent(node)
  const parsedContent = jsYaml.load(content)

  if (_.isArray(parsedContent)) {
    parsedContent.forEach((obj, i) => {
      transformObject(
        obj,
        obj.id ? obj.id : createNodeId(`${node.id} [${i}] >>> YAML`),
        _.upperFirst(_.camelCase(`${node.name} Yaml`))
      )
    })
  } else if (_.isPlainObject(parsedContent)) {
    transformObject(
      parsedContent,
      parsedContent.id ? parsedContent.id : createNodeId(`${node.id} >>> YAML`),
      _.upperFirst(_.camelCase(`${path.basename(node.dir)} Yaml`))
    )
  }
}

exports.onCreateNode = onCreateNode
