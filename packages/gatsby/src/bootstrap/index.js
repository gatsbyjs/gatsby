/* @flow */

const _ = require(`lodash`)
const slash = require(`slash`)
const fs = require(`fs-extra`)
const md5File = require(`md5-file/promise`)
const crypto = require(`crypto`)
const del = require(`del`)
const path = require(`path`)
const Promise = require(`bluebird`)
const telemetry = require(`gatsby-telemetry`)

const apiRunnerNode = require(`../utils/api-runner-node`)
const getBrowserslist = require(`../utils/browserslist`)
const { store, emitter } = require(`../redux`)
const loadPlugins = require(`./load-plugins`)
const loadThemes = require(`./load-themes`)
const report = require(`gatsby-cli/lib/reporter`)
const getConfigFile = require(`./get-config-file`)
const tracer = require(`opentracing`).globalTracer()
const preferDefault = require(`./prefer-default`)
// Add `util.promisify` polyfill for old node versions
require(`util.promisify/shim`)()

// Show stack trace on unhandled promises.
process.on(`unhandledRejection`, (reason, p) => {
  report.panic(reason)
})

const createGraphqlRunner = require(`./graphql-runner`)
const { extractQueries } = require(`../query/query-watcher`)
const requiresWriter = require(`./requires-writer`)
const { writeRedirects } = require(`./redirects-writer`)

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

  /* Time for a little story...
   * When running `gatsby develop`, the globally installed gatsby-cli starts
   * and sets up a Redux store (which is where logs are now stored). When gatsby
   * finds your project's locally installed gatsby-cli package in node_modules,
   * it switches over. This instance will have a separate redux store. We need to
   * ensure that the correct store is used which is why we call setStore
   * (/packages/gatsby-cli/src/reporter/redux/index.js)
   *
   * This function
   * - copies over the logs from the global gatsby-cli to the local one
   * - sets the store to the local one (so that further actions dispatched by
   * the global gatsby-cli are handled by the local one)
   */
  if (args.setStore) {
    args.setStore(store)
  }

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

  let activityForJobs

  emitter.on(`CREATE_JOB`, () => {
    if (!activityForJobs) {
      activityForJobs = report.phantomActivity(`Running jobs`)
      activityForJobs.start()
    }
  })

  const onEndJob = () => {
    if (activityForJobs && store.getState().jobs.active.length === 0) {
      activityForJobs.end()
      activityForJobs = null
    }
  }

  emitter.on(`END_JOB`, onEndJob)

  // Try opening the site's gatsby-config.js file.
  let activity = report.activityTimer(`open and validate gatsby-configs`, {
    parentSpan: bootstrapSpan,
  })
  activity.start()
  const { configModule, configFilePath } = await getConfigFile(
    program.directory,
    `gatsby-config`
  )
  let config = preferDefault(configModule)

  // The root config cannot be exported as a function, only theme configs
  if (typeof config === `function`) {
    report.panic({
      id: `10126`,
      context: {
        configName: `gatsby-config`,
        path: program.directory,
      },
    })
  }

  // theme gatsby configs can be functions or objects
  if (config && config.__experimentalThemes) {
    report.warn(
      `The gatsby-config key "__experimentalThemes" has been deprecated. Please use the "plugins" key instead.`
    )
    const themes = await loadThemes(config, {
      useLegacyThemes: true,
      configFilePath,
    })
    config = themes.config

    store.dispatch({
      type: `SET_RESOLVED_THEMES`,
      payload: themes.themes,
    })
  } else if (config) {
    const plugins = await loadThemes(config, {
      useLegacyThemes: false,
      configFilePath,
    })
    config = plugins.config
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

  activity = report.activityTimer(`load plugins`, { parentSpan: bootstrapSpan })
  activity.start()
  const flattenedPlugins = await loadPlugins(config, program.directory)
  activity.end()

  telemetry.decorateEvent(`BUILD_END`, {
    plugins: flattenedPlugins.map(p => `${p.name}@${p.version}`),
  })

  // onPreInit
  activity = report.activityTimer(`onPreInit`, {
    parentSpan: bootstrapSpan,
  })
  activity.start()
  await apiRunnerNode(`onPreInit`, { parentSpan: activity.span })
  activity.end()

  // During builds, delete html and css files from the public directory as we don't want
  // deleted pages and styles from previous builds to stick around.
  if (process.env.NODE_ENV === `production`) {
    activity = report.activityTimer(
      `delete html and css files from previous builds`,
      {
        parentSpan: bootstrapSpan,
      }
    )
    activity.start()
    await del([
      `public/**/*.{html,css}`,
      `!public/page-data/**/*`,
      `!public/static`,
      `!public/static/**/*.{html,css}`,
    ])
    activity.end()
  }

  activity = report.activityTimer(`initialize cache`, {
    parentSpan: bootstrapSpan,
  })
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
  const cacheDirectory = `${program.directory}/.cache`
  if (!oldPluginsHash || pluginsHash !== oldPluginsHash) {
    try {
      // Attempt to empty dir if remove fails,
      // like when directory is mount point
      await fs.remove(cacheDirectory).catch(() => fs.emptyDir(cacheDirectory))
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
  await fs.ensureDir(cacheDirectory)

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
    const dbSaveFile = `${cacheDirectory}/loki/loki.db`
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

  activity = report.activityTimer(`copy gatsby files`, {
    parentSpan: bootstrapSpan,
  })
  activity.start()
  const srcDir = `${__dirname}/../../cache-dir`
  const siteDir = cacheDirectory
  const tryRequire = `${__dirname}/../utils/test-require-error.js`
  try {
    await fs.copy(srcDir, siteDir, {
      clobber: true,
    })
    await fs.copy(tryRequire, `${siteDir}/test-require-error.js`, {
      clobber: true,
    })
    await fs.ensureDirSync(`${cacheDirectory}/json`)

    // Ensure .cache/fragments exists and is empty. We want fragments to be
    // added on every run in response to data as fragments can only be added if
    // the data used to create the schema they're dependent on is available.
    await fs.emptyDir(`${cacheDirectory}/fragments`)
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

    // Always include gatsby-browser.js files if they exist as they're
    // a handy place to include global styles and other global imports.
    try {
      if (env === `browser`) {
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
    .map(plugin => {
      // we need a relative import path to keep contenthash the same if directory changes
      const relativePluginPath = path.relative(siteDir, plugin.resolve)
      return `{
      plugin: require('${slash(relativePluginPath)}'),
      options: ${JSON.stringify(plugin.options)},
    }`
    })
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
  activity = report.activityTimer(`onPreBootstrap`, {
    parentSpan: bootstrapSpan,
  })
  activity.start()
  await apiRunnerNode(`onPreBootstrap`, {
    parentSpan: activity.span,
  })
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

  const graphqlRunner = createGraphqlRunner(store, report)

  // Collect pages.
  activity = report.activityTimer(`createPages`, {
    parentSpan: bootstrapSpan,
  })
  activity.start()
  await apiRunnerNode(
    `createPages`,
    {
      graphql: graphqlRunner,
      traceId: `initial-createPages`,
      waitForCascadingActions: true,
      parentSpan: activity.span,
    },
    { activity }
  )
  activity.end()

  // A variant on createPages for plugins that want to
  // have full control over adding/removing pages. The normal
  // "createPages" API is called every time (during development)
  // that data changes.
  activity = report.activityTimer(`createPagesStatefully`, {
    parentSpan: bootstrapSpan,
  })
  activity.start()
  await apiRunnerNode(
    `createPagesStatefully`,
    {
      graphql: graphqlRunner,
      traceId: `initial-createPagesStatefully`,
      waitForCascadingActions: true,
      parentSpan: activity.span,
    },
    {
      activity,
    }
  )
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
  await require(`../schema`).rebuildWithSitePage({ parentSpan: activity.span })
  activity.end()

  await extractQueries({ parentSpan: bootstrapSpan })

  // Write out files.
  activity = report.activityTimer(`write out requires`, {
    parentSpan: bootstrapSpan,
  })
  activity.start()
  try {
    await requiresWriter.writeAll(store.getState())
  } catch (err) {
    report.panic(`Failed to write out requires`, err)
  }
  activity.end()

  // Write out redirects.
  activity = report.activityTimer(`write out redirect data`, {
    parentSpan: bootstrapSpan,
  })
  activity.start()
  await writeRedirects()
  activity.end()

  activity = report.activityTimer(`onPostBootstrap`, {
    parentSpan: bootstrapSpan,
  })
  activity.start()
  await apiRunnerNode(`onPostBootstrap`, { parentSpan: activity.span })
  activity.end()

  report.log(``)
  report.info(`bootstrap finished - ${process.uptime().toFixed(3)} s`)
  report.log(``)
  emitter.emit(`BOOTSTRAP_FINISHED`)
  require(`../redux/actions`).boundActionCreators.setProgramStatus(
    `BOOTSTRAP_FINISHED`
  )

  bootstrapSpan.finish()

  return { graphqlRunner }
}
