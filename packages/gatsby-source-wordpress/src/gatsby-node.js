const fetch = require(`./fetch`)
const normalize = require(`./normalize`)
const Normalizer = require(`./normalizer`)

const typePrefix = `wordpress__`
const refactoredEntityTypes = {
  post: `${typePrefix}POST`,
  page: `${typePrefix}PAGE`,
  tag: `${typePrefix}TAG`,
  category: `${typePrefix}CATEGORY`,
}

/* If true, will output many console logs. */
let _verbose
let _siteURL
let _useACF = true
let _hostingWPCOM
let _auth
let _perPage

exports.sourceNodes = async (
  { boundActionCreators, getNode, store, cache, createNodeId },
  {
    baseUrl,
    protocol,
    hostingWPCOM,
    useACF = true,
    auth = {},
    verboseOutput,
    perPage = 100,
    searchAndReplaceContentUrls = {},
    plugins = [],
  }
) => {
  const { createNode } = boundActionCreators
  _verbose = verboseOutput
  _siteURL = `${protocol}://${baseUrl}`
  _useACF = useACF
  _hostingWPCOM = hostingWPCOM
  _auth = auth
  _perPage = perPage

  let entities = await fetch({
    baseUrl,
    _verbose,
    _siteURL,
    _useACF,
    _hostingWPCOM,
    _auth,
    _perPage,
    typePrefix,
    refactoredEntityTypes,
  })

  var normalizer = new Normalizer(entities, {
    createNodeId,
    store,
    cache,
    createNode,
    _auth,
    searchAndReplaceContentUrls,
  })

  normalizer
    .set(normalize.normalizeACF, 10)
    .set(normalize.normalizeEntities, 20)
    .set(normalize.standardizeKeys, 30)
    .set(normalize.standardizeDates, 40)
    .set(normalize.liftRenderedField, 50)
    .set(normalize.excludeUnknownEntities, 60)
    .set(normalize.createGatsbyIds, 70)
    .set(normalize.mapAuthorsToUsers, 80)
    .set(normalize.mapPostsToTagsCategories, 90)
    .set(normalize.mapTagsCategoriesToTaxonomies, 100)
    .set(normalize.mapEntitiesToMedia, 110)
    .set(normalize.downloadMediaFiles, 120)
    .set(normalize.searchReplaceContentUrls, 130)

  for (let i = 0; i < plugins.length; i++) {
      const requiredPlugin = require(plugins[i].resolve)
      normalizer = requiredPlugin.normalize(normalizer)
  }

  entities = await normalizer.normalize()

  // creates nodes for each entry
  normalize.createNodesFromEntities({ entities, createNode })

  return
}
