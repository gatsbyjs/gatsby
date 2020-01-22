import store from "../../store"

/**
 * This function namespaces typenames with a prefix
 */
export const buildTypeName = name => {
  if (!name || typeof name !== `string`) {
    return null
  }

  const prefix = `Wp`

  return prefix + name
}

export const typeWasFetched = type => {
  const { fetchedTypes } = store.getState().introspection

  if (fetchedTypes.get(type.name)) {
    return true
  }

  if (type.ofType && fetchedTypes.get(type.ofType.name)) {
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

export const removeCustomScalars = type => {
  if (
    type.kind !== `SCALAR` ||
    (type.ofType && type.ofType.kind !== `SCALAR`)
  ) {
    return true
  }

  const name = type.name || type.ofType.name

  return supportedScalars.includes(name)
}

// retrieves plugin settings for the provided type
export const getTypeSettingsByType = type => {
  const typeSettings = store.getState().gatsbyApi.pluginOptions.type

  if (typeSettings[type.name]) {
    return typeSettings[type.name]
  }

  if (type.ofType && typeSettings[type.ofType.name]) {
    return typeSettings[type.ofType.name]
  }

  return {}
}
