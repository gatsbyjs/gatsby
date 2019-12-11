import recursivelyTransformFields from "./recursively-transform-fields"
import {
  buildNodesQueryOnFieldName,
  buildNodeQueryOnFieldName,
} from "./build-query-on-field-name"
// @todo create function to unmap check here for similar function https://www.gatsbyjs.org/packages/gatsby-source-graphql-universal/

import store from "../../../store"

const generateQueriesFromIntrospection = ({ introspection }) => {
  const { fieldBlacklist } = store.getState().introspection

  const rootFields = introspection.data.__schema.queryType.fields

  // first we want to find root query fields that will return lists of nodes
  const rootQueryListConnections = rootFields
    .filter(
      field =>
        field.type.kind === `OBJECT` &&
        field.type.name.includes(`RootQueryTo`) &&
        !fieldBlacklist.includes(field.name)
    )
    .map(field => {
      return {
        rootFieldName: field.name,
        rootTypeName: field.type.name,
        nodesTypeName: field.type.fields.find(
          innerField => innerField.name === `nodes`
        ).type.ofType.name,
      }
    })

  // get an array of type names for the nodes in our root query node lists
  const nodeListTypeNames = rootQueryListConnections.map(
    field => field.nodesTypeName
  )

  // build an object where the root property names are node list types
  // each of those properties contains an object of info about that types fields
  const nodeListTypes = rootQueryListConnections.reduce(
    (accumulator, connection) => {
      const name = connection.nodesTypeName
      const typeInfo = rootFields.find(field => field.type.name === name)

      typeInfo.type.fields = recursivelyTransformFields({
        field: typeInfo,
        fields: typeInfo.type.fields,
        nodeListTypeNames,
      })

      accumulator[name] = {
        fieldName: typeInfo.name,
        ...connection,
        ...typeInfo.type,
      }
      return accumulator
    },
    {}
  )

  let queries = {}

  // for each root field that returns a list of nodes
  // build a query to fetch those nodes
  for (const typeName of nodeListTypeNames) {
    const listType = nodeListTypes[typeName]

    const listQueryString = buildNodesQueryOnFieldName({
      fields: listType.fields,
      fieldName: listType.rootFieldName,
      nodeListTypeNames,
    })

    const nodeQueryString = buildNodeQueryOnFieldName({
      fields: listType.fields,
      fieldName: listType.fieldName,
      nodeListTypeNames,
    })

    queries[listType.rootFieldName] = {
      typeInfo: {
        singleName: listType.fieldName,
        pluralName: listType.rootFieldName,
        nodesTypeName: listType.nodesTypeName,
      },
      listQueryString,
      nodeQueryString,
    }
  }

  return queries
}

export const buildNodeQueriesFromIntrospection = async (
  { introspection, schemaHasChanged = false },
  helpers
) => {
  const QUERY_CACHE_KEY = `introspection-node-queries`

  let queries = await helpers.cache.get(QUERY_CACHE_KEY)

  if (
    // we've never generated queries, or the schema has changed
    !queries ||
    schemaHasChanged
  ) {
    // generate them again
    queries = generateQueriesFromIntrospection({
      introspection,
      helpers,
    })

    // and cache them
    await helpers.cache.set(QUERY_CACHE_KEY, queries)
  }

  return queries
}
