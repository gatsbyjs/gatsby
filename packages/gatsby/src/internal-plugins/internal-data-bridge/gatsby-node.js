const moment = require(`moment`)
const chokidar = require(`chokidar`)
const systemPath = require(`path`)
const _ = require(`lodash`)

const { emitter } = require(`../../redux`)
const { boundActionCreators } = require(`../../redux/actions`)
const { getNode } = require(`../../db/nodes`)

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

const createPageId = path => `SitePage ${path}`

exports.sourceNodes = ({ createContentDigest, actions, store }) => {
  const { createNode } = actions
  const state = store.getState()
  const { program } = state
  const { flattenedPlugins } = state

  // Add our default development page since we know it's going to
  // exist and we need a node to exist so its query works :-)
  const page = { path: `/dev-404-page/` }
  createNode({
    ...page,
    id: createPageId(page.path),
    parent: null,
    children: [],
    internal: {
      type: `SitePage`,
      contentDigest: createContentDigest(page),
    },
  })

  flattenedPlugins.forEach(plugin => {
    plugin.pluginFilepath = plugin.resolve
    createNode({
      ...plugin,
      packageJson: transformPackageJson(
        require(`${plugin.resolve}/package.json`)
      ),
      parent: null,
      children: [],
      internal: {
        contentDigest: createContentDigest(plugin),
        type: `SitePlugin`,
      },
    })
  })

  // Add site node.

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
    }
    createNode({
      ...node,
      id: `Site`,
      parent: null,
      children: [],
      internal: {
        contentDigest: createContentDigest(node),
        type: `Site`,
      },
    })
  }

  createGatsbyConfigNode(state.config)

  const buildTime = moment()
    .subtract(process.uptime(), `seconds`)
    .startOf(`second`)
    .toJSON()

  const metadataNode = { buildTime }

  createNode({
    ...metadataNode,
    id: `SiteBuildMetadata`,
    parent: null,
    children: [],
    internal: {
      contentDigest: createContentDigest(metadataNode),
      type: `SiteBuildMetadata`,
    },
  })

  const pathToGatsbyConfig = systemPath.join(
    program.directory,
    `gatsby-config.js`
  )
  chokidar.watch(pathToGatsbyConfig).on(`change`, () => {
    const oldCache = require.cache[require.resolve(pathToGatsbyConfig)]
    try {
      // Delete require cache so we can reload the module.
      delete require.cache[require.resolve(pathToGatsbyConfig)]
      const config = require(pathToGatsbyConfig)
      createGatsbyConfigNode(config)
    } catch (e) {
      // Restore the old cache since requiring the new gatsby-config.js failed.
      if (oldCache !== undefined) {
        require.cache[require.resolve(pathToGatsbyConfig)] = oldCache
      }
    }
  })
}

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    type Site implements Node {
      buildTime: Date @dateformat
    }
  `
  createTypes(typeDefs)
}

exports.createResolvers = ({ createResolvers }) => {
  const resolvers = {
    Site: {
      buildTime: {
        type: `Date`,
        resolve(source, args, context, info) {
          const { buildTime } = context.nodeModel.getNodeById({
            id: `SiteBuildMetadata`,
            type: `SiteBuildMetadata`,
          })
          return info.originalResolver(
            {
              ...source,
              buildTime,
            },
            args,
            context,
            info
          )
        },
      },
    },
  }
  createResolvers(resolvers)
}

exports.onCreatePage = ({ createContentDigest, page, actions }) => {
  const { createNode } = actions
  // eslint-disable-next-line
  const { updatedAt, ...pageWithoutUpdated } = page

  // Add page.
  createNode({
    ...pageWithoutUpdated,
    id: createPageId(page.path),
    parent: null,
    children: [],
    internal: {
      type: `SitePage`,
      contentDigest: createContentDigest(pageWithoutUpdated),
      description:
        page.pluginCreatorId === `Plugin default-site-plugin`
          ? `Your site's "gatsby-node.js"`
          : page.pluginCreatorId,
    },
  })
}

// Listen for DELETE_PAGE and delete page nodes.
emitter.on(`DELETE_PAGE`, action => {
  const nodeId = createPageId(action.payload.path)
  const node = getNode(nodeId)
  boundActionCreators.deleteNode({ node })
})
