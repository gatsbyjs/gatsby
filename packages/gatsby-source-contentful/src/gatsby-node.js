const _ = require(`lodash`)
const fs = require(`fs-extra`)

const normalize = require(`./normalize`)
const fetchData = require(`./fetch`)

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

exports.setFieldsOnGraphQLNodeType = require(`./extend-node-type`).extendNodeType

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

exports.sourceNodes = async (
  { actions, getNodes, createNodeId, hasNodeChanged, store },
  { spaceId, accessToken, host }
) => {
  const { createNode, deleteNode, touchNode, setPluginStatus } = actions

  host = host || `cdn.contentful.com`
  // Get sync token if it exists.
  let syncToken
  if (
    store.getState().status.plugins &&
    store.getState().status.plugins[`gatsby-source-contentful`] &&
    store.getState().status.plugins[`gatsby-source-contentful`][spaceId]
  ) {
    syncToken = store.getState().status.plugins[`gatsby-source-contentful`][
      spaceId
    ]
  }

  const {
    currentSyncData,
    contentTypeItems,
    defaultLocale,
    locales,
  } = await fetchData({
    syncToken,
    spaceId,
    accessToken,
    host,
  })

  const entryList = normalize.buildEntryList({
    currentSyncData,
    contentTypeItems,
  })

  // Remove deleted entries & assets.
  // TODO figure out if entries referencing now deleted entries/assets
  // are "updated" so will get the now deleted reference removed.
  currentSyncData.deletedEntries.forEach(e => deleteNode(e.sys.id, e.sys))
  currentSyncData.deletedAssets.forEach(e => deleteNode(e.sys.id, e.sys))

  const existingNodes = getNodes().filter(
    n => n.internal.owner === `gatsby-source-contentful`
  )
  existingNodes.forEach(n => touchNode(n.id))

  const assets = currentSyncData.assets

  console.log(`Updated entries `, currentSyncData.entries.length)
  console.log(`Deleted entries `, currentSyncData.deletedEntries.length)
  console.log(`Updated assets `, currentSyncData.assets.length)
  console.log(`Deleted assets `, currentSyncData.deletedAssets.length)
  console.timeEnd(`Fetch Contentful data`)

  // Update syncToken
  const nextSyncToken = currentSyncData.nextSyncToken

  // Store our sync state for the next sync.
  // TODO: we do not store the token if we are using preview, since only initial sync is possible there
  // This might change though
  if (host !== `preview.contentful.com`) {
    const newState = {}
    newState[spaceId] = nextSyncToken
    setPluginStatus(newState)
  }

  // Create map of resolvable ids so we can check links against them while creating
  // links.
  const resolvable = normalize.buildResolvableSet({
    existingNodes,
    entryList,
    assets,
    defaultLocale,
    locales,
  })

  // Build foreign reference map before starting to insert any nodes
  const foreignReferenceMap = normalize.buildForeignReferenceMap({
    contentTypeItems,
    entryList,
    resolvable,
    defaultLocale,
    locales,
  })

  const newOrUpdatedEntries = []
  entryList.forEach(entries => {
    entries.forEach(entry => {
      newOrUpdatedEntries.push(entry.sys.id)
    })
  })

  // Update existing entry nodes that weren't updated but that need reverse
  // links added.
  Object.keys(foreignReferenceMap)
  existingNodes
    .filter(n => _.includes(newOrUpdatedEntries, n.id))
    .forEach(n => {
      if (foreignReferenceMap[n.id]) {
        foreignReferenceMap[n.id].forEach(foreignReference => {
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
        })
      }
    })

  contentTypeItems.forEach((contentTypeItem, i) => {
    normalize.createContentTypeNodes({
      contentTypeItem,
      restrictedNodeFields,
      conflictFieldPrefix,
      entries: entryList[i],
      createNode,
      createNodeId,
      resolvable,
      foreignReferenceMap,
      defaultLocale,
      locales,
    })
  })

  assets.forEach(assetItem => {
    normalize.createAssetNodes({
      assetItem,
      createNode,
      createNodeId,
      defaultLocale,
      locales,
    })
  })

  return
}

// Check if there are any ContentfulAsset nodes and if gatsby-image is installed. If so,
// add fragments for ContentfulAsset and gatsby-image. The fragment will cause an error
// if there's not ContentfulAsset nodes and without gatsby-image, the fragment is useless.
exports.onPreExtractQueries = async ({ store, getNodes }) => {
  const program = store.getState().program

  const nodes = getNodes()

  if (!nodes.some(n => n.internal.type === `ContentfulAsset`)) {
    return
  }

  let gatsbyImageDoesNotExist = true
  try {
    require.resolve(`gatsby-image`)
    gatsbyImageDoesNotExist = false
  } catch (e) {
    // Ignore
  }

  if (gatsbyImageDoesNotExist) {
    return
  }

  // We have both gatsby-image installed as well as ImageSharp nodes so let's
  // add our fragments to .cache/fragments.
  await fs.copy(
    require.resolve(`gatsby-source-contentful/src/fragments.js`),
    `${program.directory}/.cache/fragments/contentful-asset-fragments.js`
  )
}
