import { getStore } from "~/store"
import {
  findNamedTypeName,
  getTypeSettingsByType,
} from "~/steps/create-schema-customization/helpers"

// these types do not work in Gatsby because there's no way to reliably invalidate caches or do partial data updates for them
const blockListedTypenameParts = [
  `PluginConnection`,
  `ThemeConnection`,
  `ActionMonitorAction`,
  `EnqueuedScript`,
  `EnqueuedStylesheet`,
  `EnqueuedAsset`,
]

const seenTypesWhileBlockingByParts = {}

function typenamePartIsBlocked(name) {
  if (seenTypesWhileBlockingByParts[name]) {
    return seenTypesWhileBlockingByParts[name]
  }

  const typenameContainsBlocklistedPart = !!blockListedTypenameParts.find(b =>
    name?.includes(b)
  )

  seenTypesWhileBlockingByParts[name] = typenameContainsBlocklistedPart

  return typenameContainsBlocklistedPart
}

const typeIsExcluded = ({ pluginOptions, typeName }) =>
  typenamePartIsBlocked(typeName) ||
  (pluginOptions &&
    pluginOptions.type[typeName] &&
    pluginOptions.type[typeName].exclude)

const fieldIsExcludedOnAll = ({ pluginOptions, field }) => {
  const allFieldSettings = pluginOptions?.type?.__all

  if (!allFieldSettings) {
    return false
  }
  return !!allFieldSettings?.excludeFieldNames?.includes(field?.name)
}

const fieldIsExcludedOnParentType = ({ field, parentType }) => {
  const state = getStore().getState()
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
