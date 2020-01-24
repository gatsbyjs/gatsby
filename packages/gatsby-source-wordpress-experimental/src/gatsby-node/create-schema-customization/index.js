import store from "../../store"
import { getContentTypeQueryInfos } from "../source-nodes/fetch-nodes"

import { typeWasFetched, getTypeSettingsByType } from "./helpers"

import buildType from "./build-types"

/**
 * createSchemaCustomization
 */
export default async ({ actions, schema }) => {
  const state = store.getState()

  const {
    fieldAliases,
    fieldBlacklist,
    introspectionData: { data },
    ingestibles: { nonNodeRootFields },
  } = state.remoteSchema

  const {
    gatsbyApi: { pluginOptions },
  } = state

  let typeDefs = []

  const gatsbyNodeTypes = getContentTypeQueryInfos().map(
    query => query.typeInfo.nodesTypeName
  )

  // create Gatsby node types
  data.__schema.types.filter(typeWasFetched).forEach(type => {
    //
    // if this type is excluded via plugin options, don't add it
    if (getTypeSettingsByType(type).exclude) {
      return
    }

    const typeBuilderApi = {
      typeDefs,
      schema,
      type,
      gatsbyNodeTypes,
      fieldAliases,
      fieldBlacklist,
      pluginOptions,
    }

    switch (type.kind) {
      case `UNION`:
        buildType.unionType(typeBuilderApi)
        break
      case `INTERFACE`:
        buildType.interfaceType(typeBuilderApi)
        break
      case `OBJECT`:
        buildType.objectType(typeBuilderApi)
        break
      case `SCALAR`:
        /**
         * custom scalar types aren't imlemented currently.
         *  @todo make this hookable so sub-plugins or plugin options can add custom scalar support.
         */
        break
    }
  })

  // Create non Gatsby node types
  buildType.objectType({
    typeDefs,
    schema,
    type: {
      kind: `OBJECT`,
      // just use the prefix so that this node appears as { wp { ...fields } }
      name: pluginOptions.schema.typePrefix,
      description: `Non-node WPGraphQL root fields.`,
      fields: nonNodeRootFields,
      interfaces: [`Node`],
    },
    gatsbyNodeTypes,
    fieldAliases,
    fieldBlacklist,
    pluginOptions,
    isAGatsbyNode: true,
  })

  actions.createTypes(typeDefs)
}
