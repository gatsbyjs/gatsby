import crypto from "crypto"
import parseMetadata from "./parse"

const digest = str => crypto.createHash(`md5`).update(str).digest(`hex`)

const propsId = (parentId, name) => `${parentId}--ComponentProp-${name}`
const descId = parentId => `${parentId}--ComponentDescription`

function createDescriptionNode(node, entry, boundActionCreators) {
  if (!entry.description) return node
  const { createNode } = boundActionCreators

  const descriptionNode = {
    id: descId(node.id),
    parent: node.id,
    children: [],
    text: entry.description,
    internal: {
      type: `ComponentDescription`,
      mediaType: `text/x-markdown`,
      content: entry.description,
      contentDigest: digest(entry.description),
    },
  }

  node.description___NODE = descriptionNode.id
  node.children = node.children.concat([descriptionNode.id])
  createNode(descriptionNode)

  return node
}

function createPropNodes(node, component, boundActionCreators) {
  const { createNode, updateNode } = boundActionCreators
  let children = new Array(component.props.length)

  component.props.forEach((prop, i) => {
    let propNodeId = propsId(node.id, prop.name)
    let content = JSON.stringify(prop)

    let propNode = {
      ...prop,
      id: propNodeId,
      children: [],
      parent: node.id,
      parentType: prop.type,
      internal: {
        type: `ComponentProp`,
        mediaType: `text/x-react-metadata`,
        content,
        contentDigest: digest(content),
      },
    }
    children[i] = propNode.id
    propNode = createDescriptionNode(propNode, prop, boundActionCreators)
    createNode(propNode)
  })

  node.props___NODE = children
  node.children = node.children.concat(children)
  return node
}

export default function onNodeCreate(
  { node, loadNodeContent, boundActionCreators },
  pluginOptions
) {
  const { createNode, addNodeToParent } = boundActionCreators

  if (node.internal.mediaType !== `application/javascript`) return null

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
          id: nodeId,
          children: [],
          parent: node.id,
          internal: {
            contentDigest,
            content: strContent,
            type: `ComponentMetadata`,
            mediaType: `text/x-react-metadata`,
          },
        }

        addNodeToParent({ parent: node, child: metadataNode })
        metadataNode = createPropNodes(
          metadataNode,
          component,
          boundActionCreators
        )
        metadataNode = createDescriptionNode(
          metadataNode,
          component,
          boundActionCreators
        )
        createNode(metadataNode)
      })
    })
    .catch(err => console.log(err))
}
