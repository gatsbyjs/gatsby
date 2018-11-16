const GatsbyThemeComponentShadowingResolverPlugin = require(`.`)

exports.onCreateWebpackConfig = ({
  store,
  stage,
  getConfig,
  rules,
  loaders,
  actions,
}) => {
  const { config, program } = store.getState()
  const themes = config.__experimentalThemes.map(({ resolve }) => resolve)

  if (themes) {
    actions.setWebpackConfig({
      resolve: {
        plugins: [
          new GatsbyThemeComponentShadowingResolverPlugin({
            themes,
            projectRoot: program.directory,
          }),
        ],
      },
    })
  }
}
