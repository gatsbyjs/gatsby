import ExtractTextPlugin from "extract-text-webpack-plugin"
import { cssModulesConfig } from "gatsby-1-config-css-modules"
import path from "path"

exports.modifyWebpackConfig = ({ config, stage }, { theme }) => {
  const lessFiles = /\.less$/
  const lessModulesFiles = /\.module\.less$/

  let themeJson = ``

  if (typeof theme === `string` && theme !== ``) {
    try {
      const themeFile = require(path.resolve(theme))
      themeJson = JSON.stringify(themeFile)
    } catch (err) {
      throw new Error(
        `Couldn't convert js to json object at path: '${theme}'\n${err}`
      )
    }
  } else if (typeof theme === `object`) {
    try {
      themeJson = JSON.stringify(theme)
    } catch (err) {
      throw new Error(
        `Couldn't convert javascript object to json object.\n${err}`
      )
    }
  }

  let lessLoaderDev = ``
  let lessLoaderProd = ``

  if (themeJson) {
    lessLoaderDev = `less?{"sourceMap":true,"modifyVars":${themeJson}}`
    lessLoaderProd = `less?{"modifyVars":${themeJson}}`
  } else {
    lessLoaderDev = `less?{"sourceMap":true}`
    lessLoaderProd = `less`
  }

  switch (stage) {
    case `develop`: {
      config.loader(`less`, {
        test: lessFiles,
        exclude: lessModulesFiles,
        loaders: [`style`, `css`, lessLoaderDev],
      })

      config.loader(`lessModules`, {
        test: lessModulesFiles,
        loaders: [`style`, cssModulesConfig(stage), lessLoaderDev],
      })
      return config
    }
    case `build-css`: {
      config.loader(`less`, {
        test: lessFiles,
        exclude: lessModulesFiles,
        loader: ExtractTextPlugin.extract([`css?minimize`, lessLoaderProd]),
      })

      config.loader(`lessModules`, {
        test: lessModulesFiles,
        loader: ExtractTextPlugin.extract(`style`, [
          cssModulesConfig(stage),
          lessLoaderProd,
        ]),
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
        loader: ExtractTextPlugin.extract(`style`, [
          cssModulesConfig(stage),
          lessLoaderProd,
        ]),
      })
      return config
    }
    default: {
      return config
    }
  }
}
