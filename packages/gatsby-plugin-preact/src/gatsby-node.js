const PreactRefreshPlugin = require(`@prefresh/webpack`)

export function onCreateBabelConfig({ actions, stage }) {
  if (stage === `develop`) {
    // enable react-refresh babel plugin to enable hooks
    // @see https://github.com/JoviDeCroock/prefresh/tree/master/packages/webpack#using-hooks
    actions.setBabelPlugin({
      name: `@prefresh/babel-plugin`,
      stage,
    })
  }
}

export function onCreateWebpackConfig({ stage, actions, getConfig }) {
  const webpackPlugins = []
  const webpackConfig = getConfig()

  if (webpackConfig.resolve?.alias) {
    delete webpackConfig.resolve.alias.react
    delete webpackConfig.resolve.alias[`react-dom`]
  }

  if (stage === `develop`) {
    webpackPlugins.push(
      new PreactRefreshPlugin({
        overlay: {
          module: require.resolve(`gatsby/dist/utils/fast-refresh-module`),
        },
      })
    )

    // remove React refresh plugin, we want to add preact refresh instead.
    webpackConfig.plugins = webpackConfig.plugins.filter(
      plugin => plugin.constructor.name !== `ReactRefreshPlugin`
    )

    // add webpack-hot-middleware/client to the commons entry
    webpackConfig.entry.commons.unshift(
      `@gatsbyjs/webpack-hot-middleware/client`
    )
  }

  // add preact to the framework bundle
  if (stage === `build-javascript` || stage === `develop`) {
    if (
      webpackConfig?.optimization?.splitChunks?.cacheGroups?.framework?.test
    ) {
      const frameworkRegex =
        webpackConfig.optimization.splitChunks.cacheGroups.framework.test

      // replace react libs with preact
      webpackConfig.optimization.splitChunks.cacheGroups.framework.test =
        module =>
          /(?<!node_modules.*)[\\/]node_modules[\\/](preact)[\\/]/.test(
            module.resource
          ) || frameworkRegex.test(module.resource)
    }
  }

  actions.replaceWebpackConfig(webpackConfig)

  const extension =
    stage === `build-javascript` || stage === `develop` ? `.module.js` : `.js`
  actions.setWebpackConfig({
    resolve: {
      alias: {
        react: require.resolve(`preact/compat`).replace(`.js`, extension),
        "react-dom/server": require
          .resolve(`preact/compat/server`)
          .replace(`.js`, extension),
        "react-dom": require.resolve(`preact/compat`).replace(`.js`, extension),
      },
    },
    plugins: webpackPlugins,
  })
}
