import ExtractTextPlugin from "extract-text-webpack-plugin"
import cssModulesConfig from "gatsby/dist/utils/css-modules-config"

exports.modifyWebpackConfig = ({ config, stage }, { precision }) => {
  const sassLoader = precision ? `sass?precision=${precision}` : `sass`

  switch (stage) {
    case `develop`: {
      config.loader(`sass`, {
        test: /\.s(a|c)ss$/,
        exclude: /\.module\.s(a|c)ss$/,
        loaders: [`style`, `css`, sassLoader],
      })

      config.loader(`sassModules`, {
        test: /\.module\.s(a|c)ss$/,
        loaders: [`style`, cssModulesConfig(stage), sassLoader],
      })
      return config
    }
    case `build-css`: {
      config.loader(`sass`, {
        test: /\.s(a|c)ss$/,
        exclude: /\.module\.s(a|c)ss$/,
        loader: ExtractTextPlugin.extract([`css?minimize`, sassLoader]),
      })

      config.loader(`sassModules`, {
        test: /\.module\.s(a|c)ss$/,
        loader: ExtractTextPlugin.extract(`style`, [cssModulesConfig(stage), sassLoader]),
      })
      return config
    }
    case `develop-html`:
    case `build-html`:
    case `build-javascript`: {
      config.loader(`sass`, {
        test: /\.s(a|c)ss$/,
        exclude: /\.module\.s(a|c)ss$/,
        loader: `null`,
      })

      config.loader(`sassModules`, {
        test: /\.module\.s(a|c)ss$/,
        loader: ExtractTextPlugin.extract(`style`, [cssModulesConfig(stage), sassLoader]),
      })
      return config
    }
    default: {
      return config
    }
  }
}
