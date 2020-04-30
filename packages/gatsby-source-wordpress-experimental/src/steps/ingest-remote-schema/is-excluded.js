const typeIsExcluded = ({ pluginOptions, typeName }) =>
  pluginOptions &&
  pluginOptions.type[typeName] &&
  pluginOptions.type[typeName].exclude

const fieldIsExcludedOnParentType = ({ pluginOptions, field, parentType }) => {
  const allTypeSettings = pluginOptions.type

  const fieldIsExcludedOnParentType = allTypeSettings[
    parentType.name
  ]?.excludeFieldNames?.includes(field.name)

  return !!fieldIsExcludedOnParentType
}

export { typeIsExcluded, fieldIsExcludedOnParentType }
