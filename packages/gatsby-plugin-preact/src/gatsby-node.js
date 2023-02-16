const PreactRefreshPlugin = require(`@prefresh/webpack`)

const FRAMEWORK_BUNDLES_PREACT = [
  `preact`,
  `react`,
  `react-dom`,
  `scheduler`,
  `prop-types`,
]

// This regex ignores nested copies of framework libraries so they're bundled with their issuer
const FRAMEWORK_BUNDLES_REGEX_PREACT = new RegExp(
  `(?<!node_modules.*)[\\\\/]node_modules[\\\\/](${FRAMEWORK_BUNDLES_PREACT.join(
    `|`
  )})[\\\\/]`
)

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
      // replace react libs with preact
      webpackConfig.optimization.splitChunks.cacheGroups.framework.test =
        FRAMEWORK_BUNDLES_REGEX_PREACT
    }
  }

  actions.replaceWebpackConfig(webpackConfig)

  actions.setWebpackConfig({
    resolve: {
      alias: {
        react: `preact/compat`,
        "react-dom/test-utils": `preact/test-utils`,
        "react-dom": `preact/compat`,
        "react/jsx-runtime": `preact/jsx-runtime`,
      },
    },
    plugins: webpackPlugins,
  })
}
