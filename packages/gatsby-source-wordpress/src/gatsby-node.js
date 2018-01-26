const fetch = require(`./fetch`)
const normalize = require(`./normalize`)

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
  { actions, getNode, store, cache, createNodeId },
  {
    baseUrl,
    protocol,
    hostingWPCOM,
    useACF = true,
    auth = {},
    verboseOutput,
    perPage = 100,
    searchAndReplaceContentUrls = {},
  }
) => {
  const { createNode } = actions
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

  // Normalize data & create nodes

  // Remove ACF key if it's not an object
  entities = normalize.normalizeACF(entities)

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
  entities = normalize.createGatsbyIds(createNodeId, entities)

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
    _auth,
  })

  // Search and replace Content Urls
  entities = normalize.searchReplaceContentUrls({
    entities,
    searchAndReplaceContentUrls,
  })

  // creates nodes for each entry
  normalize.createNodesFromEntities({ entities, createNode })

  return
}
