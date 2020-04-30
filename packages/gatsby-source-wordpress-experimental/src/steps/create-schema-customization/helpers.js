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

/**
 * Find the first type name of a Type definition pulled via introspection
 * @param {object} type
 */
export const findTypeName = type =>
  type?.name ||
  type?.ofType?.name ||
  type?.ofType?.ofType?.name ||
  type?.ofType?.ofType?.ofType?.name

/**
 * Find the first type kind of a Type definition pulled via introspection
 * @param {object} type
 */
export const findTypeKind = type =>
  type?.kind ||
  type?.ofType?.kind ||
  type?.ofType?.ofType?.kind ||
  type?.ofType?.ofType?.ofType?.kind

export const fieldOfTypeWasFetched = type => {
  const { fetchedTypes } = store.getState().remoteSchema
  const typeName = findTypeName(type)
  const typeWasFetched = !!fetchedTypes.get(typeName)

  return typeWasFetched
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
  supportedScalars.includes(findTypeName(type))

export const typeIsASupportedScalar = type => {
  if (findTypeKind(type) !== `SCALAR`) {
    // @todo returning true here seems wrong since a type that is not a scalar can't be a supported scalar... so there is some other logic elsewhere that is wrong
    // making this return false causes errors in the schema
    return true
  }

  return supportedScalars.includes(findTypeName(type))
}

// retrieves plugin settings for the provided type
export const getTypeSettingsByType = type => {
  if (!type) {
    return {}
  }

  const typeSettings = store.getState().gatsbyApi.pluginOptions.type
  const thisTypeSettings = typeSettings[findTypeName(type)] || {}

  return thisTypeSettings
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
