const GatsbyThemeComponentShadowingResolverPlugin = require(`.`)

exports.onCreateWebpackConfig = (
  { store, stage, getConfig, rules, loaders, actions },
  pluginOptions
) => {
  const { config, program } = store.getState()

  if (config.__experimentalThemes) {
    actions.setWebpackConfig({
      resolve: {
        plugins: [
          new GatsbyThemeComponentShadowingResolverPlugin({
            themes: config.__experimentalThemes.map(({ resolve }) => resolve),
            projectRoot: program.directory,
          }),
        ],
      },
    })
  }
}
