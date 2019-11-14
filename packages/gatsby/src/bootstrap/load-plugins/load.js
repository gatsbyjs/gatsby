const _ = require(`lodash`)
const slash = require(`slash`)
const fs = require(`fs`)
const path = require(`path`)
const crypto = require(`crypto`)
const glob = require(`glob`)
const { warnOnIncompatiblePeerDependency } = require(`./validate`)
const { store } = require(`../../redux`)
const existsSync = require(`fs-exists-cached`).sync
const createNodeId = require(`../../utils/create-node-id`)
const createRequireFromPath = require(`../../utils/create-require-from-path`)

function createFileContentHash(root, globPattern) {
  const hash = crypto.createHash(`md5`)
  const files = glob.sync(`${root}/${globPattern}`, { nodir: true })

  files.forEach(filepath => {
    hash.update(fs.readFileSync(filepath))
  })

  return hash.digest(`hex`)
}

/**
 * Make sure key is unique to plugin options. E.g there could
 * be multiple source-filesystem plugins, with different names
 * (docs, blogs).
 * @param {*} name Name of the plugin
 * @param {*} pluginObject
 */
const createPluginId = (name, pluginObject = null) =>
  createNodeId(
    name + (pluginObject ? JSON.stringify(pluginObject.options) : ``),
    `Plugin`
  )

/**
 * @typedef {Object} PluginInfo
 * @property {string} resolve The absolute path to the plugin
 * @property {string} name The plugin name
 * @property {string} version The plugin version (can be content hash)
 */

/**
 * resolvePlugin
 * @param {string} pluginName
 * This can be a name of a local plugin, the name of a plugin located in
 * node_modules, or a Gatsby internal plugin. In the last case the pluginName
 * will be an absolute path.
 * @param {string} rootDir
 * This is the project location, from which are found the plugins
 * @return {PluginInfo}
 */
function resolvePlugin(pluginName, rootDir) {
  // Only find plugins when we're not given an absolute path
  if (!existsSync(pluginName)) {
    // Find the plugin in the local plugins folder
    const resolvedPath = slash(path.resolve(`./plugins/${pluginName}`))

    if (existsSync(resolvedPath)) {
      if (existsSync(`${resolvedPath}/package.json`)) {
        const packageJSON = JSON.parse(
          fs.readFileSync(`${resolvedPath}/package.json`, `utf-8`)
        )
        const name = packageJSON.name || pluginName
        warnOnIncompatiblePeerDependency(name, packageJSON)

        return {
          resolve: resolvedPath,
          name,
          id: createPluginId(name),
          version:
            packageJSON.version || createFileContentHash(resolvedPath, `**`),
        }
      } else {
        // Make package.json a requirement for local plugins too
        throw new Error(`Plugin ${pluginName} requires a package.json file`)
      }
    }
  }

  /**
   * Here we have an absolute path to an internal plugin, or a name of a module
   * which should be located in node_modules.
   */
  try {
    const requireSource =
      rootDir !== null
        ? createRequireFromPath(`${rootDir}/:internal:`)
        : require
    const resolvedPath = slash(path.dirname(requireSource.resolve(pluginName)))

    const packageJSON = JSON.parse(
      fs.readFileSync(`${resolvedPath}/package.json`, `utf-8`)
    )
    warnOnIncompatiblePeerDependency(packageJSON.name, packageJSON)

    return {
      resolve: resolvedPath,
      id: createPluginId(packageJSON.name),
      name: packageJSON.name,
      version: packageJSON.version,
    }
  } catch (err) {
    throw new Error(
      `Unable to find plugin "${pluginName}". Perhaps you need to install its package?`
    )
  }
}

const loadPlugins = (config = {}, rootDir = null) => {
  // Instantiate plugins.
  const plugins = []

  // Create fake little site with a plugin for testing this
  // w/ snapshots. Move plugin processing to its own module.
  // Also test adding to redux store.
  const processPlugin = plugin => {
    if (_.isString(plugin)) {
      const info = resolvePlugin(plugin, rootDir)

      return {
        ...info,
        pluginOptions: {
          plugins: [],
        },
      }
    } else {
      plugin.options = plugin.options || {}

      // Plugins can have plugins.
      const subplugins = []
      if (plugin.options.plugins) {
        plugin.options.plugins.forEach(p => {
          subplugins.push(processPlugin(p))
        })

        plugin.options.plugins = subplugins
      }

      // Add some default values for tests as we don't actually
      // want to try to load anything during tests.
      if (plugin.resolve === `___TEST___`) {
        const name = `TEST`

        return {
          id: createPluginId(name, plugin),
          name,
          pluginOptions: {
            plugins: [],
          },
          resolve: `__TEST__`,
        }
      }

      const info = resolvePlugin(plugin.resolve, rootDir)

      return {
        ...info,
        id: createPluginId(info.name, plugin),
        pluginOptions: _.merge({ plugins: [] }, plugin.options),
      }
    }
  }

  // Add internal plugins
  const internalPlugins = [
    `../../internal-plugins/dev-404-page`,
    `../../internal-plugins/load-babel-config`,
    `../../internal-plugins/internal-data-bridge`,
    `../../internal-plugins/prod-404`,
    `../../internal-plugins/webpack-theme-component-shadowing`,
  ]
  internalPlugins.forEach(relPath => {
    const absPath = path.join(__dirname, relPath)
    plugins.push(processPlugin(absPath))
  })

  // Add plugins from the site config.
  if (config.plugins) {
    config.plugins.forEach(plugin => {
      plugins.push(processPlugin(plugin))
    })
  }

  // the order of all of these page-creators matters. The "last plugin wins",
  // so the user's site comes last, and each page-creator instance has to
  // match the plugin definition order before that. This works fine for themes
  // because themes have already been added in the proper order to the plugins
  // array
  plugins.forEach(plugin => {
    plugins.push(
      processPlugin({
        resolve: require.resolve(`gatsby-plugin-page-creator`),
        options: {
          path: slash(path.join(plugin.resolve, `src/pages`)),
          pathCheck: false,
        },
      })
    )
  })

  // Add the site's default "plugin" i.e. gatsby-x files in root of site.
  plugins.push({
    resolve: slash(process.cwd()),
    id: createPluginId(`default-site-plugin`),
    name: `default-site-plugin`,
    version: createFileContentHash(process.cwd(), `gatsby-*`),
    pluginOptions: {
      plugins: [],
    },
  })

  const program = store.getState().program

  // default options for gatsby-plugin-page-creator
  let pageCreatorOptions = {
    path: slash(path.join(program.directory, `src/pages`)),
    pathCheck: false,
  }

  if (config.plugins) {
    const pageCreatorPlugin = config.plugins.find(
      plugin =>
        plugin.resolve === `gatsby-plugin-page-creator` &&
        slash(plugin.options.path || ``) ===
          slash(path.join(program.directory, `src/pages`))
    )
    if (pageCreatorPlugin) {
      // override the options if there are any user specified options
      pageCreatorOptions = pageCreatorPlugin.options
    }
  }

  plugins.push(
    processPlugin({
      resolve: require.resolve(`gatsby-plugin-page-creator`),
      options: pageCreatorOptions,
    })
  )

  return plugins
}

module.exports = {
  loadPlugins,
  resolvePlugin,
}
