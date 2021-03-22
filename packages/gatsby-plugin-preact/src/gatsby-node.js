const PreactRefreshPlugin = require(`@prefresh/webpack`)

exports.onCreateBabelConfig = ({ actions, stage }) => {
  if (stage === `develop`) {
    // enable react-refresh babel plugin to enable hooks
    // @see https://github.com/JoviDeCroock/prefresh/tree/master/packages/webpack#using-hooks
    actions.setBabelPlugin({
      name: `@prefresh/babel-plugin`,
      stage,
    })
  }
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
  }

  // add preact to the framework bundle
  if (stage === `build-javascript` || stage === `develop`) {
    const webpackConfig = getConfig()
    if (
      webpackConfig?.optimization?.splitChunks?.cacheGroups?.framework?.test
    ) {
      const frameworkRegex =
        webpackConfig.optimization.splitChunks.cacheGroups.framework.test

      // replace react libs with preact
      webpackConfig.optimization.splitChunks.cacheGroups.framework.test = module =>
        /(?<!node_modules.*)[\\/]node_modules[\\/](preact)[\\/]/.test(
          module.resource
        ) || frameworkRegex.test(module.resource)

      actions.replaceWebpackConfig(webpackConfig)
    }
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
