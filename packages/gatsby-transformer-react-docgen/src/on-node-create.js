import crypto from "crypto"
import parseMetadata from "./parse"

const digest = str =>
  crypto
    .createHash(`md5`)
    .update(str)
    .digest(`hex`)

const propsId = (parentId, name) => `${parentId}--ComponentProp-${name}`
const descId = parentId => `${parentId}--ComponentDescription`

function canParse(node) {
  return (
    node &&
    (node.internal.mediaType === `application/javascript` ||
      // Typescript doesn't really have a mime type and .ts files are a media file :/
      node.internal.mediaType === `application/typescript` ||
      node.internal.mediaType === `text/jsx` ||
      node.internal.mediaType === `text/tsx` ||
      node.extension === `tsx` ||
      node.extension === `ts`)
  )
}

async function createDescriptionNode(node, entry, actions, createNodeId) {
  if (!entry.description) return node
  const { createNode } = actions

  const descriptionNode = {
    id: createNodeId(descId(node.id)),
    parent: node.id,
    children: [],
    text: entry.description,
    internal: {
      type: `ComponentDescription`,
      mediaType: `text/markdown`,
      content: entry.description,
      contentDigest: digest(entry.description),
    },
  }

  node.description___NODE = descriptionNode.id
  node.children = node.children.concat([descriptionNode.id])
  await createNode(descriptionNode)

  return node
}

async function createPropNodes(node, component, actions, createNodeId) {
  const { createNode } = actions
  let children = new Array(component.props.length)

  await Promise.all(
    component.props.map((prop, i) => {
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
          contentDigest: digest(content),
        },
      }
      children[i] = propNode.id
      propNode = createDescriptionNode(propNode, prop, actions, createNodeId)
      return createNode(propNode)
    })
  )

  node.props___NODE = children
  node.children = node.children.concat(children)
  return node
}

export default async function onCreateNode(
  { node, loadNodeContent, actions, createNodeId, reporter },
  pluginOptions
) {
  const { createNode, createParentChildLink } = actions

  if (!canParse(node)) return Promise.resolve()

  const content = await loadNodeContent(node)

  let components
  try {
    components = parseMetadata(content, node, pluginOptions)
  } catch (err) {
    reporter.error(
      `There was a problem parsing component metadata for file: "${
        node.relativePath
      }"`,
      err
    )
    return Promise.resolve()
  }

  return Promise.all(
    components.map(async component => {
      const strContent = JSON.stringify(component)
      const contentDigest = digest(strContent)
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
      metadataNode = await createPropNodes(
        metadataNode,
        component,
        actions,
        createNodeId
      )
      metadataNode = await createDescriptionNode(
        metadataNode,
        component,
        actions,
        createNodeId
      )
      return createNode(metadataNode)
    })
  )
}
