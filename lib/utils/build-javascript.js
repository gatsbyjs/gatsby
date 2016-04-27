import webpack from 'webpack'
import webpackConfig from './webpack.config'

module.exports = (program, callback) => {
  const { directory } = program

  const compilerConfig = webpackConfig(program, directory, 'build-javascript')

  return webpack(compilerConfig.resolve()).run((err, stats) => callback(err, stats))
}
