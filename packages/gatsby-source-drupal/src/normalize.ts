const { URL } = require(`url`)
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)
const path = require(`path`)
const { capitalize } = require(`lodash`)
const probeImageSize = require(`probe-image-size`)

import { getOptions } from "./plugin-options"

export const getHref = link => {
  if (typeof link === `object`) {
    return link.href
  }
  return link
}

export const imageCDNState = {
  foundPlaceholderStyle: false,
  hasLoggedNoPlaceholderStyle: false,
}

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
  if (!pluginOptions?.skipFileDownloads || pluginOptions.imageCDN === false) {
    return {}
  }

  const isFile = isFileNode(
    {
      internal: {
        type,
      },
    },
    pluginOptions.typePrefix
  )

  if (!isFile) {
    return {}
  }

  const mimeType = node.attributes.filemime || node.attributes.mimetype
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
    reporter.panicOnBuild(
      `[gatsby-source-drupal] Encountered an unrecoverable error while generating Gatsby Image CDN fields for url ${url}. See above for additional information.`
    )
  }

  return {}
}

export const generateTypeName = (type: string, typePrefix = ``) => {
  const prefixed = typePrefix
    ? `${capitalize(typePrefix)}${capitalize(type)}`
    : type

  return prefixed.replace(/-|__|:|\.|\s/g, `_`)
}

export const nodeFromData = async (
  datum,
  createNodeId,
  entityReferenceRevisions = [],
  pluginOptions,
  fileNodesExtendedData,
  reporter
) => {
  const { attributes: { id: attributeId, ...attributes } = { id: null } } =
    datum

  const preservedId =
    typeof attributeId !== `undefined` ? { _attributes_id: attributeId } : {}

  const langcode = attributes.langcode || `und`
  const { typePrefix = `` } = pluginOptions

  const type = generateTypeName(datum.type, typePrefix)

  const gatsbyImageCdnFields = await getGatsbyImageCdnFields({
    node: datum,
    type,
    pluginOptions,
    fileNodesExtendedData,
    reporter,
  })

  const versionedId = createNodeIdWithVersion({
    id: datum.id,
    type: datum.type,
    langcode,
    revisionId: attributes.drupal_internal__revision_id,
    entityReferenceRevisions,
    typePrefix,
  })

  const gatsbyId = createNodeId(versionedId)

  return {
    id: gatsbyId,
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

const isEntityReferenceRevision = (
  type,
  entityReferenceRevisions: Array<string> = []
) =>
  entityReferenceRevisions.findIndex(
    revisionType => type.indexOf(revisionType) === 0
  ) !== -1

export const createNodeIdWithVersion = ({
  id,
  type,
  langcode,
  revisionId,
  entityReferenceRevisions = [],
  typePrefix,
}: {
  id: string
  type: string
  langcode: string
  revisionId: string
  entityReferenceRevisions: Array<string>
  typePrefix: string
}) => {
  const options = getOptions()

  // Fallback to default language for entities that don't translate.
  if (
    options?.languageConfig?.nonTranslatableEntities?.includes(type) &&
    options.languageConfig.defaultLanguage
  ) {
    langcode = options.languageConfig.defaultLanguage
  }

  // If the source plugin hasn't enabled `translation` then always just set langcode
  // to "undefined".
  let langcodeNormalized = options.languageConfig ? langcode : `und`

  const renamedCode = options?.languageConfig?.renamedEnabledLanguages?.find(
    lang => lang.langCode === langcodeNormalized
  )

  if (renamedCode) {
    langcodeNormalized = renamedCode.as
  }

  if (
    !renamedCode &&
    options.languageConfig &&
    options.languageConfig.defaultLanguage &&
    !options?.languageConfig?.enabledLanguages?.includes(langcodeNormalized)
  ) {
    langcodeNormalized = options.languageConfig.defaultLanguage
  }

  const isReferenceRevision = isEntityReferenceRevision(
    type,
    entityReferenceRevisions
  )

  // The relationship between an entity and another entity also depends on the revision ID if the field is of type
  // entity reference revision such as for paragraphs.
  const idVersion = isReferenceRevision
    ? `${langcodeNormalized}.${id}.${revisionId || 0}`
    : `${langcodeNormalized}.${id}`

  return typePrefix ? `${typePrefix}.${idVersion}` : idVersion
}

const fileNodeTypes = new Map<string, Set<string>>()

export const isFileNode = (node, typePrefix = ``) => {
  if (!fileNodeTypes.has(typePrefix)) {
    fileNodeTypes.set(
      typePrefix,
      new Set<string>([
        generateTypeName(`files`, typePrefix),
        generateTypeName(`file--file`, typePrefix),
      ])
    )
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return fileNodeTypes.get(typePrefix)!.has(node?.internal?.type)
}

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

export const downloadFile = async (
  { node, cache, createNode, createNodeId, getCache },
  { basicAuth, baseUrl, typePrefix }: Record<string, any>
) => {
  // handle file downloads
  if (!isFileNode(node, typePrefix)) {
    return
  }
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
