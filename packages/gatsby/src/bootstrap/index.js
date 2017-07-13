/* @flow */
const Promise = require(`bluebird`)
const glob = require(`glob`)
const _ = require(`lodash`)
const slash = require(`slash`)
const fs = require(`fs-extra`)
const md5File = require(`md5-file/promise`)
const crypto = require(`crypto`)
const report = require(`yurnalist`)
const convertHrtime = require(`convert-hrtime`)

const apiRunnerNode = require(`../utils/api-runner-node`)
const { graphql } = require(`graphql`)
const { store, emitter } = require(`../redux`)
const loadPlugins = require(`./load-plugins`)
const { initCache } = require(`../utils/cache`)

const {
  extractQueries,
} = require(`../internal-plugins/query-runner/query-watcher`)
const {
  runQueries,
} = require(`../internal-plugins/query-runner/page-query-runner`)
const { writePages } = require(`../internal-plugins/query-runner/pages-writer`)

const activityTimer = name => {
  const spinner = report.activity()
  const start = process.hrtime()

  const elapsedTime = function() {
    var precision = 3 // 3 decimal places
    var elapsed = process.hrtime(start)
    return `${convertHrtime(elapsed)[`seconds`].toFixed(precision)} s`
  }
  return {
    start: () => {
      spinner.tick(name)
    },
    end: () => {
      report.success(`${name} — ${elapsedTime()}`)
      spinner.end()
    },
  }
}

// Override console.log to add the source file + line number.
// Useful for debugging if you lose a console.log somewhere.
// Otherwise leave commented out.
// require(`./log-line-function`)

const preferDefault = m => (m && m.default) || m

module.exports = async (program: any) => {
  // Fix program directory path for windows env
  program.directory = slash(program.directory)

  store.dispatch({
    type: `SET_PROGRAM`,
    payload: program,
  })

  // Try opening the site's gatsby-config.js file.
  let activity = activityTimer(`open and validate gatsby-config.js`)
  activity.start()
  let config
  try {
    // $FlowFixMe
    config = preferDefault(require(`${program.directory}/gatsby-config`))
  } catch (e) {
    const firstLine = e.toString().split(`\n`)[0]
    if (!/Error: Cannot find module.*gatsby-config/.test(firstLine)) {
      console.log(``)
      console.log(``)
      console.log(e)
      process.exit(1)
    }
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
    console.log(
      `
One or more of your plugins have changed since the last time you ran Gatsby. As
a precaution, we're deleting your site's cache to ensure there's not any stale
data
`
    )
  }

  if (!oldPluginsHash || pluginsHash !== oldPluginsHash) {
    try {
      await fs.remove(`${program.directory}/.cache`)
    } catch (e) {
      console.error(`Failed to remove .cache files. ${e.message}`)
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
  await fs.mkdirp(`${program.directory}/public/static`)

  // Copy our site files to the root of the site.
  activity = activityTimer(`copy gatsby files`)
  activity.start()
  const srcDir = `${__dirname}/../cache-dir`
  const siteDir = `${program.directory}/.cache`
  try {
    await fs.copy(srcDir, siteDir, { clobber: true })
    await fs.mkdirs(`${program.directory}/.cache/json`)
  } catch (e) {
    console.log(`Unable to copy site files to .cache`)
    console.log(e)
    process.exit(1)
  }

  // Find plugins which implement gatsby-browser and gatsby-ssr and write
  // out api-runners for them.
  const hasAPIFile = (env, plugin) =>
    // TODO make this async...
    glob.sync(`${plugin.resolve}/gatsby-${env}*`)[0]

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
    console.error(`Failed to read ${siteDir}/api-runner-browser.js`)
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
    console.error(`Failed to read ${siteDir}/api-runner-ssr.js`)
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

  // Source nodes
  activity = activityTimer(`source and transform nodes`)
  activity.start()
  await require(`../utils/source-nodes`)()
  activity.end()

  // Create Schema.
  activity = activityTimer(`building schema`)
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
  activity = activityTimer(`createLayouts`)
  activity.start()
  await apiRunnerNode(`createLayouts`, {
    graphql: graphqlRunner,
    traceId: `initial-createLayouts`,
    waitForCascadingActions: true,
  })
  activity.end()

  // Collect pages.
  activity = activityTimer(`createPages`)
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
  activity = activityTimer(`createPagesStatefully`)
  activity.start()
  await apiRunnerNode(`createPagesStatefully`, {
    graphql: graphqlRunner,
    traceId: `initial-createPagesStatefully`,
    waitForCascadingActions: true,
  })
  activity.end()

  // Extract queries
  activity = activityTimer(`extract queries from components`)
  activity.start()
  await extractQueries()
  activity.end()

  // Run queries
  activity = activityTimer(`run graphql queries`)
  activity.start()
  await runQueries()
  activity.end()

  // Write out files.
  activity = activityTimer(`write out page data`)
  activity.start()
  await writePages()
  activity.end()

  // Update Schema for SitePage.
  activity = activityTimer(`update schema`)
  activity.start()
  await require(`../schema`)()
  activity.end()

  const checkJobsDone = _.debounce(resolve => {
    const state = store.getState()
    if (state.jobs.active.length === 0) {
      console.log(``)
      console.log(
        `bootstrap finished, time since started: ${process.uptime()}sec`
      )
      console.log(``)
      resolve({ graphqlRunner })
    }
  }, 100)

  if (store.getState().jobs.active.length === 0) {
    console.log(``)
    console.log(`bootstrap finished, time since started: ${process.uptime()} s`)
    console.log(``)
    return { graphqlRunner }
  } else {
    return new Promise(resolve => {
      // Wait until all side effect jobs are finished.
      emitter.on(`END_JOB`, () => checkJobsDone(resolve))
    })
  }
}
