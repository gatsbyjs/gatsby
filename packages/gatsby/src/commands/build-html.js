/* @flow */
const webpack = require(`webpack`)
const fs = require(`fs`)

const webpackConfig = require(`../utils/webpack.config`)
const { createErrorFromString } = require(`gatsby-cli/lib/reporter/errors`)
const renderHTMLQueue = require(`../utils/html-renderer-queue`)
const telemetry = require(`gatsby-telemetry`)

const runWebpack = compilerConfig =>
  new Promise((resolve, reject) => {
    webpack(compilerConfig).run((e, stats) => {
      if (e) {
        reject(e)
      } else {
        resolve(stats)
      }
    })
  })

const doBuildRenderer = async (program, webpackConfig) => {
  const { directory } = program
  const stats = await runWebpack(webpackConfig)
  const outputFile = `${directory}/public/render-page.js`
  if (stats.hasErrors()) {
    let webpackErrors = stats.toJson().errors.filter(Boolean)
    const error = webpackErrors.length
      ? createErrorFromString(webpackErrors[0], `${outputFile}.map`)
      : new Error(
          `There was an issue while building the site: ` +
            `\n\n${stats.toString()}`
        )
    throw error
  }
}

const buildRenderer = async (program, stage) => {
  const { directory } = program
  const config = await webpackConfig(program, directory, stage, null)
  await doBuildRenderer(program, config)
}

async function buildPages({ program, pagePaths, activity }) {
  const { directory } = program
  telemetry.decorateEvent(`BUILD_END`, {
    siteMeasurements: { pagesCount: pagePaths.length },
  })

  const outputFile = `${directory}/public/render-page.js`
  try {
    await renderHTMLQueue(outputFile, pagePaths, activity)
    try {
      await fs.unlink(outputFile)
      await fs.unlink(`${outputFile}.map`)
    } catch (e) {
      // This function will fail on Windows with no further consequences.
    }
  } catch (e) {
    const prettyError = createErrorFromString(e.stack, `${outputFile}.map`)
    prettyError.context = e.context
    throw prettyError
  }
}

module.exports = {
  buildRenderer,
  buildPages,
}
