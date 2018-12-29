const asciidoc = require(`asciidoctor.js`)()

async function onCreateNode(
  {
    node,
    actions,
    loadNodeContent,
    createNodeId,
    reporter,
    createContentDigest,
  },
  pluginOptions
) {
  // Filter out non-adoc content
  if (!node.extension || node.extension !== `adoc`) {
    return
  }

  const { createNode, createParentChildLink } = actions
  // Load Asciidoc contents
  const content = await loadNodeContent(node)
  // Load Asciidoc file for extracting
  // https://asciidoctor-docs.netlify.com/asciidoctor.js/processor/extract-api/
  const doc = await asciidoc.loadFile(node.absolutePath)

  try {
    const html = asciidoc.convert(content, pluginOptions)
    // Use "partition" option to be able to get title, subtitle, combined
    const title = doc.getDocumentTitle({ partition: true })

    let revision = null
    let author = null

    if (doc.hasRevisionInfo()) {
      revision = {
        date: doc.getRevisionDate(),
        number: doc.getRevisionNumber(),
        remark: doc.getRevisionRemark(),
      }
    }

    if (doc.getAuthor()) {
      author = {
        fullName: doc.getAttribute(`author`),
        firstName: doc.getAttribute(`firstname`),
        lastName: doc.getAttribute(`lastname`) || ``,
        middleName: doc.getAttribute(`middlename`) || ``,
        authorInitials: doc.getAttribute(`authorinitials`) || ``,
        email: doc.getAttribute(`email`) || ``,
      }
    }

    const asciiNode = {
      id: createNodeId(`${node.id} >>> ASCIIDOC`),
      parent: node.id,
      internal: {
        type: `Asciidoc`,
        mediaType: `text/html`,
      },
      children: [],
      html,
      document: {
        title: title.getCombined(),
        subtitle: title.hasSubtitle() ? title.getSubtitle() : ``,
        main: title.getMain(),
      },
      revision,
      author,
    }

    asciiNode.internal.contentDigest = createContentDigest(asciiNode)

    createNode(asciiNode)
    createParentChildLink({ parent: node, child: asciiNode })
  } catch (err) {
    reporter.panicOnBuild(
      `Error processing Asciidoc ${
        node.absolutePath ? `file ${node.absolutePath}` : `in node ${node.id}`
      }:\n
      ${err.message}`
    )
  }
}

exports.onCreateNode = onCreateNode
