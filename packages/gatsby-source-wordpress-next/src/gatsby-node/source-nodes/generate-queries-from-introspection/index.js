import recursivelyTransformFields from "./recursively-transform-fields"
import {
  buildNodesQueryOnFieldName,
  buildNodeQueryOnFieldName,
} from "./build-query-on-field-name"
// @todo create function to unmap check here for similar function https://www.gatsbyjs.org/packages/gatsby-source-graphql-universal/
import fetchGraphql from "../../../utils/fetch-graphql"
import { introspectionQuery } from "../graphql-queries"

import store from "../../../store"

export const buildNodeQueriesFromIntrospection = async (
  helpers,
  pluginOptions
) => {
  const { fieldBlacklist } = store.getState().introspection

  const introspection = await fetchGraphql({
    url: pluginOptions.url,
    query: introspectionQuery,
  })

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

    await helpers.cache.set(
      `${listType.fieldName}--types-by-single-field-name`,
      listType
    )

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

  //
  // set the queries in our redux store
  store.dispatch.introspection.setQueries(queries)
}
