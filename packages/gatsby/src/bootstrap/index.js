/* @flow */

const _ = require(`lodash`)
const slash = require(`slash`)
const fs = require(`fs-extra`)
const md5File = require(`md5-file/promise`)
const crypto = require(`crypto`)
const del = require(`del`)
const path = require(`path`)
const convertHrtime = require(`convert-hrtime`)
const Promise = require(`bluebird`)

const apiRunnerNode = require(`../utils/api-runner-node`)
const mergeGatsbyConfig = require(`../utils/merge-gatsby-config`)
const getBrowserslist = require(`../utils/browserslist`)
const { graphql } = require(`graphql`)
const { store, emitter } = require(`../redux`)
const loadPlugins = require(`./load-plugins`)
const report = require(`gatsby-cli/lib/reporter`)
const getConfigFile = require(`./get-config-file`)
const tracer = require(`opentracing`).globalTracer()
const preferDefault = require(`./prefer-default`)
const nodeTracking = require(`../db/node-tracking`)
require(`../db`).startAutosave()

// Show stack trace on unhandled promises.
process.on(`unhandledRejection`, (reason, p) => {
  report.panic(reason)
})

const {
  extractQueries,
} = require(`../internal-plugins/query-runner/query-watcher`)
const {
  runInitialQueries,
} = require(`../internal-plugins/query-runner/page-query-runner`)
const queryQueue = require(`../internal-plugins/query-runner/query-queue`)
const { writePages } = require(`../internal-plugins/query-runner/pages-writer`)
const {
  writeRedirects,
} = require(`../internal-plugins/query-runner/redirects-writer`)

// Override console.log to add the source file + line number.
// Useful for debugging if you lose a console.log somewhere.
// Otherwise leave commented out.
// require(`./log-line-function`)

type BootstrapArgs = {
  directory: string,
  prefixPaths?: boolean,
  parentSpan: Object,
}

module.exports = async (args: BootstrapArgs) => {
  const spanArgs = args.parentSpan ? { childOf: args.parentSpan } : {}
  const bootstrapSpan = tracer.startSpan(`bootstrap`, spanArgs)

  // Start plugin runner which listens to the store
  // and invokes Gatsby API based on actions.
  require(`../redux/plugin-runner`)

  const directory = slash(args.directory)

  const program = {
    ...args,
    browserslist: getBrowserslist(directory),
    // Fix program directory path for windows env.
    directory,
  }

  store.dispatch({
    type: `SET_PROGRAM`,
    payload: program,
  })

  // Try opening the site's gatsby-config.js file.
  let activity = report.activityTimer(`open and validate gatsby-configs`, {
    parentSpan: bootstrapSpan,
  })
  activity.start()
  let config = await preferDefault(
    getConfigFile(program.directory, `gatsby-config`)
  )

  // theme gatsby configs can be functions or objects
  if (config && config.__experimentalThemes) {
    const themesConfig = await Promise.mapSeries(
      config.__experimentalThemes,
      async plugin => {
        const themeName = plugin.resolve || plugin
        const themeConfig = plugin.options || {}
        const theme = await preferDefault(
          getConfigFile(themeName, `gatsby-config`)
        )
        // if theme is a function, call it with the themeConfig
        let themeConfigObj = theme
        if (_.isFunction(theme)) {
          themeConfigObj = theme(themeConfig)
        }
        // themes function as plugins too (gatsby-node, etc)
        return {
          ...themeConfigObj,
          plugins: [
            ...(themeConfigObj.plugins || []),
            // theme plugin is last so it's gatsby-node, etc can override it's declared plugins, like a normal site.
            { resolve: themeName, options: themeConfig },
          ],
        }
      }
    ).reduce(mergeGatsbyConfig, {})

    config = mergeGatsbyConfig(themesConfig, config)
  }

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

  activity = report.activityTimer(`load plugins`)
  activity.start()
  const flattenedPlugins = await loadPlugins(config)
  activity.end()

  // onPreInit
  activity = report.activityTimer(`onPreInit`, {
    parentSpan: bootstrapSpan,
  })
  activity.start()
  await apiRunnerNode(`onPreInit`, { parentSpan: activity.span })
  activity.end()

  // Delete html and css files from the public directory as we don't want
  // deleted pages and styles from previous builds to stick around.
  activity = report.activityTimer(
    `delete html and css files from previous builds`,
    {
      parentSpan: bootstrapSpan,
    }
  )
  activity.start()
  await del([
    `public/*.{html,css}`,
    `public/**/*.{html,css}`,
    `!public/static`,
    `!public/static/**/*.{html,css}`,
  ])
  activity.end()

  activity = report.activityTimer(`initialize cache`)
  activity.start()
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
  await fs.ensureDir(`${program.directory}/.cache`)

  // Ensure the public/static directory
  await fs.ensureDir(`${program.directory}/public/static`)

  activity.end()

  if (process.env.GATSBY_DB_NODES === `loki`) {
    const loki = require(`../db/loki`)
    // Start the nodes database (in memory loki js with interval disk
    // saves). If data was saved from a previous build, it will be
    // loaded here
    activity = report.activityTimer(`start nodes db`, {
      parentSpan: bootstrapSpan,
    })
    activity.start()
    const dbSaveFile = `${program.directory}/.cache/loki/loki.db`
    try {
      await loki.start({
        saveFile: dbSaveFile,
      })
    } catch (e) {
      report.error(
        `Error starting DB. Perhaps try deleting ${path.dirname(dbSaveFile)}`
      )
    }
    activity.end()
  }

  // By now, our nodes database has been loaded, so ensure that we
  // have tracked all inline objects
  nodeTracking.trackDbNodes()

  // Copy our site files to the root of the site.
  activity = report.activityTimer(`copy gatsby files`, {
    parentSpan: bootstrapSpan,
  })
  activity.start()
  const srcDir = `${__dirname}/../../cache-dir`
  const siteDir = `${program.directory}/.cache`
  const tryRequire = `${__dirname}/../utils/test-require-error.js`
  try {
    await fs.copy(srcDir, siteDir, {
      clobber: true,
    })
    await fs.copy(tryRequire, `${siteDir}/test-require-error.js`, {
      clobber: true,
    })
    await fs.ensureDirSync(`${program.directory}/.cache/json`)

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

    // Always include the site's gatsby-browser.js if it exists as it's
    // a handy place to include global styles and other global imports.
    try {
      if (env === `browser` && plugin.name === `default-site-plugin`) {
        return slash(
          require.resolve(path.join(plugin.resolve, `gatsby-${env}`))
        )
      }
    } catch (e) {
      // ignore
    }

    if (envAPIs && Array.isArray(envAPIs) && envAPIs.length > 0) {
      return slash(path.join(plugin.resolve, `gatsby-${env}`))
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

  const browserPluginsRequires = browserPlugins
    .map(
      plugin =>
        `{
      plugin: require('${plugin.resolve}'),
      options: ${JSON.stringify(plugin.options)},
    }`
    )
    .join(`,`)

  const browserAPIRunner = `module.exports = [${browserPluginsRequires}]\n`

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
    `${siteDir}/api-runner-browser-plugins.js`,
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
  activity = report.activityTimer(`source and transform nodes`, {
    parentSpan: bootstrapSpan,
  })
  activity.start()
  await require(`../utils/source-nodes`)({ parentSpan: activity.span })
  activity.end()

  // Create Schema.
  activity = report.activityTimer(`building schema`, {
    parentSpan: bootstrapSpan,
  })
  activity.start()
  await require(`../schema`).build({ parentSpan: activity.span })
  activity.end()

  // Collect resolvable extensions and attach to program.
  const extensions = [`.mjs`, `.js`, `.jsx`, `.wasm`, `.json`]
  // Change to this being an action and plugins implement `onPreBootstrap`
  // for adding extensions.
  const apiResults = await apiRunnerNode(`resolvableExtensions`, {
    traceId: `initial-resolvableExtensions`,
    parentSpan: bootstrapSpan,
  })

  store.dispatch({
    type: `SET_PROGRAM_EXTENSIONS`,
    payload: _.flattenDeep([extensions, apiResults]),
  })

  const graphqlRunner = (query, context = {}) => {
    const schema = store.getState().schema
    return graphql(schema, query, context, context, context)
  }

  // Collect pages.
  activity = report.activityTimer(`createPages`, {
    parentSpan: bootstrapSpan,
  })
  activity.start()
  await apiRunnerNode(`createPages`, {
    graphql: graphqlRunner,
    traceId: `initial-createPages`,
    waitForCascadingActions: true,
    parentSpan: activity.span,
  })
  activity.end()

  // A variant on createPages for plugins that want to
  // have full control over adding/removing pages. The normal
  // "createPages" API is called every time (during development)
  // that data changes.
  activity = report.activityTimer(`createPagesStatefully`, {
    parentSpan: bootstrapSpan,
  })
  activity.start()
  await apiRunnerNode(`createPagesStatefully`, {
    graphql: graphqlRunner,
    traceId: `initial-createPagesStatefully`,
    waitForCascadingActions: true,
    parentSpan: activity.span,
  })
  activity.end()

  activity = report.activityTimer(`onPreExtractQueries`, {
    parentSpan: bootstrapSpan,
  })
  activity.start()
  await apiRunnerNode(`onPreExtractQueries`, { parentSpan: activity.span })
  activity.end()

  // Update Schema for SitePage.
  activity = report.activityTimer(`update schema`, {
    parentSpan: bootstrapSpan,
  })
  activity.start()
  await require(`../schema`).build({ parentSpan: activity.span })
  activity.end()

  require(`../schema/type-conflict-reporter`).printConflicts()

  // Extract queries
  activity = report.activityTimer(`extract queries from components`, {
    parentSpan: bootstrapSpan,
  })
  activity.start()
  await extractQueries()
  activity.end()

  // Start the createPages hot reloader.
  if (process.env.NODE_ENV !== `production`) {
    require(`./page-hot-reloader`)(graphqlRunner)
  }

  // Run queries
  activity = report.activityTimer(`run graphql queries`, {
    parentSpan: bootstrapSpan,
  })
  activity.start()
  const startQueries = process.hrtime()
  queryQueue.on(`task_finish`, () => {
    const stats = queryQueue.getStats()
    activity.setStatus(
      `${stats.total}/${stats.peak} ${(
        stats.total / convertHrtime(process.hrtime(startQueries)).seconds
      ).toFixed(2)} queries/second`
    )
  })
  await runInitialQueries(activity)
  activity.end()

  // Write out files.
  activity = report.activityTimer(`write out page data`, {
    parentSpan: bootstrapSpan,
  })
  activity.start()
  try {
    await writePages()
  } catch (err) {
    report.panic(`Failed to write out page data`, err)
  }
  activity.end()

  // Write out redirects.
  activity = report.activityTimer(`write out redirect data`, {
    parentSpan: bootstrapSpan,
  })
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
      activity = report.activityTimer(`onPostBootstrap`, {
        parentSpan: bootstrapSpan,
      })
      activity.start()
      apiRunnerNode(`onPostBootstrap`, { parentSpan: activity.span }).then(
        () => {
          activity.end()
          bootstrapSpan.finish()
          resolve({ graphqlRunner })
        }
      )
    }
  }, 100)

  if (store.getState().jobs.active.length === 0) {
    // onPostBootstrap
    activity = report.activityTimer(`onPostBootstrap`, {
      parentSpan: bootstrapSpan,
    })
    activity.start()
    await apiRunnerNode(`onPostBootstrap`, { parentSpan: activity.span })
    activity.end()

    bootstrapSpan.finish()

    report.log(``)
    report.info(`bootstrap finished - ${process.uptime()} s`)
    report.log(``)
    emitter.emit(`BOOTSTRAP_FINISHED`)
    return {
      graphqlRunner,
    }
  } else {
    return new Promise(resolve => {
      // Wait until all side effect jobs are finished.
      emitter.on(`END_JOB`, () => checkJobsDone(resolve))
    })
  }
}
