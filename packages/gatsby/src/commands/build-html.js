/* @flow */
const webpack = require(`webpack`)
const fs = require(`fs-extra`)

const webpackConfig = require(`../utils/webpack.config`)
const { createErrorFromString } = require(`gatsby-cli/lib/reporter/errors`)
const renderHTMLQueue = require(`../utils/html-renderer-queue`)
const telemetry = require(`gatsby-telemetry`)

const runWebpack = compilerConfig =>
  new Promise((resolve, reject) => {
    webpack(compilerConfig).run((err, stats) => {
      if (err) {
        reject(err)
      } else {
        resolve(stats)
      }
    })
  })

const doBuildRenderer = async (program, webpackConfig) => {
  const { directory } = program
  const stats = await runWebpack(webpackConfig)
  // render-page.js is hard coded in webpack.config
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
  return outputFile
}

const buildRenderer = async (program, stage) => {
  const { directory } = program
  const config = await webpackConfig(program, directory, stage, null)
  return await doBuildRenderer(program, config)
}

const deleteRenderer = async rendererPath => {
  try {
    await fs.remove(rendererPath)
    await fs.remove(`${rendererPath}.map`)
  } catch (e) {
    // This function will fail on Windows with no further consequences.
  }
}

const doBuildPages = async ({ rendererPath, pagePaths, activity }) => {
  telemetry.decorateEvent(`BUILD_END`, {
    siteMeasurements: { pagesCount: pagePaths.length },
  })

  try {
    await renderHTMLQueue(rendererPath, pagePaths, activity)
  } catch (e) {
    const prettyError = createErrorFromString(e.stack, `${rendererPath}.map`)
    prettyError.context = e.context
    throw prettyError
  }
}

const buildPages = async ({ program, stage, pagePaths, activity }) => {
  const rendererPath = await buildRenderer(program, stage)
  await doBuildPages({ rendererPath, pagePaths, activity })
  await deleteRenderer(rendererPath)
}

module.exports = {
  buildPages,
}
