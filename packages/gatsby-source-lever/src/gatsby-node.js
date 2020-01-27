const fetch = require(`./fetch`)
const normalize = require(`./normalize`)

const typePrefix = `lever__`

exports.createSchemaCustomization = async ({ actions }) => {
  const typeDefs = `
    type lever implements Node @dontInfer {
      additional: String
      additionalPlain: String
      applyUrl: String
      createdAt: Date @dateformat
      description: String
      descriptionPlain: String
      hostedUrl: String
      lever_id: String
      text: String
      categories: leverCategories
      lists: [leverList]
    }

    type leverCategories {
      commitment: String
      level: String
      location:String
      team: String
    }

    type leverList {
      content: String
      text: String
    }
  `
  actions.createTypes(typeDefs)
}

exports.sourceNodes = async (
  { actions, getNode, store, cache, createNodeId, createContentDigest },
  { site, verboseOutput }
) => {
  const { createNode } = actions

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

  // creates Gatsby IDs for each entity
  entities = normalize.createGatsbyIds(createNodeId, entities)

  // creates nodes for each entry
  normalize.createNodesFromEntities({
    entities,
    createNode,
    createContentDigest,
  })

  return
}
