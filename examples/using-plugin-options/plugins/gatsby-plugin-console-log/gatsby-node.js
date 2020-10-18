exports.onPreInit = (_, pluginOptions) => {
  // uses the plugin options from the gatsby-config and uses it, or a default value
  console.log(
    `logging: "${pluginOptions.message || `default message`}" to the console`
  )
}
