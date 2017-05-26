const crypto = require(`crypto`)
import moment from "moment"

const { emitter } = require(`../../../redux`)
const { boundActionCreators } = require(`../../../redux/actions`)

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
        content: JSON.stringify(plugin),
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
      content: JSON.stringify(node),
      mediaType: `application/json`,
      type: `Site`,
    },
  })
}

const createPageId = path => `SitePage ${path}`

exports.onUpsertPage = ({ page, boundActionCreators }) => {
  const { createNode } = boundActionCreators

  // Add page.
  createNode({
    ...page,
    id: createPageId(page.path),
    parent: `SOURCE`,
    children: [],
    internal: {
      mediaType: `application/json`,
      type: `SitePage`,
      content: JSON.stringify(page),
      contentDigest: crypto
        .createHash(`md5`)
        .update(JSON.stringify(page))
        .digest(`hex`),
    },
  })
}

// Listen for DELETE_PAGE_BY_PATH and delete page nodes.
emitter.on(`DELETE_PAGE_BY_PATH`, action => {
  boundActionCreators.deleteNode(createPageId(action.payload))
})
