import store from "../../../store"

const identifyAndStoreIngestableRootFieldsAndTypes = async () => {
  const nodeListFilter = field => field.name === `nodes`

  const { introspectionData, fieldBlacklist } = store.getState().introspection

  const typeMap = new Map(
    introspectionData.data.__schema.types.map(type => [type.name, type])
  )

  const rootFields = typeMap.get(`RootQuery`).fields

  const nodeInterfaceTypes = []
  const nodeListRootFields = []
  const nonNodeRootFields = []

  for (const field of rootFields) {
    const fieldHasNonNullArgs = field.args.some(
      arg => arg.type.kind === `NON_NULL`
    )

    if (fieldHasNonNullArgs) {
      // we can't know what those args should be, so skip this field
      continue
    }

    if (field.type.kind === `OBJECT`) {
      const type = typeMap.get(field.type.name)

      const nodeField = type.fields.find(nodeListFilter)

      if (nodeField && nodeField.type.ofType.kind === `INTERFACE`) {
        const nodeListField = type.fields.find(nodeListFilter)

        if (nodeListField) {
          nodeInterfaceTypes.push(nodeListField.type.ofType.name)
          continue
        }
      } else if (nodeField) {
        if (fieldBlacklist.includes(field.name)) {
          continue
        }

        nodeListRootFields.push(field)
        continue
      }

      // more non-Node fields here
      // dd(field)
    }

    if (fieldBlacklist.includes(field.name)) {
      continue
    }

    nonNodeRootFields.push(field)
  }

  const nodeListFieldNames = nodeListRootFields.map(field => field.name)

  const nodeListTypeNames = nodeListRootFields.map(field => {
    const connectionType = typeMap.get(field.type.name)

    const nodesField = connectionType.fields.find(nodeListFilter)
    return nodesField.type.ofType.name
  })

  const gatsbyNodesInfo = {
    fieldNames: nodeListFieldNames,
    typeNames: nodeListTypeNames,
  }

  store.dispatch.introspection.setState({
    typeMap,
    gatsbyNodesInfo,
    ingestibles: {
      nodeListRootFields,
      nonNodeRootFields,
      nodeInterfaceTypes,
    },
  })
}

export default identifyAndStoreIngestableRootFieldsAndTypes
