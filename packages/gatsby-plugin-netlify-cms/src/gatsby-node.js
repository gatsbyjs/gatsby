import path from "path"
import { get, mapValues, isPlainObject, trim } from "lodash"
import webpack from "webpack"
import HtmlWebpackPlugin from "html-webpack-plugin"
import HtmlWebpackExcludeAssetsPlugin from "html-webpack-exclude-assets-plugin"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import FriendlyErrorsPlugin from "friendly-errors-webpack-plugin"

/**
 * Deep mapping function for plain objects and arrays. Allows any value,
 * including an object or array, to be transformed.
 */
function deepMap(obj, fn) {
  /**
   * If the transform function transforms the value, regardless of type,
   * return the transformed value.
   */
  const mapped = fn(obj)
  if (mapped !== obj) {
    return mapped
  }

  /**
   * Recursively deep map arrays and plain objects, otherwise return the value.
   */
  if (Array.isArray(obj)) {
    return obj.map(value => deepMap(value, fn))
  }
  if (isPlainObject(obj)) {
    return mapValues(obj, value => deepMap(value, fn))
  }
  return obj
}

exports.onCreateWebpackConfig = (
  { store, stage, getConfig, plugins, pathPrefix },
  {
    modulePath,
    publicPath = `admin`,
    enableIdentityWidget = true,
    htmlTitle = `Content Manager`,
    manualInit = false,
  }
) => {
  if ([`develop`, `build-javascript`].includes(stage)) {
    const gatsbyConfig = getConfig()
    const { program } = store.getState()
    const publicPathClean = trim(publicPath, `/`)
    const config = {
      ...gatsbyConfig,
      entry: {
        cms: [
          manualInit && `${__dirname}/cms-manual-init.js`,
          `${__dirname}/cms.js`,
          modulePath,
          enableIdentityWidget && `${__dirname}/cms-identity.js`,
        ].filter(p => p),
      },
      output: {
        path: path.join(program.directory, `public`, publicPathClean),
      },
      module: {
        /**
         * Manually swap `style-loader` for `MiniCssExtractPlugin.loader`.
         * `style-loader` is only used in development, and doesn't allow us to
         * pass the `styles` entry css path to Netlify CMS.
         */
        rules: deepMap(gatsbyConfig.module.rules, value => {
          if (
            typeof get(value, `loader`) === `string` &&
            value.loader.includes(`style-loader`)
          ) {
            return { ...value, loader: MiniCssExtractPlugin.loader }
          }
          return value
        }),
      },
      plugins: [
        /**
         * Remove plugins that either attempt to process the core Netlify CMS
         * application, or that we want to replace with our own instance.
         */
        ...gatsbyConfig.plugins.filter(
          plugin =>
            ![`MiniCssExtractPlugin`, `GatsbyWebpackStatsExtractor`].find(
              pluginName =>
                plugin.constructor && plugin.constructor.name === pluginName
            )
        ),

        /**
         * Provide a custom message for Netlify CMS compilation success.
         */
        stage === `develop` &&
          new FriendlyErrorsPlugin({
            clearConsole: false,
            compilationSuccessInfo: {
              messages: [
                `Netlify CMS is running at ${
                  program.ssl ? `https` : `http`
                }://${program.host}:${program.port}/${publicPathClean}/`,
              ],
            },
          }),

        /**
         * Use a simple filename with no hash so we can access from source by
         * path.
         */
        new MiniCssExtractPlugin({
          filename: `[name].css`,
        }),

        /**
         * Auto generate CMS index.html page.
         */
        new HtmlWebpackPlugin({
          title: htmlTitle,
          chunks: [`cms`],
          excludeAssets: [/cms.css/],
        }),

        /**
         * Exclude CSS from index.html, as any imported styles are assumed to be
         * targeting the editor preview pane. Uses `excludeAssets` option from
         * `HtmlWebpackPlugin` config.
         */
        new HtmlWebpackExcludeAssetsPlugin(),

        /**
         * Pass in needed Gatsby config values.
         */
        new webpack.DefinePlugin({
          __PATH__PREFIX__: pathPrefix,
          CMS_PUBLIC_PATH: JSON.stringify(publicPath),
        }),
      ].filter(p => p),

      /**
       * Remove mode and common chunks style optimizations from Gatsby's default
       * config, they cause issues for our pre-bundled code.
       */
      mode: `none`,
      optimization: {},
      devtool: stage === `develop` ? `cheap-module-source-map` : `source-map`,
    }

    if (stage === `develop`) {
      webpack(config).watch({}, () => {})
    } else {
      webpack(config).run()
    }
  }
}
