const webpack = require(`webpack`)
const HtmlWebpackPlugin = require(`html-webpack-plugin`)

exports.onCreateWebpackConfig = async (args, { modulePath }) => {
  const { stage, getConfig, plugins, store } = args

  if (stage === `develop` || stage === `build-javascript`) {
    const gatsbyWebpackConfig = getConfig()

    const cmsWebpackConfig = {
      ...gatsbyWebpackConfig,

      optimization: undefined,

       // Fixes error in netlify-cms: Uncaught TypeError: Super expression must either be null or a function, not undefined
      mode: `none`,

      entry: {
        cms: [`${__dirname}/cms.js`, modulePath].filter(p => p),
      },

      plugins: [
        plugins.extractText(),

        new HtmlWebpackPlugin({
          title: `Content Manager`,
          filename: `admin/index.html`,
          chunks: [`cms`],
        }),
      ],
    }

    const compiler = webpack(cmsWebpackConfig)

    if (stage === `develop`) {
      const { config: gatsbyConfig } = store.getState()

      const developMiddleware = (app) => {
        gatsbyConfig.developMiddleware?.(app)

        app.use(
          require(`webpack-dev-middleware`)(compiler, {
            logLevel: `trace`,
            publicPath: cmsWebpackConfig.output.publicPath,
            stats: `errors-only`,
          })
        )
      }

      store.dispatch({
        type: `SET_SITE_CONFIG`,
        payload: {
          ...gatsbyConfig,

          // Joy schema validation fails with pathPrefix = ''
          pathPrefix: gatsbyConfig.pathPrefix || undefined,

          developMiddleware,
        },
      })
    } else {
      await new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
          if (err) {
            reject(err)
            return
          }

          const jsonStats = stats.toJson()
          if (jsonStats.errors && jsonStats.errors.length > 0) {
            reject(jsonStats.errors)
            return
          }

          resolve()
        })
      })
    }
  }
}
