const contentful = require(`contentful`)
const crypto = require(`crypto`)
const _ = require(`lodash`)

const typePrefix = `contentful__`
const conflictFieldPrefix = `contentful`
const makeTypeName = type => `${typePrefix}${type}`
// restrictedNodeFields from here https://www.gatsbyjs.org/docs/node-interface/
const restrictedNodeFields = [`id`, `children`, `parent`, `fields`, `internal`]

exports.sourceNodes = async (
  { boundActionCreators, getNode, hasNodeChanged, store },
  { spaceId, accessToken }
) => {
  const {
    createNode,
    updateSourcePluginStatus,
    deleteNode,
  } = boundActionCreators
  updateSourcePluginStatus({
    plugin: `gatsby-source-contentful`,
    status: {
      ...store.getState().status[`gatsby-source-contentful`],
      ready: false,
    },
  })

  // Delete existing Contentful nodes since we are doing a bulk re-add
  // Once we are sync'ing Contentful nodes to get the diff, this would
  // need to be changed.
  _.values(store.getState().nodes)
    .filter(n => n.internal.type.indexOf(typePrefix) === 0)
    .forEach(n => deleteNode(n.id))

  // Fetch articles.
  console.time(`fetch Contentful data`)
  console.log(`Starting to fetch data from Contentful`)

  const client = contentful.createClient({
    space: spaceId,
    accessToken,
  })

  let contentTypes
  try {
    contentTypes = await client.getContentTypes()
  } catch (e) {
    console.log(`error fetching content types`, e)
  }
  console.log(`contentTypes fetched`, contentTypes.items.length)

  const entryList = await Promise.all(contentTypes.items.map(async (contentType) => {
    const contentTypeId = contentType.sys.id
    let entries
    try {
      entries = await client.getEntries({
        content_type: contentTypeId,
      })
    } catch (e) {
      console.log(`error fetching entries`, e)
    }
    console.log(`entries fetched for content type ${contentType.name} (${contentTypeId})`, entries.items.length)
    return entries
  }))

  let assets
  try {
    assets = await client.getAssets()
  } catch (e) {
    console.log(`error fetching assets`, e)
  }
  console.log(`assets fetched`, assets.items.length)

  updateSourcePluginStatus({
    plugin: `gatsby-source-contentful`,
    status: {
      ...store.getState().status[`gatsby-source-contentful`],
      lastFetched: new Date().toJSON(),
    },
  })

  console.timeEnd(`fetch Contentful data`)

  const contentTypeItems = contentTypes.items
  contentTypeItems.forEach((contentTypeItem, i) => {
    const contentTypeItemId = contentTypeItem.sys.id

    // Warn about any field conflicts
    const conflictFields = []
    contentTypeItem.fields.forEach(contentTypeItemField => {
      const fieldName = contentTypeItemField.id
      if (restrictedNodeFields.includes(fieldName)) {
        console.log(`Restricted field found for ContentType ${contentTypeItemId} and field ${fieldName}. Prefixing with ${conflictFieldPrefix}.`)
        conflictFields.push(fieldName)
      }
    })

    // First create nodes for each of the entries of that content type
    const entryNodes = entryList[i].items.map((entryItem) => {

      // Prefix any conflicting fields
      // https://github.com/gatsbyjs/gatsby/pull/1084#pullrequestreview-41662888
      const entryItemFields = Object.assign({}, entryItem.fields)
      conflictFields.forEach(conflictField => {
        entryItemFields[`${conflictFieldPrefix}${conflictField}`] = entryItemFields[conflictField]
        delete entryItemFields[conflictField]
      })

      const entryNode = {
        id: entryItem.sys.id,
        parent: contentTypeItemId,
        children: [],
        name: entryItem.name,
        ...entryItemFields,
        internal: {
          type: `${makeTypeName(contentTypeItemId)}`,
          content: JSON.stringify(entryItem),
          mediaType: `application/json`,
        },
      }

      // Get content digest of node.
      const contentDigest = crypto
        .createHash(`md5`)
        .update(JSON.stringify(entryNode))
        .digest(`hex`)

      entryNode.internal.contentDigest = contentDigest

      return entryNode
    })
    // Create a node for each content type
    const contentTypeItemStr = JSON.stringify(contentTypeItem)

    const contentTypeNode = {
      id: contentTypeItemId,
      parent: `__SOURCE__`,
      children: [],
      name: contentTypeItem.name,
      displayField: contentTypeItem.displayField,
      description: contentTypeItem.description,
      internal: {
        type: `${makeTypeName(`ContentType`)}`,
        content: contentTypeItemStr,
        mediaType: `application/json`,
      },
    }

    // Get content digest of node.
    const contentDigest = crypto
      .createHash(`md5`)
      .update(JSON.stringify(contentTypeNode))
      .digest(`hex`)

    contentTypeNode.internal.contentDigest = contentDigest

    createNode(contentTypeNode)
    entryNodes.forEach(entryNode => { createNode(entryNode) })
  })

  assets.items.forEach(assetItem => {
    // Create a node for each asset
    const assetItemStr = JSON.stringify(assetItem)

    const assetNode = {
      id: assetItem.sys.id,
      parent: `__SOURCE__`,
      children: [],
      ...assetItem.fields,
      internal: {
        type: `${makeTypeName(`Asset`)}`,
        content: assetItemStr,
        mediaType: `application/json`,
      },
    }

    // Get content digest of node.
    const contentDigest = crypto
      .createHash(`md5`)
      .update(JSON.stringify(assetNode))
      .digest(`hex`)

    assetNode.internal.contentDigest = contentDigest

    createNode(assetNode)
  })

  updateSourcePluginStatus({
    plugin: `gatsby-source-contentful`,
    status: {
      ...store.getState().status[`gatsby-source-contentful`],
      ready: true,
    },
  })

  return
}
