import store from "~/store"
import { findTypeName } from "~/steps/create-schema-customization/helpers"

const typeIsExcluded = ({ pluginOptions, typeName }) =>
  pluginOptions &&
  pluginOptions.type[typeName] &&
  pluginOptions.type[typeName].exclude

const fieldIsExcludedOnParentType = ({ pluginOptions, field, parentType }) => {
  const allTypeSettings = pluginOptions.type

  const state = store.getState()
  const { typeMap } = state.remoteSchema

  const fullType = typeMap.get(findTypeName(parentType))

  const parentTypeNodesField = fullType?.fields?.find(
    field => field.name === `nodes`
  )

  const parentTypeNodesFieldTypeName = findTypeName(parentTypeNodesField?.type)

  const fieldIsExcludedOnParentType =
    // if this field is excluded on either the parent type
    allTypeSettings[parentType?.name]?.excludeFieldNames?.includes(
      field?.name
    ) ||
    // or the parent type has a "nodes" field and that type has this field excluded
    allTypeSettings[parentTypeNodesFieldTypeName]?.excludeFieldNames?.includes(
      field?.name
    )

  return !!fieldIsExcludedOnParentType
}

export { typeIsExcluded, fieldIsExcludedOnParentType }
