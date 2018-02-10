const jsYaml = require(`js-yaml`)
const _ = require(`lodash`)
const crypto = require(`crypto`)
const path = require(`path`)

async function onCreateNode({ node, actions, loadNodeContent, createNodeId }) {
  function transformObject(obj, id, type) {
    const objStr = JSON.stringify(obj)
    const contentDigest = crypto
      .createHash(`md5`)
      .update(objStr)
      .digest(`hex`)
    const yamlNode = {
      ...obj,
      id,
      children: [],
      parent: node.id,
      internal: {
        contentDigest,
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
