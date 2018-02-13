const _ = require(`lodash`)
const slash = require(`slash`)
const fs = require(`fs`)
const path = require(`path`)
const crypto = require(`crypto`)
const glob = require(`glob`)

const { store } = require(`../redux`)
const nodeAPIs = require(`../utils/api-node-docs`)
const browserAPIs = require(`../utils/api-browser-docs`)
const ssrAPIs = require(`../../cache-dir/api-ssr-docs`)
const testRequireError = require(`../utils/test-require-error`)
const report = require(`gatsby-cli/lib/reporter`)

// Given a plugin object and a moduleName like `gatsby-node`, check that the
// path to moduleName can be resolved.
const resolvePluginModule = (plugin, moduleName) => {
  let resolved = false
  try {
    resolved = require(`${plugin.resolve}/${moduleName}`)
  } catch (err) {
    if (!testRequireError(moduleName, err)) {
      // ignore
    } else {
      report.panic(`Error requiring ${plugin.resolve}/${moduleName}.js`, err)
    }
  }
  return resolved
}

// Given a plugin object, an array of the API names it exports and an
// array of valid API names, return an array of invalid API exports.
const getBadExports = (plugin, pluginAPIKeys, apis) => {
  let badExports = []
  // Discover any exports from plugins which are not "known"
  badExports = badExports.concat(
    _.difference(pluginAPIKeys, apis).map(e => {
      return {
        exportName: e,
        pluginName: plugin.name,
        pluginVersion: plugin.version,
      }
    })
  )
  return badExports
}

const getBadExportsMessage = (badExports, exportType, apis) => {
  const { stripIndent } = require(`common-tags`)
  const stringSimiliarity = require(`string-similarity`)
  let capitalized = `${exportType[0].toUpperCase()}${exportType.slice(1)}`
  if (capitalized === `Ssr`) capitalized = `SSR`

  let message = `\n`
  message += stripIndent`
    Your plugins must export known APIs from their gatsby-${exportType}.js.
    The following exports aren't APIs. Perhaps you made a typo or
    your plugin is outdated?

    See https://www.gatsbyjs.org/docs/${exportType}-apis/ for the list of Gatsby ${capitalized} APIs`

  badExports.forEach(bady => {
    const similarities = stringSimiliarity.findBestMatch(
      bady.exportName,
      apis
    )
    message += `\n — `
    if (bady.pluginName == `default-site-plugin`) {
      message += `Your site's gatsby-${exportType}.js is exporting a variable named "${
        bady.exportName
      }" which isn't an API.`
    } else {
      message += `The plugin "${bady.pluginName}@${
        bady.pluginVersion
      }" is exporting a variable named "${
        bady.exportName
      }" which isn't an API.`
    }
    if (similarities.bestMatch.rating > 0.5) {
      message += ` Perhaps you meant to export "${
        similarities.bestMatch.target
      }"?`
    }
  })

  return message
}

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
  plugins.push(
    processPlugin(path.join(__dirname, `../internal-plugins/dev-404-page`))
  )
  plugins.push(
    processPlugin(
      path.join(__dirname, `../internal-plugins/component-page-creator`)
    )
  )
  plugins.push(
    processPlugin(
      path.join(__dirname, `../internal-plugins/component-layout-creator`)
    )
  )
  plugins.push(
    processPlugin(
      path.join(__dirname, `../internal-plugins/internal-data-bridge`)
    )
  )
  plugins.push(
    processPlugin(path.join(__dirname, `../internal-plugins/prod-404`))
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
    id: `Plugin default-site-plugin`,
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

  // Validate plugins before saving. Plugins can only export known APIs. The known
  // APIs that a plugin supports are saved along with the plugin in the store for
  // easier filtering later. If there are bad exports (either typos, outdated, or
  // plain incorrect), then we output a readable error & quit.
  const apis = {}
  apis.node = _.keys(nodeAPIs)
  apis.browser = _.keys(browserAPIs)
  apis.ssr = _.keys(ssrAPIs)

  const allAPIs = [...apis.node, ...apis.browser, ...apis.ssr]

  const apiToPlugins = allAPIs.reduce((acc, value) => {
    acc[value] = []
    return acc
  }, {})

  const badExports = {
    node: [],
    browser: [],
    ssr: [],
  }

  flattenedPlugins.forEach(plugin => {
    plugin.nodeAPIs = []
    plugin.browserAPIs = []
    plugin.ssrAPIs = []

    const gatsbyNode = resolvePluginModule(plugin, `gatsby-node`)
    const gatsbyBrowser = resolvePluginModule(plugin, `gatsby-browser`)
    const gatsbySSR = resolvePluginModule(plugin, `gatsby-ssr`)

    // Discover which APIs this plugin implements and store an array against
    // the plugin node itself *and* in an API to plugins map for faster lookups
    // later.
    if (gatsbyNode) {
      const gatsbyNodeKeys = _.keys(gatsbyNode)
      plugin.nodeAPIs = _.intersection(gatsbyNodeKeys, apis.node)
      plugin.nodeAPIs.map(nodeAPI => apiToPlugins[nodeAPI].push(plugin.name))
      badExports.node = getBadExports(plugin, gatsbyNodeKeys, apis.node) // Collate any bad exports
    }

    if (gatsbyBrowser) {
      const gatsbyBrowserKeys = _.keys(gatsbyBrowser)
      plugin.browserAPIs = _.intersection(gatsbyBrowserKeys, apis.browser)
      plugin.browserAPIs.map(browserAPI => apiToPlugins[browserAPI].push(plugin.name))
      badExports.browser = getBadExports(plugin, gatsbyBrowserKeys, apis.browser) // Collate any bad exports
    }

    if (gatsbySSR) {
      const gatsbySSRKeys = _.keys(gatsbySSR)
      plugin.ssrAPIs = _.intersection(gatsbySSRKeys, apis.ssr)
      plugin.ssrAPIs.map(ssrAPI => apiToPlugins[ssrAPI].push(plugin.name))
      badExports.ssr = getBadExports(plugin, gatsbySSRKeys, apis.ssr) // Collate any bad exports
    }
  })

  // Output error messages for all bad exports
  let bad = false
  _.toPairs(badExports).forEach(bad => {
    const [exportType, entries] = bad
    if (entries.length > 0) {
      bad = true
      console.log(getBadExportsMessage(entries, exportType, apis[exportType]))
    }
  })

  if (bad) process.exit()

  store.dispatch({
    type: `SET_SITE_PLUGINS`,
    payload: plugins,
  })

  store.dispatch({
    type: `SET_SITE_FLATTENED_PLUGINS`,
    payload: flattenedPlugins,
  })

  store.dispatch({
    type: `SET_SITE_API_TO_PLUGINS`,
    payload: apiToPlugins,
  })

  return flattenedPlugins
}
