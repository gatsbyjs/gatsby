const _ = require(`lodash`)

const processAPIData = require(`./process-api-data`)
const fetchData = require(`./fetch-data`)

const conflictFieldPrefix = `contentful`

// restrictedNodeFields from here https://www.gatsbyjs.org/docs/node-interface/
const restrictedNodeFields = [`id`, `children`, `parent`, `fields`, `internal`]

exports.setFieldsOnGraphQLNodeType = require(`./extend-node-type`).extendNodeType

exports.sourceNodes = async (
  { boundActionCreators, getNodes, hasNodeChanged, store },
  { spaceId, accessToken }
) => {
  const {
    createNode,
    deleteNodes,
    touchNode,
    setPluginStatus,
  } = boundActionCreators

  // Get sync token if it exists.
  let syncToken
  if (
    store.getState().status.plugins &&
    store.getState().status.plugins[`gatsby-source-contentful`]
  ) {
    syncToken = store.getState().status.plugins[`gatsby-source-contentful`]
      .status.syncToken
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
  })

  const entryList = processAPIData.buildEntryList({
    currentSyncData,
    contentTypeItems,
  })

  // Remove deleted entries & assets.
  // TODO figure out if entries referencing now deleted entries/assets
  // are "updated" so will get the now deleted reference removed.
  deleteNodes(currentSyncData.deletedEntries.map(e => e.sys.id))
  deleteNodes(currentSyncData.deletedAssets.map(e => e.sys.id))

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
  setPluginStatus({
    status: {
      syncToken: nextSyncToken,
    },
  })

  // Create map of resolvable ids so we can check links against them while creating
  // links.
  const resolvable = processAPIData.buildResolvableSet({
    existingNodes,
    entryList,
    assets,
    defaultLocale,
    locales,
  })

  // Build foreign reference map before starting to insert any nodes
  const foreignReferenceMap = processAPIData.buildForeignReferenceMap({
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
    processAPIData.createContentTypeNodes({
      contentTypeItem,
      restrictedNodeFields,
      conflictFieldPrefix,
      entries: entryList[i],
      createNode,
      resolvable,
      foreignReferenceMap,
      defaultLocale,
      locales,
    })
  })

  assets.forEach(assetItem => {
    processAPIData.createAssetNodes({
      assetItem,
      createNode,
      defaultLocale,
      locales,
    })
  })

  return
}
