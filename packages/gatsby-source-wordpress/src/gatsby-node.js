const fetch = require(`./fetch`)
const normalize = require(`./normalize`)
const normalizeBaseUrl = require(`./normalize-base-url`)

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
let _acfOptionPageIds
let _hostingWPCOM
let _auth
let _perPage
let _concurrentRequests
let _includedRoutes
let _excludedRoutes
let _normalizer

exports.sourceNodes = async (
  {
    actions,
    getNode,
    store,
    cache,
    createNodeId,
    createContentDigest,
    reporter,
  },
  {
    baseUrl,
    protocol,
    hostingWPCOM,
    useACF = true,
    acfOptionPageIds = [],
    auth = {},
    verboseOutput,
    perPage = 100,
    searchAndReplaceContentUrls = {},
    concurrentRequests = 10,
    includedRoutes = [`**`],
    excludedRoutes = [],
    normalizer,
  }
) => {
  const { createNode, touchNode } = actions
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl)

  _verbose = verboseOutput
  _siteURL = `${protocol}://${normalizedBaseUrl}`
  _useACF = useACF
  _acfOptionPageIds = acfOptionPageIds
  _hostingWPCOM = hostingWPCOM
  _auth = auth
  _perPage = perPage
  _concurrentRequests = concurrentRequests
  _includedRoutes = includedRoutes
  _excludedRoutes = excludedRoutes
  _normalizer = normalizer

  let entities = await fetch({
    baseUrl,
    _verbose,
    _siteURL,
    _useACF,
    _acfOptionPageIds,
    _hostingWPCOM,
    _auth,
    _perPage,
    _concurrentRequests,
    _includedRoutes,
    _excludedRoutes,
    typePrefix,
    refactoredEntityTypes,
  })

  // Normalize data & create nodes

  // Create fake wordpressId form element who done have any in the database
  entities = normalize.generateFakeWordpressId(entities)

  // Remove ACF key if it's not an object, combine ACF Options
  entities = normalize.normalizeACF(entities)

  // Combine ACF Option Data entities into one but split by IDs + options
  entities = normalize.combineACF(entities)

  // Creates entities from object collections of entities
  entities = normalize.normalizeEntities(entities)

  // Standardizes ids & cleans keys
  entities = normalize.standardizeKeys(entities)

  // Converts to use only GMT dates
  entities = normalize.standardizeDates(entities)

  // Lifts all "rendered" fields to top-level.
  entities = normalize.liftRenderedField(entities)

  // Exclude entities of unknown shape
  entities = normalize.excludeUnknownEntities(entities)

  // Creates Gatsby IDs for each entity
  entities = normalize.createGatsbyIds(createNodeId, entities, _siteURL)

  // Creates links between authors and user entities
  entities = normalize.mapAuthorsToUsers(entities)

  // Creates links between posts and tags/categories.
  entities = normalize.mapPostsToTagsCategories(entities)

  // Creates links between tags/categories and taxonomies.
  entities = normalize.mapTagsCategoriesToTaxonomies(entities)

  // Creates links from entities to media nodes
  entities = normalize.mapEntitiesToMedia(entities)

  // Downloads media files and removes "sizes" data as useless in Gatsby context.
  entities = await normalize.downloadMediaFiles({
    entities,
    store,
    cache,
    createNode,
    createNodeId,
    touchNode,
    getNode,
    _auth,
    reporter,
  })

  // Creates links between elements and parent element.
  entities = normalize.mapElementsToParent(entities)

  // Search and replace Content Urls
  entities = normalize.searchReplaceContentUrls({
    entities,
    searchAndReplaceContentUrls,
  })

  entities = normalize.mapPolylangTranslations(entities)

  entities = normalize.createUrlPathsFromLinks(entities)

  // apply custom normalizer
  if (typeof _normalizer === `function`) {
    entities = _normalizer({
      entities,
      store,
      cache,
      createNode,
      createNodeId,
      touchNode,
      getNode,
      typePrefix,
      refactoredEntityTypes,
      baseUrl,
      protocol,
      _siteURL,
      hostingWPCOM,
      useACF,
      acfOptionPageIds,
      auth,
      verboseOutput,
      perPage,
      searchAndReplaceContentUrls,
      concurrentRequests,
      excludedRoutes,
    })
  }

  // creates nodes for each entry
  normalize.createNodesFromEntities({
    entities,
    createNode,
    createContentDigest,
  })

  return
}
