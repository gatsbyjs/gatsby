const visit = require(`unist-util-visit`)
const { interopDefault } = require(`./interop-default`)

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
  let pathPlugin = undefined
  if (pathPrefix) {
    pathPlugin = () =>
      async function transformer(markdownAST) {
        // Ensure relative links include `pathPrefix`
        visit(markdownAST, `link`, node => {
          if (
            node.url &&
            node.url.startsWith(`/`) &&
            !node.url.startsWith(`//`)
          ) {
            // TODO: where does withPathPrefix
            node.url = withPathPrefix(node.url, pathPrefix)
          }
        })
        return markdownAST
      }
  }

  // return list of remarkPlugins
  const userPluginsFiltered = gatsbyRemarkPlugins.filter(
    plugin => typeof interopDefault(require(plugin.resolve)) === `function`
  )

  if (!userPluginsFiltered.length) {
    return pathPlugin ? [pathPlugin] : []
  }

  const userPlugins = userPluginsFiltered.map(plugin => {
    const requiredPlugin = interopDefault(require(plugin.resolve))
    const wrappedPlugin = () =>
      async function transformer(markdownAST) {
        await requiredPlugin(
          {
            markdownAST,
            markdownNode: mdxNode,
            getNode,
            getNodesByType,
            get files() {
              return getNodesByType(`File`)
            },
            pathPrefix,
            reporter,
            cache,
            ...helpers,
          },
          plugin.options || {}
        )

        return markdownAST
      }

    return [wrappedPlugin, {}]
  })

  if (pathPlugin) {
    return [pathPlugin, ...userPlugins]
  } else {
    return [...userPlugins]
  }
}
