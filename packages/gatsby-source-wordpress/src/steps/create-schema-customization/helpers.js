import store from "~/store"
import { typeDefinitionFilters } from "./type-filters"
import { getPluginOptions } from "~/utils/get-gatsby-api"
import { cloneDeep, merge } from "lodash"

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

  if (name === `Filter`) {
    name = `FilterType`
  }

  if (name.startsWith(prefix)) {
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

const implementingTypeCache = new Map()

export const getTypesThatImplementInterfaceType = type => {
  if (implementingTypeCache.has(type.name)) {
    return implementingTypeCache.get(type.name)
  }

  const state = store.getState()
  const { typeMap } = state.remoteSchema

  const allTypes = typeMap.values()

  const implementingTypes = Array.from(allTypes)
    .filter(
      ({ interfaces }) =>
        interfaces &&
        // find types that implement this interface type
        interfaces.find(singleInterface => singleInterface.name === type.name)
    )
    .map(type => typeMap.get(type.name))
    .filter(
      type =>
        type.kind !== `UNION` ||
        // if this is a union type, make sure the union type has one or more member types, otherwise schema customization will throw an error
        (!!type.possibleTypes && !!type.possibleTypes.length)
    )

  implementingTypeCache.set(type.name, implementingTypes)

  return implementingTypes
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

const typeSettingCache = new Map()

// retrieves plugin settings for the provided type
export const getTypeSettingsByType = type => {
  if (!type) {
    return {}
  }

  const typeName = findTypeName(type)

  if (!typeName) {
    return {}
  }

  const cachedTypeSettings = typeSettingCache.get(typeName)

  if (cachedTypeSettings) {
    return cachedTypeSettings
  }

  // the plugin options object containing every type setting
  const allTypeSettings = store.getState().gatsbyApi.pluginOptions.type

  const typeSettings = cloneDeep(allTypeSettings[typeName] || {})

  // the type.__all plugin option which is applied to every type setting
  const __allTypeSetting = cloneDeep(allTypeSettings.__all || {})

  if (typeName === `MediaItem`) {
    delete __allTypeSetting.limit
    delete typeSettings.limit
  }

  if (typeSettings) {
    const mergedSettings = merge(__allTypeSetting, typeSettings)

    typeSettingCache.set(typeName, mergedSettings)

    return mergedSettings
  }

  typeSettingCache.set(typeName, __allTypeSetting)

  return __allTypeSetting
}

/**
 * This is used to filter the automatically generated type definitions before they're added to the schema customization api.
 */
export const filterTypeDefinition = (
  typeDefinition,
  typeBuilderApi,
  typeKind
) => {
  const filters = typeDefinitionFilters.filter(filter =>
    [typeBuilderApi.type.name, `__all`].includes(filter.typeName)
  )

  if (filters?.length) {
    filters.forEach(filter => {
      if (filter && typeof filter.typeDef === `function`) {
        typeDefinition = filter.typeDef(
          typeDefinition,
          typeBuilderApi,
          typeKind
        )
      }
    })
  }

  return typeDefinition
}
