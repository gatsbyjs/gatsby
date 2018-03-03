const _ = require(`lodash`)
const slash = require(`slash`)
const fs = require(`fs`)
const path = require(`path`)
const crypto = require(`crypto`)
const glob = require(`glob`)

function createFileContentHash(root, globPattern) {
  const hash = crypto.createHash(`md5`)
  const files = glob.sync(`${root}/${globPattern}`, { nodir: true })

  files.forEach(filepath => {
    hash.update(fs.readFileSync(filepath))
  })

  return hash.digest(`hex`)
}

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
 * @return {PluginInfo}
 */
function resolvePlugin(pluginName) {
  // Only find plugins when we're not given an absolute path
  if (!fs.existsSync(pluginName)) {
    // Find the plugin in the local plugins folder
    const resolvedPath = slash(path.resolve(`./plugins/${pluginName}`))

    if (fs.existsSync(resolvedPath)) {
      if (fs.existsSync(`${resolvedPath}/package.json`)) {
        const packageJSON = JSON.parse(
          fs.readFileSync(`${resolvedPath}/package.json`, `utf-8`)
        )

        return {
          resolve: resolvedPath,
          name: packageJSON.name || pluginName,
          id: `Plugin ${packageJSON.name || pluginName}`,
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
    const resolvedPath = slash(path.dirname(require.resolve(pluginName)))

    const packageJSON = JSON.parse(
      fs.readFileSync(`${resolvedPath}/package.json`, `utf-8`)
    )

    return {
      resolve: resolvedPath,
      id: `Plugin ${packageJSON.name}`,
      name: packageJSON.name,
      version: packageJSON.version,
    }
  } catch (err) {
    throw new Error(`Unable to find plugin "${pluginName}"`)
  }
}

module.exports = async (config = {}) => {
  // Instantiate plugins.
  const plugins = []

  // Create fake little site with a plugin for testing this
  // w/ snapshots. Move plugin processing to its own module.
  // Also test adding to redux store.
  const processPlugin = plugin => {
    if (_.isString(plugin)) {
      const info = resolvePlugin(plugin)

      return {
        ...info,
        pluginOptions: {
          plugins: [],
        },
      }
    } else {
      // Plugins can have plugins.
      const subplugins = []
      if (plugin.options && plugin.options.plugins) {
        plugin.options.plugins.forEach(p => {
          subplugins.push(processPlugin(p))
        })

        plugin.options.plugins = subplugins
      }

      // Add some default values for tests as we don't actually
      // want to try to load anything during tests.
      if (plugin.resolve === `___TEST___`) {
        return {
          name: `TEST`,
          pluginOptions: {
            plugins: [],
          },
        }
      }

      const info = resolvePlugin(plugin.resolve)

      return {
        ...info,
        pluginOptions: _.merge({ plugins: [] }, plugin.options),
      }
    }
  }

  // Add internal plugins
  const internalPlugins = [
    `../../internal-plugins/dev-404-page`,
    `../../internal-plugins/load-babel-config`,
    `../../internal-plugins/component-page-creator`,
    `../../internal-plugins/component-layout-creator`,
    `../../internal-plugins/internal-data-bridge`,
    `../../internal-plugins/prod-404`,
    `../../internal-plugins/query-runner`,
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

  // Add the site's default "plugin" i.e. gatsby-x files in root of site.
  plugins.push({
    resolve: slash(process.cwd()),
    id: `Plugin default-site-plugin`,
    name: `default-site-plugin`,
    version: createFileContentHash(process.cwd(), `gatsby-*`),
    pluginOptions: {
      plugins: [],
    },
  })

  return plugins
}
