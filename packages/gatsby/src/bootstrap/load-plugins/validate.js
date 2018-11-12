const _ = require(`lodash`)

const reporter = require(`gatsby-cli/lib/reporter`)
const resolveModuleExports = require(`../resolve-module-exports`)

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
    The following exports aren't APIs. Perhaps you made a typo or your plugin is outdated?

    See https://www.gatsbyjs.org/docs/${exportType}-apis/ for the list of Gatsby ${capitalized} APIs
  `

  badExports.forEach(bady => {
    message += `\n\n`
    const similarities = stringSimiliarity.findBestMatch(bady.exportName, apis)
    const isDefaultPlugin = bady.pluginName == `default-site-plugin`
    const badExportsMigrationMap = {
      modifyWebpackConfig: {
        replacement: `onCreateWebpackConfig`,
        migrationLink: `https://gatsby.app/update-webpack-config`,
      },
      wrapRootComponent: {
        replacement: `wrapRootElement`,
        migrationLink: `https://gatsby.app/update-wraprootcomponent`,
      },
    }
    const isOldAPI = Object.keys(badExportsMigrationMap).includes(
      bady.exportName
    )

    if (isDefaultPlugin && isOldAPI) {
      const { replacement, migrationLink } = badExportsMigrationMap[
        bady.exportName
      ]
      message += stripIndent`
        - Your site's gatsby-${exportType}.js is exporting "${
        bady.exportName
      }" which was removed in Gatsby v2. Refer to the migration guide for more info on upgrading to "${replacement}":
      `
      message += `\n ${migrationLink}`
    } else if (isDefaultPlugin) {
      message += stripIndent`
        - Your site's gatsby-${exportType}.js is exporting a variable named "${
        bady.exportName
      }" which isn't an API.
      `
    } else {
      message += stripIndent`
        - The plugin "${bady.pluginName}@${
        bady.pluginVersion
      }" is exporting a variable named "${bady.exportName}" which isn't an API.
      `
    }

    if (similarities.bestMatch.rating > 0.5 && !isOldAPI) {
      message += `\n\n`
      message += `Perhaps you meant to export "${
        similarities.bestMatch.target
      }"?`
    }
  })

  return message
}

const handleBadExports = ({ apis, badExports }) => {
  // Output error messages for all bad exports
  _.toPairs(badExports).forEach(badItem => {
    const [exportType, entries] = badItem
    if (entries.length > 0) {
      reporter.panicOnBuild(
        getBadExportsMessage(entries, exportType, apis[exportType])
      )
    }
  })
}

/**
 * Identify which APIs each plugin exports
 */
const collatePluginAPIs = ({ apis, flattenedPlugins }) => {
  const allAPIs = [...apis.node, ...apis.browser, ...apis.ssr]
  const apiToPlugins = allAPIs.reduce((acc, value) => {
    acc[value] = []
    return acc
  }, {})

  // Get a list of bad exports
  const badExports = {
    node: [],
    browser: [],
    ssr: [],
  }

  flattenedPlugins.forEach(plugin => {
    plugin.nodeAPIs = []
    plugin.browserAPIs = []
    plugin.ssrAPIs = []

    // Discover which APIs this plugin implements and store an array against
    // the plugin node itself *and* in an API to plugins map for faster lookups
    // later.
    const pluginNodeExports = resolveModuleExports(
      `${plugin.resolve}/gatsby-node`
    )
    const pluginBrowserExports = resolveModuleExports(
      `${plugin.resolve}/gatsby-browser`
    )
    const pluginSSRExports = resolveModuleExports(
      `${plugin.resolve}/gatsby-ssr`
    )

    if (pluginNodeExports.length > 0) {
      plugin.nodeAPIs = _.intersection(pluginNodeExports, apis.node)
      plugin.nodeAPIs.map(nodeAPI => apiToPlugins[nodeAPI].push(plugin.name))
      badExports.node = badExports.node.concat(
        getBadExports(plugin, pluginNodeExports, apis.node)
      ) // Collate any bad exports
    }

    if (pluginBrowserExports.length > 0) {
      plugin.browserAPIs = _.intersection(pluginBrowserExports, apis.browser)
      plugin.browserAPIs.map(browserAPI =>
        apiToPlugins[browserAPI].push(plugin.name)
      )
      badExports.browser = badExports.browser.concat(
        getBadExports(plugin, pluginBrowserExports, apis.browser)
      ) // Collate any bad exports
    }

    if (pluginSSRExports.length > 0) {
      plugin.ssrAPIs = _.intersection(pluginSSRExports, apis.ssr)
      plugin.ssrAPIs.map(ssrAPI => apiToPlugins[ssrAPI].push(plugin.name))
      badExports.ssr = badExports.ssr.concat(
        getBadExports(plugin, pluginSSRExports, apis.ssr)
      ) // Collate any bad exports
    }
  })

  return { apiToPlugins, flattenedPlugins, badExports }
}

const handleMultipleReplaceRenderers = ({ apiToPlugins, flattenedPlugins }) => {
  // multiple replaceRenderers may cause problems at build time
  if (apiToPlugins.replaceRenderer.length > 1) {
    const rendererPlugins = [...apiToPlugins.replaceRenderer]

    if (rendererPlugins.includes(`default-site-plugin`)) {
      reporter.warn(`replaceRenderer API found in these plugins:`)
      reporter.warn(rendererPlugins.join(`, `))
      reporter.warn(
        `This might be an error, see: https://www.gatsbyjs.org/docs/debugging-replace-renderer-api/`
      )
    } else {
      console.log(``)
      reporter.error(
        `Gatsby's replaceRenderer API is implemented by multiple plugins:`
      )
      reporter.error(rendererPlugins.join(`, `))
      reporter.error(`This will break your build`)
      reporter.error(
        `See: https://www.gatsbyjs.org/docs/debugging-replace-renderer-api/`
      )
      if (process.env.NODE_ENV === `production`) process.exit(1)
    }

    // Now update plugin list so only final replaceRenderer will run
    const ignorable = rendererPlugins.slice(0, -1)

    // For each plugin in ignorable, set a skipSSR flag to true
    // This prevents apiRunnerSSR() from attempting to run it later
    const messages = []
    flattenedPlugins.forEach((fp, i) => {
      if (ignorable.includes(fp.name)) {
        messages.push(
          `Duplicate replaceRenderer found, skipping gatsby-ssr.js for plugin: ${
            fp.name
          }`
        )
        flattenedPlugins[i].skipSSR = true
      }
    })
    if (messages.length > 0) {
      console.log(``)
      messages.forEach(m => reporter.warn(m))
      console.log(``)
    }
  }

  return flattenedPlugins
}

module.exports = {
  collatePluginAPIs,
  handleBadExports,
  handleMultipleReplaceRenderers,
}
