const { cssModulesConfig } = require(`gatsby-1-config-css-modules`)

exports.modifyWebpackConfig = ({ config, stage }, options) => {
  const sassFiles = /\.s[ac]ss$/
  const sassModulesFiles = /\.module\.s[ac]ss$/
  const sassLoader = `sass?${JSON.stringify(options)}`

  /**
   * Get the first instance of `ExtractTextPlugin` from the plugins array. This
   * relies on other plugins not intentionally inserting their own instance of
   * `ExtractTextPlugin` before Gatsby's own.
   */
  const extractPlugin = config
    .resolve()
    .plugins.find(
      plugin =>
        plugin.constructor && plugin.constructor.name === `ExtractTextPlugin`
    )

  switch (stage) {
    case `develop`: {
      config.loader(`sass`, {
        test: sassFiles,
        exclude: sassModulesFiles,
        loaders: [`style`, `css`, sassLoader],
      })

      config.loader(`sassModules`, {
        test: sassModulesFiles,
        loaders: [`style`, cssModulesConfig(stage), sassLoader],
      })
      return config
    }
    case `build-css`: {
      config.loader(`sass`, {
        test: sassFiles,
        exclude: sassModulesFiles,
        loader: extractPlugin.extract([`css?minimize`, sassLoader]),
      })

      config.loader(`sassModules`, {
        test: sassModulesFiles,
        loader: extractPlugin.extract(`style`, [
          cssModulesConfig(stage),
          sassLoader,
        ]),
      })

      return config
    }
    case `develop-html`:
    case `build-html`:
    case `build-javascript`: {
      config.loader(`sass`, {
        test: sassFiles,
        exclude: sassModulesFiles,
        loader: `null`,
      })

      config.loader(`sassModules`, {
        test: sassModulesFiles,
        loader: extractPlugin.extract(`style`, [
          cssModulesConfig(stage),
          sassLoader,
        ]),
      })

      return config
    }
    default: {
      return config
    }
  }
}
