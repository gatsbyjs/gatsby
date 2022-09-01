import parseMetadata from "./parse"

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
  const children = new Array(component.props.length)

  component.props.forEach((prop, i) => {
    const propNodeId = propsId(node.id, prop.name)
    const content = JSON.stringify(prop)

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

export function shouldOnCreateNode({ node }) {
  return canParse(node)
}

export async function onCreateNode(
  {
    node,
    loadNodeContent,
    actions,
    createNodeId,
    reporter,
    createContentDigest,
  },
  pluginOptions
) {
  if (!canParse(node)) return

  const { createNode, createParentChildLink } = actions

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
