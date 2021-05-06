/* eslint-disable no-useless-escape */
import { isWebUri } from "valid-url"
import { fluid } from "gatsby-plugin-sharp"
import Img from "gatsby-image"
import React from "react"
import ReactDOMServer from "react-dom/server"
import stringify from "fast-json-stable-stringify"
import execall from "execall"
import cheerio from "cheerio"
import url from "url"
import path from "path"
import fs from "fs-extra"
import { supportedExtensions } from "gatsby-transformer-sharp/supported-extensions"
import replaceAll from "replaceall"

import { formatLogMessage } from "~/utils/format-log-message"

import fetchReferencedMediaItemsAndCreateNodes, {
  stripImageSizesFromUrl,
} from "../fetch-nodes/fetch-referenced-media-items"
import btoa from "btoa"
import store from "~/store"
import { createLocalFileNode } from "./create-local-file-node"

const getNodeEditLink = node => {
  const { protocol, hostname } = url.parse(node.link)
  const editUrl = `${protocol}//${hostname}/wp-admin/post.php?post=${node.databaseId}&action=edit`

  return editUrl
}

const findReferencedImageNodeIds = ({ nodeString, pluginOptions, node }) => {
  // if the lazyNodes plugin option is set we don't need to find
  // image node id's because those nodes will be fetched lazily in resolvers.
  if (pluginOptions.type.MediaItem.lazyNodes) {
    return []
  }

  // get an array of all referenced media file ID's
  const matchedIds = execall(
    /"__typename":"MediaItem","id":"([^"]*)"/gm,
    nodeString
  )
    .map(match => match.subMatches[0])
    .filter(id => id !== node.id)

  return matchedIds
}

const getCheerioImgDbId = cheerioImg => {
  // try to get the db id from data attributes
  const dataAttributeId =
    cheerioImg.attribs[`data-id`] || cheerioImg.attribs[`data-image-id`]

  if (dataAttributeId) {
    return dataAttributeId
  }

  if (!cheerioImg.attribs.class) {
    return null
  }

  // try to get the db id from the wp-image-id classname
  const wpImageClass = cheerioImg.attribs.class
    .split(` `)
    .find(className => className.includes(`wp-image-`))

  if (wpImageClass) {
    const wpImageClassDashArray = wpImageClass.split(`-`)
    const wpImageClassId = Number(
      wpImageClassDashArray[wpImageClassDashArray.length - 1]
    )

    if (wpImageClassId) {
      return wpImageClassId
    }
  }

  return null
}

// media items are of the "post" type
const dbIdToMediaItemRelayId = dbId => (dbId ? btoa(`post:${dbId}`) : null)

const getCheerioImgRelayId = cheerioImg =>
  dbIdToMediaItemRelayId(getCheerioImgDbId(cheerioImg))

export const ensureSrcHasHostname = ({ src, wpUrl }) => {
  const { protocol, host } = url.parse(wpUrl)

  if (src.startsWith(`/wp-content`)) {
    src = `${protocol}//${host}${src}`
  }

  return src
}

const pickNodeBySourceUrlOrCheerioImg = ({
  url,
  cheerioImg,
  mediaItemNodes,
}) => {
  const possibleHtmlSrcs = [
    // try to match the media item source url by original html src
    url,
    // or by the src minus any image sizes string
    stripImageSizesFromUrl(url),
  ]

  const imageNode = mediaItemNodes.find(
    mediaItemNode =>
      // either find our node by the source url
      possibleHtmlSrcs.includes(mediaItemNode.sourceUrl) ||
      possibleHtmlSrcs.includes(
        // try to match without -scaled in the sourceUrl as well
        // since WP adds -scaled to image urls if they were too large
        // at upload time but image urls in html don't have this requirement.
        // the sourceUrl may have -scaled in it but the full size image is still
        // stored on the server (just not in the db)
        (mediaItemNode.sourceUrl || mediaItemNode.mediaItemUrl).replace(
          `-scaled`,
          ``
        )
      ) ||
      // or by id for cases where the src url didn't return a node
      (!!cheerioImg && getCheerioImgRelayId(cheerioImg) === mediaItemNode.id)
  )

  return imageNode
}

let displayedFailedToRestoreMessage = false

const fetchNodeHtmlImageMediaItemNodes = async ({
  cheerioImages,
  node,
  helpers,
  wpUrl,
}) => {
  // get all the image nodes we've cached from elsewhere
  const { nodeMetaByUrl } = store.getState().imageNodes

  const previouslyCachedNodesByUrl = (
    await Promise.all(
      Object.entries(nodeMetaByUrl).map(([sourceUrl, { id } = {}]) => {
        if (!sourceUrl || !id) {
          return null
        }

        sourceUrl = ensureSrcHasHostname({ wpUrl, src: sourceUrl })

        const existingNode = helpers.getNode(id)

        if (!existingNode) {
          if (!displayedFailedToRestoreMessage) {
            helpers.reporter.warn(
              formatLogMessage(
                `File node failed to restore from cache. This is a bug in gatsby-source-wordpress. Please open an issue so we can help you out :)`
              )
            )
            displayedFailedToRestoreMessage = true
          }

          return null
        }

        return {
          sourceUrl,
          ...existingNode,
        }
      })
    )
  ).filter(Boolean)

  const mediaItemUrls = cheerioImages
    // filter out nodes we already have
    .filter(({ cheerioImg }) => {
      const url = ensureSrcHasHostname({ wpUrl, src: cheerioImg.attribs.src })

      const existingNode = pickNodeBySourceUrlOrCheerioImg({
        url,
        mediaItemNodes: previouslyCachedNodesByUrl,
      })

      return !existingNode
    })
    // get remaining urls
    .map(({ cheerioImg }) => {
      const src = ensureSrcHasHostname({
        src: cheerioImg.attribs.src,
        wpUrl,
      })

      return src
    })

  // build a query to fetch all media items that we don't already have
  const mediaItemNodesBySourceUrl = await fetchReferencedMediaItemsAndCreateNodes(
    {
      mediaItemUrls,
    }
  )

  // images that have been edited from the media library that were previously
  // uploaded to a post/page will have a different sourceUrl so they can't be fetched by it
  // in many cases we have data-id or data-image-id as attributes on the img
  // we can try to use those to fetch media item nodes as well
  // this will keep us from missing nodes
  const mediaItemDbIds = cheerioImages
    .map(({ cheerioImg }) => getCheerioImgDbId(cheerioImg))
    .filter(Boolean)

  const mediaItemRelayIds = mediaItemDbIds
    .map(dbId => dbIdToMediaItemRelayId(dbId))
    .filter(
      // filter out any media item ids we already fetched
      relayId =>
        ![...mediaItemNodesBySourceUrl, ...previouslyCachedNodesByUrl].find(
          ({ id } = {}) => id === relayId
        )
    )

  const mediaItemNodesById = await fetchReferencedMediaItemsAndCreateNodes({
    referencedMediaItemNodeIds: mediaItemRelayIds,
  })

  const createdNodes = [...mediaItemNodesById, ...mediaItemNodesBySourceUrl]

  const mediaItemNodes = [...createdNodes, ...previouslyCachedNodesByUrl]

  const htmlMatchesToMediaItemNodesMap = new Map()
  for (const { cheerioImg, match } of cheerioImages) {
    const htmlImgSrc = ensureSrcHasHostname({
      src: cheerioImg.attribs.src,
      wpUrl,
    })

    let imageNode = pickNodeBySourceUrlOrCheerioImg({
      url: htmlImgSrc,
      cheerioImg,
      mediaItemNodes,
    })

    if (!imageNode && htmlImgSrc) {
      // if we didn't get a media item node for this image,
      // we need to fetch it and create a file node for it with no
      // media item node.
      try {
        imageNode = await createLocalFileNode({
          skipExistingNode: true,
          parentName: `Creating File node from URL where we couldn't find a MediaItem node`,
          mediaItemNode: {
            id: node.id,
            mediaItemUrl: htmlImgSrc,
            modifiedGmt: null,
            mimeType: null,
            title: null,
            fileSize: null,
            parentHtmlNode: node,
          },
        })
      } catch (e) {
        const sharedError = `when trying to fetch\n${htmlImgSrc}\nfrom ${
          node.__typename
        } #${node.databaseId} "${node.title ?? node.id}"`
        const nodeEditLink = getNodeEditLink(node)

        if (typeof e === `string` && e.includes(`404`)) {
          helpers.reporter.warn(
            formatLogMessage(
              `\n\nReceived a 404 ${sharedError}\n\nMost likely this image was uploaded to this ${node.__typename} and then deleted from the media library.\nYou'll need to fix this and re-save this ${node.__typename} to remove this warning at\n${nodeEditLink}.\n\n`
            )
          )
          imageNode = null
        } else {
          helpers.reporter.warn(
            `Received the below error ${sharedError}\n\n${nodeEditLink}\n\n`
          )
          helpers.reporter.panic(formatLogMessage(e))
        }
      }
    }

    cacheCreatedFileNodeBySrc({ node: imageNode, src: htmlImgSrc })

    if (imageNode) {
      // match is the html string of the img tag
      htmlMatchesToMediaItemNodesMap.set(match, { imageNode, cheerioImg })
    }
  }

  return htmlMatchesToMediaItemNodesMap
}

const getCheerioElementFromMatch = wpUrl => ({ match, tag = `img` }) => {
  // unescape quotes
  const parsedMatch = JSON.parse(`"${match}"`)

  // load our matching img tag into cheerio
  const $ = cheerio.load(parsedMatch, {
    xml: {
      // make sure it's not wrapped in <body></body>
      withDomLvl1: false,
      // no need to normalize whitespace, we're dealing with a single element here
      normalizeWhitespace: false,
      xmlMode: true,
      // entity decoding isn't our job here, that will be the responsibility of WPGQL
      // or of the source plugin elsewhere.
      decodeEntities: false,
    },
  })

  // there's only ever one element due to our match matching a single tag
  // $(tag) isn't an array, it's an object with a key of 0
  const cheerioElement = $(tag)[0]

  if (cheerioElement?.attribs?.src?.startsWith(`/wp-content`)) {
    cheerioElement.attribs.src = `${wpUrl}${cheerioElement.attribs.src}`
  }

  return {
    match,
    cheerioElement,
    // @todo this is from when this function was just used for images
    // remove this by refactoring
    cheerioImg: cheerioElement,
  }
}

const getCheerioElementsFromMatches = ({ imgTagMatches, wpUrl }) =>
  imgTagMatches
    .map(getCheerioElementFromMatch(wpUrl))
    .filter(({ cheerioImg: { attribs } }) => {
      if (!attribs.src) {
        return false
      }

      return isWebUri(encodeURI(attribs.src))
    })

const getLargestSizeFromSizesAttribute = sizesString => {
  const sizesStringsArray = sizesString.split(`,`)

  return sizesStringsArray.reduce((largest, currentSizeString) => {
    const maxWidth = currentSizeString
      .substring(
        currentSizeString.indexOf(`max-width: `) + 1,
        currentSizeString.indexOf(`px`)
      )
      .trim()

    const maxWidthNumber = Number(maxWidth)
    const noLargestAndMaxWidthIsANumber = !largest && !isNaN(maxWidthNumber)
    const maxWidthIsALargerNumberThanLargest =
      largest && !isNaN(maxWidthNumber) && maxWidthNumber > largest

    if (noLargestAndMaxWidthIsANumber || maxWidthIsALargerNumberThanLargest) {
      largest = maxWidthNumber
    }

    return largest
  }, null)
}

const findImgTagMaxWidthFromCheerioImg = cheerioImg => {
  const {
    attribs: { width, sizes },
  } = cheerioImg || { attribs: { width: null, sizes: null } }

  if (width) {
    const widthNumber = Number(width)

    if (!isNaN(widthNumber)) {
      return widthNumber
    }
  }

  if (sizes) {
    const largestSize = getLargestSizeFromSizesAttribute(sizes)

    if (largestSize && !isNaN(largestSize)) {
      return largestSize
    }
  }

  return null
}

const getFileNodeRelativePathname = fileNode => {
  const fileName = `${fileNode.internal.contentDigest}/${fileNode.base}`

  return fileName
}

const getFileNodePublicPath = fileNode => {
  const fileName = getFileNodeRelativePathname(fileNode)

  const publicPath = path.join(process.cwd(), `public`, `static`, fileName)

  return publicPath
}

const copyFileToStaticAndReturnUrlPath = async (fileNode, helpers) => {
  const publicPath = getFileNodePublicPath(fileNode)

  if (!fs.existsSync(publicPath)) {
    await fs.copy(
      fileNode.absolutePath,
      publicPath,
      { dereference: true },
      err => {
        if (err) {
          console.error(
            `error copying file from ${fileNode.absolutePath} to ${publicPath}`,
            err
          )
        }
      }
    )
  }

  const fileName = getFileNodeRelativePathname(fileNode)

  const relativeUrl = `${helpers.pathPrefix ?? ``}/static/${fileName}`

  return relativeUrl
}

const filterMatches = wpUrl => ({ match }) => {
  const { hostname: wpHostname } = url.parse(wpUrl)

  // @todo make it a plugin option to fetch non-wp images
  // here we're filtering out image tags that don't contain our site url
  const isHostedInWp =
    // if it has the full WP url
    match.includes(wpHostname) ||
    // or it's an absolute path
    match.includes(`src=\\"/wp-content`)

  // six backslashes means we're looking for three backslashes
  // since we're looking for JSON encoded strings inside of our JSON encoded string
  const isInJSON = match.includes(`src=\\\\\\"`)

  return isHostedInWp && !isInJSON
}

const cacheCreatedFileNodeBySrc = ({ node, src }) => {
  if (node) {
    // save any fetched media items in our global media item cache
    store.dispatch.imageNodes.pushNodeMeta({
      sourceUrl: src,
      id: node.id,
      modifiedGmt: node.modifiedGmt,
    })
  }
}

const imgSrcRemoteFileRegex = /(?:src=\\")((?:(?:https?|ftp|file):\/\/|www\.|ftp\.|\/)(?:[^'"])*\.(?:jpeg|jpg|png|gif|ico|mpg|ogv|svg|bmp|tif|tiff))(\?[^\\" \.]*|)(?=\\"| |\.)/gim

export const getImgSrcRemoteFileMatchesFromNodeString = nodeString =>
  execall(imgSrcRemoteFileRegex, nodeString).filter(({ subMatches }) => {
    // if our match is json encoded, that means it's inside a JSON
    // encoded string field.
    const isInJSON = subMatches[0].includes(`\\/\\/`)

    // we shouldn't process encoded JSON, so skip this match if it's JSON
    return !isInJSON
  })

export const getImgTagMatchesWithUrl = ({ nodeString, wpUrl }) =>
  execall(
    /<img([\w\W]+?)[\/]?>/gim,
    nodeString
      // we don't want to match images inside pre
      .replace(/<pre([\w\W]+?)[\/]?>.*(<\/pre>)/gim, ``)
      // and code tags, so temporarily remove those tags and everything inside them
      .replace(/<code([\w\W]+?)[\/]?>.*(<\/code>)/gim, ``)
  ).filter(filterMatches(wpUrl))

const replaceNodeHtmlImages = async ({
  nodeString,
  node,
  helpers,
  wpUrl,
  pluginOptions,
}) => {
  // this prevents fetching inline html images
  if (!pluginOptions?.html?.useGatsbyImage) {
    return nodeString
  }

  const imageUrlMatches = getImgSrcRemoteFileMatchesFromNodeString(nodeString)

  const imgTagMatches = getImgTagMatchesWithUrl({ nodeString, wpUrl })

  if (imageUrlMatches.length && imgTagMatches.length) {
    const cheerioImages = getCheerioElementsFromMatches({
      imgTagMatches,
      wpUrl,
    })

    const htmlMatchesToMediaItemNodesMap = await fetchNodeHtmlImageMediaItemNodes(
      {
        cheerioImages,
        nodeString,
        node,
        helpers,
        pluginOptions,
        wpUrl,
      }
    )

    // generate gatsby images for each cheerioImage
    const htmlMatchesWithImageResizes = await Promise.all(
      imgTagMatches.map(async ({ match }) => {
        const matchInfo = htmlMatchesToMediaItemNodesMap.get(match)

        if (!matchInfo) {
          return null
        }

        const { imageNode, cheerioImg } = matchInfo

        const isMediaItemNode = imageNode.__typename === `MediaItem`

        if (!imageNode) {
          return null
        }

        const fileNode =
          // if we couldn't get a MediaItem node for this image in WPGQL
          !isMediaItemNode
            ? // this will already be a file node
              imageNode
            : // otherwise grab the file node
              helpers.getNode(imageNode.localFile.id)

        const imgTagMaxWidth = findImgTagMaxWidthFromCheerioImg(cheerioImg)

        const mediaItemNodeWidth = isMediaItemNode
          ? imageNode?.mediaDetails?.width
          : null

        // if a max width can't be inferred from html, this value will be passed to Sharp
        let fallbackImageMaxWidth = pluginOptions?.html?.fallbackImageMaxWidth

        if (
          // if the image is smaller than the fallback max width,
          // the images width will be used instead if we have a media item node
          fallbackImageMaxWidth > mediaItemNodeWidth &&
          // of course that means we have to have a media item node
          // and a media item node max width
          mediaItemNodeWidth &&
          typeof mediaItemNodeWidth === `number` &&
          mediaItemNodeWidth > 0
        ) {
          fallbackImageMaxWidth = mediaItemNodeWidth
        }

        let maxWidth =
          // if we inferred a maxwidth from html
          (imgTagMaxWidth &&
          // and we have a media item node to know it's full size max width
          mediaItemNodeWidth &&
          // and this isn't an svg which has no maximum width
          fileNode.extension !== `svg` &&
          // and the media item node max width is smaller than what we inferred
          // from html
          mediaItemNodeWidth < imgTagMaxWidth
            ? // use the media item node width
              mediaItemNodeWidth
            : // otherwise use the width inferred from html
              imgTagMaxWidth) ??
          // if we don't have a media item node and we inferred no width
          // from html, then use the fallback max width from plugin options
          fallbackImageMaxWidth

        const configuredMaxWidth = pluginOptions?.html?.imageMaxWidth

        // if the configured html.maxWidth property is less than the result, then
        // override the resultant width
        if (configuredMaxWidth && configuredMaxWidth < maxWidth) {
          maxWidth = configuredMaxWidth
        }

        const quality = pluginOptions?.html?.imageQuality

        const { reporter, cache, pathPrefix } = helpers

        const gatsbyTransformerSharpSupportsThisFileType =
          supportedExtensions[fileNode?.extension]

        let fluidResult = null

        if (gatsbyTransformerSharpSupportsThisFileType) {
          try {
            fluidResult = await fluid({
              file: fileNode,
              args: {
                maxWidth,
                quality,
                pathPrefix,
              },
              reporter,
              cache,
            })
          } catch (e) {
            reporter.error(e)
            reporter.warn(
              formatLogMessage(
                `${node.__typename} ${node.id} couldn't process inline html image ${fileNode.url}`
              )
            )
            return null
          }
        }

        return {
          match,
          cheerioImg,
          fileNode,
          imageResize: fluidResult,
          maxWidth,
        }
      })
    )

    // find/replace mutate nodeString to replace matched images with rendered gatsby images
    for (const matchResize of htmlMatchesWithImageResizes) {
      if (!matchResize) {
        continue
      }

      const { match, imageResize, cheerioImg, maxWidth } = matchResize

      // @todo retain img tag classes and attributes from cheerioImg
      const imgOptions = {
        style: {
          // these styles make it so that the image wont be stretched
          // beyond it's max width, but it also wont exceed the width
          // of it's parent element
          maxWidth: `100%`,
          width: `${imageResize?.presentationWidth || maxWidth}px`,
        },
        placeholderStyle: {
          opacity: 0,
        },
        className: `${
          cheerioImg?.attribs?.class || ``
        } inline-gatsby-image-wrapper`,
        loading: `eager`,
        alt: cheerioImg?.attribs?.alt,
        fadeIn: true,
        imgStyle: {
          opacity: 1,
        },
      }

      let ReactGatsbyImage

      if (imageResize) {
        imgOptions.fluid = imageResize
        ReactGatsbyImage = React.createElement(Img, imgOptions, null)
      } else {
        const { fileNode } = matchResize

        const relativeUrl = await copyFileToStaticAndReturnUrlPath(
          fileNode,
          helpers
        )

        imgOptions.src = relativeUrl

        delete imgOptions.imgStyle
        delete imgOptions.fadeIn
        delete imgOptions.placeholderStyle

        ReactGatsbyImage = React.createElement(`img`, imgOptions, null)
      }

      const gatsbyImageStringJSON = JSON.stringify(
        ReactDOMServer.renderToString(ReactGatsbyImage)
          .replace(/<div/gm, `<span`)
          .replace(/<\/div/gm, `</span`)
      )

      // need to remove the JSON stringify quotes around our image since we're
      // threading this JSON string back into a larger JSON object string
      const gatsbyImageString = gatsbyImageStringJSON.substring(
        1,
        gatsbyImageStringJSON.length - 1
      )

      nodeString = replaceAll(match, gatsbyImageString, nodeString)
    }
  }

  return nodeString
}

const replaceFileLinks = async ({
  nodeString,
  helpers,
  wpUrl,
  pluginOptions,
  node,
}) => {
  if (!pluginOptions?.html?.createStaticFiles) {
    return nodeString
  }

  if (node.__typename === `MediaItem`) {
    // we don't want to replace file links on MediaItem nodes because they're processed specially from other node types.
    // if we replace file links here then we wont be able to properly fetch the localFile node
    return nodeString
  }

  const hrefMatches = execall(
    /(\\"|\\'|\()([^'"()]*)(\/wp-content\/uploads\/[^'">()]+)(\\"|\\'|>|\))/gm,
    nodeString
  )

  if (hrefMatches.length) {
    // eslint-disable-next-line arrow-body-style
    const mediaItemUrlsAndMatches = hrefMatches.map(matchGroup => ({
      matchGroup,
      url: `${wpUrl}${matchGroup.subMatches[2]}`,
    }))

    const mediaItemUrls = mediaItemUrlsAndMatches
      .map(({ url }) => url)
      .filter(isWebUri)

    const mediaItemNodesBySourceUrl = await fetchReferencedMediaItemsAndCreateNodes(
      {
        mediaItemUrls,
      }
    )

    const findReplaceMaps = []

    await Promise.all(
      mediaItemNodesBySourceUrl.map(async node => {
        let fileNode
        let mediaItemNode

        if (node.internal.type === `File`) {
          fileNode = node
          mediaItemNode = await helpers.getNode(node.parent)
        } else if (node.localFile?.id) {
          fileNode = await helpers.getNode(node.localFile.id)
          mediaItemNode = node
        } else {
          return null
        }

        const relativeUrl = await copyFileToStaticAndReturnUrlPath(
          fileNode,
          helpers
        )

        if (!relativeUrl || !mediaItemNode?.mediaItemUrl || !fileNode) {
          return null
        }

        const mediaItemMatchGroup = mediaItemUrlsAndMatches.find(
          ({
            matchGroup: {
              subMatches: [, , path],
            },
          }) => mediaItemNode.mediaItemUrl.includes(path)
        )?.matchGroup

        if (!mediaItemMatchGroup) {
          return null
        }

        const [, hostname, path] = mediaItemMatchGroup?.subMatches

        cacheCreatedFileNodeBySrc({
          node: mediaItemNode,
          src: `${wpUrl}${path}`,
        })

        findReplaceMaps.push({
          find: `${hostname || ``}${path}`,
          replace: relativeUrl,
        })

        findReplaceMaps.push({
          find: path,
          replace: relativeUrl,
        })

        return null
      })
    )

    for (const { find, replace } of findReplaceMaps.filter(Boolean)) {
      nodeString = replaceAll(find, replace, nodeString)
    }
  }

  return nodeString
}

export const getWpLinkRegex = wpUrl =>
  new RegExp(
    `["']${wpUrl}(?!/wp-content|/wp-admin|/wp-includes)(/[^'"]+)["']`,
    `gim`
  )

// replaces any url which is a front-end WP url with a relative path
const replaceNodeHtmlLinks = ({ wpUrl, nodeString, node }) => {
  const wpLinkRegex = getWpLinkRegex(wpUrl)
  const linkMatches = execall(wpLinkRegex, nodeString)

  if (linkMatches.length) {
    linkMatches.forEach(({ match, subMatches: [path] }) => {
      if (path) {
        try {
          // remove \, " and ' characters from match
          const normalizedMatch = match
            .replace(/['"\\]/g, ``)
            // ensure that query params are properly quoted
            .replace(/\?/, `\\?`)

          const normalizedPath = path.replace(/\\/g, ``)

          // replace normalized match with relative path
          const thisMatchRegex = new RegExp(
            normalizedMatch + `(?!/?wp-content|/?wp-admin|/?wp-includes)`,
            `g`
          )

          nodeString = nodeString.replace(thisMatchRegex, normalizedPath)
        } catch (e) {
          console.error(e)
          console.warn(
            formatLogMessage(
              `Failed to process inline html links in ${node.__typename} ${node.id}`
            )
          )
        }
      }
    })
  }

  return nodeString
}

const processNodeString = async ({
  nodeString,
  node,
  pluginOptions,
  helpers,
  wpUrl,
}) => {
  const nodeStringFilters = [
    replaceNodeHtmlImages,
    replaceFileLinks,
    replaceNodeHtmlLinks,
  ]

  for (const nodeStringFilter of nodeStringFilters) {
    nodeString = await nodeStringFilter({
      nodeString,
      node,
      pluginOptions,
      helpers,
      wpUrl,
    })
  }

  return nodeString
}

const processNode = async ({
  node,
  pluginOptions,
  wpUrl,
  helpers,
  referencedMediaItemNodeIds,
}) => {
  const nodeString = stringify(node)

  // find referenced node ids
  // here we're searching for node id strings in our node
  // we use this to download only the media items
  // that are being used in posts
  // this is important for downloading images nodes that are connected somewhere
  // on a node field
  const nodeMediaItemIdReferences = findReferencedImageNodeIds({
    nodeString,
    pluginOptions,
    node,
  })

  // push them to our store of referenced id's
  if (nodeMediaItemIdReferences?.length && referencedMediaItemNodeIds) {
    nodeMediaItemIdReferences.forEach(id => referencedMediaItemNodeIds.add(id))
  }

  const processedNodeString = await processNodeString({
    nodeString,
    node,
    pluginOptions,
    helpers,
    wpUrl,
  })

  // only parse if the nodeString has changed
  if (processedNodeString !== nodeString) {
    return JSON.parse(processedNodeString)
  } else {
    return node
  }
}

export { processNode }
