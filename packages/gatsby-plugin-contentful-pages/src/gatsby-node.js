const { createAllQuery, getNodesFor } = require(`./util`)

const handleGraphQl = ({ data, errors }) => {
  if (errors) {
    throw new Error(errors)
  }
  return { data }
}

const createRunner = graphql => query => graphql(query).then(handleGraphQl)

const isFunction = val => typeof val === `function`
const isString = val => typeof val === `string`

const resolveOption = (optionName, optionValue, fields) => {
  if (isFunction(optionValue)) {
    return optionValue(fields)
  }
  if (isString(optionValue)) {
    return optionValue
  }

  throw new TypeError(`INVALID_OPTION_TYPE_${optionName}`)
}

const createPageObject = ({ component: cValue, path: pValue }) => fields => {
  const { id } = fields
  const component = resolveOption(`component`, cValue, fields)
  const path = resolveOption(`path`, pValue, fields)
  return {
    component,
    context: { id },
    path,
  }
}

const getContentTypeEntries = async (
  gqlRunner,
  { name, fields = [], map = d => d } = {}
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
