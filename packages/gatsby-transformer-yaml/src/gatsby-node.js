const jsYaml = require(`js-yaml`)
const _ = require(`lodash`)
const path = require(`path`)

const conflictFieldPrefix = `yaml_`
// restrictedNodeFields from here https://www.gatsbyjs.org/docs/node-interface/
const restrictedNodeFields = [
  `children`,
  `contentful_id`,
  `fields`,
  `id`,
  `internal`,
  `parent`,
]

function unstable_shouldOnCreateNode({ node }) {
  return node.internal.mediaType === `text/yaml`
}

async function onCreateNode(
  { node, actions, loadNodeContent, createNodeId, createContentDigest },
  pluginOptions
) {
  if (!unstable_shouldOnCreateNode({ node })) {
    return
  }

  function getType({ node, object, isArray }) {
    if (pluginOptions && _.isFunction(pluginOptions.typeName)) {
      return pluginOptions.typeName({ node, object, isArray })
    } else if (pluginOptions && _.isString(pluginOptions.typeName)) {
      return pluginOptions.typeName
    } else if (node.internal.type !== `File`) {
      return _.upperFirst(_.camelCase(`${node.internal.type} Yaml`))
    } else if (isArray) {
      return _.upperFirst(_.camelCase(`${node.name} Yaml`))
    } else {
      return _.upperFirst(_.camelCase(`${path.basename(node.dir)} Yaml`))
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
    createNode(yamlNode)
    createParentChildLink({ parent: node, child: yamlNode })
  }

  const { createNode, createParentChildLink } = actions

  const content = await loadNodeContent(node)
  const parsedContent = jsYaml.load(content)

  function normalizeRestrictedFields(obj) {
    restrictedNodeFields.forEach(restrictedNodeField => {
      if (Object.keys(obj).includes(restrictedNodeField)) {
        obj[`${conflictFieldPrefix}${restrictedNodeField}`] =
          obj[restrictedNodeField]
        delete obj[restrictedNodeField]

        console.log(
          `Restricted field found for when parsing yaml object. Field ${restrictedNodeField} value is now found on field ${conflictFieldPrefix}${restrictedNodeField}.`
        )
      }
    })
  }

  if (_.isArray(parsedContent)) {
    parsedContent.forEach(obj => {
      if (_.isPlainObject(obj)) {
        normalizeRestrictedFields(obj)
      }
    })
  }
  if (_.isPlainObject(parsedContent)) {
    normalizeRestrictedFields(parsedContent)
  }

  if (_.isArray(parsedContent)) {
    parsedContent.forEach((obj, i) => {
      transformObject(
        obj,
        createNodeId(`${node.id} [${i}] >>> YAML`),
        getType({ node, object: obj, isArray: true })
      )
    })
  } else if (_.isPlainObject(parsedContent)) {
    transformObject(
      parsedContent,
      parsedContent.id ? parsedContent.id : createNodeId(`${node.id} >>> YAML`),
      getType({ node, object: parsedContent, isArray: false })
    )
  }
}

exports.unstable_shouldOnCreateNode = unstable_shouldOnCreateNode
exports.onCreateNode = onCreateNode
