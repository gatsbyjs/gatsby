import store from "~/store"

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
