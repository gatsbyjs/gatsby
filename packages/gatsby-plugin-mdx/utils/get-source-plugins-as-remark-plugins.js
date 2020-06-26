const visit = require(`unist-util-visit`)
const debug = require(`debug`)(`get-source-plugins-as-remark-plugins`)
const { interopDefault } = require(`./interop-default`)

let fileNodes

// ensure only one `/` in new url
const withPathPrefix = (url, pathPrefix) =>
  (pathPrefix + url).replace(/\/\//, `/`)

module.exports = async function getSourcePluginsAsRemarkPlugins({
  gatsbyRemarkPlugins,
  mdxNode,
  getNode,
  getNodesByType,
  reporter,
  cache,
  pathPrefix,
  ...helpers
}) {
  debug(`getSourcePluginsAsRemarkPlugins`)

  const userPlugins = []

  if (pathPrefix) {
    userPlugins.push(async function withPathPrefixTransformer(markdownAST) {
      // Ensure relative links include `pathPrefix`
      visit(markdownAST, `link`, node => {
        if (
          node.url &&
          node.url.startsWith(`/`) &&
          !node.url.startsWith(`//`)
        ) {
          node.url = withPathPrefix(node.url, pathPrefix)
        }
      })
      return markdownAST
    })
  }

  fileNodes = getNodesByType(`File`)

  // return list of remarkPlugins
  gatsbyRemarkPlugins.forEach(plugin => {
    const importedPlugin = interopDefault(require(plugin.resolve))
    if (typeof importedPlugin !== `function`) {
      debug(`userPlugins: not a valid plugin: \`${plugin}\``)
      return
    }

    debug(`userPlugins: constructing remark plugin for `, plugin)
    userPlugins.push(async function pluginTransformer(markdownAST) {
      await importedPlugin(
        {
          markdownAST,
          markdownNode: mdxNode,
          getNode,
          getNodesByType,
          files: fileNodes,
          pathPrefix,
          reporter,
          cache,
          ...helpers,
        },
        plugin.options || {}
      )

      return markdownAST
    })
  })

  // Note: I'm not sure if the object is even required, but at the time of writing these plugins had no other options
  return userPlugins.map(plugin => [plugin, {}])
}
