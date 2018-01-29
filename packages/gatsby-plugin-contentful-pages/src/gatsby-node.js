const { resolve } = require(`path`)

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
  const component = resolve(resolveOption(`component`, cValue, fields))
  const path = resolveOption(`path`, pValue, fields)

  const pageObject = {
    component,
    context: { id },
    path,
  }
  return pageObject
}

const getContentTypeEntries = async (
  gqlRunner,
  { name, subQuery, map = d => d } = {}
) => {
  if (!name) {
    throw new TypeError(`MISSING_CONTENT_TYPE_NAME`)
  }

  const query = createAllQuery(name, subQuery)
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
  try {
    const pageCollections = await Promise.all(
      contentTypes.map(createContentTypePages(gqlRunner))
    )
    const allPageObjects = Array.prototype.concat(...pageCollections)
    allPageObjects.forEach(page => {
      // Necessary, because create page seems to use `this` and
      // is not bound.
      createPage(page)
    })
    return
  } catch (e) {
    throw e
  }
}

exports.createPages = createPages
