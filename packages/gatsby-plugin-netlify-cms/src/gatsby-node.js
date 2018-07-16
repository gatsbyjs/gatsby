import path from "path"
import { get, mapValues, isPlainObject, trim, pickBy } from "lodash"
import webpack from "webpack"
import HtmlWebpackPlugin from "html-webpack-plugin"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import UglifyJsPlugin from "uglifyjs-webpack-plugin"
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
  { store, stage, getConfig, plugins },
  {
    modulePath,
    stylesPath,
    publicPath = `admin`,
    enableIdentityWidget = true,
    htmlTitle = `Content Manager`,
  }
) => {
  if ([`develop`, `build-javascript`].includes(stage)) {
    const gatsbyConfig = getConfig()
    const { program } = store.getState()
    const publicPathClean = trim(publicPath, `/`)
    const config = {
      ...gatsbyConfig,
      mode: `none`,
      /**
       * Two entries, one for the core CMS styles, and a `styles` entry, the
       * output of which will be applied to the preview pane iframe only. Use
       * `pickBy` to filter out empty entries.
       */
      entry: pickBy({
        cms: [
          `${__dirname}/cms.js`,
          modulePath,
          enableIdentityWidget && `${__dirname}/cms-identity.js`,
        ].filter(p => p),
        styles: stylesPath,
      }),
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
            ![UglifyJsPlugin, MiniCssExtractPlugin, FriendlyErrorsPlugin].find(
              Plugin => plugin instanceof Plugin
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
        }),

        /**
         * Set flag if custom styles path is added to plugin options.
         */
        plugins.define({
          NETLIFY_CMS_PREVIEW_STYLES_SET: !!stylesPath,
        }),
      ].filter(p => p),

      /**
       * Remove common chunks style optimizations from Gatsby's default config,
       * they cause issues for our pre-bundled code.
       */
      optimization: {},
    }
    webpack(config).run()
  }
}
