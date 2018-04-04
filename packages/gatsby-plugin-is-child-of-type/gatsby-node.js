const path = require(`path`)

const packageName = `gatsby-is-child-of-type`

const hotLoaderPath = path.resolve(
  `node_modules/gatsby-plugin-is-child-of-type/isChildOfTypeHotLoader`
)

const standardPath = path.resolve(
  `node_modules/gatsby-plugin-is-child-of-type/isChildOfTypeStandard`
)

exports.modifyWebpackConfig = function modifyWebpackConfig({ config, stage }) {
  /*
   * Resolve aliases
   */
  config.merge(current => {
    current.resolve = current.resolve || {}
    const alias = Object.assign({}, current.resolve.alias || {})
    Object.assign(alias, {
      [packageName]: stage === `develop` ? hotLoaderPath : standardPath,
    })
    current.resolve.alias = alias
    current.resolve.root = current.resolve.root || __dirname
    return current
  })
  return config
}
