const { URL } = require(`url`)
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)
const path = require(`path`)
const probeImageSize = require(`probe-image-size`)

const { getOptions } = require(`./plugin-options`)
const getHref = link => {
  if (typeof link === `object`) {
    return link.href
  }
  return link
}

exports.getHref = getHref

const imageCDNState = {
  foundPlaceholderStyle: false,
  hasLoggedNoPlaceholderStyle: false,
}

exports.imageCDNState = imageCDNState

let four04WarningCount = 0
let corruptFileWarningCount = 0
/**
 * This FN takes in node data and returns Gatsby Image CDN fields that should be added to that node. If the input node isn't an image an empty object is returned.
 */
const getGatsbyImageCdnFields = async ({
  node,
  type,
  pluginOptions,
  fileNodesExtendedData,
  reporter,
}) => {
  if (!pluginOptions?.skipFileDownloads) {
    return {}
  }

  const isFile = isFileNode({
    internal: {
      type,
    },
  })

  if (!isFile) {
    return {}
  }

  const mimeType = node.attributes.filemime
  const { filename } = node.attributes

  if (!mimeType || !filename) {
    return {}
  }

  const url = getFileUrl(node.attributes, pluginOptions.baseUrl)?.href

  if (!url) {
    return {}
  }

  if (!mimeType.includes(`image/`)) {
    return {
      mimeType,
      filename,
      url,
    }
  }

  const extraNodeData = fileNodesExtendedData?.get?.(node.id) || null

  try {
    const { placeholderStyleName } = getOptions()
    const placeholderUrl =
      extraNodeData?.imageDerivatives?.links?.[placeholderStyleName]?.href ||
      extraNodeData?.imageDerivatives?.links?.placeholder?.href ||
      url

    if (placeholderUrl !== url) {
      imageCDNState.foundPlaceholderStyle = true
    }

    const hasRequiredData = input => input && input.width && input.height

    // extraNodeData comes from the fileNodesExtendedData Map which is built up in sourceNodes in gatsby-node. The data in this Map is found by looking at connections to file nodes from other node types. This is needed because Drupal's JSON API doesn't provide image widths/heights and placeholder urls for file nodes when querying directly for file nodes. This data can only be found on other nodes with relationships to file nodes. In the case that we don't have this data, we use probe-image-size to find the width/height of the image so that image CDN still works even if we don't have the data.
    const imageSize = hasRequiredData(extraNodeData)
      ? extraNodeData
      : await probeImageSize(url)

    if (!hasRequiredData(imageSize) || !placeholderUrl) {
      return {}
    }

    const gatsbyImageCdnFields = {
      filename,
      url,
      placeholderUrl,
      width: imageSize.width,
      height: imageSize.height,
      mimeType,
    }

    return gatsbyImageCdnFields
  } catch (e) {
    if (e.message.includes(`404`)) {
      if (four04WarningCount < 10) {
        four04WarningCount++
        reporter.warn(`[gatsby-source-drupal] file returns 404: ${url}`)
      }

      return {}
    }

    if (e.message.includes(`unrecognized file format`)) {
      if (corruptFileWarningCount < 10) {
        corruptFileWarningCount++
        reporter.warn(
          `[gatsby-source-drupal] Encountered corrupt file while requesting image dimensions for ${url}`
        )
      }

      return {}
    }

    reporter.error(e)
    reporter.info(
      JSON.stringify(
        {
          extraNodeData,
          url,
          attributes: node.attributes,
        },
        null,
        2
      )
    )
    reporter.panic(
      `[gatsby-source-drupal] Encountered an unrecoverable error while generating Gatsby Image CDN fields for url ${url}. See above for additional information.`
    )
  }

  return {}
}

const nodeFromData = async (
  datum,
  createNodeId,
  entityReferenceRevisions = [],
  pluginOptions,
  fileNodesExtendedData,
  reporter
) => {
  const { attributes: { id: attributeId, ...attributes } = {} } = datum
  const preservedId =
    typeof attributeId !== `undefined` ? { _attributes_id: attributeId } : {}
  const langcode = attributes.langcode || `und`
  const type = datum.type.replace(/-|__|:|\.|\s/g, `_`)

  const gatsbyImageCdnFields = await getGatsbyImageCdnFields({
    node: datum,
    type,
    pluginOptions,
    fileNodesExtendedData,
    reporter,
  })

  return {
    id: createNodeId(
      createNodeIdWithVersion(
        datum.id,
        datum.type,
        langcode,
        attributes.drupal_internal__revision_id,
        entityReferenceRevisions
      )
    ),
    drupal_id: datum.id,
    parent: null,
    drupal_parent_menu_item: attributes.parent,
    children: [],
    ...attributes,
    ...preservedId,
    ...gatsbyImageCdnFields,
    drupal_relationships: datum.relationships,
    relationships: {},
    internal: {
      type,
    },
  }
}

exports.nodeFromData = nodeFromData

const isEntityReferenceRevision = (type, entityReferenceRevisions = []) =>
  entityReferenceRevisions.findIndex(
    revisionType => type.indexOf(revisionType) === 0
  ) !== -1

const createNodeIdWithVersion = (
  id,
  type,
  langcode,
  revisionId,
  entityReferenceRevisions = []
) => {
  // Fallback to default language for entities that don't translate.
  if (getOptions()?.languageConfig?.nonTranslatableEntities.includes(type)) {
    langcode = getOptions().languageConfig.defaultLanguage
  }

  // If the source plugin hasn't enabled `translation` then always just set langcode
  // to "undefined".
  let langcodeNormalized = getOptions().languageConfig ? langcode : `und`

  if (
    getOptions().languageConfig &&
    !getOptions().languageConfig?.enabledLanguages.includes(langcodeNormalized)
  ) {
    langcodeNormalized = getOptions().languageConfig.defaultLanguage
  }

  // The relationship between an entity and another entity also depends on the revision ID if the field is of type
  // entity reference revision such as for paragraphs.
  return isEntityReferenceRevision(type, entityReferenceRevisions)
    ? `${langcodeNormalized}.${id}.${revisionId || 0}`
    : `${langcodeNormalized}.${id}`
}

exports.createNodeIdWithVersion = createNodeIdWithVersion

const isFileNode = node => {
  const type = node?.internal?.type
  return type === `files` || type === `file__file`
}

exports.isFileNode = isFileNode

const getFileUrl = (node, baseUrl) => {
  let fileUrl = node.url

  if (typeof node.uri === `object`) {
    // Support JSON API 2.x file URI format https://www.drupal.org/node/2982209
    fileUrl = node.uri.url
  }

  // Resolve w/ baseUrl if node.uri isn't absolute.
  const url = new URL(fileUrl, baseUrl)

  return url
}

exports.downloadFile = async (
  { node, store, cache, createNode, createNodeId, getCache, reporter },
  { basicAuth, baseUrl }
) => {
  // handle file downloads
  if (isFileNode(node)) {
    let fileType

    if (typeof node.uri === `object`) {
      // get file type from uri prefix ("S3:", "public:", etc.)
      const uriPrefix = node.uri.value.match(/^\w*:/)
      fileType = uriPrefix ? uriPrefix[0] : null
    }

    const url = getFileUrl(node, baseUrl)

    // If we have basicAuth credentials, add them to the request.
    const basicAuthFileSystems = [`public:`, `private:`, `temporary:`]
    const auth =
      typeof basicAuth === `object` && basicAuthFileSystems.includes(fileType)
        ? {
            htaccess_user: basicAuth.username,
            htaccess_pass: basicAuth.password,
          }
        : {}
    const fileNode = await createRemoteFileNode({
      url: url.href,
      name: path.parse(decodeURIComponent(url.pathname)).name,
      cache,
      createNode,
      createNodeId,
      getCache,
      parentNodeId: node.id,
      auth,
    })
    if (fileNode) {
      node.localFile___NODE = fileNode.id
    }
  }
}
