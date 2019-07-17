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
    webpack(webpackConfigs).run((err, webpackStats) => {
      if (err) {
        reject(err)
        return
      }

      if (process.env.ENABLE_MODERN_BUILDS) {
        const [legacyStats, modernStats] = webpackStats.stats

        if (legacyStats.hasErrors()) {
          reject(legacyStats.compilation.errors)
          return
        }

        if (modernStats.hasErrors()) {
          reject(modernStats.compilation.errors)
          return
        }
      } else {
        if (webpackStats.hasErrors()) {
          reject(webpackStats.compilation.errors)
          return
        }
      }

      resolve(webpackStats)
    })
  })
}
