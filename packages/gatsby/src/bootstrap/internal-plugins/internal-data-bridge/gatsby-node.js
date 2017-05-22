const crypto = require(`crypto`)
import moment from "moment"

exports.sourceNodes = ({ boundActionCreators, store }) => {
  const { createNode } = boundActionCreators
  const state = store.getState()
  const { flattenedPlugins } = state

  flattenedPlugins.forEach(plugin =>
    createNode({
      ...plugin,
      packageJson: {
        ...require(`${plugin.resolve}/package.json`),
      },
      id: `Plugin ${plugin.name}`,
      parent: `SOURCE`,
      children: [],
      internal: {
        contentDigest: crypto
          .createHash(`md5`)
          .update(JSON.stringify(plugin))
          .digest(`hex`),
        mediaType: `application/json`,
        type: `SitePlugin`,
      },
    })
  )

  // Add site node.
  const buildTime = moment().subtract(process.uptime(), `seconds`).toJSON()

  // Delete plugins from the config as we add plugins above.
  const configCopy = { ...state.config }
  delete configCopy.plugins

  const node = {
    siteMetadata: {
      ...state.config.siteMetadata,
    },
    port: state.program.port,
    host: state.program.host,
    ...configCopy,
    buildTime,
  }

  createNode({
    ...node,
    id: `Site`,
    parent: `SOURCE`,
    children: [],
    internal: {
      contentDigest: crypto
        .createHash(`md5`)
        .update(JSON.stringify(node))
        .digest(`hex`),
      mediaType: `application/json`,
      type: `Site`,
    },
  })
}
