/* @flow */
const webpack = require(`webpack`)
const webpackConfig = require(`../utils/webpack.config`)

const { reportWebpackWarnings } = require(`../utils/webpack-error-utils`)

module.exports = async (program, { parentSpan }) => {
  const { directory } = program

  const compilerConfig = await webpackConfig(
    program,
    directory,
    `build-javascript`,
    null,
    { parentSpan }
  )

  return new Promise((resolve, reject) => {
    webpack(compilerConfig).run((err, stats) => {
      if (err) {
        reject(err)
        return
      }

      reportWebpackWarnings(stats)

      if (stats.hasErrors()) {
        reject(stats.compilation.errors)
        return
      }

      resolve(stats)
    })
  })
}
