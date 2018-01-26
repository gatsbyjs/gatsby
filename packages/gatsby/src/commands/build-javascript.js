/* @flow */
const webpack = require(`webpack`)
const webpackConfig = require(`../utils/webpack.config`)

module.exports = async program => {
  const { directory } = program

  const compilerConfig = await webpackConfig(
    program,
    directory,
    `build-javascript`
  )

  return new Promise((resolve, reject) => {
    webpack(compilerConfig).run((err, stats) => {
      if (err) {
        reject(err)
        return
      }

      const jsonStats = stats.toJson()
      if (jsonStats.errors && jsonStats.errors.length > 0) {
        reject(jsonStats.errors[0])
        return
      }

      resolve()
    })
  })
}
