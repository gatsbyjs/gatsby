/** @type {import('gatsby').GatsbyNode["onPreInit"]} */
exports.onPreInit = (args, options) => {
  if (options.defaultDataLayer) {
    options.defaultDataLayer = {
      type: typeof options.defaultDataLayer,
      value: options.defaultDataLayer,
    }

    if (options.defaultDataLayer.type === `function`) {
      options.defaultDataLayer.value = options.defaultDataLayer.value.toString()
    }
  }
}
