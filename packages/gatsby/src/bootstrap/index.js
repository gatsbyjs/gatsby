/* @flow */

const _ = require(`lodash`)
const slash = require(`slash`)
const fs = require(`fs-extra`)
const md5File = require(`md5-file/promise`)
const crypto = require(`crypto`)
const del = require(`del`)
const path = require(`path`)

const apiRunnerNode = require(`../utils/api-runner-node`)
const { graphql } = require(`graphql`)
const { store, emitter } = require(`../redux`)
const loadPlugins = require(`./load-plugins`)
const { initCache } = require(`../utils/cache`)
const report = require(`gatsby-cli/lib/reporter`)
const getConfigFile = require(`./get-config-file`)

// Show stack trace on unhandled promises.
process.on(`unhandledRejection`, (reason, p) => {
  report.panic(reason)
})

const {
  extractQueries,
} = require(`../internal-plugins/query-runner/query-watcher`)
const {
  runQueries,
} = require(`../internal-plugins/query-runner/page-query-runner`)
const { writePages } = require(`../internal-plugins/query-runner/pages-writer`)
const {
  writeRedirects,
} = require(`../internal-plugins/query-runner/redirects-writer`)

// Override console.log to add the source file + line number.
// Useful for debugging if you lose a console.log somewhere.
// Otherwise leave commented out.
// require(`./log-line-function`)

const preferDefault = m => (m && m.default) || m

type BootstrapArgs = {
  directory: string,
  prefixPaths?: boolean,
}

module.exports = async (args: BootstrapArgs) => {
  const program = {
    ...args,
    // Fix program directory path for windows env.
    directory: slash(args.directory),
  }

  store.dispatch({
    type: `SET_PROGRAM`,
    payload: program,
  })

  // Delete html files from the public directory as we don't want deleted
  // pages from previous builds to stick around.
  let activity = report.activityTimer(`delete html files from previous builds`)
  activity.start()
  await del([
    `public/*.{html}`,
    `public/**/*.{html}`,
    `!public/static`,
    `!public/static/**/*.{html}`,
  ])
  activity.end()

  // Try opening the site's gatsby-config.js file.
  activity = report.activityTimer(`open and validate gatsby-config.js`)
  activity.start()
  const config = await preferDefault(
    getConfigFile(program.directory, `gatsby-config.js`)
  )

  if (config && config.polyfill) {
    report.warn(
      `Support for custom Promise polyfills has been removed in Gatsby v2. We only support Babel 7's new automatic polyfilling behavior.`
    )
  }

  store.dispatch({
    type: `SET_SITE_CONFIG`,
    payload: config,
  })

  activity.end()

  const flattenedPlugins = await loadPlugins(config)

  // Check if any plugins have been updated since our last run. If so
  // we delete the cache is there's likely been changes
  // since the previous run.
  //
  // We do this by creating a hash of all the version numbers of installed
  // plugins, the site's package.json, gatsby-config.js, and gatsby-node.js.
  // The last, gatsby-node.js, is important as many gatsby sites put important
  // logic in there e.g. generating slugs for custom pages.
  const pluginVersions = flattenedPlugins.map(p => p.version)
  const hashes = await Promise.all([
    md5File(`package.json`),
    Promise.resolve(
      md5File(`${program.directory}/gatsby-config.js`).catch(() => {})
    ), // ignore as this file isn't required),
    Promise.resolve(
      md5File(`${program.directory}/gatsby-node.js`).catch(() => {})
    ), // ignore as this file isn't required),
  ])
  const pluginsHash = crypto
    .createHash(`md5`)
    .update(JSON.stringify(pluginVersions.concat(hashes)))
    .digest(`hex`)
  let state = store.getState()
  const oldPluginsHash = state && state.status ? state.status.PLUGINS_HASH : ``

  // Check if anything has changed. If it has, delete the site's .cache
  // directory and tell reducers to empty themselves.
  //
  // Also if the hash isn't there, then delete things just in case something
  // is weird.
  if (oldPluginsHash && pluginsHash !== oldPluginsHash) {
    report.info(report.stripIndent`
      One or more of your plugins have changed since the last time you ran Gatsby. As
      a precaution, we're deleting your site's cache to ensure there's not any stale
      data
    `)
  }

  if (!oldPluginsHash || pluginsHash !== oldPluginsHash) {
    try {
      await fs.remove(`${program.directory}/.cache`)
    } catch (e) {
      report.error(`Failed to remove .cache files.`, e)
    }
    // Tell reducers to delete their data (the store will already have
    // been loaded from the file system cache).
    store.dispatch({
      type: `DELETE_CACHE`,
    })
  }

  // Update the store with the new plugins hash.
  store.dispatch({
    type: `UPDATE_PLUGINS_HASH`,
    payload: pluginsHash,
  })

  // Now that we know the .cache directory is safe, initialize the cache
  // directory.
  initCache()

  // Ensure the public/static directory is created.
  await fs.ensureDirSync(`${program.directory}/public/static`)

  // Copy our site files to the root of the site.
  activity = report.activityTimer(`copy gatsby files`)
  activity.start()
  const srcDir = `${__dirname}/../../cache-dir`
  const siteDir = `${program.directory}/.cache`
  const tryRequire = `${__dirname}/../utils/test-require-error.js`
  try {
    await fs.copy(srcDir, siteDir, { clobber: true })
    await fs.copy(tryRequire, `${siteDir}/test-require-error.js`, {
      clobber: true,
    })
    await fs.ensureDirSync(`${program.directory}/.cache/json`)
    await fs.ensureDirSync(`${program.directory}/.cache/layouts`)

    // Ensure .cache/fragments exists and is empty. We want fragments to be
    // added on every run in response to data as fragments can only be added if
    // the data used to create the schema they're dependent on is available.
    await fs.emptyDir(`${program.directory}/.cache/fragments`)
  } catch (err) {
    report.panic(`Unable to copy site files to .cache`, err)
  }

  // Find plugins which implement gatsby-browser and gatsby-ssr and write
  // out api-runners for them.
  const hasAPIFile = (env, plugin) => {
    // The plugin loader has disabled SSR APIs for this plugin. Usually due to
    // multiple implementations of an API that can only be implemented once
    if (env === `ssr` && plugin.skipSSR === true) return undefined

    const envAPIs = plugin[`${env}APIs`]
    if (envAPIs && Array.isArray(envAPIs) && envAPIs.length > 0) {
      return slash(path.join(plugin.resolve, `gatsby-${env}.js`))
    }
    return undefined
  }

  const ssrPlugins = _.filter(
    flattenedPlugins.map(plugin => {
      return {
        resolve: hasAPIFile(`ssr`, plugin),
        options: plugin.pluginOptions,
      }
    }),
    plugin => plugin.resolve
  )
  const browserPlugins = _.filter(
    flattenedPlugins.map(plugin => {
      return {
        resolve: hasAPIFile(`browser`, plugin),
        options: plugin.pluginOptions,
      }
    }),
    plugin => plugin.resolve
  )

  let browserAPIRunner = ``

  try {
    browserAPIRunner = fs.readFileSync(
      `${siteDir}/api-runner-browser.js`,
      `utf-8`
    )
  } catch (err) {
    report.panic(`Failed to read ${siteDir}/api-runner-browser.js`, err)
  }

  const browserPluginsRequires = browserPlugins
    .map(
      plugin =>
        `{
      plugin: require('${plugin.resolve}'),
      options: ${JSON.stringify(plugin.options)},
    }`
    )
    .join(`,`)

  browserAPIRunner = `var plugins = [${browserPluginsRequires}]\n${browserAPIRunner}`

  let sSRAPIRunner = ``

  try {
    sSRAPIRunner = fs.readFileSync(`${siteDir}/api-runner-ssr.js`, `utf-8`)
  } catch (err) {
    report.panic(`Failed to read ${siteDir}/api-runner-ssr.js`, err)
  }

  const ssrPluginsRequires = ssrPlugins
    .map(
      plugin =>
        `{
      plugin: require('${plugin.resolve}'),
      options: ${JSON.stringify(plugin.options)},
    }`
    )
    .join(`,`)
  sSRAPIRunner = `var plugins = [${ssrPluginsRequires}]\n${sSRAPIRunner}`

  fs.writeFileSync(
    `${siteDir}/api-runner-browser.js`,
    browserAPIRunner,
    `utf-8`
  )
  fs.writeFileSync(`${siteDir}/api-runner-ssr.js`, sSRAPIRunner, `utf-8`)

  activity.end()
  /**
   * Start the main bootstrap processes.
   */

  // onPreBootstrap
  activity = report.activityTimer(`onPreBootstrap`)
  activity.start()
  await apiRunnerNode(`onPreBootstrap`)
  activity.end()

  // Source nodes
  activity = report.activityTimer(`source and transform nodes`)
  activity.start()
  await require(`../utils/source-nodes`)()
  activity.end()

  // Create Schema.
  activity = report.activityTimer(`building schema`)
  activity.start()
  await require(`../schema`)()
  activity.end()

  // Collect resolvable extensions and attach to program.
  const extensions = [`.js`, `.jsx`]
  // Change to this being an action and plugins implement `onPreBootstrap`
  // for adding extensions.
  const apiResults = await apiRunnerNode(`resolvableExtensions`, {
    traceId: `initial-resolvableExtensions`,
  })

  store.dispatch({
    type: `SET_PROGRAM_EXTENSIONS`,
    payload: _.flattenDeep([extensions, apiResults]),
  })

  const graphqlRunner = (query, context = {}) => {
    const schema = store.getState().schema
    return graphql(schema, query, context, context, context)
  }

  // Collect layouts.
  activity = report.activityTimer(`createLayouts`)
  activity.start()
  await apiRunnerNode(`createLayouts`, {
    graphql: graphqlRunner,
    traceId: `initial-createLayouts`,
    waitForCascadingActions: true,
  })
  activity.end()

  // Collect pages.
  activity = report.activityTimer(`createPages`)
  activity.start()
  await apiRunnerNode(`createPages`, {
    graphql: graphqlRunner,
    traceId: `initial-createPages`,
    waitForCascadingActions: true,
  })
  activity.end()

  // A variant on createPages for plugins that want to
  // have full control over adding/removing pages. The normal
  // "createPages" API is called every time (during development)
  // that data changes.
  activity = report.activityTimer(`createPagesStatefully`)
  activity.start()
  await apiRunnerNode(`createPagesStatefully`, {
    graphql: graphqlRunner,
    traceId: `initial-createPagesStatefully`,
    waitForCascadingActions: true,
  })
  activity.end()

  activity = report.activityTimer(`onPreExtractQueries`)
  activity.start()
  await apiRunnerNode(`onPreExtractQueries`)
  activity.end()

  // Update Schema for SitePage.
  activity = report.activityTimer(`update schema`)
  activity.start()
  await require(`../schema`)()
  activity.end()

  // Extract queries
  activity = report.activityTimer(`extract queries from components`)
  activity.start()
  await extractQueries()
  activity.end()

  // Start the createPages hot reloader.
  if (process.env.NODE_ENV !== `production`) {
    require(`./page-hot-reloader`)(graphqlRunner)
  }

  // Run queries
  activity = report.activityTimer(`run graphql queries`)
  activity.start()
  await runQueries()
  activity.end()

  // Write out files.
  activity = report.activityTimer(`write out page data`)
  activity.start()
  try {
    await writePages()
  } catch (err) {
    report.panic(`Failed to write out page data`, err)
  }
  activity.end()

  // Write out redirects.
  activity = report.activityTimer(`write out redirect data`)
  activity.start()
  await writeRedirects()
  activity.end()

  const checkJobsDone = _.debounce(resolve => {
    const state = store.getState()
    if (state.jobs.active.length === 0) {
      report.log(``)
      report.info(`bootstrap finished - ${process.uptime()} s`)
      report.log(``)

      // onPostBootstrap
      activity = report.activityTimer(`onPostBootstrap`)
      activity.start()
      apiRunnerNode(`onPostBootstrap`).then(() => {
        activity.end()
        resolve({ graphqlRunner })
      })
    }
  }, 100)

  if (store.getState().jobs.active.length === 0) {
    // onPostBootstrap
    activity = report.activityTimer(`onPostBootstrap`)
    activity.start()
    await apiRunnerNode(`onPostBootstrap`)
    activity.end()

    report.log(``)
    report.info(`bootstrap finished - ${process.uptime()} s`)
    report.log(``)
    return { graphqlRunner }
  } else {
    return new Promise(resolve => {
      // Wait until all side effect jobs are finished.
      emitter.on(`END_JOB`, () => checkJobsDone(resolve))
    })
  }
}
