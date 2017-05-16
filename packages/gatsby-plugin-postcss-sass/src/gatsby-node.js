import ExtractTextPlugin from "extract-text-webpack-plugin"

exports.modifyWebpackConfig = ({ config, stage }, { postCssPlugins }) => {
  const cssModulesConf = `css?modules&minimize&importLoaders=1`
  const cssModulesConfDev = `${cssModulesConf}&sourceMap&localIdentName=[name]---[local]---[hash:base64:5]`

  // Pass in plugins regardless of stage.
  // If none specified, fallback to Gatsby default postcss plugins.
  if (postCssPlugins) {
    config.merge(current => {
      current.postcss = postCssPlugins
      return current
    })
  }

  switch (stage) {
    case `develop`: {
      config.loader(`sass`, {
        test: /\.s(a|c)ss$/,
        exclude: /\.module\.s(a|c)ss$/,
        loaders: [`style`, `css`, `postcss`, `sass`],
      })

      config.loader(`sassModules`, {
        test: /\.module\.s(a|c)ss$/,
        loaders: [`style`, `cssModulesConfDev`, `postcss`, `sass`],
      })
      return config
    }
    case `build-css`: {
      config.loader(`sass`, {
        test: /\.s(a|c)ss$/,
        exclude: /\.module\.s(a|c)ss$/,
        loader: ExtractTextPlugin.extract([`css?minimize`, `postcss`, `sass`]),
      })

      config.loader(`sassModules`, {
        test: /\.module\.s(a|c)ss$/,
        loader: ExtractTextPlugin.extract(`style`, [
          cssModulesConf,
          `postcss`,
          `sass`,
        ]),
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
        loader: ExtractTextPlugin.extract(`style`, [
          cssModulesConf,
          `postcss`,
          `sass`,
        ]),
      })
      return config
    }
    case `build-javascript`: {
      config.loader(`sass`, {
        test: /\.s(a|c)ss$/,
        exclude: /\.module\.s(a|c)ss$/,
        loader: null,
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
