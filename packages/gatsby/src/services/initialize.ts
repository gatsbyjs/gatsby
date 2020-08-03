import _ from "lodash"
import { slash } from "gatsby-core-utils"
import fs from "fs-extra"
import md5File from "md5-file/promise"
import crypto from "crypto"
import del from "del"
import path from "path"
import telemetry from "gatsby-telemetry"

import apiRunnerNode from "../utils/api-runner-node"
import { getBrowsersList } from "../utils/browserslist"
import { Store, AnyAction } from "redux"
import { preferDefault } from "../bootstrap/prefer-default"
import * as WorkerPool from "../utils/worker/pool"
import JestWorker from "jest-worker"
import { startPluginRunner } from "../redux/plugin-runner"
import { loadPlugins } from "../bootstrap/load-plugins"
import { store, emitter } from "../redux"
import loadThemes from "../bootstrap/load-themes"
import reporter from "gatsby-cli/lib/reporter"
import { getConfigFile } from "../bootstrap/get-config-file"
import { removeStaleJobs } from "../bootstrap/remove-stale-jobs"
import { IPluginInfoOptions } from "../bootstrap/load-plugins/types"
import { internalActions } from "../redux/actions"
import { IGatsbyState } from "../redux/types"
import { IBuildContext } from "./types"

interface IPluginResolution {
  resolve: string
  options: IPluginInfoOptions
}

// Show stack trace on unhandled promises.
process.on(`unhandledRejection`, (reason: unknown) => {
  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/33636
  reporter.panic((reason as Error) || `Unhandled rejection`)
})

// Override console.log to add the source file + line number.
// Useful for debugging if you lose a console.log somewhere.
// Otherwise leave commented out.
// require(`../bootstrap/log-line-function`)

export async function initialize({
  program: args,
  parentSpan,
}: IBuildContext): Promise<{
  store: Store<IGatsbyState, AnyAction>
  workerPool: JestWorker
}> {
  if (!args) {
    reporter.panic(`Missing program args`)
  }

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
  startPluginRunner()

  const directory = slash(args.directory)

  const program = {
    ...args,
    browserslist: getBrowsersList(directory),
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
      activityForJobs = reporter.phantomActivity(`Running jobs`)
      activityForJobs.start()
    }
  })

  const onEndJob = (): void => {
    if (activityForJobs && store.getState().jobs.active.length === 0) {
      activityForJobs.end()
      activityForJobs = null
    }
  }

  emitter.on(`END_JOB`, onEndJob)

  // Try opening the site's gatsby-config.js file.
  let activity = reporter.activityTimer(`open and validate gatsby-configs`, {
    parentSpan,
  })
  activity.start()
  const { configModule, configFilePath } = await getConfigFile(
    program.directory,
    `gatsby-config`
  )
  let config = preferDefault(configModule)

  // The root config cannot be exported as a function, only theme configs
  if (typeof config === `function`) {
    reporter.panic({
      id: `10126`,
      context: {
        configName: `gatsby-config`,
        path: program.directory,
      },
    })
  }

  // theme gatsby configs can be functions or objects
  if (config && config.__experimentalThemes) {
    reporter.warn(
      `The gatsby-config key "__experimentalThemes" has been deprecated. Please use the "plugins" key instead.`
    )
    const themes = await loadThemes(config, {
      useLegacyThemes: true,
      configFilePath,
      rootDir: program.directory,
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
      rootDir: program.directory,
    })
    config = plugins.config
  }

  if (config && config.polyfill) {
    reporter.warn(
      `Support for custom Promise polyfills has been removed in Gatsby v2. We only support Babel 7's new automatic polyfilling behavior.`
    )
  }

  store.dispatch(internalActions.setSiteConfig(config))

  activity.end()

  // run stale jobs
  store.dispatch(removeStaleJobs(store.getState()))

  activity = reporter.activityTimer(`load plugins`, {
    parentSpan,
  })
  activity.start()
  const flattenedPlugins = await loadPlugins(config, program.directory)
  activity.end()

  // Multiple occurrences of the same name-version-pair can occur,
  // so we report an array of unique pairs
  const pluginsStr = _.uniq(flattenedPlugins.map(p => `${p.name}@${p.version}`))
  telemetry.decorateEvent(`BUILD_END`, {
    plugins: pluginsStr,
  })

  telemetry.decorateEvent(`DEVELOP_STOP`, {
    plugins: pluginsStr,
  })

  // onPreInit
  activity = reporter.activityTimer(`onPreInit`, {
    parentSpan,
  })
  activity.start()
  await apiRunnerNode(`onPreInit`, { parentSpan: activity.span })
  activity.end()

  // During builds, delete html and css files from the public directory as we don't want
  // deleted pages and styles from previous builds to stick around.
  if (
    !process.env.GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES &&
    process.env.NODE_ENV === `production`
  ) {
    activity = reporter.activityTimer(
      `delete html and css files from previous builds`,
      {
        parentSpan,
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

  activity = reporter.activityTimer(`initialize cache`, {
    parentSpan,
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
    !!process.env.GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES,
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
  const state = store.getState()
  const oldPluginsHash = state && state.status ? state.status.PLUGINS_HASH : ``

  // Check if anything has changed. If it has, delete the site's .cache
  // directory and tell reducers to empty themselves.
  //
  // Also if the hash isn't there, then delete things just in case something
  // is weird.
  if (oldPluginsHash && pluginsHash !== oldPluginsHash) {
    reporter.info(reporter.stripIndent`
      One or more of your plugins have changed since the last time you ran Gatsby. As
      a precaution, we're deleting your site's cache to ensure there's no stale data.
    `)
  }
  const cacheDirectory = `${program.directory}/.cache`
  if (!oldPluginsHash || pluginsHash !== oldPluginsHash) {
    try {
      // Attempt to empty dir if remove fails,
      // like when directory is mount point
      await fs.remove(cacheDirectory).catch(() => fs.emptyDir(cacheDirectory))
    } catch (e) {
      reporter.error(`Failed to remove .cache files.`, e)
    }
    // Tell reducers to delete their data (the store will already have
    // been loaded from the file system cache).
    store.dispatch({
      type: `DELETE_CACHE`,
    })

    // in future this should show which plugin's caches are purged
    // possibly should also have which plugins had caches
    telemetry.decorateEvent(`BUILD_END`, {
      pluginCachesPurged: [`*`],
    })
    telemetry.decorateEvent(`DEVELOP_STOP`, {
      pluginCachesPurged: [`*`],
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

  activity = reporter.activityTimer(`copy gatsby files`, {
    parentSpan,
  })
  activity.start()
  const srcDir = `${__dirname}/../../cache-dir`
  const siteDir = cacheDirectory
  const tryRequire = `${__dirname}/../utils/test-require-error.js`
  try {
    await fs.copy(srcDir, siteDir)
    await fs.copy(tryRequire, `${siteDir}/test-require-error.js`)
    await fs.ensureDirSync(`${cacheDirectory}/json`)

    // Ensure .cache/fragments exists and is empty. We want fragments to be
    // added on every run in response to data as fragments can only be added if
    // the data used to create the schema they're dependent on is available.
    await fs.emptyDir(`${cacheDirectory}/fragments`)
  } catch (err) {
    reporter.panic(`Unable to copy site files to .cache`, err)
  }

  // Find plugins which implement gatsby-browser and gatsby-ssr and write
  // out api-runners for them.
  const hasAPIFile = (env, plugin): string | undefined => {
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

  const isResolved = (plugin): plugin is IPluginResolution => !!plugin.resolve

  const ssrPlugins: IPluginResolution[] = flattenedPlugins
    .map(plugin => {
      return {
        resolve: hasAPIFile(`ssr`, plugin),
        options: plugin.pluginOptions,
      }
    })
    .filter(isResolved)

  const browserPlugins: IPluginResolution[] = flattenedPlugins
    .map(plugin => {
      return {
        resolve: hasAPIFile(`browser`, plugin),
        options: plugin.pluginOptions,
      }
    })
    .filter(isResolved)

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
    reporter.panic(`Failed to read ${siteDir}/api-runner-ssr.js`, err)
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
  activity = reporter.activityTimer(`onPreBootstrap`, {
    parentSpan,
  })
  activity.start()
  await apiRunnerNode(`onPreBootstrap`, {
    parentSpan: activity.span,
  })
  activity.end()

  // Collect resolvable extensions and attach to program.
  const extensions = [`.mjs`, `.js`, `.jsx`, `.wasm`, `.json`]
  // Change to this being an action and plugins implement `onPreBootstrap`
  // for adding extensions.
  const apiResults = await apiRunnerNode(`resolvableExtensions`, {
    traceId: `initial-resolvableExtensions`,
    parentSpan,
  })

  store.dispatch({
    type: `SET_PROGRAM_EXTENSIONS`,
    payload: _.flattenDeep([extensions, apiResults]),
  })

  const workerPool = WorkerPool.create()

  return {
    store,
    workerPool,
  }
}
