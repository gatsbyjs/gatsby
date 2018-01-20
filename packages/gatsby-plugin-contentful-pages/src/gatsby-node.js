const { createAllQuery, getNodesFor } = require(`./util`)

const handleGraphQl = ({ data, errors }) => {
  if (errors) {
    throw new Error(errors)
  }
  return { data }
}

const createRunner = graphql => query => graphql(query).then(handleGraphQl)

const createPageObject = ({ component, map }) => fields => {
  const { id } = fields
  const path = map(fields)
  return {
    component,
    context: { id },
    path,
  }
}

const getContentTypeEntries = async (
  gqlRunner,
  { name, component, fields = `*`, map = d => d, prefix = `` } = {}
) => {
  if (!name) {
    throw new TypeError(`NO_CONTENT_TYPE`)
  }

  const query = createAllQuery(name, fields)
  const data = await gqlRunner(query)
  return getNodesFor(name)(data).map(map)
}

const createContentTypePages = gqlRunner => async config => {
  const nodes = await getContentTypeEntries(gqlRunner, config)
  return nodes.map(createPageObject(config))
}

const createPages = async (
  { graphql, boundActionCreators },
  { contentTypes }
) => {
  const { createPage } = boundActionCreators
  const gqlRunner = createRunner(graphql)
  const pageCollections = contentTypes.map(createContentTypePages(gqlRunner))
  const allPageObjects = Array.prototype.concat(...pageCollections)
  return allPageObjects.map(createPage, allPageObjects)
}

exports.createPages = createPages
