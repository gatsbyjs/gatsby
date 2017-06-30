import ExtractTextPlugin from "extract-text-webpack-plugin"

exports.modifyWebpackConfig = ({ config, stage }) => {
  const cssModulesConf = `css?modules&minimize&importLoaders=1`
  const cssModulesConfDev = `${cssModulesConf}&sourceMap&localIdentName=[name]---[local]---[hash:base64:5]`

  console.log(`stage`, stage)
  switch (stage) {
    case `develop`: {
      config.loader(`sass`, {
        test: /\.s(a|c)ss$/,
        exclude: /\.module\.s(a|c)ss$/,
        loaders: [`style`, `css`, `sass`],
      })

      config.loader(`sassModules`, {
        test: /\.module\.s(a|c)ss$/,
        loaders: [`style`, cssModulesConfDev, `sass`],
      })
      return config
    }
    case `build-css`: {
      config.loader(`sass`, {
        test: /\.s(a|c)ss$/,
        exclude: /\.module\.s(a|c)ss$/,
        loader: ExtractTextPlugin.extract([`css?minimize`, `sass`]),
      })

      config.loader(`sassModules`, {
        test: /\.module\.s(a|c)ss$/,
        loader: ExtractTextPlugin.extract(`style`, [cssModulesConf, `sass`]),
      })
      return config
    }
    case `build-html`: {
      config.loader(`sass`, {
        test: /\.s(a|c)ss$/,
        exclude: /\.module\.s(a|c)ss$/,
        loader: `null`,
      })

      config.loader(`sassModules`, {
        test: /\.module\.s(a|c)ss$/,
        loader: ExtractTextPlugin.extract(`style`, [cssModulesConf, `sass`]),
      })
      return config
    }
    case `build-javascript`: {
      config.loader(`sass`, {
        test: /\.s(a|c)ss$/,
        exclude: /\.module\.s(a|c)ss$/,
        loader: ExtractTextPlugin.extract([`css`, `sass`]),
      })

      config.loader(`sassModules`, {
        test: /\.module\.s(a|c)ss$/,
        loader: ExtractTextPlugin.extract(`style`, [cssModulesConf, `sass`]),
      })
      return config
    }
    default: {
      return config
    }
  }
}
