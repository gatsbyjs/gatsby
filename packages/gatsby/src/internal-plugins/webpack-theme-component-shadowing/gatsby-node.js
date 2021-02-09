const GatsbyThemeComponentShadowingResolverPlugin = require(`.`)

exports.onCreateWebpackConfig = (
  { store, stage, getConfig, rules, loaders, actions },
  pluginOptions
) => {
  const { flattenedPlugins, program } = store.getState()

  actions.setWebpackConfig({
    resolve: {
      plugins: [
        new GatsbyThemeComponentShadowingResolverPlugin({
          extensions: getConfig().resolve.extensions,
          themes: flattenedPlugins.map(plugin => {
            return {
              themeDir: plugin.pluginFilepath,
              themeName: plugin.name,
            }
          }),
          projectRoot: program.directory,
        }),
      ],
    },
  })
}
