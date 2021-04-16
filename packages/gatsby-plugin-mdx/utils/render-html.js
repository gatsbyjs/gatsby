const webpack = require(`webpack`)
const path = require(`path`)
const evaluate = require(`eval`)
const debug = require(`debug`)(`gatsby-plugin-mdx:render-html`)
const { default: PQueue } = require(`p-queue`)

// const StaticSiteGeneratorPlugin = require("static-site-generator-webpack-plugin");
const { cloneDeep } = require(`lodash`)
// const { store: ogStore} = require("gatsby/dist/redux");
const DataLoader = require(`dataloader`)

const queue = new PQueue({
  concurrency: parseInt(process.env.GATSBY_MDX_CONCURRENCY) || 4,
})

let count = 0
queue.on(`active`, () => {
  debug(
    `Working on item #${++count}.  Size: ${queue.size}  Pending: ${
      queue.pending
    }`
  )
})

exports.mdxHTMLLoader = ({ cache, reporter, store }) =>
  new DataLoader(
    async keys => {
      const webpackConfig = cloneDeep(store.getState().webpack)
      const outputPath = path.join(cache.directory, `webpack`)
      // something sets externals, which will cause React to be undefined
      webpackConfig.externals = undefined
      webpackConfig.entry = require.resolve(`./wrap-root-render-html-entry.js`)
      webpackConfig.output = {
        filename: `output.js`,
        path: outputPath,
        libraryTarget: `commonjs`,
      }
      webpackConfig.plugins = webpackConfig.plugins || []
      webpackConfig.externalsPresets = {
        node: true,
      }
      const compiler = webpack(webpackConfig)

      return queue.add(
        () =>
          new Promise(resolve => {
            compiler.run((err, stats) => {
              // error handling bonanza
              if (err) {
                reporter.error(err.stack || err)
                if (err.details) {
                  reporter.error(`gatsby-plugin-mdx\n` + err.details)
                }
                return
              }

              const info = stats.toJson()

              if (stats.hasErrors()) {
                reporter.error(`gatsby-plugin-mdx\n` + info.errors)
              }

              if (stats.hasWarnings()) {
                reporter.warn(`gatsby-plugin-mdx\n` + info.warnings)
              }

              const renderMdxBody = require(path.join(outputPath, `output.js`))
                .default

              resolve(
                keys.map(({ body }) =>
                  renderMdxBody
                    ? renderMdxBody(body)
                    : new Error(
                        `renderMdxBody was unavailable when rendering html.`
                      )
                )
              )
            })
          })
      )
    },
    { cacheKeyFn: ({ id }) => id }
  )
