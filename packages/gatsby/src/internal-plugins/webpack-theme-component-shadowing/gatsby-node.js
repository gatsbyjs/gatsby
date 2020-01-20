const GatsbyThemeComponentShadowingResolverPlugin = require(`.`)

exports.onCreateWebpackConfig = (
  { store, stage, getConfig, rules, loaders, actions },
  pluginOptions
) => {
  const { themes, flattenedPlugins, program } = store.getState()

  actions.setWebpackConfig({
    resolve: {
      plugins: [
        new GatsbyThemeComponentShadowingResolverPlugin({
          extensions: getConfig().resolve.extensions,
          themes: themes.themes
            ? themes.themes
            : flattenedPlugins.map(plugin => {
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
