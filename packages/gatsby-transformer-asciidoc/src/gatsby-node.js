// const Promise = require(`bluebird`)
// const _ = require(`lodash`)
const asciidoc = require(`asciidoctor.js`)()
// import asciidoc from 'asciidoctor.js'

async function onCreateNode(
  { node, actions, loadNodeContent, createNodeId, createContentDigest },
  options
) {
  // Filter out non-adoc content
  if (!node.extension || node.extension !== `adoc`) {
    return
  }

  const { createNode, createParentChildLink } = actions
  // Load Asciidoc contents
  const content = await loadNodeContent(node)
  const html = asciidoc.convert(content)
  
  const asciiNode = {
    id: createNodeId(`${node.id} >>> ASCIIDOC`),
    parent: node.id,
    internal: {
      type: `Asciidoc`,
      mediaType: `text/html`,
      content: html
    },
    children: [],
    html,
    relativePath: node.relativePath
  }

  asciiNode.internal.contentDigest = createContentDigest(asciiNode)

  createNode(asciiNode)
  createParentChildLink({ parent: node, child: asciiNode })
}

exports.onCreateNode = onCreateNode
