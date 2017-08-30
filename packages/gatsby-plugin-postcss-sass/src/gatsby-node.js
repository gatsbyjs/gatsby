const ExtractTextPlugin = require(`extract-text-webpack-plugin`)
const { cssModulesConfig } = require(`gatsby-1-config-css-modules`)

exports.modifyWebpackConfig = (
  { config, stage },
  { postCssPlugins, precision, includePaths }
) => {
  // Pass in plugins regardless of stage.
  // If none specified, fallback to Gatsby default postcss plugins.
  if (postCssPlugins) {
    config.merge(current => {
      current.postcss = postCssPlugins
      return current
    })
  }

  var sassQueries = []

  if (precision) {
    sassQueries.push(`precision=${precision}`)
  }

  if (includePaths && includePaths.length > 0) {
    sassQueries.push(`includePaths[]=${includePaths.join(',')}`)
  }

  const sassFiles = /\.s[ac]ss$/
  const sassModulesFiles = /\.module\.s[ac]ss$/
  const sassLoader = (sassQueries.length > 0) ? `sass?${sassQueries.join('&')}` : `sass`

  switch (stage) {
    case `develop`: {
      config.loader(`sass`, {
        test: sassFiles,
        exclude: sassModulesFiles,
        loaders: [`style`, `css`, `postcss`, sassLoader],
      })

      config.loader(`sassModules`, {
        test: sassModulesFiles,
        loaders: [`style`, cssModulesConfig(stage), `postcss`, sassLoader],
      })
      return config
    }
    case `build-css`: {
      config.loader(`sass`, {
        test: sassFiles,
        exclude: sassModulesFiles,
        loader: ExtractTextPlugin.extract([
          `css?minimize`,
          `postcss`,
          sassLoader,
        ]),
      })

      config.loader(`sassModules`, {
        test: sassModulesFiles,
        loader: ExtractTextPlugin.extract(`style`, [
          cssModulesConfig(stage),
          `postcss`,
          sassLoader,
        ]),
      })
      return config
    }
    case `develop-html`:
    case `build-html`: {
      config.loader(`sass`, {
        test: sassFiles,
        exclude: sassModulesFiles,
        loader: `null`,
      })

      config.loader(`sassModules`, {
        test: sassModulesFiles,
        loader: ExtractTextPlugin.extract(`style`, [
          cssModulesConfig(stage),
          `postcss`,
          sassLoader,
        ]),
      })
      return config
    }
    case `build-javascript`: {
      config.loader(`sass`, {
        test: sassFiles,
        exclude: sassModulesFiles,
        loader: `null`,
      })

      config.loader(`sassModules`, {
        test: sassModulesFiles,
        loader: ExtractTextPlugin.extract(`style`, [
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
