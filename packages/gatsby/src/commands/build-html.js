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

async function buildRenderPage(program) {
  const { directory } = program
  const compilerConfig = await webpackConfig(
    program,
    directory,
    `build-html`,
    null
  )
  const stats = await runWebpack(compilerConfig)
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

async function buildPages({ program, pages }) {
  const { directory } = program
  telemetry.decorateEvent(`BUILD_END`, {
    siteMeasurements: { pagesCount: pages.length },
  })
  const dirtyPages = [...pages.keys()]

  const outputFile = `${directory}/public/render-page.js`
  try {
    await renderHTMLQueue(outputFile, dirtyPages)
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

module.exports = async ({ program, pages }) => {
  await buildRenderPage(program)
  await buildPages({ program, pages })
}
