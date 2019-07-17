/* @flow */
const webpack = require(`webpack`)
const webpackConfig = require(`../utils/webpack.config`)

module.exports = async program => {
  const { directory } = program

  const webpackConfigs = [
    await webpackConfig(program, directory, `build-javascript`),
  ]

  if (process.env.ENABLE_MODERN_BUILDS) {
    webpackConfigs.push(
      await webpackConfig(program, directory, `build-javascript`, {
        modern: true,
      })
    )
  }

  return new Promise((resolve, reject) => {
    webpack(webpackConfigs).run((err, stats) => {
      if (err) {
        reject(err)
        return
      }

      if (stats.hasErrors()) {
        reject(stats.compilation.errors)
        return
      }

      resolve(stats)
    })
  })
}
