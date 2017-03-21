import transform from 'coffee-react-transform'
import { compile } from 'coffeescript'

const COFFEE = /\.coffee$/
const CJSX = /\.cjsx$/

export function resolvableExtensions() {
  return [ `.coffee`, `.cjsx` ]
}

export function modifyWebpackConfig(ctx) {
  // we need to use Babel to get around the ES6 export issue
  const { config } = ctx.args
  config.loader('coffee', {
    test: COFFEE,
    loaders: [ 'babel', 'coffee' ]
  })
  config.loader('cjsx', {
    test: CJSX,
    loaders: [ 'babel', 'coffee', 'cjsx' ]
  })
}

export function preprocessSource(ctx) {
  const { args: { filename, contents }, pluginOptions } = ctx
  // don't need to account for ES6, Babylon can parse it
  if (CJSX.test(filename)) {
    return compile(transform(contents), pluginOptions)
  } else if (COFFEE.test(filename)) {
    return compile(contents, pluginOptions)
  } else return null
}