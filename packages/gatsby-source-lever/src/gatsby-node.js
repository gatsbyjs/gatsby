const fetch = require(`./fetch`)
const normalize = require(`./normalize`)

const typePrefix = `lever__`

exports.sourceNodes = async (
  { boundActionCreators, getNode, store, cache },
  { site, verboseOutput }
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

  // creates Gatsby IDs for each entity
  entities = normalize.createGatsbyIds(entities)

  // creates nodes for each entry
  normalize.createNodesFromEntities({ entities, createNode })

  return
}
