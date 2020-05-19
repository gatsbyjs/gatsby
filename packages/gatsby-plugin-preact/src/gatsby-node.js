const PreactRefreshPlugin = require(`@prefresh/webpack`)

exports.onPreInit = () => {
  // force fast-refresh in gatsby
  process.env.GATSBY_HOT_LOADER = `fast-refresh`
}

exports.onCreateWebpackConfig = ({ stage, actions, getConfig }) => {
  const webpackPlugins = []
  if (stage === `develop`) {
    webpackPlugins.push(new PreactRefreshPlugin())

    // remove React refresh plugin, we want to add preact refresh instead.
    const webpackConfig = getConfig()
    webpackConfig.plugins = webpackConfig.plugins.filter(
      plugin => plugin.constructor.name !== `ReactRefreshPlugin`
    )
    actions.replaceWebpackConfig(webpackConfig)

    // enable react-refresh babel plugin to enable hooks
    // @see https://github.com/JoviDeCroock/prefresh/tree/master/packages/webpack#using-hooks
    actions.setBabelPlugin({
      name: `react-refresh/babel`,
    })
  }

  actions.setWebpackConfig({
    resolve: {
      alias: {
        react: `preact/compat`,
        "react-dom": `preact/compat`,
      },
    },
    plugins: webpackPlugins,
  })
}
