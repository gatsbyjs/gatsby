import store from "~/store"

export const getQueryInfoByTypeName = typeName => {
  const { nodeQueries } = store.getState().remoteSchema

  const queryInfo = Object.values(nodeQueries).find(
    q => q.typeInfo.singularName === typeName
  )

  return queryInfo
}
