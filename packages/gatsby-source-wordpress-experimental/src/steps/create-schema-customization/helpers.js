import store from "~/store"
import { objectTypeFilters } from "./type-filters"
import { getPluginOptions } from "~/utils/get-gatsby-api"

/**
 * This function namespaces typenames with a prefix
 */
export const buildTypeName = name => {
  if (!name || typeof name !== `string`) {
    return null
  }

  const {
    schema: { typePrefix: prefix },
  } = getPluginOptions()

  // this is for our namespace type on the root { wp { ...fields } }
  if (name === prefix) {
    return name
  }

  return prefix + name
}

export const fieldOfTypeWasFetched = type => {
  const { fetchedTypes } = store.getState().remoteSchema

  if (fetchedTypes.get(type.name)) {
    return true
  }

  if (type.ofType && fetchedTypes.get(type.ofType.name)) {
    return true
  }

  return false
}

export const typeIsASupportedScalar = type => {
  if (
    type.kind !== `SCALAR` ||
    (type.ofType && type.ofType.kind !== `SCALAR`)
  ) {
    return true
  }

  const supportedScalars = [
    `Int`,
    `Float`,
    `String`,
    `Boolean`,
    `ID`,
    `Date`,
    `JSON`,
  ]

  return supportedScalars.includes(type.name || type.ofType.name)
}

// retrieves plugin settings for the provided type
export const getTypeSettingsByType = type => {
  if (!type) {
    return {}
  }

  const typeSettings = store.getState().gatsbyApi.pluginOptions.type

  if (typeSettings[type.name]) {
    return typeSettings[type.name]
  }

  if (type.ofType && typeSettings[type.ofType.name]) {
    return typeSettings[type.ofType.name]
  }

  return {}
}

export const filterObjectType = (objectType, typeBuilderApi) => {
  const filter = objectTypeFilters.find(
    filter => typeBuilderApi.type.name === filter.typeName
  )

  if (filter && typeof filter.typeDef === `function`) {
    objectType = filter.typeDef(objectType, typeBuilderApi)
  }

  return objectType
}
