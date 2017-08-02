import transform from "coffee-react-transform"
import { compile } from "coffeescript"

const COFFEE = /\.coffee$/
const CJSX = /\.cjsx$/

export function resolvableExtensions() {
  return [`.coffee`, `.cjsx`]
}

export function modifyWebpackConfig({ loaders, boundActionCreators }) {
  const coffeeLoader = [loaders.js(), require.resolve(`coffee-loader`)]

  // We need to use Babel to get around the ES6 export issue.
  boundActionCreators.setWebpackConfig({
    module: {
      rules: [
        {
          test: COFFEE,
          use: coffeeLoader,
        },
        {
          test: COFFEE,
          use: [...coffeeLoader, require.resolve(`cjsx-loader`)],
        },
      ],
    },
  })
}

export function preprocessSource({ filename, contents }, pluginOptions) {
  // Don`t need to account for ES6, Babylon can parse it.
  if (CJSX.test(filename)) {
    return compile(transform(contents), pluginOptions)
  } else if (COFFEE.test(filename)) {
    return compile(contents, pluginOptions)
  } else return null
}
