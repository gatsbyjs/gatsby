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
let _cookies
let _perPage
let _concurrentRequests
let _includedRoutes
let _excludedRoutes
let _normalizer
let _normalizers
let _keepMediaSizes

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
    cookies = {},
    verboseOutput,
    perPage = 100,
    searchAndReplaceContentUrls = {},
    concurrentRequests = 10,
    includedRoutes = [`**`],
    excludedRoutes = [],
    normalizer,
    normalizers,
    keepMediaSizes = false,
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
  _cookies = cookies
  _perPage = perPage
  _concurrentRequests = concurrentRequests
  _includedRoutes = includedRoutes
  _excludedRoutes = excludedRoutes
  _keepMediaSizes = keepMediaSizes
  _normalizer = normalizer
  _normalizers = normalizers

  let entities = await fetch({
    baseUrl,
    _verbose,
    _siteURL,
    _useACF,
    _acfOptionPageIds,
    _hostingWPCOM,
    _auth,
    _cookies,
    _perPage,
    _concurrentRequests,
    _includedRoutes,
    _excludedRoutes,
    _keepMediaSizes,
    typePrefix,
    refactoredEntityTypes,
  })

  let wordpressDataNormalizers = [
    // Create fake wordpressId form element who done have any in the database
    {
      name: `generateFakeWordpressId`,
      normalizer: ({ entities }) => normalize.generateFakeWordpressId(entities),
    },
    // Remove ACF key if it's not an object, combine ACF Options
    {
      name: `normalizeACF`,
      normalizer: ({ entities }) => normalize.normalizeACF(entities),
    },
    // Combine ACF Option Data entities into one but split by IDs + options
    {
      name: `combineACF`,
      normalizer: ({ entities }) => normalize.combineACF(entities),
    },
    // Creates entities from object collections of entities
    {
      name: `normalizeEntities`,
      normalizer: ({ entities }) => normalize.normalizeEntities(entities),
    },
    // Standardizes ids & cleans keys
    {
      name: `standardizeKeys`,
      normalizer: ({ entities }) => normalize.standardizeKeys(entities),
    },
    // Converts to use only GMT dates
    {
      name: `standardizeDates`,
      normalizer: ({ entities }) => normalize.standardizeDates(entities),
    },
    // Lifts all "rendered" fields to top-level.
    {
      name: `liftRenderedField`,
      normalizer: ({ entities }) => normalize.liftRenderedField(entities),
    },
    // Exclude entities of unknown shape
    {
      name: `excludeUnknownEntities`,
      normalizer: ({ entities }) => normalize.excludeUnknownEntities(entities),
    },
    // Creates Gatsby IDs for each entity
    {
      name: `createGatsbyIds`,
      normalizer: ({ creteNodeId, entities, _siteURL }) =>
        normalize.createGatsbyIds(createNodeId, entities, _siteURL),
    },
    // Creates links between authors and user entities
    {
      name: `mapAuthorsToUsers`,
      normalizer: ({ entities }) => normalize.mapAuthorsToUsers(entities),
    },
    // Creates links between posts and tags/categories.
    {
      name: `mapPostsToTagsCategories`,
      normalizer: ({ entities }) =>
        normalize.mapPostsToTagsCategories(entities),
    },
    // Creates links between tags/categories and taxonomies.
    {
      name: `mapTagsCategoriesToTaxonomies`,
      normalizer: ({ entities }) =>
        normalize.mapTagsCategoriesToTaxonomies(entities),
    },
    // Normalize menu items
    {
      name: `normalizeMenuItems`,
      normalizer: ({ entities }) => normalize.normalizeMenuItems(entities),
    },
    // Creates links from entities to media nodes
    {
      name: `mapEntitiesToMedia`,
      normalizer: ({ entities }) => normalize.mapEntitiesToMedia(entities),
    },
    // Downloads media files and removes "sizes" data as useless in Gatsby context.
    {
      name: `downloadMediaFiles`,
      normalizer: async ({
        entities,
        store,
        cache,
        createNode,
        createNodeId,
        touchNode,
        getNode,
        auth,
        reporter,
        keepMediaSizes,
      }) =>
        await normalize.downloadMediaFiles({
          entities,
          store,
          cache,
          createNode,
          createNodeId,
          touchNode,
          getNode,
          _auth: auth,
          reporter,
          keepMediaSizes,
        }),
    },
    // Creates links between elements and parent element.
    {
      name: `mapElementsToParent`,
      normalizer: ({ entities }) => normalize.mapElementsToParent(entities),
    },
    // Search and replace Content Urls
    {
      name: `searchReplaceContentUrls`,
      normalizer: ({ entities, searchAndReplaceContentUrls }) =>
        normalize.searchReplaceContentUrls({
          entities,
          searchAndReplaceContentUrls,
        }),
    },
    {
      name: `mapPolylangTranslations`,
      normalizer: ({ entities }) => normalize.mapPolylangTranslations(entities),
    },
    {
      name: `createUrlPathsFromLinks`,
      normalizer: ({ entities }) => normalize.createUrlPathsFromLinks(entities),
    },
  ]

  const normalizerHelpers = {
    store,
    cache,
    createNode,
    createNodeId,
    createContentDigest,
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
    keepMediaSizes,
  }

  // apply custom normalizer
  if (typeof _normalizer === `function`) {
    wordpressDataNormalizers.push({
      name: `customNormalizer`,
      normalizer: _normalizer,
    })
  }

  if (typeof _normalizers === `function`) {
    wordpressDataNormalizers = _normalizers([...wordpressDataNormalizers])
  }

  // creates nodes for each entry
  wordpressDataNormalizers.push({
    name: `createNodesFromEntities`,
    normalizer: ({ entities, createNode, createContentDigest }) =>
      normalize.createNodesFromEntities({
        entities,
        createNode,
        createContentDigest,
      }),
  })

  // Normalize data & create nodes
  for (const { normalizer } of wordpressDataNormalizers) {
    entities = await normalizer({
      entities,
      ...normalizerHelpers,
    })
  }

  return
}
