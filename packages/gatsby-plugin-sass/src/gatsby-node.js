const { cssModulesConfig } = require(`gatsby-1-config-css-modules`)
const { extractTextPlugin } = require(`gatsby-1-config-extract-plugin`)

exports.modifyWebpackConfig = ({ config, stage }, options) => {
  const sassFiles = /\.s[ac]ss$/
  const sassModulesFiles = /\.module\.s[ac]ss$/
  const sassLoader = `sass?${JSON.stringify(options)}`

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
        loader: extractTextPlugin(stage).extract([`css?minimize`, sassLoader]),
      })

      config.loader(`sassModules`, {
        test: sassModulesFiles,
        loader: extractTextPlugin(stage).extract(`style`, [
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
        loader: extractTextPlugin(stage).extract(`style`, [
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
