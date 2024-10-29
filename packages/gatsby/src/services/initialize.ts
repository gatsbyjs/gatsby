import _ from "lodash"
import { slash, isCI } from "gatsby-core-utils"
import * as fs from "fs-extra"
import { releaseAllMutexes } from "gatsby-core-utils/mutex"
import { md5, md5File } from "gatsby-core-utils"
import path from "path"
import glob from "globby"

import apiRunnerNode from "../utils/api-runner-node"
import { getBrowsersList } from "../utils/browserslist"
import { Store, AnyAction } from "redux"
import * as WorkerPool from "../utils/worker/pool"
import { startPluginRunner } from "../redux/plugin-runner"
import { store, emitter } from "../redux"
import reporter from "gatsby-cli/lib/reporter"
import { removeStaleJobs } from "../bootstrap/remove-stale-jobs"
import { IPluginInfoOptions } from "../bootstrap/load-plugins/types"
import { IGatsbyState, IStateProgram } from "../redux/types"
import { IBuildContext } from "./types"
import { loadConfig } from "../bootstrap/load-config"
import { loadPlugins } from "../bootstrap/load-plugins"
import type { InternalJob } from "../utils/jobs/types"
import type { IDataLayerContext } from "./../state-machines/data-layer/types"
import { enableNodeMutationsDetection } from "../utils/detect-node-mutations"
import { compileGatsbyFiles } from "../utils/parcel/compile-gatsby-files"
import { resolveModule } from "../utils/module-resolver"
import { writeGraphQLConfig } from "../utils/graphql-typegen/file-writes"
import { initAdapterManager } from "../utils/adapter/manager"
import type { IAdapterManager } from "../utils/adapter/types"

interface IPluginResolution {
  resolve: string
  options: IPluginInfoOptions
}

interface IPluginResolutionSSR extends IPluginResolution {
  name: string
}

// If the env variable GATSBY_EXPERIMENTAL_FAST_DEV is set, enable
// all DEV experimental changes (but only during development & not on CI).
if (
  process.env.gatsby_executing_command === `develop` &&
  process.env.GATSBY_EXPERIMENTAL_FAST_DEV &&
  !isCI() &&
  // skip FAST_DEV handling in workers, all env vars will be handle
  // by main process already and passed to worker
  !process.env.GATSBY_WORKER_POOL_WORKER
) {
  process.env.GATSBY_EXPERIMENTAL_DEV_SSR = `true`
  process.env.PRESERVE_FILE_DOWNLOAD_CACHE = `true`

  reporter.info(`
Two fast dev experiments are enabled: SSR in develop and preserving file download cache.

Please give feedback on their respective umbrella issues!

- https://gatsby.dev/dev-ssr-feedback
- https://gatsby.dev/cache-clearing-feedback
  `)
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

type WebhookBody = IDataLayerContext["webhookBody"]

export async function initialize({
  program: args,
  parentSpan,
}: IBuildContext): Promise<{
  store: Store<IGatsbyState, AnyAction>
  workerPool: WorkerPool.GatsbyWorkerPool
  webhookBody?: WebhookBody
  adapterManager?: IAdapterManager
}> {
  if (process.env.GATSBY_DISABLE_CACHE_PERSISTENCE) {
    reporter.info(
      `GATSBY_DISABLE_CACHE_PERSISTENCE is enabled. Cache won't be persisted. Next builds will not be able to reuse any work done by current session.`
    )
  }
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

  if (reporter._registerAdditionalDiagnosticOutputHandler) {
    reporter._registerAdditionalDiagnosticOutputHandler(
      function logPendingJobs(): string {
        const outputs: Array<InternalJob> = []

        for (const [, { job }] of store.getState().jobsV2.incomplete) {
          outputs.push(job)
          if (outputs.length >= 5) {
            // 5 not finished jobs should be enough to track down issues
            // this is just limiting output "spam"
            break
          }
        }

        return outputs.length
          ? `Unfinished jobs (showing ${outputs.length} of ${
              store.getState().jobsV2.incomplete.size
            } jobs total):\n\n` + JSON.stringify(outputs, null, 2)
          : ``
      }
    )
  }

  const directory = slash(args.directory)

  const program: IStateProgram = {
    ...args,
    extensions: [],
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

  const siteDirectory = program.directory

  // Compile root gatsby files
  let activity = reporter.activityTimer(`compile gatsby files`)
  activity.start()
  await compileGatsbyFiles(siteDirectory)
  activity.end()

  // Load gatsby config
  activity = reporter.activityTimer(`load gatsby config`, {
    parentSpan,
  })
  activity.start()
  const config = await loadConfig({
    siteDirectory,
    processFlags: true,
  })
  activity.end()

  let adapterManager: IAdapterManager | undefined = undefined

  // Only initialize adapters during "gatsby build"
  if (process.env.gatsby_executing_command === `build`) {
    adapterManager = await initAdapterManager()
    await adapterManager.restoreCache()
  }

  // Load plugins
  activity = reporter.activityTimer(`load plugins`, {
    parentSpan,
  })
  activity.start()
  const flattenedPlugins = await loadPlugins(config, siteDirectory)
  activity.end()

  // GATSBY_QUERY_ON_DEMAND_LOADING_INDICATOR=false gatsby develop
  // to disable query on demand loading indicator
  if (!process.env.GATSBY_QUERY_ON_DEMAND_LOADING_INDICATOR) {
    // if GATSBY_QUERY_ON_DEMAND_LOADING_INDICATOR was not set at all
    // enable loading indicator
    process.env.GATSBY_QUERY_ON_DEMAND_LOADING_INDICATOR = `true`
  }

  if (process.env.GATSBY_DETECT_NODE_MUTATIONS) {
    enableNodeMutationsDetection()
  }

  if (config && config.polyfill) {
    reporter.warn(
      `Support for custom Promise polyfills has been removed in Gatsby v2. We only support Babel 7's new automatic polyfilling behavior.`
    )
  }

  // Throughout the codebase GATSBY_QUERY_ON_DEMAND is used to conditionally enable the QoD behavior, depending on if "gatsby develop" is running or not. In CI QoD is disabled by default, too.
  // You can use GATSBY_ENABLE_QUERY_ON_DEMAND_IN_CI to force enable it in CI.
  process.env.GATSBY_QUERY_ON_DEMAND = `true`
  if (process.env.gatsby_executing_command !== `develop`) {
    // we don't want to ever have this flag enabled for anything than develop
    // in case someone have this env var globally set
    delete process.env.GATSBY_QUERY_ON_DEMAND
  } else if (isCI() && !process.env.GATSBY_ENABLE_QUERY_ON_DEMAND_IN_CI) {
    delete process.env.GATSBY_QUERY_ON_DEMAND
    reporter.verbose(
      `Query on Demand is disabled in CI by default. You can enable it by setting GATSBY_ENABLE_QUERY_ON_DEMAND_IN_CI env var.`
    )
  }

  // run stale jobs
  // @ts-ignore we'll need to fix redux typings https://redux.js.org/usage/usage-with-typescript
  store.dispatch(removeStaleJobs(store.getState().jobsV2))

  // Start plugin runner which listens to the store
  // and invokes Gatsby API based on actions.
  startPluginRunner()

  // onPreInit
  activity = reporter.activityTimer(`onPreInit`, {
    parentSpan,
  })
  activity.start()
  await apiRunnerNode(`onPreInit`, { parentSpan: activity.span })
  activity.end()

  const lmdbCacheDirectoryName = `caches-lmdb`

  const cacheDirectory = `${program.directory}/.cache`
  const publicDirectory = `${program.directory}/public`
  const workerCacheDirectory = `${program.directory}/.cache/worker`
  const lmdbCacheDirectory = `${program.directory}/.cache/${lmdbCacheDirectoryName}`

  const publicDirExists = fs.existsSync(publicDirectory)
  const workerCacheDirExists = fs.existsSync(workerCacheDirectory)
  const lmdbCacheDirExists = fs.existsSync(lmdbCacheDirectory)

  // check the cache file that is used by the current configuration
  const cacheDirExists = lmdbCacheDirExists

  // For builds in case public dir exists, but cache doesn't, we need to clean up potentially stale
  // artifacts from previous builds (due to cache not being available, we can't rely on tracking of artifacts)
  if (
    process.env.NODE_ENV === `production` &&
    publicDirExists &&
    !cacheDirExists
  ) {
    activity = reporter.activityTimer(
      `delete html and css files from previous builds`,
      {
        parentSpan,
      }
    )
    activity.start()
    const files = await glob(
      [
        `public/**/*.{html,css,mdb}`,
        `!public/page-data/**/*`,
        `!public/static`,
        `!public/static/**/*.{html,css}`,
      ],
      {
        cwd: program.directory,
      }
    )
    await Promise.all(files.map(file => fs.remove(file)))
    activity.end()
  }

  // When the main process and workers communicate they save parts of their redux state to .cache/worker
  // We should clean this directory to remove stale files that a worker might accidentally reuse then
  if (workerCacheDirExists) {
    activity = reporter.activityTimer(
      `delete worker cache from previous builds`,
      {
        parentSpan,
      }
    )
    activity.start()
    await fs
      .remove(workerCacheDirectory)
      .catch(() => fs.emptyDir(workerCacheDirectory))
    activity.end()
  }

  activity = reporter.activityTimer(`initialize cache`, {
    parentSpan,
  })
  activity.start()
  // Check if any plugins have been updated since our last run. If so,
  // we delete the cache as there's likely been changes since
  // the previous run.
  //
  // We do this by creating a hash of all the version numbers of installed
  // plugins, the site's package.json, gatsby-config.js, and gatsby-node.js.
  // The last, gatsby-node.js, is important as many gatsby sites put important
  // logic in there e.g. generating slugs for custom pages.
  const pluginVersions = flattenedPlugins.map(p => p.version)
  // we should include gatsby version as well
  pluginVersions.push(require(`../../package.json`).version)
  const optionalFiles = [
    `${program.directory}/gatsby-config.js`,
    `${program.directory}/gatsby-node.js`,
    `${program.directory}/gatsby-config.ts`,
    `${program.directory}/gatsby-node.ts`,
  ] as Array<string>

  const state = store.getState()

  const hashes = await Promise.all(
    // Ignore optional files with .catch() as these are not required
    [md5File(`package.json`), state.config.trailingSlash as string].concat(
      optionalFiles.map(f => md5File(f).catch(() => ``))
    )
  )

  const pluginsHash = await md5(JSON.stringify(pluginVersions.concat(hashes)))

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

  // .cache directory exists in develop at this point
  // so checking for .cache/json or .cache/caches-lmdb as a heuristic (could be any expected file)
  const cacheIsCorrupt = cacheDirExists && !publicDirExists
  if (cacheIsCorrupt) {
    reporter.info(reporter.stripIndent`
      We've detected that the Gatsby cache is incomplete (the .cache directory exists
      but the public directory does not). As a precaution, we're deleting your site's
      cache to ensure there's no stale data.
    `)
  }

  if (!oldPluginsHash || pluginsHash !== oldPluginsHash || cacheIsCorrupt) {
    try {
      // Comment out inviet until we can test perf impact
      //
      // let sourceFileSystemVersion = flattenedPlugins.find(
      // plugin => plugin.name === `gatsby-source-filesystem`
      // )?.version

      // // The site might be using a plugin which uses "createRemoteFileNode" but
      // // doesn't have gatsby-source-filesystem in their gatsby-config.js. So lets
      // // also try requiring it.
      // if (!sourceFileSystemVersion) {
      // try {
      // sourceFileSystemVersion = require(`gatsby-source-filesystem/package.json`)
      // ?.version
      // } catch {
      // // ignore require errors
      // }
      // }
      // } else if (
      // sourceFileSystemVersion &&
      // semver.lt(sourceFileSystemVersion, `2.9.0`)
      // ) {
      // // If the site has more than 50 downloaded files in it, tell them
      // // how to save time.
      // try {
      // // Divide by two as the directory as both cache files + the actual downloaded files so
      // // two results / downloaded file.
      // const filesCount =
      // (await fs.readdir(`.cache/caches/gatsby-source-filesystem`))
      // .length / 2
      // if (filesCount > 50) {
      // reporter.info(stripIndent`\n\n

      // Your local development experience is about to get better, faster, and stronger!

      // Your friendly Gatsby maintainers detected your site downloads quite a few files and that we're about to delete all ${Math.round(
      // filesCount
      // )} of them 😅. We're working right now to make our caching smarter which means we won't delete your downloaded files any more.

      // If you're interested in trialing the new caching behavior *today* — which should make your local development environment faster, go ahead and enable the PRESERVE_FILE_DOWNLOAD_CACHE flag and run your develop server again.

      // To do so, add to your gatsby-config.js:

      // flags: {
      // preserve_file_download_cache: true,
      // }

      // visit the umbrella issue to learn more: https://github.com/gatsbyjs/gatsby/discussions/28331
      // `)
      // }
      // } catch {
      // // ignore errors (mostly will just be directory not found).
      // }
      // }

      const deleteGlobs = [
        // By default delete all files & subdirectories
        `.cache/**`,
        `.cache/data/**`,
        `!.cache/data/gatsby-core-utils/**`,
        `!.cache/compiled`,
        // Add webpack
        `!.cache/webpack`,
        `!.cache/adapters`,
      ]

      if (process.env.GATSBY_EXPERIMENTAL_PRESERVE_FILE_DOWNLOAD_CACHE) {
        // Stop the caches directory from being deleted, add all sub directories,
        // but remove gatsby-source-filesystem
        deleteGlobs.push(`!.cache/caches`)
        deleteGlobs.push(`.cache/caches/*`)
        deleteGlobs.push(`!.cache/caches/gatsby-source-filesystem`)
      }

      const files = await glob(deleteGlobs, {
        cwd: program.directory,
      })

      await Promise.all(files.map(file => fs.remove(file)))
    } catch (e) {
      reporter.error(`Failed to remove .cache files.`, e)
    }
    // Tell reducers to delete their data (the store will already have
    // been loaded from the file system cache).
    store.dispatch({
      type: `DELETE_CACHE`,
      cacheIsCorrupt,
    })

    // make sure all previous mutexes are released
    await releaseAllMutexes()
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
  await fs.ensureDir(`${publicDirectory}/static`)

  // Init plugins once cache is initialized
  await apiRunnerNode(`onPluginInit`, {
    parentSpan: activity.span,
  })

  activity.end()

  activity = reporter.activityTimer(`copy gatsby files`, {
    parentSpan,
  })

  activity.start()

  const srcDir = `${__dirname}/../../cache-dir`
  const siteDir = cacheDirectory

  try {
    await fs.copy(srcDir, siteDir, {
      overwrite: true,
    })
    await fs.ensureDir(`${cacheDirectory}/${lmdbCacheDirectoryName}`)

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
        const modulePath = path.join(plugin.resolve, `gatsby-${env}`)
        return slash(resolveModule(modulePath) as string)
      }
    } catch (e) {
      // ignore
    }

    if (envAPIs && Array.isArray(envAPIs) && envAPIs.length > 0) {
      const modulePath = path.join(plugin.resolve, `gatsby-${env}`)
      return slash(resolveModule(modulePath) as string)
    }
    return undefined
  }

  const isResolved = (plugin): plugin is IPluginResolution => !!plugin.resolve
  const isResolvedSSR = (plugin): plugin is IPluginResolutionSSR =>
    !!plugin.resolve

  const ssrPlugins: Array<IPluginResolutionSSR> = flattenedPlugins
    .map(plugin => {
      return {
        name: plugin.name,
        resolve: hasAPIFile(`ssr`, plugin),
        options: plugin.pluginOptions,
      }
    })
    .filter(isResolvedSSR)

  const browserPlugins: Array<IPluginResolution> = flattenedPlugins
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
      name: '${plugin.name}',
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

  if (state.config.graphqlTypegen) {
    // This is only run during `gatsby develop`
    if (process.env.gatsby_executing_command === `develop`) {
      writeGraphQLConfig(program)
    }
  }

  let initialWebhookBody: WebhookBody = undefined

  if (process.env.GATSBY_INITIAL_WEBHOOK_BODY) {
    try {
      initialWebhookBody = JSON.parse(process.env.GATSBY_INITIAL_WEBHOOK_BODY)
    } catch (e) {
      reporter.error(
        `Failed to parse GATSBY_INITIAL_WEBHOOK_BODY as JSON:\n"${e.message}"`
      )
    }
  }

  return {
    store,
    workerPool,
    webhookBody: initialWebhookBody,
    adapterManager,
  }
}
