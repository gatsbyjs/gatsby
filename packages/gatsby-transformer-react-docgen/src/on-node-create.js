import crypto from "crypto"
import parseMetadata from "./parse"

const digest = str =>
  crypto
    .createHash(`md5`)
    .update(str)
    .digest(`hex`)

const propsId = (parentId, name) => `${parentId}--ComponentProp-${name}`
const descId = parentId => `${parentId}--ComponentDescription`

function createDescriptionNode(node, entry, actions, createNodeId) {
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
  createNode(descriptionNode)

  return node
}

function createPropNodes(node, component, actions, createNodeId) {
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
        contentDigest: digest(content),
      },
    }
    children[i] = propNode.id
    propNode = createDescriptionNode(propNode, prop, actions, createNodeId)
    createNode(propNode)
  })

  node.props___NODE = children
  node.children = node.children.concat(children)
  return node
}

export default function onCreateNode(
  { node, loadNodeContent, actions, createNodeId },
  pluginOptions
) {
  const { createNode, createParentChildLink } = actions

  if (
    node.internal.mediaType !== `application/javascript` &&
    node.internal.mediaType !== `text/jsx`
  )
    return null

  return loadNodeContent(node)
    .then(content => {
      const components = parseMetadata(content, node, pluginOptions)

      components.forEach(component => {
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
        metadataNode = createPropNodes(
          metadataNode,
          component,
          actions,
          createNodeId
        )
        metadataNode = createDescriptionNode(
          metadataNode,
          component,
          actions,
          createNodeId
        )
        createNode(metadataNode)
      })
    })
    .catch(err => console.log(err))
}
