import ExtractTextPlugin from "extract-text-webpack-plugin"
import cssModulesConfig from "gatsby/dist/utils/css-modules-config"

exports.modifyWebpackConfig = (
  { config, stage },
  { postCssPlugins, precision }
) => {
  const sassLoader = precision ? `sass?precision=${precision}` : `sass`

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
        loaders: [`style`, `css`, `postcss`, sassLoader],
      })

      config.loader(`sassModules`, {
        test: /\.module\.s(a|c)ss$/,
        loaders: [`style`, cssModulesConfig(stage), `postcss`, sassLoader],
      })
      return config
    }
    case `build-css`: {
      config.loader(`sass`, {
        test: /\.s(a|c)ss$/,
        exclude: /\.module\.s(a|c)ss$/,
        loader: ExtractTextPlugin.extract([
          `css?minimize`,
          `postcss`,
          sassLoader,
        ]),
      })

      config.loader(`sassModules`, {
        test: /\.module\.s(a|c)ss$/,
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
        test: /\.s(a|c)ss$/,
        exclude: /\.module\.s(a|c)ss$/,
        loader: `null`,
      })

      config.loader(`sassModules`, {
        test: /\.module\.s(a|c)ss$/,
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
        test: /\.s(a|c)ss$/,
        exclude: /\.module\.s(a|c)ss$/,
        loader: `null`,
      })

      config.loader(`sassModules`, {
        test: /\.module\.s(a|c)ss$/,
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
