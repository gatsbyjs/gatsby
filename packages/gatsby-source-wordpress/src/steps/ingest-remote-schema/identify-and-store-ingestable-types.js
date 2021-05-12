import store from "~/store"
import { typeIsExcluded } from "~/steps/ingest-remote-schema/is-excluded"
import { typeIsABuiltInScalar } from "../create-schema-customization/helpers"
import { findTypeName } from "~/steps/create-schema-customization/helpers"
import { getPersistentCache } from "~/utils/cache"

const identifyAndStoreIngestableFieldsAndTypes = async () => {
  const nodeListFilter = field => field.name === `nodes`

  const state = store.getState()
  const { introspectionData, fieldBlacklist, typeMap } = state.remoteSchema
  const { pluginOptions } = state.gatsbyApi

  const cachedFetchedTypes = await getPersistentCache({
    key: `previously-fetched-types`,
  })

  if (cachedFetchedTypes) {
    const restoredFetchedTypesMap = new Map(cachedFetchedTypes)

    store.dispatch.remoteSchema.setState({
      fetchedTypes: restoredFetchedTypesMap,
    })
  }

  if (pluginOptions.type) {
    Object.entries(pluginOptions.type).forEach(([typeName, typeSettings]) => {
      // our lazy types won't initially be fetched,
      // so we need to mark them as fetched here
      if (
        (typeSettings.lazyNodes || pluginOptions.type?.__all?.lazyNodes) &&
        !typeIsExcluded({ pluginOptions, typeName })
      ) {
        const lazyType = typeMap.get(typeName)
        store.dispatch.remoteSchema.addFetchedType(lazyType)
      }
    })
  }

  const interfaces = introspectionData.__schema.types.filter(
    type => type.kind === `INTERFACE`
  )

  for (const interfaceType of interfaces) {
    if (typeIsExcluded({ pluginOptions, typeName: interfaceType.name })) {
      continue
    }

    store.dispatch.remoteSchema.addFetchedType(interfaceType)

    if (interfaceType.fields) {
      for (const interfaceField of interfaceType.fields) {
        if (interfaceField.type) {
          store.dispatch.remoteSchema.addFetchedType(interfaceField.type)
        }
      }
    }
  }

  const rootFields = typeMap.get(`RootQuery`).fields

  const nodeInterfaceTypes = []
  const nodeListRootFields = []
  const nonNodeRootFields = []
  const nodeInterfacePossibleTypeNames = []

  for (const field of rootFields) {
    const fieldHasNonNullArgs = field.args.some(
      arg => arg.type.kind === `NON_NULL`
    )

    if (fieldHasNonNullArgs) {
      // we can't know what those args should be, so skip this field
      continue
    }

    if (typeIsExcluded({ pluginOptions, typeName: field.type.name })) {
      continue
    }

    if (field.type.kind === `OBJECT`) {
      const type = typeMap.get(field.type.name)

      const nodeField = type?.fields?.find(nodeListFilter)

      if (nodeField && nodeField.type.ofType.kind === `INTERFACE`) {
        const nodeListField = type.fields.find(nodeListFilter)

        if (nodeListField) {
          nodeInterfaceTypes.push(nodeListField.type.ofType.name)

          store.dispatch.remoteSchema.addFetchedType(nodeListField.type)

          const nodeListFieldType = typeMap.get(nodeListField.type.ofType.name)

          for (const innerField of nodeListFieldType.fields) {
            store.dispatch.remoteSchema.addFetchedType(innerField.type)
          }

          if (
            // if we haven't marked this as a nodeInterface type then push this to root fields to fetch it
            // nodeInterface is different than a node which is an interface type.
            // In Gatsby nodeInterface means the node data is pulled from a different type. On the WP side we can also have nodes that are of an interface type, but we only pull them from a single root field
            // the problem is that if we don't mark them as a node list root field
            // we don't know to identify them later as being a node type that will have been fetched and we also won't try to fetch this type during node sourcing.
            !pluginOptions?.type?.[nodeListField.type.ofType.name]
              ?.nodeInterface
          ) {
            const nodeInterfaceType = typeMap.get(
              findTypeName(nodeListField.type)
            )

            // we need to mark all the possible types as being fetched
            // and also need to record the possible type as a node type
            for (const type of nodeInterfaceType?.possibleTypes || []) {
              nodeInterfacePossibleTypeNames.push(type.name)
              store.dispatch.remoteSchema.addFetchedType(type)
            }

            nodeListRootFields.push(field)
          }

          continue
        }
      } else if (nodeField) {
        if (fieldBlacklist.includes(field.name)) {
          continue
        }

        store.dispatch.remoteSchema.addFetchedType(nodeField.type)

        nodeListRootFields.push(field)
        continue
      }
    }

    if (fieldBlacklist.includes(field.name)) {
      continue
    }

    const takesIDinput = field?.args?.find(arg => arg.type.name === `ID`)

    // if a non-node root field takes an id input, we 99% likely can't use it.
    // so don't fetch it and don't add it to the schema.
    if (takesIDinput) {
      continue
    }

    if (
      // if this type is excluded on the RootQuery, skip it
      pluginOptions.type.RootQuery?.excludeFieldNames?.find(
        excludedFieldName => excludedFieldName === field.name
      )
    ) {
      continue
    }

    // we don't need to mark types as fetched if they're supported SCALAR types
    if (!typeIsABuiltInScalar(field.type)) {
      store.dispatch.remoteSchema.addFetchedType(field.type)
    }

    nonNodeRootFields.push(field)
  }

  const nodeListFieldNames = nodeListRootFields.map(field => field.name)

  const nodeListTypeNames = [
    ...nodeInterfacePossibleTypeNames,
    ...nodeListRootFields.map(field => {
      const connectionType = typeMap.get(field.type.name)

      const nodesField = connectionType.fields.find(nodeListFilter)
      return nodesField.type.ofType.name
    }),
  ]

  const gatsbyNodesInfo = {
    fieldNames: nodeListFieldNames,
    typeNames: nodeListTypeNames,
  }

  store.dispatch.remoteSchema.setState({
    gatsbyNodesInfo,
    ingestibles: {
      nodeListRootFields,
      nonNodeRootFields,
      nodeInterfaceTypes,
    },
  })
}

export { identifyAndStoreIngestableFieldsAndTypes }
