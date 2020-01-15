import { availablePostTypesQuery } from "../../graphql-queries"
import fetchGraphql from "../../../utils/fetch-graphql"
import { introspectionQuery } from "../../graphql-queries"
import checkIfSchemaHasChanged from "../check-if-schema-has-changed"

import recursivelyTransformFields from "./recursively-transform-fields"
import {
  buildNodesQueryOnFieldName,
  buildNodeQueryOnFieldName,
  buildSelectionSet,
} from "./build-query-on-field-name"
// @todo create function to unmap check here for similar function https://www.gatsbyjs.org/packages/gatsby-source-graphql-universal/

import store from "../../../store"
import formatLogMessage from "../../../utils/format-log-message"

/**
 * generateQueriesFromIntrospection
 *
 * Takes in data from an introspection query and
 * processes it to build GraphQL query strings/info
 *
 * @param {object} introspectionData
 * @returns {Object} GraphQL query info including gql query strings
 */
const generateQueriesFromIntrospection = async introspectionData => {
  const state = store.getState()
  const { pluginOptions } = state.gatsbyApi
  const { fieldBlacklist = [] } = state.introspection || {}

  const nodeListFilter = field => field.name === `nodes`
  const { types } = introspectionData.data.__schema
  const typeMap = new Map(types.map(type => [type.name, type]))
  const rootFields = typeMap.get(`RootQuery`).fields

  // find root fields that are lists of nodes.
  const nodeListFields = rootFields.filter(field => {
    if (field.type.kind !== `OBJECT` && field.type.kind !== `INTERFACE`) {
      return false
    }

    const type = typeMap.get(field.type.name)

    return type && type.fields.find(nodeListFilter)
  })

  const nodeListFieldNames = nodeListFields.map(field => field.name)

  const nodeListTypeNames = nodeListFields.map(field => {
    const connectionType = typeMap.get(field.type.name)
    const nodesField = connectionType.fields.find(nodeListFilter)
    return nodesField.type.ofType.name
  })

  const gatsbyNodesInfo = {
    fieldNames: nodeListFieldNames,
    typeNames: nodeListTypeNames,
  }

  // @todo This is temporary. We need a list of post types so we
  // can add field arguments just to post type fields so we can
  // get a flat list of posts and pages, instead of having them
  // nested as children
  // for example we need to do posts(where: { parent: null }) { nodes { ... }}
  // https://github.com/wp-graphql/wp-graphql/issues/928
  const {
    url,
    type: typeOptions,
    schema: { queryDepth },
  } = pluginOptions
  const {
    data: { postTypes },
  } = await fetchGraphql({ url, query: availablePostTypesQuery })

  let queries = {}

  for (const { type, name } of nodeListFields) {
    // this removes problematic root fields (themes, revisions, actionMonitorActions)
    if (fieldBlacklist.includes(name)) {
      continue
    }

    // nested fields
    const fieldFields = typeMap.get(type.name).fields

    // a nested field containing a list of nodes
    const nodesField = fieldFields.find(nodeListFilter)

    // the type of this query
    const nodesType = typeMap.get(nodesField.type.ofType.name)

    const { fields } = nodesType

    /**
     * plugin settings for this type
     * For example:
     * {
      resolve: `gatsby-source-wordpress-experimental`,
      options: {
        url: `http://gatsbysourcewordpressv4.local/graphql`,
        type: {
          Page: { // <-- this object
            limit: 10,
          },
        },
      },
    },
     */
    const settings = typeOptions[nodesType.name] || {}

    const singleTypeInfo = rootFields.find(
      field => field.type.name === nodesType.name
    )

    const singleFieldName = singleTypeInfo.name

    const transformedFields = recursivelyTransformFields({
      maxDepth: queryDepth,
      field: nodesType,
      fields,
      gatsbyNodesInfo,
      typeMap,
    })

    const selectionSet = buildSelectionSet(transformedFields)

    const listQueryString = buildNodesQueryOnFieldName({
      fields: transformedFields,
      fieldName: name,
      nodeListFieldNames,
      postTypes,
    })

    const nodeQueryString = buildNodeQueryOnFieldName({
      fields: transformedFields,
      fieldName: singleFieldName,
      nodeListFieldNames,
    })

    // build a query info object containing gql query strings for fetching
    // node lists or single nodes, as well as type info and plugin
    // settings for this type
    queries[name] = {
      typeInfo: {
        singularName: singleFieldName,
        pluralName: name,
        nodesTypeName: nodesType.name,
      },
      listQueryString,
      nodeQueryString,
      selectionSet,
      settings,
    }
  }

  return queries
}

/**
 * buildNodeQueriesFromIntrospection
 *
 * Uses plugin options to introspect the remote GraphQL
 * source, run cache logic, and generate GQL query strings/info
 *
 * @returns {Object} GraphQL query info including gql query strings
 */
export const buildNodeQueriesFromIntrospection = async () => {
  const { pluginOptions, helpers } = store.getState().gatsbyApi

  const QUERY_CACHE_KEY = `${pluginOptions.url}--introspection-node-queries`
  const INTROSPECTION_CACHE_KEY = `${pluginOptions.url}--introspection-response`

  const schemaHasChanged = await checkIfSchemaHasChanged()

  let queries = await helpers.cache.get(QUERY_CACHE_KEY)
  let introspectionData = await helpers.cache.get(INTROSPECTION_CACHE_KEY)

  if (
    // we've never generated queries, or the schema has changed
    !queries ||
    !introspectionData ||
    schemaHasChanged
  ) {
    if (pluginOptions.verbose && queries && schemaHasChanged) {
      helpers.reporter.info(
        formatLogMessage(
          `The WPGraphQL schema has changed since the last build. \n Refetching all data.`
        )
      )
    }

    // generate them again
    introspectionData = await fetchGraphql({
      url: pluginOptions.url,
      query: introspectionQuery,
    })

    // cache introspection response
    await helpers.cache.set(INTROSPECTION_CACHE_KEY, introspectionData)

    queries = await generateQueriesFromIntrospection(introspectionData)

    // and cache them
    await helpers.cache.set(QUERY_CACHE_KEY, queries)
  }

  // dd(Object.values(queries).map(query => query.typeInfo))

  // set the queries in our redux store to use later
  store.dispatch.introspection.setState({
    queries,
    introspectionData,
  })

  return queries
}
