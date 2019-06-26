const GatsbyThemeComponentShadowingResolverPlugin = require(`.`)

exports.onCreateWebpackConfig = (
  { store, stage, getConfig, rules, loaders, actions },
  pluginOptions
) => {
  const { themes, plugins } = store.getState()

  actions.setWebpackConfig({
    resolve: {
      plugins: [
        new GatsbyThemeComponentShadowingResolverPlugin({
          themes: themes.themes
            ? themes.themes
            : plugins.map(plugin => {
                return {
                  themeDir: plugin.pluginFilepath,
                  themeName: plugin.name,
                }
              }),
        }),
      ],
    },
  })
}
