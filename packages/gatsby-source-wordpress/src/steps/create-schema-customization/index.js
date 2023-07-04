import { getStore } from "~/store"

import { diffBuiltTypeDefs, fieldOfTypeWasFetched } from "./helpers"

import buildType from "./build-types"
import { getGatsbyNodeTypeNames } from "../source-nodes/fetch-nodes/fetch-nodes"
import { typeIsExcluded } from "~/steps/ingest-remote-schema/is-excluded"
import { formatLogMessage } from "../../utils/format-log-message"
import { CODES } from "../../utils/report"
import { addRemoteFilePolyfillInterface } from "gatsby-plugin-utils/polyfill-remote-file"

/**
 * createSchemaCustomization
 */
const customizeSchema = async ({ actions, schema, store: gatsbyStore }) => {
  const state = getStore().getState()

  const {
    gatsbyApi: { pluginOptions },
    remoteSchema,
  } = state

  const {
    fieldAliases,
    fieldBlacklist,
    ingestibles: { nonNodeRootFields },
  } = remoteSchema

  const typeDefs = []

  const gatsbyNodeTypes = getGatsbyNodeTypeNames()

  const typeBuilderApi = {
    typeDefs,
    schema,
    gatsbyNodeTypes,
    fieldAliases,
    fieldBlacklist,
    pluginOptions,
  }

  // create Gatsby node types
  remoteSchema.introspectionData.__schema.types.forEach(type => {
    if (
      fieldOfTypeWasFetched(type) &&
      !typeIsExcluded({ pluginOptions, typeName: type.name })
    ) {
      let builtType

      switch (type.kind) {
        case `UNION`:
          builtType = buildType.unionType({ ...typeBuilderApi, type })
          break
        case `INTERFACE`:
          builtType = buildType.interfaceType({ ...typeBuilderApi, type })
          break
        case `OBJECT`:
          builtType = buildType.objectType({ ...typeBuilderApi, type })
          break
        case `ENUM`:
          builtType = buildType.enumType({ ...typeBuilderApi, type })
          break
        case `SCALAR`:
          /**
           * custom scalar types aren't supported.
           */
          break
      }

      if (builtType) {
        typeDefs.push(builtType)
      }
    }
  })

  // Create non Gatsby node types by creating a single node
  // where the typename is the type prefix
  // The node fields are the non-node root fields of the remote schema
  // like so: query { prefix { ...fields } }
  const wpType = buildType.objectType({
    ...typeBuilderApi,
    type: {
      kind: `OBJECT`,
      name: pluginOptions.schema.typePrefix,
      description: `Non-node WPGraphQL root fields.`,
      fields: nonNodeRootFields,
      interfaces: [`Node`],
    },
  })

  typeDefs.push(wpType)

  typeDefs.push(
    addRemoteFilePolyfillInterface(
      schema.buildObjectType({
        name: pluginOptions.schema.typePrefix + `MediaItem`,
        fields: {},
        interfaces: [`Node`, `RemoteFile`],
      }),
      {
        schema,
        actions,
        store: gatsbyStore,
      }
    )
  )

  diffBuiltTypeDefs(typeDefs)
  actions.createTypes(typeDefs)
}

const createSchemaCustomization = async api => {
  try {
    await customizeSchema(api)
  } catch (e) {
    api.reporter.panic({
      id: CODES.SourcePluginCodeError,
      error: e,
      context: {
        sourceMessage: formatLogMessage(e.message),
      },
    })
  }
}

export { createSchemaCustomization }
