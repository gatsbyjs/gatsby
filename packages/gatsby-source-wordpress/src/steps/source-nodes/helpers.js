import store from "~/store"

export const getTypeInfoBySingleName = singleName => {
  const { typeMap } = store.getState().remoteSchema

  const rootField = typeMap
    .get(`RootQuery`)
    .fields.find(field => field.name === singleName)

  const typeName = rootField.type.name || rootField.type.ofType.name

  const type = typeMap.get(typeName)

  return type
}

export const getQueryInfoBySingleFieldName = singleName => {
  const { nodeQueries } = store.getState().remoteSchema

  const queryInfo = Object.values(nodeQueries).find(
    q => q.typeInfo.singularName === singleName
  )

  return queryInfo
}

export const getQueryInfoByTypeName = typeName => {
  const { nodeQueries } = store.getState().remoteSchema

  const queryInfo = Object.values(nodeQueries).find(
    q => q.typeInfo.nodesTypeName === typeName
  )

  return queryInfo
}
