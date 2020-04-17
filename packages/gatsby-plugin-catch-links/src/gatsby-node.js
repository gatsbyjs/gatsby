/** @type {import('gatsby').GatsbyNode["onPreInit"]} */
exports.onPreInit = function (args, options) {
  if (options.excludeRegex && !options.excludePattern) {
    options.excludePattern = options.excludeRegex
  }

  if (options.excludePattern) {
    options.excludePattern = options.excludePattern.source
  }
}
