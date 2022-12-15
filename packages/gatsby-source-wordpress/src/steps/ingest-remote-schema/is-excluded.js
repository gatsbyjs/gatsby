import store from "~/store"
import {
  findNamedTypeName,
  getTypeSettingsByType,
} from "~/steps/create-schema-customization/helpers"

const typeIsExcluded = ({ pluginOptions, typeName }) =>
  pluginOptions &&
  pluginOptions.type[typeName] &&
  pluginOptions.type[typeName].exclude

const fieldIsExcludedOnAll = ({ pluginOptions, field }) => {
  const allFieldSettings = pluginOptions?.type?.__all

  if (!allFieldSettings) {
    return false
  }
  return !!allFieldSettings?.excludeFieldNames?.includes(field?.name)
}

const fieldIsExcludedOnParentType = ({ field, parentType }) => {
  const state = store.getState()
  const { typeMap } = state.remoteSchema

  const fullType = typeMap.get(findNamedTypeName(parentType))

  const parentTypeNodesField = fullType?.fields?.find(
    field => field.name === `nodes`
  )

  const parentTypeNameSettings = getTypeSettingsByType(parentType)
  const parentTypeNodesFieldTypeNameSettings = getTypeSettingsByType(
    parentTypeNodesField?.type
  )

  const fieldIsExcludedOnParentType =
    // if this field is excluded on either the parent type
    parentTypeNameSettings?.excludeFieldNames?.includes(field?.name) ||
    // or the parent type has a "nodes" field and that type has this field excluded
    parentTypeNodesFieldTypeNameSettings?.excludeFieldNames?.includes(
      field?.name
    )

  return !!fieldIsExcludedOnParentType
}

export { typeIsExcluded, fieldIsExcludedOnAll, fieldIsExcludedOnParentType }
