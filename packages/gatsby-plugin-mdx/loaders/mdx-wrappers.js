const loaderUtils = require(`loader-utils`)

/**
 * loads a generated file that allows us to require all of the plugins
 * that implement wrapRootElement in their gatsby-ssr.js file.
 * When using gatsby-plugin-mdx with gatsby-plugin-feed, this keeps the build from
 * breaking when using GraphQL to query the html field.
 *
 * results in a file that looks like:
 *
 * ```js
 * module.exports = {
 *   plugins: [require('some-plugin'), require('some-other-plugin')]
 * }
 * ```
 */
module.exports = function () {
  const options = loaderUtils.getOptions(this)
  const { flattenedPlugins: plugins } = options.store.getState()
  const wrapperPlugins = plugins
    .filter(plugin => plugin.ssrAPIs.includes(`wrapRootElement`))
    .map(plugin => `${plugin.resolve}/gatsby-ssr.js`)
  const pluginRequires = !wrapperPlugins.length
    ? `[]`
    : `[` + wrapperPlugins.map(plugin => `require("${plugin}")`).join(`,`) + `]`
  return `module.exports = {plugins: ${pluginRequires}}`
}
