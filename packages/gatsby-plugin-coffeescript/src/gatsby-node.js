import { compile } from "coffeescript"
import resolve from "./resolve"

const COFFEE = /\.coffee$/

export function resolvableExtensions() {
  return [`.coffee`]
}

export function modifyWebpackConfig({ loaders, boundActionCreators }) {
  const coffeeLoader = [loaders.js(), resolve(`coffee-loader`)]

  // We need to use Babel to get around the ES6 export issue.
  boundActionCreators.setWebpackConfig({
    module: {
      rules: [
        {
          test: COFFEE,
          use: coffeeLoader,
        },
      ],
    },
  })
}

export function preprocessSource({ filename, contents }, pluginOptions) {
  if (COFFEE.test(filename)) {
    return compile(contents, pluginOptions)
  }
  return null
}
