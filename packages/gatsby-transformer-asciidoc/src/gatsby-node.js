"use strict"

const asciidoc = require(`asciidoctor.js`)()

async function onCreateNode(
  {
    node,
    actions,
    pathPrefix,
    loadNodeContent,
    createNodeId,
    reporter,
    createContentDigest,
  },
  pluginOptions
) {
  var extensionsConfig = pluginOptions.fileExtensions

  // make extensions configurable and use adoc and asciidoc as default
  var supportedExtensions =
    typeof extensionsConfig != `undefined` && extensionsConfig instanceof Array
      ? extensionsConfig
      : [`adoc`, `asciidoc`]
  var currentExtension = node.extension
  var isSupportedExtension = supportedExtensions.indexOf(currentExtension) > -1

  if (!isSupportedExtension) {
    return
  }

  // changes the incoming imagesdir option to take the
  var changedImagesDir = resolveImagesDir(
    pathPrefix,
    pluginOptions.attributes.imagesdir
  )
  pluginOptions.attributes.imagesDir = changedImagesDir

  const { createNode, createParentChildLink } = actions // Load Asciidoc contents

  const content = await loadNodeContent(node) // Load Asciidoc file for extracting
  // https://asciidoctor-docs.netlify.com/asciidoctor.js/processor/extract-api/
  // We use a `let` here as a warning: some operations, like .convert() mutate the document

  let doc = await asciidoc.load(content, pluginOptions)

  try {
    const html = doc.convert() // Use "partition" option to be able to get title, subtitle, combined

    const title = doc.getDocumentTitle({
      partition: true,
    })
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

    let pageAttributes = extractPageAttributes(doc.getAttributes())

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
      pageAttributes: pageAttributes,
    }
    asciiNode.internal.contentDigest = createContentDigest(asciiNode)
    createNode(asciiNode)
    createParentChildLink({
      parent: node,
      child: asciiNode,
    })
  } catch (err) {
    reporter.panicOnBuild(`Error processing Asciidoc ${
      node.absolutePath ? `file ${node.absolutePath}` : `in node ${node.id}`
    }:\n
      ${err.message}`)
  }
}

const resolveImagesDir = (pathPrefix, optionImagesDir) => {
  var defaultImagesDir = `/images`
  var currentPathPrefix = pathPrefix || ``

  if (optionImagesDir === undefined) {
    return withPathPrefix(currentPathPrefix, defaultImagesDir)
  }

  return withPathPrefix(currentPathPrefix, defaultImagesDir)
}

const withPathPrefix = (pathPrefix, url) =>
  (pathPrefix + url).replace(/\/\//, `/`)

const extractPageAttributes = allAttributes => {
  var allPageAttributes = Object.keys(allAttributes).filter(v =>
    v.startsWith(`page-`)
  )
  var newAttributes = {}

  for (const key in allPageAttributes) {
    var currentKey = allPageAttributes[key]
    var newKey = currentKey.replace(`page-`, ``)
    var value = allAttributes[currentKey]
    newAttributes[newKey] = value
  }

  return newAttributes
}

exports.onCreateNode = onCreateNode
