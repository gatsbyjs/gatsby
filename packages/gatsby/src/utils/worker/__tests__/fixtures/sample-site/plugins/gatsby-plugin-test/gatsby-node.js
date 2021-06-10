exports.createSchemaCustomization = (_, pluginOptions) => {
  global.test = pluginOptions.fn()
}