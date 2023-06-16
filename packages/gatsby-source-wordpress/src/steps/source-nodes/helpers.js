import { getStore } from "~/store"
import { camelCase } from "lodash"
import { findNamedTypeName } from "../create-schema-customization/helpers"

export const getTypeInfoBySingleName = singleName => {
  const { typeMap } = getStore().getState().remoteSchema

  const rootField = typeMap
    .get(`RootQuery`)
    .fields.find(field => field.name === singleName)

  const typeName = rootField.type.name || findNamedTypeName(rootField.type)

  const type = typeMap.get(typeName)

  return type
}

export const getQueryInfoBySingleFieldName = singleName => {
  const { nodeQueries } = getStore().getState().remoteSchema
  const queryInfo = Object.values(nodeQueries).find(
    q =>
      q.typeInfo.singularName === singleName ||
      q.typeInfo.singularName === camelCase(singleName)
  )

  return queryInfo
}

export const getQueryInfoByTypeName = typeName => {
  const { nodeQueries } = getStore().getState().remoteSchema

  const queryInfo = Object.values(nodeQueries).find(
    q => q.typeInfo.nodesTypeName === typeName
  )

  return queryInfo
}
