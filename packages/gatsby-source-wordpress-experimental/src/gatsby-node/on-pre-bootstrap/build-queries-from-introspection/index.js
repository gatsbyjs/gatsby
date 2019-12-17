import { getAvailablePostTypesQuery } from "../../graphql-queries"
import fetchGraphql from "../../../utils/fetch-graphql"

import recursivelyTransformFields from "./recursively-transform-fields"
import {
  buildNodesQueryOnFieldName,
  buildNodeQueryOnFieldName,
} from "./build-query-on-field-name"
// @todo create function to unmap check here for similar function https://www.gatsbyjs.org/packages/gatsby-source-graphql-universal/

import store from "../../../store"

const generateQueriesFromIntrospection = async ({
  introspection,
  nodeListFilter,
  pluginOptions,
  fieldBlacklist = [],
  rootType = `RootQuery`,
}) => {
  if (!nodeListFilter || typeof nodeListFilter !== `function`) {
    throw new Error(`nodeListFilter must be a function.`)
  }

  const { types } = introspection.data.__schema
  const typeMap = new Map(types.map(type => [type.name, type]))
  const rootFields = typeMap.get(rootType).fields

  // find fields that are lists of nodes.
  const nodeListFields = rootFields.filter(field => {
    if (field.type.kind !== `OBJECT`) {
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

  const futureGatsbyNodesInfo = {
    fieldNames: nodeListFieldNames,
    typeNames: nodeListTypeNames,
  }

  // This is temporary. We need a list of post types so we
  // can add field arguments just to post type fields so we can
  // get a flat list of posts and pages, instead of having them
  // nested as children
  // for example we need to do posts(where: { parent: null }) { nodes { ... }}
  // https://github.com/wp-graphql/wp-graphql/issues/928
  const query = getAvailablePostTypesQuery()
  const { url } = pluginOptions
  const {
    data: { postTypes },
  } = await fetchGraphql({ url, query })

  let queries = {}

  for (const { type, name } of nodeListFields) {
    if (fieldBlacklist.includes(name)) {
      continue
    }

    const fieldFields = typeMap.get(type.name).fields
    const nodesField = fieldFields.find(nodeListFilter)

    const nodesType = typeMap.get(nodesField.type.ofType.name)
    const { fields } = nodesType

    const singleTypeInfo = rootFields.find(
      field => field.type.name === nodesType.name
    )

    const singleFieldName = singleTypeInfo.name

    const transformedFields = recursivelyTransformFields({
      maxDepth: 3,
      field: nodesType,
      fields,
      futureGatsbyNodesInfo,
      typeMap,
    })

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

    queries[name] = {
      typeInfo: {
        singleName: singleFieldName,
        pluralName: name,
        nodesTypeName: nodesType.name,
      },
      listQueryString,
      nodeQueryString,
    }
  }

  return queries
}

const nodeListFilter = field => field.name === `nodes`

export const buildNodeQueriesFromIntrospection = async (
  { introspection, schemaHasChanged = false },
  helpers,
  pluginOptions
) => {
  const QUERY_CACHE_KEY = `${pluginOptions.url}--introspection-node-queries`

  let queries = await helpers.cache.get(QUERY_CACHE_KEY)

  if (
    // we've never generated queries, or the schema has changed
    !queries ||
    schemaHasChanged
  ) {
    // generate them again
    const { fieldBlacklist } = store.getState().introspection

    queries = await generateQueriesFromIntrospection({
      introspection,
      fieldBlacklist,
      nodeListFilter,
      pluginOptions,
    })

    // and cache them
    await helpers.cache.set(QUERY_CACHE_KEY, queries)
  }

  return queries
}
