const _ = require(`lodash`)
const { getNamedType } = require(`graphql`)
const deepmerge = require(`deepmerge`)

const lokiRunQuery = require(`./loki/nodes-query`)
const siftRunQuery = require(`../redux/run-sift`)

const pathToObject = path => {
  if (path && typeof path === `string`) {
    return path.split(`.`).reduceRight((acc, key) => {
      return { [key]: acc }
    }, true)
  }
  return {}
}

const withSortFields = (fields, sortFields = []) =>
  sortFields.reduce((acc, field) => {
    const sortField = pathToObject(field.replace(/___/g, `.`))
    return deepmerge(acc, sortField)
  }, fields)

// FIXME: This is duplicate code (`extractFieldsToSift`)
const dropQueryOperators = filter =>
  Object.keys(filter).reduce((acc, key) => {
    let value = filter[key]
    let k = Object.keys(value)[0]
    let v = value[k]
    if (_.isPlainObject(value) && _.isPlainObject(v)) {
      acc[key] =
        k === `elemMatch` ? dropQueryOperators(v) : dropQueryOperators(value)
    } else {
      acc[key] = true
    }
    return acc
  }, {})

const hasFieldResolvers = (type, filterFields) => {
  const fields = type.getFields()
  return Object.keys(filterFields).some(fieldName => {
    const filterValue = filterFields[fieldName]
    const field = fields[fieldName]
    return (
      Boolean(field.resolve) ||
      (filterValue !== true &&
        hasFieldResolvers(getNamedType(field.type), filterValue))
    )
  })
}

function chooseQueryEngine(args) {
  const { backend } = require(`./nodes`)

  const { queryArgs, gqlType } = args
  // FIXME: Need to get group and distinct `field` arg from projection
  const { filter, sort } = queryArgs
  const filterFields = filter ? dropQueryOperators(filter) : {}
  const fields = sort ? withSortFields(filterFields, sort.fields) : filterFields

  // TODO: Where to handle abstract types? This is related to refactoring
  // all of the query/resolving nodes stuff
  // TODO: `hasFieldResolvers` is also true for Date fields
  if (backend === `loki` && !hasFieldResolvers(gqlType, fields)) {
    return lokiRunQuery
  } else {
    return siftRunQuery
  }
}

/**
 * Runs the query over all nodes of type. It must first select the
 * appropriate query engine. Sift, or Loki. Sift is used by default,
 * or if the query includes fields with custom resolver functions,
 * those that need to be resolved before being queried.
 * These could be either plugin fields, i.e those declared by plugins during
 * the `setFieldsOnGraphQLNodeType` API, or they could be linked fields.
 * See `../redux/run-sift.js` for more.
 *
 * If the query does *not* include fields with custom resolver functions,
 * and environment variable `GATSBY_DB_NODES` = `loki` then we can perform
 * a much faster pure data query using loki. See `loki/nodes-query.js` for
 * more.
 *
 * @param {Object} args. Object with:
 *
 * {Object} gqlType: built during `./build-node-types.js`
 *
 * {Object} queryArgs: The raw graphql query as a js object. E.g `{
 * filter: { fields { slug: { eq: "/somepath" } } } }`
 *
 * {Object} context: The context from the QueryJob
 *
 * {boolean} firstOnly: Whether to return the first found match, or
 * all matching result.
 *
 * @returns {promise} A promise that will eventually be resolved with
 * a collection of matching objects (even if `firstOnly` is true, in
 * which case it will be a collection of length 1 or zero)
 */
function run(args) {
  const queryFunction = chooseQueryEngine(args)

  return queryFunction(args)
}

module.exports.run = run
