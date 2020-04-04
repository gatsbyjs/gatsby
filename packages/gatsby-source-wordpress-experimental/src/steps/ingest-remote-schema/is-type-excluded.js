const typeIsExcluded = ({ pluginOptions, typeName }) =>
  pluginOptions &&
  pluginOptions.type[typeName] &&
  pluginOptions.type[typeName].exclude

export { typeIsExcluded }
