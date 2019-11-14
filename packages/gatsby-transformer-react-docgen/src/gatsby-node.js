const parseMetadata = require(`./parse`)

const propsId = (parentId, name) => `${parentId}--ComponentProp-${name}`
const descId = parentId => `${parentId}--ComponentDescription`

function canParse(node) {
  return (
    node &&
    (node.internal.mediaType === `application/javascript` ||
      // TypeScript doesn't really have a mime type and .ts files are a media file :/
      node.internal.mediaType === `application/typescript` ||
      node.internal.mediaType === `text/jsx` ||
      node.internal.mediaType === `text/tsx` ||
      node.extension === `tsx` ||
      node.extension === `ts`)
  )
}

function createDescriptionNode(
  node,
  entry,
  actions,
  createNodeId,
  createContentDigest
) {
  const { createNode } = actions

  delete node.description

  const descriptionNode = {
    id: createNodeId(descId(node.id)),
    parent: node.id,
    children: [],
    text: entry.description,
    internal: {
      type: `ComponentDescription`,
      mediaType: `text/markdown`,
      content: entry.description,
      contentDigest: createContentDigest(entry.description),
    },
  }

  node.description___NODE = descriptionNode.id
  node.children = node.children.concat([descriptionNode.id])
  createNode(descriptionNode)

  return node
}

function createPropNodes(
  node,
  component,
  actions,
  createNodeId,
  createContentDigest
) {
  const { createNode } = actions
  let children = new Array(component.props.length)

  component.props.forEach((prop, i) => {
    let propNodeId = propsId(node.id, prop.name)
    let content = JSON.stringify(prop)

    let propNode = {
      ...prop,
      id: createNodeId(propNodeId),
      children: [],
      parent: node.id,
      parentType: prop.type,
      internal: {
        type: `ComponentProp`,
        contentDigest: createContentDigest(content),
      },
    }
    children[i] = propNode.id
    propNode = createDescriptionNode(
      propNode,
      prop,
      actions,
      createNodeId,
      createContentDigest
    )
    createNode(propNode)
  })

  node.props___NODE = children
  node.children = node.children.concat(children)
  return node
}

exports.onCreateNode = async (
  {
    node,
    loadNodeContent,
    actions,
    createNodeId,
    reporter,
    createContentDigest,
  },
  pluginOptions
) => {
  const { createNode, createParentChildLink } = actions

  if (!canParse(node)) return

  const content = await loadNodeContent(node)

  let components
  try {
    components = parseMetadata(content, node, pluginOptions)
  } catch (err) {
    reporter.error(
      `There was a problem parsing component metadata for file: "${node.relativePath}"`,
      err
    )
    return
  }

  components.forEach(component => {
    const strContent = JSON.stringify(component)
    const contentDigest = createContentDigest(strContent)
    const nodeId = `${node.id}--${component.displayName}--ComponentMetadata`

    let metadataNode = {
      ...component,
      props: null, // handled by the prop node creation
      id: createNodeId(nodeId),
      children: [],
      parent: node.id,
      internal: {
        contentDigest,
        type: `ComponentMetadata`,
      },
    }

    createParentChildLink({ parent: node, child: metadataNode })
    metadataNode = createPropNodes(
      metadataNode,
      component,
      actions,
      createNodeId,
      createContentDigest
    )
    metadataNode = createDescriptionNode(
      metadataNode,
      component,
      actions,
      createNodeId,
      createContentDigest
    )
    createNode(metadataNode)
  })
}

exports.sourceNodes = ({ actions }) => {
  const { createTypes } = actions

  createTypes(/* GraphQL */ `
    type PropDefaultValue {
      value: String
      computed: Boolean
    }

    type PropTypeValue {
      name: String!
      value: JSON
      raw: String
    }

    type ComponentMethodParams {
      name: String
      type: JSON
    }

    type ComponentMethod {
      name: String!
      description: String

      # The raw comment block leading a method declaration
      docblock: String

      # Modifiers describing the kind and sort of method e.g. "static", "generator", or "async".
      modifiers: [String]

      params: [ComponentMethodParams]
      returns: JSON
    }

    type ComponentProp implements Node @infer {
      type: PropTypeValue
      flowType: JSON
      tsType: JSON

      description: ComponentDescription! @link(from: description___NODE)

      defaultValue: PropDefaultValue
      doclets: JSON
      # The raw comment block leading a propType declaration
      docblock: String

      # Describes whether or not the propType is required, i.e. not \`null\`
      required: Boolean!
    }

    type ComponentDescription implements Node @infer {
      text: String!
    }

    type ComponentMetadata implements Node @infer {
      doclets: JSON

      description: ComponentDescription! @link(from: description___NODE)
      props: [ComponentProp!]! @link(from: props___NODE)

      # A list of additional modules "spread" into this component's propTypes such as:
      #
      # propTypes = {
      #   name: PropTypes.string,
      #   ...AnotherComponent.propTypes,
      # }
      composes: [String!]

      # Component methods
      methods: [ComponentMethod]
    }
  `)
}

exports.createResolvers = ({ createResolvers }) => {
  createResolvers({
    ComponentProp: {
      required: {
        type: `Boolean!`,
        resolve: ({ required }) => required || false,
      },
    },
  })
}
