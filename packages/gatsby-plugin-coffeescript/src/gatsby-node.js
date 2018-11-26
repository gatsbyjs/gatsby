import { compile } from "coffeescript"
import resolve from "./resolve"

const COFFEE = /\.coffee$/

export function resolvableExtensions() {
  return [`.coffee`]
}

export function onCreateWebpackConfig({ loaders, actions }) {
  // We need to use Babel to get around the ES6 export issue.
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: COFFEE,
          use: [loaders.js(), resolve(`coffee-loader`)],
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
