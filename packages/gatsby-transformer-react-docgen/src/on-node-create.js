import crypto from "crypto"
import parseMetadata from "./parse"

const digest = str => crypto.createHash(`md5`).update(str).digest(`hex`)

const propsId = (parentId, name) => `${parentId}--ComponentProp-${name}`
const descId = parentId => `${parentId}--ComponentDescription`

function createDescriptionNode(node, entry, boundActionCreators) {
  if (!entry.description) return
  const { createNode, updateNode } = boundActionCreators

  const markdownNode = {
    id: descId(node.id),
    children: [],
    parent: node.id,
    internal: {
      type: `ComponentDescription`,
      mediaType: `text/x-markdown`,
      content: entry.description,
      contentDigest: digest(entry.description),
    },
  }

  node.description___NODE = markdownNode.id
  node.children = node.children.concat([markdownNode.id])
  updateNode(node)
  createNode(markdownNode)
}

function createPropNodes(node, component, boundActionCreators) {
  const { createNode, updateNode } = boundActionCreators
  let children = new Array(component.props.length)

  component.props.forEach((prop, i) => {
    let propNodeId = propsId(node.id, prop.name)
    let content = JSON.stringify(prop)

    const propNode = {
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
    createNode(propNode)
    createDescriptionNode(propNode, prop, boundActionCreators)
  })

  node.props___NODE = children
  node.children = node.children.concat(children)
  updateNode(node)
}

export default function onNodeCreate(
  { node, loadNodeContent, boundActionCreators },
  pluginOptions
) {
  const { createNode, updateNode } = boundActionCreators

  if (node.mediaType !== `application/javascript`) return null

  return loadNodeContent(node)
    .then(content => {
      const components = parseMetadata(content, node, pluginOptions)

      components.forEach(component => {
        const strContent = JSON.stringify(component)
        const contentDigest = digest(strContent)
        const nodeId = `${node.id}--${component.displayName}--ComponentMetadata`

        const metadataNode = {
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

        node.children = node.children.concat([metadataNode.id])
        updateNode(node)
        createNode(metadataNode)
        createPropNodes(metadataNode, component, boundActionCreators)
        createDescriptionNode(metadataNode, component, boundActionCreators)
      })
    })
    .catch(err => console.log(err))
}
