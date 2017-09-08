const crypto = require(`crypto`)
const moment = require(`moment`)
const chokidar = require(`chokidar`)
const systemPath = require(`path`)
const _ = require(`lodash`)

const { emitter } = require(`../../redux`)
const { boundActionCreators } = require(`../../redux/actions`)
const { getNode } = require(`../../redux`)

function transformPackageJson(json) {
  const transformDeps = deps =>
    _.entries(deps).map(([name, version]) => {
      return {
        name,
        version,
      }
    })

  json = _.pick(json, [
    `name`,
    `description`,
    `version`,
    `main`,
    `keywords`,
    `author`,
    `license`,
    `dependencies`,
    `devDependencies`,
    `peerDependencies`,
    `optionalDependecies`,
    `bundledDependecies`,
  ])
  json.dependencies = transformDeps(json.dependencies)
  json.devDependencies = transformDeps(json.devDependencies)
  json.peerDependencies = transformDeps(json.peerDependencies)
  json.optionalDependecies = transformDeps(json.optionalDependecies)
  json.bundledDependecies = transformDeps(json.bundledDependecies)

  return json
}

exports.sourceNodes = ({ boundActionCreators, store }) => {
  const { createNode } = boundActionCreators
  const state = store.getState()
  const { program } = state
  const { flattenedPlugins } = state

  // Add our default development page since we know it's going to
  // exist and we need a node to exist so it's query works :-)
  const page = { path: `/dev-404-page/` }
  createNode({
    ...page,
    id: createPageId(page.path),
    parent: `SOURCE`,
    children: [],
    internal: {
      type: `SitePage`,
      contentDigest: crypto
        .createHash(`md5`)
        .update(JSON.stringify(page))
        .digest(`hex`),
    },
  })

  flattenedPlugins.forEach(plugin => {
    plugin.pluginFilepath = plugin.resolve
    createNode({
      ...plugin,
      packageJson: transformPackageJson(
        require(`${plugin.resolve}/package.json`)
      ),
      parent: `SOURCE`,
      children: [],
      internal: {
        contentDigest: crypto
          .createHash(`md5`)
          .update(JSON.stringify(plugin))
          .digest(`hex`),
        type: `SitePlugin`,
      },
    })
  })

  // Add site node.
  const buildTime = moment()
    .subtract(process.uptime(), `seconds`)
    .toJSON()

  const createGatsbyConfigNode = (config = {}) => {
    // Delete plugins from the config as we add plugins above.
    const configCopy = { ...config }
    delete configCopy.plugins
    const node = {
      siteMetadata: {
        ...configCopy.siteMetadata,
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
        type: `Site`,
      },
    })
  }

  createGatsbyConfigNode(state.config)

  const pathToGatsbyConfig = systemPath.join(
    program.directory,
    `gatsby-config.js`
  )
  chokidar.watch(pathToGatsbyConfig).on(`change`, () => {
    // Delete require cache so we can reload the module.
    delete require.cache[require.resolve(pathToGatsbyConfig)]
    const config = require(pathToGatsbyConfig)
    createGatsbyConfigNode(config)
  })
}

const createPageId = path => `SitePage ${path}`

exports.onCreatePage = ({ page, boundActionCreators }) => {
  const { createNode } = boundActionCreators

  // Add page.
  createNode({
    ...page,
    id: createPageId(page.path),
    parent: `SOURCE`,
    children: [],
    internal: {
      type: `SitePage`,
      contentDigest: crypto
        .createHash(`md5`)
        .update(JSON.stringify(page))
        .digest(`hex`),
    },
  })
}

// Listen for DELETE_PAGE and delete page nodes.
emitter.on(`DELETE_PAGE`, action => {
  const nodeId = createPageId(action.payload.path)
  const node = getNode(nodeId)
  boundActionCreators.deleteNode(nodeId, node)
})
