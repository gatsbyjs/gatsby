const select = require(`unist-util-select`)
const Promise = require(`bluebird`)
const fs = require(`fs`)
const jsYaml = require(`js-yaml`)
const _ = require(`lodash`)
const crypto = require(`crypto`)

async function onCreateNode({ node, boundActionCreators, loadNodeContent }) {
  const { createNode, createParentChildLink } = boundActionCreators
  if (node.internal.mediaType !== `text/yaml`) {
    return
  }

  const content = await loadNodeContent(node)
  const parsedContent = jsYaml.load(content)

  // TODO handle non-array data.
  if (_.isArray(parsedContent)) {
    const yamlArray = parsedContent.map((obj, i) => {
      const objStr = JSON.stringify(obj)
      const contentDigest = crypto
        .createHash(`md5`)
        .update(objStr)
        .digest(`hex`)

      return {
        ...obj,
        id: obj.id ? obj.id : `${node.id} [${i}] >>> YAML`,
        children: [],
        parent: node.id,
        internal: {
          contentDigest,
          // TODO make choosing the "type" a lot smarter. This assumes
          // the parent node is a file.
          // PascalCase
          type: _.upperFirst(_.camelCase(`${node.name} Yaml`)),
          mediaType: `application/json`,
          content: objStr,
        },
      }
    })

    _.each(yamlArray, y => {
      createNode(y)
      createParentChildLink({ parent: node, child: y })
    })
  }

  return
}

exports.onCreateNode = onCreateNode
