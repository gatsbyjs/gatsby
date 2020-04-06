const path = require(`path`)
const isOnline = require(`is-online`)
const fs = require(`fs-extra`)

const normalize = require(`./normalize`)
const fetchData = require(`./fetch`)
const { createPluginConfig, validateOptions } = require(`./plugin-options`)
const { downloadContentfulAssets } = require(`./download-contentful-assets`)
const stringify = require(`json-stringify-safe`)
const { createContentDigest } = require(`gatsby-core-utils`)

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

exports.onPreBootstrap = validateOptions
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
  {
    actions,
    getNode,
    getNodes,
    createNodeId,
    store,
    cache,
    getCache,
    reporter,
  },
  pluginOptions
) => {
  const { createNode, deleteNode, touchNode, setPluginStatus } = actions

  const online = await isOnline()

  // If the user knows they are offline, serve them cached result
  // For prod builds though always fail if we can't get the latest data
  if (
    !online &&
    process.env.GATSBY_CONTENTFUL_OFFLINE === `true` &&
    process.env.NODE_ENV !== `production`
  ) {
    getNodes().forEach(node => {
      if (node.internal.owner !== `gatsby-source-contentful`) {
        return
      }
      touchNode({ nodeId: node.id })
      if (node.localFile___NODE) {
        // Prevent GraphQL type inference from crashing on this property
        touchNode({ nodeId: node.localFile___NODE })
      }
    })

    reporter.info(`Using Contentful Offline cache ⚠️`)
    reporter.info(
      `Cache may be invalidated if you edit package.json, gatsby-node.js or gatsby-config.js files`
    )

    return
  }

  const pluginConfig = createPluginConfig(pluginOptions)

  const createSyncToken = () =>
    `${pluginConfig.get(`spaceId`)}-${pluginConfig.get(
      `environment`
    )}-${pluginConfig.get(`host`)}`

  // Get sync token if it exists.
  let syncToken
  if (
    !pluginConfig.get(`forceFullSync`) &&
    store.getState()?.status?.plugins &&
    store.getState()?.status?.plugins[`gatsby-source-contentful`] &&
    store.getState()?.status?.plugins[`gatsby-source-contentful`][
      createSyncToken()
    ]
  ) {
    syncToken = store.getState().status.plugins[`gatsby-source-contentful`][
      createSyncToken()
    ]
  }

  const {
    currentSyncData,
    contentTypeItems,
    defaultLocale,
    locales,
    space,
  } = await fetchData({
    syncToken,
    reporter,
    pluginConfig,
  })

  const entryList = normalize.buildEntryList({
    currentSyncData,
    contentTypeItems,
  })

  // Remove deleted entries & assets.
  // TODO figure out if entries referencing now deleted entries/assets
  // are "updated" so will get the now deleted reference removed.

  function deleteContentfulNode(referencesToRemove, node) {
    locales.forEach(locale => {
      const nodeId = createNodeId(
        normalize.makeId({
          spaceId: space.sys.id,
          id: node.sys.id,
          currentLocale: locale.code,
          defaultLocale,
        })
      )
      const gatsbyNode = getNode(nodeId)

      if (!gatsbyNode) {
        return
      }

      Object.keys(gatsbyNode).forEach(field => {
        // we only care about ___NODE as they are links to other ones
        if (!field.endsWith(`___NODE`)) {
          return
        }

        //   // remove foreignReferences to this node
        ;[].concat(gatsbyNode[field]).forEach(value => {
          const fieldKey = `${gatsbyNode.parent.toLowerCase()}___NODE`
          const referencedNode = getNode(value)

          // child -> parent relations are always arrays so we add some extra checks
          if (
            !referencedNode ||
            !Array.isArray(referencedNode[fieldKey]) ||
            !referencedNode[fieldKey].includes(gatsbyNode.id)
          ) {
            return
          }

          const nodeToUpdate = referencesToRemove.get(value) || {}
          nodeToUpdate[fieldKey] = nodeToUpdate[fieldKey] || []
          nodeToUpdate[fieldKey].push(gatsbyNode.id)
          referencesToRemove.set(value, nodeToUpdate)
        })
      })

      // touchNode first, to populate typeOwners & avoid erroring
      touchNode({
        nodeId: gatsbyNode.id,
      })
      deleteNode({
        node: gatsbyNode,
      })
    })
  }

  const referencesToRemove = new Map()
  currentSyncData.deletedEntries.forEach(
    deleteContentfulNode.bind(deleteContentfulNode, referencesToRemove)
  )
  currentSyncData.deletedAssets.forEach(
    deleteContentfulNode.bind(deleteContentfulNode, referencesToRemove)
  )

  // remove all references
  let promises = []
  for await (const [key, value] of referencesToRemove) {
    const node = { ...getNode(key) }
    for (const field in value) {
      node[field] = node[field].filter(nodeId => !value[field].includes(nodeId))
    }

    // gatsby creates the owner
    delete node.internal.owner
    node.internal.contentDigest = createContentDigest(stringify(node))

    promises.push(createNode(node))
  }
  // wait for all create nodes to finish
  await Promise.all(promises)

  const existingNodes = getNodes().filter(
    n => n.internal.owner === `gatsby-source-contentful`
  )

  existingNodes.forEach(n => touchNode({ nodeId: n.id }))

  const assets = currentSyncData.assets

  reporter.info(`Updated entries `, currentSyncData.entries.length)
  reporter.info(`Deleted entries `, currentSyncData.deletedEntries.length)
  reporter.info(`Updated assets `, currentSyncData.assets.length)
  reporter.info(`Deleted assets `, currentSyncData.deletedAssets.length)
  console.timeEnd(`Fetch Contentful data`)

  // Update syncToken
  const nextSyncToken = currentSyncData.nextSyncToken

  // Store our sync state for the next sync.
  const newState = {}
  newState[createSyncToken()] = nextSyncToken
  setPluginStatus(newState)

  const foreignReferenceMap = new Map()
  for (let i = 0; i < contentTypeItems.length; i++) {
    const contentTypeItem = contentTypeItems[i]
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
        foreignReferenceMap,
        defaultLocale,
        locales,
        space,
        useNameForId: pluginConfig.get(`useNameForId`),
        richTextOptions: pluginConfig.get(`richText`),
      })
    )
  }

  // Add referenced values
  promises = []
  for (let [key, references] of foreignReferenceMap) {
    const node = getNode(key)
    const nodeValues = {}
    if (node) {
      for (const field in references) {
        nodeValues[field] = []
        if (node[field]) {
          nodeValues[field] = node[field]
        }
        references[field].forEach(reference => {
          if (getNode(reference)) {
            nodeValues[field].push(reference)
          }
        })
      }

      const newNode = {
        ...node,
        ...nodeValues,
      }

      // gatsby creates the owner
      delete node.internal.owner
      newNode.internal.contentDigest = createContentDigest(stringify(newNode))
      promises.push(createNode(newNode))
    }
  }
  await Promise.all(promises)

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

  if (pluginConfig.get(`downloadLocal`)) {
    await downloadContentfulAssets({
      actions,
      createNodeId,
      store,
      cache,
      getCache,
      getNodes,
      reporter,
    })
  }

  return
}

// Check if there are any ContentfulAsset nodes and if gatsby-image is installed. If so,
// add fragments for ContentfulAsset and gatsby-image. The fragment will cause an error
// if there's not ContentfulAsset nodes and without gatsby-image, the fragment is useless.
exports.onPreExtractQueries = async ({ store, getNodesByType }) => {
  const program = store.getState().program

  const CACHE_DIR = path.resolve(
    `${program.directory}/.cache/contentful/assets/`
  )
  await fs.ensureDir(CACHE_DIR)
}
