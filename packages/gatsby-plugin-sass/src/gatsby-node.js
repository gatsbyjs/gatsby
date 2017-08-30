const ExtractTextPlugin = require(`extract-text-webpack-plugin`)
const { cssModulesConfig } = require(`gatsby-1-config-css-modules`)

exports.modifyWebpackConfig = ({ config, stage }, { precision, includePaths }) => {
  var sassQueries = []
  
  if (precision) {
    sassQueries.push(`precision=${precision}`)
  }

  if (includePaths && includePaths.length > 0) {
    sassQueries.push(`includePaths[]=${includePaths.join(`,`)}`)
  }
  
  const sassFiles = /\.s[ac]ss$/
  const sassModulesFiles = /\.module\.s[ac]ss$/
  const sassLoader = (sassQueries.length > 0) ? `sass?${sassQueries.join(`&`)}` : `sass`

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
        loader: ExtractTextPlugin.extract([`css?minimize`, sassLoader]),
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
