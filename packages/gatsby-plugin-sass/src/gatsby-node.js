const ExtractTextPlugin = require(`extract-text-webpack-plugin`)
const { cssModulesConfig } = require(`gatsby-1-config-css-modules`)

const extractSass = new ExtractTextPlugin(`styles.css`, { allChunks: true })

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
        loader: extractSass.extract([`css?minimize`, sassLoader]),
      })

      config.loader(`sassModules`, {
        test: sassModulesFiles,
        loader: extractSass.extract(`style`, [
          cssModulesConfig(stage),
          sassLoader,
        ]),
      })

      config.merge({
        plugins: [extractSass],
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
        loader: extractSass.extract(`style`, [
          cssModulesConfig(stage),
          sassLoader,
        ]),
      })

      config.merge({
        plugins: [extractSass],
      })

      return config
    }
    default: {
      return config
    }
  }
}
