const crypto = require(`crypto`)
const querystring = require(`querystring`)
const _ = require(`lodash`)
const stringify = require(`json-stringify-safe`)
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)
const path = require(`path`)

const fetch = require(`./fetch`)
const httpExceptionHandler = require(`./http-exception-handler`)
const normalize = require(`./normalize`)

const typePrefix = `lever__`

exports.sourceNodes = async (
  { boundActionCreators, getNode, store, cache },
  {
    site,
    verboseOutput,
  }
) => {
  const { createNode } = boundActionCreators

  let entities = await fetch({
    site,
    verboseOutput,
    typePrefix,
  })

  // Normalize data & create nodes
  //
  // Creates entities from object collections of entities
  entities = normalize.normalizeEntities(entities)

  // Standardizes ids & cleans keys
  entities = normalize.standardizeKeys(entities)

  // Converts to use only GMT dates
  entities = normalize.standardizeDates(entities)

  // Lifts all "rendered" fields to top-level.
  entities = normalize.liftRenderedField(entities)

  // creates Gatsby IDs for each entity
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
