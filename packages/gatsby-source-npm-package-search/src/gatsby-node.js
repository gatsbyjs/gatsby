const algoliasearch = require(`algoliasearch`)
const crypto = require(`crypto`)

const client = algoliasearch(`OFCNCOG2CU`, `6fbcaeafced8913bf0e4d39f0b541957`)
var index = client.initIndex(`npm-search`)


const OBSCURED = `3f3f81d91a4ec03e6950d8deb9bf7f3390090909090`.slice(0,32)
const client2 = algoliasearch(`CJN8T7ZVN1`, OBSCURED)
var customIndex = client2.initIndex(`gatsby-custom-npm-search`)

const createContentDigest = obj =>
  crypto
    .createHash(`md5`)
    .update(JSON.stringify(obj))
    .digest(`hex`)

const browse = ({ index, ...params }) => {
  let hits = []
  const browser = index.browseAll(params)

  return new Promise((resolve, reject) => {
    browser.on(`result`, content => (hits = hits.concat(content.hits)))
    browser.on(`end`, () => resolve(hits))
    browser.on(`error`, err => reject(err))
  })
}

const ALGOLIA_BLACKLIST = new Map([[`gatsby-source-aem`, `gatsby-source-aem`]])

// returns all results matching ANY keyword or ANY name, ordered by dowwnloads
const getHits = async (keywords, queryStrings) => {
  const keywordFilter = keywords.map(keyword => `keywords:${keyword}`).join(` OR `)

  // because Algolia API does not allow OR-ing together query strings and filters,
  // we need to construct a query for each query string
  const queries = [{
    index,
    filters: keywordFilter,
    hitsPerPage: 1000,
  }].concat(queryStrings.map(queryString =>
    {
      return {
        index,
        query: queryString,
        hitsPerPage: 1000,
      }
    }
  ))

  //console.log(queries)
  //console.log(queries.map(query => browse(query)))
  const queryHits = await Promise.all(queries.map(query => (browse(query)) ))
  //console.log(queryHits)
  const allPlugins = new Map()
  console.log(queryHits.map(result => result.length))
  queryHits.forEach(result => result.forEach(hit => allPlugins.set(hit.name, hit)))
  const results = Array.from(allPlugins.values()).sort((pluginA, pluginB) => (pluginB.downloadsLast30Days - pluginA.downloadsLast30Days))
  console.log(results.length)
  return results
}

exports.sourceNodes = async (
  { boundActionCreators, createNodeId },
  { keywords, queryStrings = [] }
) => {
  const { createNode } = boundActionCreators

  const hits = await getHits(keywords, queryStrings)
  customIndex.saveObjects(hits.filter(hit => !ALGOLIA_BLACKLIST.has(hit.name)))

  hits.forEach(hit => {
    const parentId = createNodeId(`plugin ${hit.objectID}`)
    const readmeNode = {
      id: createNodeId(`readme ${hit.objectID}`),
      parent: parentId,
      slug: `/packages/en/${hit.objectID}`,
      children: [],
      internal: {
        type: `NPMPackageReadme`,
        mediaType: `text/markdown`,
        content: hit.readme !== undefined ? hit.readme : ``,
      },
    }
    readmeNode.internal.contentDigest = createContentDigest(readmeNode)
    // Remove unneeded data
    delete hit.readme
    delete hit.versions

    const node = {
      ...hit,
      deprecated: `${hit.deprecated}`,
      created: new Date(hit.created),
      modified: new Date(hit.modified),
      id: parentId,
      parent: null,
      children: [],
      slug: `/packages/${hit.objectID}/`,
      readme___NODE: readmeNode.id,
      title: `${hit.objectID}`,
      internal: {
        type: `NPMPackage`,
        content: hit.readme !== undefined ? hit.readme : ``,
      },
    }
    node.internal.contentDigest = createContentDigest(node)
    createNode(readmeNode)
    createNode(node)
  })

  return
}
