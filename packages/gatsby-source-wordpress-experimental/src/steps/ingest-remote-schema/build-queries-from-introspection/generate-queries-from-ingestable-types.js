import { availablePostTypesQuery } from "~/utils/graphql-queries"
import fetchGraphql from "~/utils/fetch-graphql"

import recursivelyTransformFields from "./recursively-transform-fields"
import {
  buildNodesQueryOnFieldName,
  buildNodeQueryOnFieldName,
  buildSelectionSet,
} from "./build-query-on-field-name"

import store from "~/store"
import { getTypeSettingsByType } from "~/steps/create-schema-customization/helpers"

/**
 * generateNodeQueriesFromIngestibleFields
 *
 * Takes in data from an introspection query and
 * processes it to build GraphQL query strings/info
 *
 * @param {object} introspectionData
 * @returns {Object} GraphQL query info including gql query strings
 */
const generateNodeQueriesFromIngestibleFields = async () => {
  const { remoteSchema } = store.getState()

  const {
    fieldBlacklist,
    nodeListFilter,
    typeMap,
    ingestibles: { nodeListRootFields },
  } = remoteSchema

  const rootFields = typeMap.get(`RootQuery`).fields

  // @todo This is temporary. We need a list of post types so we
  // can add field arguments just to post type fields so we can
  // get a flat list of posts and pages, instead of having them
  // nested as children
  // for example we need to do posts(where: { parent: null }) { nodes { ... }}
  // https://github.com/wp-graphql/wp-graphql/issues/928
  const {
    data: { postTypes },
  } = await fetchGraphql({ query: availablePostTypesQuery })

  let nodeQueries = {}

  for (const { type, name } of nodeListRootFields) {
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

    const settings = getTypeSettingsByType(nodesType)

    if (settings.exclude) {
      continue
    }

    let nodeListQueries = []

    const singleTypeInfo = rootFields.find(
      field => field.type.name === nodesType.name
    )

    const singleFieldName = singleTypeInfo.name

    const transformedFields = recursivelyTransformFields({ fields })

    const selectionSet = buildSelectionSet(transformedFields)

    const nodeQuery = buildNodeQueryOnFieldName({
      fields: transformedFields,
      fieldName: singleFieldName,
    })

    if (
      settings.nodeListQueries &&
      typeof settings.nodeListQueries === `function`
    ) {
      const queries = settings.nodeListQueries({
        name,
        fields,
        postTypes,
        selectionSet,
        singleFieldName,
        singleTypeInfo,
        settings,
        store,
        remoteSchema,
        transformedFields,
        helpers: {
          recursivelyTransformFields,
          buildNodesQueryOnFieldName,
        },
      })

      if (queries && queries.length) {
        nodeListQueries = queries
      }
    }

    if (!nodeListQueries || !nodeListQueries.length) {
      const nodeListQuery = buildNodesQueryOnFieldName({
        fields: transformedFields,
        fieldName: name,
        postTypes,
      })

      nodeListQueries = [nodeListQuery]
    }

    // build a query info object containing gql query strings for fetching
    // node lists or single nodes, as well as type info and plugin
    // settings for this type
    nodeQueries[name] = {
      typeInfo: {
        singularName: singleFieldName,
        pluralName: name,
        nodesTypeName: nodesType.name,
      },
      nodeListQueries,
      nodeQuery,
      selectionSet,
      settings,
    }
  }

  return nodeQueries
}

export default generateNodeQueriesFromIngestibleFields
