const contentful = require(`contentful`)
const crypto = require(`crypto`)
const _ = require(`lodash`)

const digest = str => crypto.createHash(`md5`).update(str).digest(`hex`)

const processAPIData = require(`./process-api-data`)

const conflictFieldPrefix = `contentful`
// restrictedNodeFields from here https://www.gatsbyjs.org/docs/node-interface/
const restrictedNodeFields = [`id`, `children`, `parent`, `fields`, `internal`]

exports.setFieldsOnGraphQLNodeType = require(`./extend-node-type`).extendNodeType

exports.sourceNodes = async (
  { boundActionCreators, getNode, hasNodeChanged, store },
  { spaceId, accessToken }
) => {
  const { createNode } = boundActionCreators

  // Fetch articles.
  console.time(`fetch Contentful data`)
  console.log(`Starting to fetch data from Contentful`)

  const client = contentful.createClient({
    space: spaceId,
    accessToken,
  })

  let contentTypes
  try {
    contentTypes = await client.getContentTypes({ limit: 1000 })
  } catch (e) {
    console.log(`error fetching content types`, e)
  }
  console.log(`contentTypes fetched`, contentTypes.items.length)
  if (contentTypes.total > 1000) {
    console.log(
      `HI! gatsby-source-plugin isn't setup yet to paginate over 1000 content types (the max we can fetch in one go). Please help out the project and contribute a PR fixing this.`
    )
  }

  const entryList = await Promise.all(
    contentTypes.items.map(async contentType => {
      const contentTypeId = contentType.sys.id
      let entries
      try {
        entries = await client.getEntries({
          content_type: contentTypeId,
          limit: 1000,
        })
      } catch (e) {
        console.log(`error fetching entries`, e)
      }
      console.log(
        `entries fetched for content type ${contentType.name} (${contentTypeId})`,
        entries.items.length
      )
      if (entries.total > 1000) {
        console.log(
          `HI! gatsby-source-plugin isn't setup yet to paginate over 1000 entries (the max we can fetch in one go). Please help out the project and contribute a PR fixing this.`
        )
      }

      return entries
    })
  )

  let assets
  try {
    assets = await client.getAssets({ limit: 1000 })
  } catch (e) {
    console.log(`error fetching assets`, e)
  }
  if (assets.total > 1000) {
    console.log(
      `HI! gatsby-source-plugin isn't setup yet to paginate over 1000 assets (the max we can fetch in one go). Please help out the project and contribute a PR fixing this.`
    )
  }
  console.log(`assets fetched`, assets.items.length)
  console.timeEnd(`fetch Contentful data`)

  // Create map of not resolvable ids so we can filter them out while creating
  // links.
  const notResolvable = new Map()
  entryList.forEach(ents => {
    if (ents.errors) {
      ents.errors.forEach(error => {
        if (error.sys.id === `notResolvable`) {
          notResolvable.set(error.details.id, error.details)
        }
      })
    }
  })

  const contentTypeItems = contentTypes.items

  // Build foreign reference map before starting to insert any nodes
  const foreignReferenceMap = processAPIData.buildForeignReferenceMap({
    contentTypeItems,
    entryList,
    notResolvable,
  })

  contentTypeItems.forEach((contentTypeItem, i) => {
    processAPIData.createContentTypeNodes({
      contentTypeItem,
      restrictedNodeFields,
      conflictFieldPrefix,
      entries: entryList[i],
      createNode,
      notResolvable,
      foreignReferenceMap,
    })
  })

  assets.items.forEach(assetItem => {
    processAPIData.createAssetNodes({ assetItem, createNode })
  })

  return
}
