import PQueue from "p-queue"
import fetchReferencedMediaItemsAndCreateNodes from "../fetch-nodes/fetch-referenced-media-items"
import urlToPath from "~/utils/url-to-path"
import { getStore } from "~/store"
import fetchGraphql from "~/utils/fetch-graphql"
import { usingGatsbyV4OrGreater } from "~/utils/gatsby-version"

import {
  buildTypeName,
  getTypeSettingsByType,
} from "~/steps/create-schema-customization/helpers"
import { processNode } from "./process-node"

// @todo concurrency is currently set so low because side effects can overwhelm
// the remote server. A queue for the entire source plugin should be created so that
// everything can share a queue and we can speed some of these things up
const createNodesQueue = new PQueue({
  concurrency: 2,
})

export const createNodeWithSideEffects =
  ({
    node,
    state,
    wpgqlNodesGroup = null,
    referencedMediaItemNodeIds = new Set(),
    createdNodeIds = [],
    createNodesActivity = null,
    totalSideEffectNodes = null,
    type = null,
  }) =>
  async () => {
    const { wpUrl } = state.remoteSchema
    const { helpers, pluginOptions } = state.gatsbyApi

    const { actions, createContentDigest } = helpers

    if (node.link) {
      // @todo is this still necessary? I don't think it is but double check
      // create a pathname for the node using the WP permalink
      node.path = urlToPath(node.link)
    }

    if (wpgqlNodesGroup?.plural !== `mediaItems`) {
      const { processedNode } = await processNode({
        node,
        pluginOptions,
        referencedMediaItemNodeIds,
        wpUrl,
        helpers,
      })

      node = processedNode
    }

    const builtTypename = buildTypeName(
      node.__typename,
      pluginOptions.schema.typePrefix
    )

    let remoteNode = {
      ...node,
      __typename: builtTypename,
      id: node.id,
      parent: null,
      internal: {
        contentDigest: createContentDigest(node),
        type: type || builtTypename,
      },
    }

    const typeSettings = getTypeSettingsByType({
      name: node.type,
    })

    if (typeof typeSettings?.beforeChangeNode === `function`) {
      const { additionalNodeIds, remoteNode: changedRemoteNode } =
        (await typeSettings.beforeChangeNode({
          actionType: `CREATE_ALL`,
          remoteNode,
          actions,
          helpers,
          type: node.type,
          fetchGraphql,
          typeSettings,
          buildTypeName,
          wpStore: getStore(),
        })) || {}

      if (changedRemoteNode) {
        remoteNode = changedRemoteNode
      }

      if (additionalNodeIds?.length && totalSideEffectNodes) {
        additionalNodeIds.forEach(
          id => createdNodeIds.push(id) && totalSideEffectNodes.push(id)
        )
      }

      if (
        totalSideEffectNodes &&
        typeof totalSideEffectNodes?.length === `number` &&
        totalSideEffectNodes.length > 0 &&
        createNodesActivity
      ) {
        createNodesActivity.setStatus(
          `awaiting async side effects - ${totalSideEffectNodes.length} additional nodes fetched`
        )
      }
    }

    await actions.createNode(remoteNode)

    createdNodeIds.push(node.id)
  }

export const createGatsbyNodesFromWPGQLContentNodes = async ({
  wpgqlNodesByContentType,
  createNodesActivity,
}) => {
  const state = getStore().getState()
  const { helpers, pluginOptions } = state.gatsbyApi

  const { reporter } = helpers

  // wp supports these file extensions
  // jpeg|jpg|png|gif|ico|pdf|doc|docx|ppt|pptx|pps|ppsx|odt|xls|psd|mp3|m4a|ogg|wav|mp4|m4v|mov|wmv|avi|mpg|ogv|3gp|3g2|svg|bmp|tif|tiff|asf|asx|wm|wmx|divx|flv|qt|mpe|webm|mkv|txt|asc|c|cc|h|csv|tsv|ics|rtx|css|htm|html|m4b|ra|ram|mid|midi|wax|mka|rtf|js|swf|class|tar|zip|gz|gzip|rar|7z|exe|pot|wri|xla|xlt|xlw|mdb|mpp|docm|dotx|dotm|xlsm|xlsb|xltx|xltm|xlam|pptm|ppsm|potx|potm|ppam|sldx|sldm|onetoc|onetoc2|onetmp|onepkg|odp|ods|odg|odc|odb|odf|wp|wpd|key|numbers|pages

  // gatsby-image supports these file types
  // const imgSrcRemoteFileRegex = /<img.*?src=\\"(.*?jpeg|jpg|png|webp|tif|tiff$)\\"[^>]+>/gim

  getStore().dispatch.logger.createActivityTimer({
    typeName: `MediaItem`,
    pluginOptions,
    reporter,
  })

  const createdNodeIds = []
  const totalSideEffectNodes = []
  const referencedMediaItemNodeIds = new Set()

  for (const wpgqlNodesGroup of wpgqlNodesByContentType) {
    const wpgqlNodes = wpgqlNodesGroup.allNodesOfContentType

    for (const node of wpgqlNodes.values()) {
      createNodesQueue.add(
        createNodeWithSideEffects({
          state,
          node,
          wpgqlNodesGroup,
          referencedMediaItemNodeIds,
          createdNodeIds,
          createNodesActivity,
          totalSideEffectNodes,
        })
      )
    }
  }

  await createNodesQueue.onIdle()

  const referencedMediaItemNodeIdsArray = [...referencedMediaItemNodeIds]

  /**
   * if we're not excluding media items or we're lazy fetching media items (before Gatsby v4), we need to fetch media item nodes upfront here
   */
  if (
    !pluginOptions.type.MediaItem.exclude &&
    (!pluginOptions.type.MediaItem.lazyNodes || usingGatsbyV4OrGreater) &&
    referencedMediaItemNodeIdsArray.length
  ) {
    await fetchReferencedMediaItemsAndCreateNodes({
      referencedMediaItemNodeIds: referencedMediaItemNodeIdsArray,
    })

    getStore().dispatch.logger.stopActivityTimer({
      typeName: `MediaItem`,
    })

    return [...createdNodeIds, ...referencedMediaItemNodeIdsArray]
  }

  getStore().dispatch.logger.stopActivityTimer({
    typeName: `MediaItem`,
  })

  return createdNodeIds
}
