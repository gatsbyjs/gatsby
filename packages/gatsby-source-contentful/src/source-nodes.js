// @todo import syntax!
import _ from "lodash"
const path = require(`path`)
const fs = require(`fs-extra`)
import normalize from "./normalize"

const { createPluginConfig } = require(`./plugin-options`)
import { downloadContentfulAssets } from "./download-contentful-assets"

const conflictFieldPrefix = `contentful`

// restrictedNodeFields from here https://www.gatsbyjs.org/docs/node-interface/
const restrictedNodeFields = [
  `children`,
  `contentful_id`,
  `fields`,
  `id`,
  `internal`,
  `parent`,
]

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

export async function sourceNodes(
  {
    actions,
    getNode,
    getNodes,
    getNodesByType,
    createNodeId,
    store,
    cache,
    getCache,
    reporter,
    parentSpan,
  },
  pluginOptions
) {
  const { createNode, touchNode } = actions

  const pluginConfig = createPluginConfig(pluginOptions)
  const sourceId = `${pluginConfig.get(`spaceId`)}-${pluginConfig.get(
    `environment`
  )}`

  const {
    mergedSyncData,
    contentTypeItems,
    locales,
    space,
    defaultLocale,
  } = await cache.get(`contentful-sync-result-${sourceId}`)

  const { assets } = mergedSyncData

  const entryList = normalize.buildEntryList({
    mergedSyncData,
    contentTypeItems,
  })

  const existingNodes = getNodes().filter(
    n => n.internal.owner === `gatsby-source-contentful`
  )
  existingNodes.forEach(n => touchNode(n))

  reporter.verbose(`Building Contentful reference map`)

  // Create map of resolvable ids so we can check links against them while creating
  // links.
  const resolvable = normalize.buildResolvableSet({
    existingNodes,
    entryList,
    assets,
    defaultLocale,
    locales,
    space,
  })

  // Build foreign reference map before starting to insert any nodes
  const foreignReferenceMap = normalize.buildForeignReferenceMap({
    contentTypeItems,
    entryList,
    resolvable,
    defaultLocale,
    locales,
    space,
    useNameForId: pluginConfig.get(`useNameForId`),
  })

  reporter.verbose(`Resolving Contentful references`)

  const newOrUpdatedEntries = new Set()
  entryList.forEach(entries => {
    entries.forEach(entry => {
      newOrUpdatedEntries.add(`${entry.sys.id}___${entry.sys.type}`)
    })
  })

  // Update existing entry nodes that weren't updated but that need reverse
  // links added.
  existingNodes
    .filter(n => newOrUpdatedEntries.has(`${n.id}___${n.sys.type}`))
    .forEach(n => {
      if (foreignReferenceMap[`${n.id}___${n.sys.type}`]) {
        foreignReferenceMap[`${n.id}___${n.sys.type}`].forEach(
          foreignReference => {
            // Add reverse links
            if (n[foreignReference.name]) {
              n[foreignReference.name].push(foreignReference.id)
              // It might already be there so we'll uniquify after pushing.
              n[foreignReference.name] = _.uniq(n[foreignReference.name])
            } else {
              // If is one foreign reference, there can always be many.
              // Best to be safe and put it in an array to start with.
              n[foreignReference.name] = [foreignReference.id]
            }
          }
        )
      }
    })

  const creationActivity = reporter.activityTimer(
    `Contentful: Create nodes (${sourceId})`,
    {
      parentSpan,
    }
  )
  creationActivity.start()

  for (let i = 0; i < contentTypeItems.length; i++) {
    const contentTypeItem = contentTypeItems[i]

    if (entryList[i].length) {
      reporter.info(
        `Creating ${entryList[i].length} Contentful ${
          pluginConfig.get(`useNameForId`)
            ? contentTypeItem.name
            : contentTypeItem.sys.id
        } nodes`
      )
    }

    // A contentType can hold lots of entries which create nodes
    // We wait until all nodes are created and processed until we handle the next one
    // TODO add batching in gatsby-core
    await Promise.all(
      normalize.createNodesForContentType({
        contentTypeItem,
        contentTypeItems,
        restrictedNodeFields,
        conflictFieldPrefix,
        entries: entryList[i],
        createNode,
        createNodeId,
        getNode,
        resolvable,
        foreignReferenceMap,
        defaultLocale,
        locales,
        space,
        useNameForId: pluginConfig.get(`useNameForId`),
      })
    )
  }

  if (assets.length) {
    reporter.info(`Creating ${assets.length} Contentful asset nodes`)
  }

  for (let i = 0; i < assets.length; i++) {
    // We wait for each asset to be process until handling the next one.
    await Promise.all(
      normalize.createAssetNodes({
        assetItem: assets[i],
        createNode,
        createNodeId,
        defaultLocale,
        locales,
        space,
      })
    )
  }

  creationActivity.end()

  // @todo add own activity!

  if (pluginConfig.get(`downloadLocal`)) {
    reporter.info(`Download Contentful asset files`)

    // Ensure cache dir exists for downloadLocal
    const program = store.getState().program

    const CACHE_DIR = path.resolve(
      `${program.directory}/.cache/contentful/assets/`
    )

    await fs.ensureDir(CACHE_DIR)

    await downloadContentfulAssets({
      actions,
      createNodeId,
      store,
      cache,
      getCache,
      getNode,
      getNodesByType,
      reporter,
      assetDownloadWorkers: pluginConfig.get(`assetDownloadWorkers`),
    })
  }
}
