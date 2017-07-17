import transform from "coffee-react-transform"
import { compile } from "coffeescript"

const COFFEE = /\.coffee$/
const CJSX = /\.cjsx$/

export function resolvableExtensions() {
  return [`.coffee`, `.cjsx`]
}

export function modifyWebpackConfig({ config }) {
  // We need to use Babel to get around the ES6 export issue.
  config.loader(`coffee`, {
    test: COFFEE,
    loaders: [`babel`, `coffee`],
  })
  config.loader(`cjsx`, {
    test: CJSX,
    loaders: [`babel`, `coffee`, `cjsx`],
  })
}

export function preprocessSource({ filename, contents }, pluginOptions) {
  // Don't need to account for ES6, Babylon can parse it.
  if (CJSX.test(filename)) {
    return compile(transform(contents), pluginOptions)
  } else if (COFFEE.test(filename)) {
    return compile(contents, pluginOptions)
  } else return null
}
