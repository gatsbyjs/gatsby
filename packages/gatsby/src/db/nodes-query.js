const _ = require(`lodash`)
const { isAbstractType, getNamedType } = require(`graphql`)

const { getQueryFields } = require(`./common/query`)

const lokiRunQuery = require(`./loki/nodes-query`)
const siftRunQuery = require(`../redux/run-sift`)

const prepareNodes = require(`./prepare-nodes`)

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
 * {Object}: schema: Current GraphQL schema
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
async function run(args) {
  const { backend } = require(`./nodes`)
  const { queryArgs, gqlType } = args
  const { filter, sort, group, distinct } = queryArgs
  const fields = getQueryFields({ filter, sort, group, distinct })

  if (backend === `redux`) {
    const nodeStore = require(`./nodes`)
    // We provide nodes in case of abstract types, because `run-sift` should
    // only need to know about node types in the store.
    let nodes
    const nodeTypeNames = toNodeTypeNames(args.gqlSchema, gqlType)
    if (nodeTypeNames.length > 1) {
      nodes = nodeTypeNames.reduce(
        (acc, typeName) => acc.concat(nodeStore.getNodesByType(typeName)),
        []
      )
    }
    return siftRunQuery({
      ...args,
      nodes,
    })
  } else {
    const fieldsToResolve = determineResolvableFields(
      args.gqlComposer,
      args.gqlSchema,
      args.gqlType,
      fields
    )
    await prepareNodes(
      args.gqlComposer,
      args.gqlSchema,
      gqlType,
      fields,
      fieldsToResolve
    )

    return lokiRunQuery(args, fieldsToResolve)
  }
}

const toNodeTypeNames = (schema, gqlTypeName) => {
  const gqlType =
    typeof gqlTypeName === `string` ? schema.getType(gqlTypeName) : gqlTypeName

  if (!gqlType) return []

  const possibleTypes = isAbstractType(gqlType)
    ? schema.getPossibleTypes(gqlType)
    : [gqlType]

  return possibleTypes
    .filter(type => type.getInterfaces().some(iface => iface.name === `Node`))
    .map(type => type.name)
}

const determineResolvableFields = (schemaComposer, schema, type, fields) => {
  const fieldsToResolve = {}
  const gqlFields = type.getFields()
  Object.keys(fields).forEach(fieldName => {
    const field = fields[fieldName]
    const gqlField = gqlFields[fieldName]
    const gqlFieldType = getNamedType(gqlField.type)
    const typeComposer = schemaComposer.getAnyTC(type.name)
    const needsResolve = typeComposer.getFieldExtension(
      fieldName,
      `needsResolve`
    )
    if (_.isObject(field) && gqlField) {
      const innerResolved = determineResolvableFields(
        schemaComposer,
        schema,
        gqlFieldType,
        field
      )
      if (!_.isEmpty(innerResolved)) {
        fieldsToResolve[fieldName] = innerResolved
      } else if (_.isEmpty(innerResolved) && needsResolve) {
        fieldsToResolve[fieldName] = true
      }
    } else if (needsResolve) {
      fieldsToResolve[fieldName] = true
    }
  })
  return fieldsToResolve
}

module.exports.run = run
