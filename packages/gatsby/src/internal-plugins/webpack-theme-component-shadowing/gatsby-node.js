const GatsbyThemeComponentShadowingResolverPlugin = require(`.`)

exports.onCreateWebpackConfig = (
  { store, stage, getConfig, rules, loaders, actions },
  pluginOptions
) => {
  const { program, themes } = store.getState()

  if (themes.themes) {
    actions.setWebpackConfig({
      resolve: {
        plugins: [
          new GatsbyThemeComponentShadowingResolverPlugin({
            themes: themes.themes,
            projectRoot: program.directory,
          }),
        ],
      },
    })
  }
}
