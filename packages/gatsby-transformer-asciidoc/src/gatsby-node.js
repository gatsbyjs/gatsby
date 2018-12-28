const asciidoc = require(`asciidoctor.js`)()

async function onCreateNode(
  { node, actions, loadNodeContent, createNodeId, createContentDigest },
  pluginOptions
) {
  // Filter out non-adoc content
  if (!node.extension || node.extension !== `adoc`) {
    return
  }

  const { createNode, createParentChildLink } = actions
  // Load Asciidoc contents
  const content = await loadNodeContent(node)
  const html = asciidoc.convert(content, pluginOptions)

  const asciiNode = {
    id: createNodeId(`${node.id} >>> ASCIIDOC`),
    parent: node.id,
    internal: {
      type: `Asciidoc`,
      mediaType: `text/html`,
      content: html,
    },
    children: [],
    html,
  }

  asciiNode.internal.contentDigest = createContentDigest(asciiNode)

  createNode(asciiNode)
  createParentChildLink({ parent: node, child: asciiNode })
}

exports.onCreateNode = onCreateNode
