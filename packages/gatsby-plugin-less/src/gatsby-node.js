import ExtractTextPlugin from "extract-text-webpack-plugin"
import cssModulesConfig from "gatsby-1-config-css-modules"

exports.modifyWebpackConfig = ({ config, stage }) => {
  const lessFiles = /\.less$/
  const lessModulesFiles = /\.module\.less$/

  switch (stage) {
    case `develop`: {
      config.loader(`less`, {
        test: lessFiles,
        exclude: lessModulesFiles,
        loaders: [`style`, `css`, `less`],
      })

      config.loader(`lessModules`, {
        test: lessModulesFiles,
        loaders: [`style`, cssModulesConfig(stage), `less`],
      })
      return config
    }
    case `build-css`: {
      config.loader(`less`, {
        test: lessFiles,
        exclude: lessModulesFiles,
        loader: ExtractTextPlugin.extract([`css?minimize`, `less`]),
      })

      config.loader(`lessModules`, {
        test: lessModulesFiles,
        loader: ExtractTextPlugin.extract(`style`, [cssModulesConfig(stage), `less`]),
      })
      return config
    }
    case `develop-html`:
    case `build-html`:
    case `build-javascript`: {
      config.loader(`less`, {
        test: lessFiles,
        exclude: lessModulesFiles,
        loader: `null`,
      })

      config.loader(`lessModules`, {
        test: lessModulesFiles,
        loader: ExtractTextPlugin.extract(`style`, [cssModulesConfig(stage), `less`]),
      })
      return config
    }
    default: {
      return config
    }
  }
}
