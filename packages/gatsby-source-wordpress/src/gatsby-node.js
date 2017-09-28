const crypto = require(`crypto`)
const querystring = require(`querystring`)
const _ = require(`lodash`)
const stringify = require(`json-stringify-safe`)
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)
const path = require(`path`)

const fetch = require(`./fetch`)
const colorized = require(`./output-color`)
const httpExceptionHandler = require(`./http-exception-handler`)
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
let _getNode
let _useACF
let _hostingWPCOM
let _auth
let _perPage
let _accessToken

exports.sourceNodes = async (
  { boundActionCreators, getNode, store, cache },
  {
    baseUrl,
    protocol,
    hostingWPCOM,
    useACF,
    auth,
    verboseOutput,
    perPage = 100,
  }
) => {
  const { createNode } = boundActionCreators
  _verbose = verboseOutput
  _siteURL = `${protocol}://${baseUrl}`
  _getNode = getNode
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
  entities = normalize.createGatsbyIds(entities)

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
  })

  // creates nodes for each entry
  normalize.createNodesFromEntities({ entities, createNode })

  return
}
