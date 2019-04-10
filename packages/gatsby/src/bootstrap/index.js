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
const telemetry = require(`gatsby-telemetry`)

const apiRunnerNode = require(`../utils/api-runner-node`)
const getBrowserslist = require(`../utils/browserslist`)
const { graphql } = require(`graphql`)
const { store, emitter } = require(`../redux`)
const { actions } = require(`../redux/actions`)
const loadPlugins = require(`./load-plugins`)
const loadThemes = require(`./load-themes`)
const report = require(`gatsby-cli/lib/reporter`)
const getConfigFile = require(`./get-config-file`)
const tracer = require(`opentracing`).globalTracer()
const preferDefault = require(`./prefer-default`)
const nodeTracking = require(`../db/node-tracking`)
const withResolverContext = require(`../schema/context`)
// Add `util.promisify` polyfill for old node versions
require(`util.promisify/shim`)()

const { dispatch } = store
const { log, setProgramStatus } = actions
const logger = ({ message, type = `info` }) => report[type](message)

// Show stack trace on unhandled promises.
process.on(`unhandledRejection`, reason => {
  dispatch(log({ message: reason, type: `panic` }))
})

const { extractQueries } = require(`../query/query-watcher`)
const { runInitialQueries } = require(`../query/page-query-runner`)
const queryQueue = require(`../query/query-queue`)
const { writePages } = require(`../query/pages-writer`)
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
  dispatch({ type: `SET_LOGGER`, payload: logger })
  // dispatch(setLogger(logger))

  const spanArgs = args.parentSpan ? { childOf: args.parentSpan } : {}
  const bootstrapSpan = tracer.startSpan(`bootstrap`, spanArgs)

  const run = async (message, cb) => {
    const activity = dispatch(
      log({
        message,
        type: `activityTimer`,
        tracing: { parentSpan: bootstrapSpan },
      })
    )
    activity.start()
    const result = await cb(activity)
    activity.end()
    return result
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

  dispatch({ type: `SET_PROGRAM`, payload: program })

  // Try opening the site's gatsby-config.js file.
  const config = await run(`open and validate gatsby-configs`, async () => {
    let config = await preferDefault(
      getConfigFile(program.directory, `gatsby-config`)
    )

    // theme gatsby configs can be functions or objects
    if (config && config.__experimentalThemes) {
      const themes = await loadThemes(config)
      config = themes.config

      dispatch({ type: `SET_RESOLVED_THEMES`, payload: themes.themes })
    }

    if (config && config.polyfill) {
      const message =
        `Support for custom Promise polyfills has been removed in Gatsby v2. ` +
        `We only support Babel 7's new automatic polyfilling behavior.`
      dispatch(log({ message, type: `warn` }))
    }

    dispatch({ type: `SET_SITE_CONFIG`, payload: config })

    return config
  })

  const flattenedPlugins = await run(`load plugins`, () =>
    loadPlugins(config, program.directory)
  )

  telemetry.decorateEvent(`BUILD_END`, {
    plugins: flattenedPlugins.map(p => `${p.name}@${p.version}`),
  })

  // onPreInit
  await run(`onPreInit`, activity =>
    apiRunnerNode(`onPreInit`, { parentSpan: activity.span })
  )

  // During builds, delete html and css files from the public directory as we don't want
  // deleted pages and styles from previous builds to stick around.
  if (process.env.NODE_ENV === `production`) {
    await run(`delete html and css files from previous builds`, () =>
      del([
        `public/*.{html,css}`,
        `public/**/*.{html,css}`,
        `!public/static`,
        `!public/static/**/*.{html,css}`,
      ])
    )
  }

  const cacheDirectory = await run(`initialize cache`, async () => {
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
    const oldPluginsHash =
      state && state.status ? state.status.PLUGINS_HASH : ``

    // Check if anything has changed. If it has, delete the site's .cache
    // directory and tell reducers to empty themselves.
    //
    // Also if the hash isn't there, then delete things just in case something
    // is weird.
    if (oldPluginsHash && pluginsHash !== oldPluginsHash) {
      const message =
        `One or more of your plugins have changed since the last time you ran ` +
        `Gatsby. As a precaution, we're deleting your site's cache to ensure ` +
        `there's not any stale data.`
      dispatch(log({ message, type: `info` }))
    }
    const cacheDirectory = `${program.directory}/.cache`
    if (!oldPluginsHash || pluginsHash !== oldPluginsHash) {
      try {
        // Attempt to empty dir if remove fails,
        // like when directory is mount point
        await fs.remove(cacheDirectory).catch(() => fs.emptyDir(cacheDirectory))
      } catch (err) {
        const message = `Failed to remove .cache files.\n` + err
        dispatch(log({ message, type: `error` }))
      }
      // Tell reducers to delete their data (the store will already have
      // been loaded from the file system cache).
      dispatch({ type: `DELETE_CACHE` })
    }

    // Update the store with the new plugins hash.
    dispatch({ type: `UPDATE_PLUGINS_HASH`, payload: pluginsHash })

    // Now that we know the .cache directory is safe, initialize the cache
    // directory.
    fs.ensureDirSync(cacheDirectory)

    // Ensure the public/static directory
    fs.ensureDirSync(`${program.directory}/public/static`)

    return cacheDirectory
  })

  if (process.env.GATSBY_DB_NODES === `loki`) {
    await run(`start nodes db`, async () => {
      const loki = require(`../db/loki`)
      // Start the nodes database (in memory loki js with interval disk
      // saves). If data was saved from a previous build, it will be
      // loaded here
      const dbSaveFile = `${cacheDirectory}/loki/loki.db`
      try {
        await loki.start({
          saveFile: dbSaveFile,
        })
      } catch (e) {
        const message = `Error starting DB. Perhaps try deleting ${path.dirname(
          dbSaveFile
        )}.`
        dispatch(log({ message, type: `error` }))
      }
    })
  }

  /**
   * Initialize node tracking
   *
   * By now, our nodes database has been loaded, so ensure that we have
   * tracked all inline objects.
   */
  nodeTracking.trackDbNodes()

  /**
   * Copy our site files to the root of the site.
   */
  await run(`copy gatsby files`, async () => {
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
      const message = `Unable to copy site files to .cache.\n` + err
      dispatch(log({ message, type: `error` }))
    }

    // Find plugins which implement gatsby-browser and gatsby-ssr and write
    // out api-runners for them.
    const hasAPIFile = (env, plugin) => {
      // The plugin loader has disabled SSR APIs for this plugin. Usually due to
      // multiple implementations of an API that can only be implemented once
      if (env === `ssr` && plugin.skipSSR === true) return undefined

      const envAPIs = plugin[`${env}APIs`]

      // Always include gatsby-browser.js files if they exists as they're
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
      const message = `Failed to read ${siteDir}/api-runner-ssr.js\n` + err
      dispatch(log({ message, type: `panic` }))
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
  })

  /**
   * Start the main bootstrap processes.
   */

  // onPreBootstrap
  await run(`onPreBootstrap`, () => apiRunnerNode(`onPreBootstrap`))

  // Source nodes
  await run(`source and transform nodes`, activity =>
    require(`../utils/source-nodes`)({ parentSpan: activity.span })
  )

  // Create Schema.
  await run(`building schema`, activity =>
    require(`../schema`).build({ parentSpan: activity.span })
  )

  // Collect resolvable extensions and attach to program.
  const extensions = [`.mjs`, `.js`, `.jsx`, `.wasm`, `.json`]
  // Change to this being an action and plugins implement `onPreBootstrap`
  // for adding extensions.
  const apiResults = await apiRunnerNode(`resolvableExtensions`, {
    traceId: `initial-resolvableExtensions`,
    parentSpan: bootstrapSpan,
  })

  dispatch({
    type: `SET_PROGRAM_EXTENSIONS`,
    payload: _.flattenDeep([extensions, apiResults]),
  })

  const graphqlRunner = (query, context = {}) => {
    const schema = store.getState().schema
    return graphql(
      schema,
      query,
      context,
      withResolverContext(context, schema),
      context
    )
  }

  // Collect pages.
  await run(`createPages`, activity =>
    apiRunnerNode(`createPages`, {
      graphql: graphqlRunner,
      traceId: `initial-createPages`,
      waitForCascadingActions: true,
      parentSpan: activity.span,
    })
  )

  // A variant on createPages for plugins that want to
  // have full control over adding/removing pages. The normal
  // "createPages" API is called every time (during development)
  // that data changes.

  await run(`createPagesStatefully`, activity =>
    apiRunnerNode(`createPagesStatefully`, {
      graphql: graphqlRunner,
      traceId: `initial-createPagesStatefully`,
      waitForCascadingActions: true,
      parentSpan: activity.span,
    })
  )

  await run(`onPreExtractQueries`, activity =>
    apiRunnerNode(`onPreExtractQueries`, { parentSpan: activity.span })
  )

  // Update Schema for SitePage.
  await run(`update schema`, activity =>
    require(`../schema`).rebuildWithSitePage({ parentSpan: activity.span })
  )

  // Extract queries
  await run(`extract queries from components`, () => extractQueries())

  // Start the createPages hot reloader.
  if (process.env.NODE_ENV !== `production`) {
    require(`./page-hot-reloader`)(graphqlRunner)
  }

  // Run queries
  await run(`run graphql queries`, async activity => {
    const startQueries = process.hrtime()
    queryQueue.on(`task_finish`, () => {
      const stats = queryQueue.getStats()
      activity.setStatus(
        `${stats.total}/${stats.peak} ${(
          stats.total / convertHrtime(process.hrtime(startQueries)).seconds
        ).toFixed(2)} queries/second`
      )
    })
    // HACKY!!! TODO: REMOVE IN NEXT REFACTOR
    emitter.emit(`START_QUERY_QUEUE`)
    // END HACKY
    runInitialQueries(activity)
    await new Promise(resolve => queryQueue.on(`drain`, resolve))
    dispatch(setProgramStatus(`BOOTSTRAP_QUERY_RUNNING_FINISHED`))
  })

  // Write out files.
  await run(`Failed to write out page data`, async () => {
    try {
      await writePages()
    } catch (err) {
      const message = `Failed to write out page data: ` + err
      dispatch(log({ message, type: `error` }))
    }
  })

  // Write out redirects.
  await run(`write out redirect data`, () => writeRedirects())

  let onEndJob

  const checkJobsDone = _.debounce(async resolve => {
    const state = store.getState()
    if (state.jobs.active.length === 0) {
      emitter.off(`END_JOB`, onEndJob)

      await finishBootstrap(run, bootstrapSpan)
      resolve({ graphqlRunner })
    }
  }, 100)

  if (store.getState().jobs.active.length === 0) {
    await finishBootstrap(run, bootstrapSpan)
    return { graphqlRunner }
  } else {
    return new Promise(resolve => {
      // Wait until all side effect jobs are finished.
      onEndJob = () => checkJobsDone(resolve)
      emitter.on(`END_JOB`, onEndJob)
    })
  }
}

const finishBootstrap = async (run, bootstrapSpan) => {
  // onPostBootstrap
  await run(`onPostBootstrap`, activity =>
    apiRunnerNode(`onPostBootstrap`, { parentSpan: activity.span })
  )

  const message = `bootstrap finished - ${process.uptime()} s\n`
  dispatch(log({ message, type: `info` }))

  emitter.emit(`BOOTSTRAP_FINISHED`)
  dispatch(setProgramStatus(`BOOTSTRAP_FINISHED`))

  bootstrapSpan.finish()
}
