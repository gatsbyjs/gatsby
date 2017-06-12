const _ = require(`lodash`)
const slash = require(`slash`)
const fs = require(`fs`)
const path = require(`path`)
const crypto = require(`crypto`)
const { store } = require(`../redux`)
const nodeAPIs = require(`../utils/api-node-docs`)
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
        return { name: `TEST` }
      }

      const info = resolvePlugin(plugin.resolve)

      return {
        ...info,
        pluginOptions: _.merge({ plugins: [] }, plugin.options),
      }
    }
  }

  // Add internal plugins
  plugins.push(
    processPlugin(
      path.join(__dirname, `../internal-plugins/component-page-creator`)
    )
  )
  plugins.push(
    processPlugin(
      path.join(__dirname, `../internal-plugins/internal-data-bridge`)
    )
  )
  plugins.push(
    processPlugin(path.join(__dirname, `../internal-plugins/dev-404-page`))
  )
  plugins.push(
    processPlugin(path.join(__dirname, `../internal-plugins/query-runner`))
  )

  // Add plugins from the site config.
  if (config.plugins) {
    config.plugins.forEach(plugin => {
      plugins.push(processPlugin(plugin))
    })
  }

  // Add the site's default "plugin" i.e. gatsby-x files in root of site.
  plugins.push({
    resolve: slash(process.cwd()),
    name: `default-site-plugin`,
    version: createFileContentHash(process.cwd(), `gatsby-*`),
    pluginOptions: {
      plugins: [],
    },
  })

  // Create a "flattened" array of plugins with all subplugins
  // brought to the top-level. This simplifies running gatsby-* files
  // for subplugins.
  const flattenedPlugins = []
  const extractPlugins = plugin => {
    plugin.pluginOptions.plugins.forEach(subPlugin => {
      flattenedPlugins.push(subPlugin)
      extractPlugins(subPlugin)
    })
  }

  plugins.forEach(plugin => {
    flattenedPlugins.push(plugin)
    extractPlugins(plugin)
  })

  // Validate plugins before saving. Plugins can only export known APIs. Collect
  // any bad exports (either typos or outdated) and output an error and quit.
  const apis = _.keys(nodeAPIs)
  let badExports = []
  flattenedPlugins.forEach(plugin => {
    let gatsbyNode
    try {
      gatsbyNode = require(`${plugin.resolve}/gatsby-node`)
    } catch (e) {
      // ignore
    }

    if (gatsbyNode) {
      badExports = badExports.concat(
        _.without(_.keys(gatsbyNode), ...apis).map(e => {
          return {
            exportName: e,
            pluginName: plugin.name,
            pluginVersion: plugin.version,
          }
        })
      )
    }
  })

  if (badExports.length > 0) {
    const stringSimiliarity = require(`string-similarity`)
    const { stripIndent } = require(`common-tags`)
    console.log(`\n`)
    console.log(
      stripIndent`
      Your plugins must export known APIs from their gatsby-node.js.
      The following exports aren't APIs. Perhaps you made a typo or
      your plugin is outdated?

      See https://www.gatsbyjs.org/docs/node-apis/ for the list of Gatsby Node APIs`
    )
    badExports.forEach(bady => {
      const similarities = stringSimiliarity.findBestMatch(
        bady.exportName,
        apis
      )
      let message = `\n — `
      if (bady.pluginName == `default-site-plugin`) {
        message += `Your site's gatsby-node.js is exporting a variable named "${bady.exportName}" which isn't an API.`
      } else {
        message += `The plugin "${bady.pluginName}@${bady.pluginVersion}" is exporting a variable named "${bady.exportName}" which isn't an API.`
      }
      if (similarities.bestMatch.rating > 0.5) {
        message += ` Perhaps you meant to export "${similarities.bestMatch
          .target}"?`
      }

      console.log(message)
    })
    process.exit()
  }

  store.dispatch({
    type: `SET_SITE_PLUGINS`,
    payload: plugins,
  })

  store.dispatch({
    type: `SET_SITE_FLATTENED_PLUGINS`,
    payload: flattenedPlugins,
  })

  return flattenedPlugins
}
