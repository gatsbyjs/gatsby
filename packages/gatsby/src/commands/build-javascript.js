/* @flow */
const webpack = require(`webpack`)
const webpackConfig = require(`../utils/webpack.config`)

module.exports = async (program) => {
  const { directory } = program

  const compilerConfig = await webpackConfig(
    program,
    directory,
    `build-javascript`
  )

  return new Promise(resolve => {
    webpack(compilerConfig.resolve()).run(() => resolve())
  })
}
