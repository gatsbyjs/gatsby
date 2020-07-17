const visit = require(`unist-util-visit`)
const _ = require(`lodash`)
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

  fileNodes = getNodesByType(`File`)

  // return list of remarkPlugins
  const userPlugins = gatsbyRemarkPlugins
    .filter(plugin => {
      if (_.isFunction(interopDefault(require(plugin.resolve)))) {
        return true
      } else {
        debug(`userPlugins: filtering out`, plugin)
        return false
      }
    })
    .map(plugin => {
      debug(`userPlugins: constructing remark plugin for `, plugin)
      const requiredPlugin = interopDefault(require(plugin.resolve))
      const wrappedPlugin = () =>
        async function transformer(markdownAST) {
          await requiredPlugin(
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
        }

      return [wrappedPlugin, {}]
    })

  if (pathPlugin) {
    return [pathPlugin, ...userPlugins]
  } else {
    return [...userPlugins]
  }
}
