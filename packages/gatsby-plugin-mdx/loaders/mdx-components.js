const loaderUtils = require(`loader-utils`)

/**
 * loads a generated file that allows us to require all of the mdxPlugins.
 * this is useful because otherwise requiring all the plugins in
 * gatsby-ssr/browser results in a webpack require context warning
 *
 * results in a file that looks like:
 *
 * ```js
 * module.exports = {
 *   plugins: [require('some-plugin'), require('some-other-plugin')]
 * }
 * ```
 */
module.exports = function() {
  const options = loaderUtils.getOptions(this)
  const pluginRequires = !options.plugins
    ? `[]`
    : `[` +
      options.plugins
        .map(plugin => `require("${plugin.resolve ? plugin.resolve : plugin}")`)
        .join(`,`) +
      `]`
  return `module.exports = {plugins: ${pluginRequires}}`
}
