/* @flow */
const webpack = require(`webpack`)
const fs = require(`fs-extra`)
const webpackConfig = require(`../utils/webpack.config`)

module.exports = async (program: any) => {
  const { directory } = program

  const compilerConfig = await webpackConfig(program, directory, `build-css`)

  return new Promise((resolve, reject) => {
    webpack(compilerConfig.resolve()).run(err => {
      if (err) {
        reject(err)
      }

      // We don't want any javascript produced by this step in the process.
      try {
        fs.unlinkSync(`${directory}/public/bundle-for-css.js`)
      } catch (e) {
        // ignore.
      }

      // Ensure there's a styles.css file in public so tools that expect it
      // can find it.
      fs.ensureFile(`${directory}/public/styles.css`, err => {
        resolve(err)
      })
    })
  })
}
