import type { GatsbyNode, Node } from "gatsby"
import isOnline from "is-online"
import _ from "lodash"

import { downloadContentfulAssets } from "./download-contentful-assets"
import { fetchContent } from "./fetch"
import {
  buildEntryList,
  buildForeignReferenceMap,
  buildResolvableSet,
  createAssetNodes,
  createNodesForContentType,
  createRefId,
  makeId,
} from "./normalize"
import { createPluginConfig } from "./plugin-options"
import { CODES } from "./report"
import type { IPluginOptions } from "./types/plugin"
import type { IContentfulAsset, IContentfulEntry } from "./types/contentful"
import type { ContentType } from "./types/contentful-js-sdk"

const CONTENT_DIGEST_COUNTER_SEPARATOR = `_COUNT_`

/***
 * Localization algorithm
 *
 * 1. Make list of all resolvable IDs worrying just about the default ids not
 * localized ids
 * 2. Make mapping between ids, again not worrying about localization.
 * 3. When creating entries and assets, make the most localized version
 * possible for each localized node i.e. get the localized field if it exists
 * or the fallback field or the default field.
 */

let isFirstSource = true
export const sourceNodes: GatsbyNode["sourceNodes"] =
  async function sourceNodes(args, pluginOptions) {
    const {
      actions,
      getNode,
      getNodes,
      createNodeId,
      store,
      cache,
      reporter,
      parentSpan,
    } = args
    const { createNode, touchNode, deleteNode } = actions
    const online = await isOnline()

    // Gatsby only checks if a node has been touched on the first sourcing.
    // As iterating and touching nodes can grow quite expensive on larger sites with
    // 1000s of nodes, we'll skip doing this on subsequent sources.
    if (isFirstSource) {
      getNodes().forEach(node => {
        if (node.internal.owner !== `gatsby-source-contentful`) {
          return
        }
        touchNode(node)
        const assetNode = node as IContentfulAsset
        if (!assetNode.fields.localFile) {
          return
        }
        const localFileNode = getNode(assetNode.fields.localFile)
        if (localFileNode) {
          touchNode(localFileNode)
        }
      })
      isFirstSource = false
    }

    if (
      !online &&
      process.env.GATSBY_CONTENTFUL_OFFLINE === `true` &&
      process.env.NODE_ENV !== `production`
    ) {
      return
    }

    const pluginConfig = createPluginConfig(pluginOptions as IPluginOptions)
    const sourceId = `${pluginConfig.get(`spaceId`)}-${pluginConfig.get(
      `environment`
    )}`

    const fetchActivity = reporter.activityTimer(`Contentful: Fetch data`, {
      parentSpan,
    })

    // If the user knows they are offline, serve them cached result
    // For prod builds though always fail if we can't get the latest data
    if (
      !online &&
      process.env.GATSBY_CONTENTFUL_OFFLINE === `true` &&
      process.env.NODE_ENV !== `production`
    ) {
      reporter.info(`Using Contentful Offline cache ⚠️`)
      reporter.info(
        `Cache may be invalidated if you edit package.json, gatsby-node.js or gatsby-config.js files`
      )

      return
    }
    if (process.env.GATSBY_CONTENTFUL_OFFLINE) {
      reporter.info(
        `Note: \`GATSBY_CONTENTFUL_OFFLINE\` was set but it either was not \`true\`, we _are_ online, or we are in production mode, so the flag is ignored.`
      )
    }

    fetchActivity.start()

    const CACHE_SYNC_TOKEN = `contentful-sync-token-${sourceId}`
    const CACHE_CONTENT_TYPES = `contentful-content-types-${sourceId}`
    const CACHE_FOREIGN_REFERENCE_MAP_STATE = `contentful-foreign-reference-map-state-${sourceId}`

    /*
     * Subsequent calls of Contentfuls sync API return only changed data.
     *
     * In some cases, especially when using rich-text fields, there can be data
     * missing from referenced entries. This breaks the reference matching.
     *
     * To workround this, we cache the initial sync data and merge it
     * with all data from subsequent syncs. Afterwards the references get
     * resolved via the Contentful JS SDK.
     */
    const syncToken =
      store.getState().status.plugins?.[`gatsby-source-contentful`]?.[
        CACHE_SYNC_TOKEN
      ]

    // Actual fetch of data from Contentful
    const {
      currentSyncData,
      tagItems,
      defaultLocale,
      locales: allLocales,
      space,
    } = await fetchContent({ syncToken, pluginConfig, reporter })

    const contentTypeItems = (await cache.get(
      CACHE_CONTENT_TYPES
    )) as Array<ContentType>

    const locales = allLocales.filter(pluginConfig.get(`localeFilter`))
    reporter.verbose(
      `Default locale: ${defaultLocale}. All locales: ${allLocales
        .map(({ code }) => code)
        .join(`, `)}`
    )
    if (allLocales.length !== locales.length) {
      reporter.verbose(
        `After plugin.options.localeFilter: ${locales
          .map(({ code }) => code)
          .join(`, `)}`
      )
    }
    if (locales.length === 0) {
      reporter.panic({
        id: CODES.LocalesMissing,
        context: {
          sourceMessage: `Please check if your localeFilter is configured properly. Locales '${allLocales
            .map(item => item.code)
            .join(`,`)}' were found but were filtered down to none.`,
        },
      })
    }

    // Update syncToken
    const nextSyncToken = currentSyncData.nextSyncToken

    actions.setPluginStatus({
      [CACHE_SYNC_TOKEN]: nextSyncToken,
    })

    fetchActivity.end()

    // Process data fetch results and turn them into GraphQL entities
    const processingActivity = reporter.activityTimer(
      `Contentful: Process data`,
      {
        parentSpan,
      }
    )
    processingActivity.start()

    // Array of all existing Contentful entry and asset nodes
    const existingNodes = getNodes().filter(
      n =>
        (n.internal.owner === `gatsby-source-contentful` &&
          n.internal.type.indexOf(`ContentfulContentType`) === 0) ||
        n.internal.type === `ContentfulAsset`
    ) as Array<IContentfulEntry>

    // Report existing, new and updated nodes
    const nodeCounts = {
      newEntry: 0,
      newAsset: 0,
      updatedEntry: 0,
      updatedAsset: 0,
      existingEntry: 0,
      existingAsset: 0,
      deletedEntry: currentSyncData.deletedEntries.length,
      deletedAsset: currentSyncData.deletedAssets.length,
    }

    existingNodes.forEach(node => nodeCounts[`existing${node.sys.type}`]++)
    currentSyncData.entries.forEach(entry =>
      entry.sys.revision === 1
        ? nodeCounts.newEntry++
        : nodeCounts.updatedEntry++
    )
    currentSyncData.assets.forEach(asset =>
      asset.sys.revision === 1
        ? nodeCounts.newAsset++
        : nodeCounts.updatedAsset++
    )

    reporter.info(`Contentful: ${nodeCounts.newEntry} new entries`)
    reporter.info(`Contentful: ${nodeCounts.updatedEntry} updated entries`)
    reporter.info(`Contentful: ${nodeCounts.deletedEntry} deleted entries`)
    reporter.info(
      `Contentful: ${nodeCounts.existingEntry / locales.length} cached entries`
    )
    reporter.info(`Contentful: ${nodeCounts.newAsset} new assets`)
    reporter.info(`Contentful: ${nodeCounts.updatedAsset} updated assets`)
    reporter.info(
      `Contentful: ${nodeCounts.existingAsset / locales.length} cached assets`
    )
    reporter.info(`Contentful: ${nodeCounts.deletedAsset} deleted assets`)

    reporter.verbose(`Building Contentful reference map`)

    const entryList = buildEntryList({
      currentSyncData,
      contentTypeItems,
    })
    const { assets } = currentSyncData

    // Create map of resolvable ids so we can check links against them while creating
    // links.
    const resolvable = buildResolvableSet({
      existingNodes,
      entryList,
      assets,
    })

    // Build foreign reference map before starting to insert any nodes
    const previousForeignReferenceMapState = await cache.get(
      CACHE_FOREIGN_REFERENCE_MAP_STATE
    )
    const useNameForId = pluginConfig.get(`useNameForId`)

    const foreignReferenceMapState = buildForeignReferenceMap({
      contentTypeItems,
      entryList,
      resolvable,
      defaultLocale,
      space,
      useNameForId,
      previousForeignReferenceMapState,
      deletedEntries: currentSyncData?.deletedEntries,
    })
    await cache.set(CACHE_FOREIGN_REFERENCE_MAP_STATE, foreignReferenceMapState)
    const foreignReferenceMap = foreignReferenceMapState.backLinks

    reporter.verbose(`Resolving Contentful references`)

    const newOrUpdatedEntries = new Set()
    entryList.forEach(entries => {
      entries.forEach(entry => {
        newOrUpdatedEntries.add(createRefId(entry))
      })
    })

    const { deletedEntries, deletedAssets } = currentSyncData
    const deletedEntryGatsbyReferenceIds = new Set()

    function deleteContentfulNode(node): void {
      const normalizedType = node.sys.type.startsWith(`Deleted`)
        ? node.sys.type.substring(`Deleted`.length)
        : node.sys.type

      const localizedNodes = locales.map(locale => {
        const nodeId = createNodeId(
          makeId({
            spaceId: space.sys.id,
            id: node.sys.id,
            type: normalizedType,
            currentLocale: locale.code,
            defaultLocale,
          })
        )
        // Gather deleted node ids to remove them later on
        deletedEntryGatsbyReferenceIds.add(nodeId)
        return getNode(nodeId)
      })

      localizedNodes.forEach(node => {
        // TODO: nodes of text fields should be deleted as well
        if (node) {
          deleteNode(node)
        }
      })
    }

    if (deletedEntries.length || deletedAssets.length) {
      const deletionActivity = reporter.activityTimer(
        `Contentful: Deleting nodes and assets`,
        {
          parentSpan,
        }
      )
      deletionActivity.start()
      deletedEntries.forEach(deleteContentfulNode)
      deletedAssets.forEach(deleteContentfulNode)
      deletionActivity.end()
    }

    // Create map of reference fields to properly delete stale references
    const referenceFieldMap = new Map()
    for (const contentTypeItem of contentTypeItems) {
      const referenceFields = contentTypeItem.fields.filter(field => {
        if (field.disabled || field.omitted) {
          return false
        }

        return (
          field.type === `Link` ||
          (field.type === `Array` && field.items?.type === `Link`)
        )
      })
      if (referenceFields.length) {
        referenceFieldMap.set(
          contentTypeItem.name,
          referenceFields.map(field => field.id)
        )
      }
    }

    // TODO: mirror structure of Contentful GraphQL API, as it prevents field name overlaps
    const reverseReferenceFields = contentTypeItems.map(contentTypeItem =>
      useNameForId
        ? contentTypeItem.name.toLowerCase()
        : contentTypeItem.sys.id.toLowerCase()
    )

    // Update existing entry nodes that weren't updated but that need reverse links added or removed.
    const existingNodesThatNeedReverseLinksUpdateInDatastore = new Set()
    existingNodes
      .filter(
        n =>
          n.sys.type === `Entry` &&
          !newOrUpdatedEntries.has(createRefId(n)) &&
          !deletedEntryGatsbyReferenceIds.has(n.id)
      )
      .forEach(n => {
        const refId = createRefId(n)
        if (n.sys.id && foreignReferenceMap[refId]) {
          foreignReferenceMap[refId].forEach(foreignReference => {
            const { name, id, type, spaceId } = foreignReference

            const nodeId = createNodeId(
              makeId({
                spaceId,
                id,
                type,
                currentLocale: n.sys.locale,
                defaultLocale,
              })
            )

            // Create new reference field when none exists
            if (!n[name]) {
              existingNodesThatNeedReverseLinksUpdateInDatastore.add(n)
              n[name] = [nodeId]
              return
            }

            // Add non existing references to reference field
            const field = n[name]
            if (field && Array.isArray(field) && !field.includes(nodeId)) {
              existingNodesThatNeedReverseLinksUpdateInDatastore.add(n)
              field.push(nodeId)
            }
          })
        }

        // Remove references to deleted nodes
        if (
          n.sys.id &&
          deletedEntryGatsbyReferenceIds.size &&
          referenceFieldMap.has(n.sys.contentType)
        ) {
          const referenceFields = [
            ...referenceFieldMap.get(n.sys.contentType),
            ...reverseReferenceFields,
          ]

          referenceFields.forEach(name => {
            const fieldValue = n[name]
            if (Array.isArray(fieldValue)) {
              n[name] = fieldValue.filter(referenceId => {
                const shouldRemove =
                  deletedEntryGatsbyReferenceIds.has(referenceId)
                if (shouldRemove) {
                  existingNodesThatNeedReverseLinksUpdateInDatastore.add(n)
                }
                return !shouldRemove
              })
            } else {
              if (deletedEntryGatsbyReferenceIds.has(fieldValue)) {
                existingNodesThatNeedReverseLinksUpdateInDatastore.add(n)
                n[name] = null
              }
            }
          })
        }
      })

    // We need to call `createNode` on nodes we modified reverse links on,
    // otherwise changes won't actually persist
    if (existingNodesThatNeedReverseLinksUpdateInDatastore.size) {
      for (const node of existingNodesThatNeedReverseLinksUpdateInDatastore) {
        function addChildrenToList(
          node,
          nodeList: Array<Node> = [node]
        ): Array<Node> {
          for (const childNodeId of node?.children ?? []) {
            const childNode = getNode(childNodeId)
            if (
              childNode &&
              childNode.internal.owner === `gatsby-source-contentful`
            ) {
              nodeList.push(childNode)
              addChildrenToList(childNode)
            }
          }
          return nodeList
        }

        const nodeAndDescendants = addChildrenToList(node)
        for (const nodeToUpdateOriginal of nodeAndDescendants) {
          // We should not mutate original node as Gatsby will still
          // compare against what's in in-memory weak cache, so we
          // clone original node to ensure reference identity is not possible
          const nodeToUpdate = _.cloneDeep(nodeToUpdateOriginal)
          // We need to remove properties from existing fields
          // that are reserved and managed by Gatsby (`.internal.owner`, `.fields`).
          // Gatsby automatically will set `.owner` it back
          delete nodeToUpdate.internal.owner
          // `.fields` need to be created with `createNodeField` action, we can't just re-add them.
          // Other plugins (or site itself) will have opportunity to re-generate them in `onCreateNode` lifecycle.
          // Contentful content nodes are not using `createNodeField` so it's safe to delete them.
          // (Asset nodes DO use `createNodeField` for `localFile` and if we were updating those, then
          // we would also need to restore that field ourselves after re-creating a node)
          delete nodeToUpdate.fields // plugin adds node field on asset nodes which don't have reverse links

          // We add or modify counter postfix to contentDigest
          // to make sure Gatsby treat this as data update
          let counter
          const [initialContentDigest, counterStr] =
            nodeToUpdate.internal.contentDigest.split(
              CONTENT_DIGEST_COUNTER_SEPARATOR
            )

          if (counterStr) {
            counter = parseInt(counterStr, 10)
          }

          if (!counter || isNaN(counter)) {
            counter = 1
          } else {
            counter++
          }

          nodeToUpdate.internal.contentDigest = `${initialContentDigest}${CONTENT_DIGEST_COUNTER_SEPARATOR}${counter}`
          createNode(nodeToUpdate)
        }
      }
    }

    const creationActivity = reporter.activityTimer(
      `Contentful: Create nodes`,
      {
        parentSpan,
      }
    )
    creationActivity.start()

    // Create nodes for each entry of each content type
    for (let i = 0; i < contentTypeItems.length; i++) {
      const contentTypeItem = contentTypeItems[i]

      if (entryList[i].length) {
        reporter.info(
          `Creating ${entryList[i].length} Contentful ${
            useNameForId ? contentTypeItem.name : contentTypeItem.sys.id
          } nodes`
        )
      }

      // A contentType can hold lots of entries which create nodes
      // We wait until all nodes are created and processed until we handle the next one
      // TODO add batching in gatsby-core
      await Promise.all(
        createNodesForContentType({
          contentTypeItem,
          entries: entryList[i],
          resolvable,
          foreignReferenceMap,
          defaultLocale,
          locales,
          space,
          useNameForId,
          pluginConfig,
          ...actions,
          ...args,
        })
      )
    }

    if (assets.length) {
      reporter.info(`Creating ${assets.length} Contentful asset nodes`)
    }

    const assetNodes: Array<IContentfulAsset> = []
    for (let i = 0; i < assets.length; i++) {
      // We wait for each asset to be process until handling the next one.
      assetNodes.push(
        ...(await Promise.all(
          createAssetNodes({
            assetItem: assets[i],
            createNode,
            createNodeId,
            defaultLocale,
            locales,
            space,
          })
        ))
      )
    }

    // Create tags entities
    if (tagItems.length) {
      reporter.info(`Creating ${tagItems.length} Contentful Tag nodes`)

      for (const tag of tagItems) {
        await createNode({
          id: createNodeId(`ContentfulTag__${space.sys.id}__${tag.sys.id}`),
          name: tag.name,
          // TODO: update the structure of tags
          contentful_id: tag.sys.id,
          internal: {
            type: `ContentfulTag`,
            contentDigest: tag.sys.updatedAt,
          },
        })
      }
    }

    creationActivity.end()

    // Download asset files to local fs
    if (pluginConfig.get(`downloadLocal`)) {
      const assetDownloadWorkers = pluginConfig.get(`assetDownloadWorkers`)
      await downloadContentfulAssets(
        args,
        actions,
        assetNodes,
        assetDownloadWorkers
      )
    }
  }
