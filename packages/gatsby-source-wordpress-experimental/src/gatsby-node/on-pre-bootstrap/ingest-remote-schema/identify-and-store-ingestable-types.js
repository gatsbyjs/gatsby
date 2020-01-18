import store from "../../../store"

const identifyAndStoreIngestableRootFieldsAndTypes = async () => {
  const nodeListFilter = field => field.name === `nodes`

  const { introspectionData } = store.getState().introspection

  const typeMap = new Map(
    introspectionData.data.__schema.types.map(type => [type.name, type])
  )

  const rootFields = typeMap.get(`RootQuery`).fields

  const nodeInterfaceTypes = []
  const nodeListRootFields = []
  const nonNodeRootFields = []

  for (const field of rootFields) {
    if (field.type.kind !== `OBJECT`) {
      continue
    }

    const type = typeMap.get(field.type.name)

    const nodeField = type.fields.find(nodeListFilter)

    if (nodeField && nodeField.type.ofType.kind === `INTERFACE`) {
      const nodeListField = type.fields.find(nodeListFilter)

      if (nodeListField) {
        nodeInterfaceTypes.push(nodeListField.type.ofType.name)
      }
    } else if (nodeField) {
      nodeListRootFields.push(field)
    }

    // identify other fetchable root fields here.
    // if (something) nonNodeRootFields.push(field)
  }

  store.dispatch.introspection.setState({
    typeMap,
    ingestibles: {
      nodeListRootFields,
      nonNodeRootFields,
      nodeInterfaceTypes,
    },
  })
}

export default identifyAndStoreIngestableRootFieldsAndTypes
