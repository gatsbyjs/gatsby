/* @flow */
const webpack = require(`webpack`)
const webpackConfig = require(`../utils/webpack.config`)

module.exports = async program => {
  const { directory } = program

  const legacyConfig = await webpackConfig(
    program,
    directory,
    `build-javascript`
  )

  const modernConfig = await webpackConfig(
    program,
    directory,
    `build-javascript`,
    { modern: true }
  )

  return new Promise((resolve, reject) => {
    webpack([legacyConfig, modernConfig]).run((err, stats) => {
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
