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

  if (type?.ofType?.ofType && fetchedTypes.get(type.ofType.ofType.name)) {
    return true
  }

  return false
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

export const typeIsABuiltInScalar = type =>
  // @todo the next function and this one are redundant.
  // see the next todo on how to fix the issue. If that todo is resolved, these functions will be identical. :(
  supportedScalars.includes(
    type.name || type.ofType.name || type.ofType?.ofType?.name
  )

export const typeIsASupportedScalar = type => {
  if (
    type.kind !== `SCALAR` ||
    type?.ofType?.kind !== `SCALAR` ||
    type?.ofType?.ofType?.kind !== `SCALAR`
  ) {
    // @todo returning true here seems wrong since a type that is not a scalar can't be a supported scalar... so there is some other logic elsewhere that is wrong
    // making this return false causes errors in the schema
    return true
  }

  return supportedScalars.includes(
    type.name || type.ofType.name || type.ofType?.ofType?.name
  )
}

// retrieves plugin settings for the provided type
export const getTypeSettingsByType = type => {
  if (!type) {
    return {}
  }

  const typeSettings = store.getState().gatsbyApi.pluginOptions.type
  const __allTypeSetting = typeSettings.__all || {}

  if (typeSettings[type.name]) {
    return { ...__allTypeSetting, ...typeSettings[type.name] }
  }

  if (typeSettings[type.ofType?.name]) {
    return { ...__allTypeSetting, ...typeSettings[type.ofType.name] }
  }

  return __allTypeSetting
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
