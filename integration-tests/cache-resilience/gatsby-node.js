const fs = require(`fs`)
const v8 = require(`v8`)
const path = require(`path`)

const db = require(`gatsby/dist/db`)

const {
  ON_PRE_BOOTSTRAP_FILE_PATH,
  ON_POST_BOOTSTRAP_FILE_PATH,
} = require(`./utils/constants`)

const sanitizePageCreatorPluginOptions = options => {
  if (options && options.path) {
    return {
      ...options,
      path: path.relative(process.cwd(), options.path),
    }
  }
  return options
}

// copied from packages/gatsby/src/bootstrap/load-plugins/load.js
// and adjusted a bit to make it work
const createPluginId = (createNodeId, name, pluginObject) =>
  createNodeId(
    name +
      (pluginObject
        ? JSON.stringify(
            sanitizePageCreatorPluginOptions(pluginObject.pluginOptions)
          )
        : ``),
    `Plugin`
  )

const createMap = (nodes, createNodeId) => {
  const map = new Map()
  nodes.forEach(node => {
    // HACK - SitePlugin nodes for gatsby-plugin-page-creator will have different id
    // depending on CWD, which make it impossible to do snapshot testing.
    // We will generate more stable id replacement here
    if (
      node.internal.type === `SitePlugin` &&
      node.name === `gatsby-plugin-page-creator`
    ) {
      node = {
        ...node,
        id: createPluginId(createNodeId, node.name, node),
      }
    }
    map.set(node.id, node)
  })
  return map
}

exports.onPreBootstrap = ({ getNodes, createNodeId }) => {
  fs.writeFileSync(
    ON_PRE_BOOTSTRAP_FILE_PATH,
    v8.serialize(createMap(getNodes(), createNodeId))
  )
}

exports.onPostBootstrap = async ({ getNodes, createNodeId }) => {
  fs.writeFileSync(
    ON_POST_BOOTSTRAP_FILE_PATH,
    v8.serialize(createMap(getNodes(), createNodeId))
  )

  await db.saveState()

  if (process.env.EXIT_ON_POST_BOOTSTRAP) {
    process.exit()
  }
}
