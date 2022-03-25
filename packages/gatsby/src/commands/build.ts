import path from "path"
import report from "gatsby-cli/lib/reporter"
import signalExit from "signal-exit"
import fs from "fs-extra"
import telemetry from "gatsby-telemetry"
import { updateInternalSiteMetadata, isTruthy, uuid } from "gatsby-core-utils"
import {
  buildRenderer,
  buildHTMLPagesAndDeleteStaleArtifacts,
  IBuildArgs,
} from "./build-html"
import { buildProductionBundle } from "./build-javascript"
import { bootstrap } from "../bootstrap"
import apiRunnerNode from "../utils/api-runner-node"
import { GraphQLRunner } from "../query/graphql-runner"
import { copyStaticDirs } from "../utils/get-static-dir"
import { initTracer, stopTracer } from "../utils/tracer"
import * as db from "../redux/save-state"
import { store } from "../redux"
import * as appDataUtil from "../utils/app-data"
import { flush as flushPendingPageDataWrites } from "../utils/page-data"
import {
  structureWebpackErrors,
  reportWebpackWarnings,
} from "../utils/webpack-error-utils"
import {
  userGetsSevenDayFeedback,
  userPassesFeedbackRequestHeuristic,
  showFeedbackRequest,
  showSevenDayFeedbackRequest,
} from "../utils/feedback"
import { actions } from "../redux/actions"
import { waitUntilAllJobsComplete } from "../utils/wait-until-jobs-complete"
import { Stage } from "./types"
import {
  calculateDirtyQueries,
  runStaticQueries,
  runPageQueries,
  writeOutRequires,
} from "../services"
import {
  markWebpackStatusAsPending,
  markWebpackStatusAsDone,
} from "../utils/webpack-status"
import { showExperimentNotices } from "../utils/show-experiment-notice"
import {
  mergeWorkerState,
  runQueriesInWorkersQueue,
} from "../utils/worker/pool"
import { createGraphqlEngineBundle } from "../schema/graphql-engine/bundle-webpack"
import {
  createPageSSRBundle,
  writeQueryContext,
} from "../utils/page-ssr-module/bundle-webpack"
import { shouldGenerateEngines } from "../utils/engines-helpers"
import reporter from "gatsby-cli/lib/reporter"
import type webpack from "webpack"
import {
  materializePageMode,
  getPageMode,
  preparePageTemplateConfigs,
} from "../utils/page-mode"
import { validateEngines } from "../utils/validate-engines"
import { constructConfigObject } from "../utils/gatsby-cloud-config"
import { runPageGenerationJobs } from "../services/run-page-generation-jobs"

module.exports = async function build(
  program: IBuildArgs,
  // Let external systems running Gatsby to inject attributes
  externalTelemetryAttributes: Record<string, any>
): Promise<void> {
  const buildId = uuid.v4()

  // global gatsby object to use without store

  global.__GATSBY = {
    buildId,
    root: program!.directory,
  }

  if (isTruthy(process.env.VERBOSE)) {
    program.verbose = true
  }
  report.setVerbose(program.verbose)

  if (program.profile) {
    report.warn(
      `React Profiling is enabled. This can have a performance impact. See https://www.gatsbyjs.com/docs/profiling-site-performance-with-react-profiler/#performance-impact`
    )
  }

  await updateInternalSiteMetadata({
    name: program.sitePackageJson.name,
    sitePath: program.directory,
    lastRun: Date.now(),
    pid: process.pid,
  })

  markWebpackStatusAsPending()

  const publicDir = path.join(program.directory, `public`)
  if (!externalTelemetryAttributes) {
    await initTracer(
      process.env.GATSBY_OPEN_TRACING_CONFIG_FILE ||
        program.openTracingConfigFile
    )
  }

  const buildActivity = report.phantomActivity(`build`)
  buildActivity.start()

  telemetry.trackCli(`BUILD_START`)
  signalExit(exitCode => {
    telemetry.trackCli(`BUILD_END`, {
      exitCode: exitCode as number | undefined,
    })
  })

  const buildSpan = buildActivity.span
  buildSpan.setTag(`directory`, program.directory)

  // Add external tags to buildSpan
  if (externalTelemetryAttributes) {
    Object.entries(externalTelemetryAttributes).forEach(([key, value]) => {
      buildActivity.span.setTag(key, value)
    })
  }

  const { gatsbyNodeGraphQLFunction, workerPool } = await bootstrap({
    program,
    parentSpan: buildSpan,
  })

  // writes sync and async require files to disk
  // used inside routing "html" + "javascript"
  await writeOutRequires({
    store,
    parentSpan: buildSpan,
  })

  const graphqlRunner = new GraphQLRunner(store, {
    collectStats: true,
    graphqlTracing: program.graphqlTracing,
  })

  // queryIds from this function represent the pages that need to be built
  const { queryIds } = await calculateDirtyQueries({ store })

  // Only run queries with mode SSG
  if (_CFLAGS_.GATSBY_MAJOR === `4`) {
    queryIds.pageQueryIds = queryIds.pageQueryIds.filter(
      query => getPageMode(query) === `SSG`
    )
  }

  /************
   * Bundling *
   ************/

  let closeJavascriptBundleCompilation: (() => Promise<void>) | undefined
  let closeHTMLBundleCompilation: (() => Promise<void>) | undefined
  let webpackAssets: Array<webpack.StatsAsset> | null = null
  let webpackCompilationHash: string | null = null
  let webpackSSRCompilationHash: string | null = null

  const engineBundlingPromises: Array<Promise<any>> = []
  const buildActivityTimer = report.activityTimer(
    `Building production JavaScript and CSS bundles`,
    { parentSpan: buildSpan }
  )
  buildActivityTimer.start()

  try {
    const { stats, close } = await buildProductionBundle(
      program,
      buildActivityTimer.span
    )
    closeJavascriptBundleCompilation = close

    if (stats.hasWarnings()) {
      const rawMessages = stats.toJson({ all: false, warnings: true })
      reportWebpackWarnings(rawMessages.warnings, report)
    }

    webpackAssets = stats.toJson({
      all: false,
      assets: true,
      cachedAssets: true,
    }).assets as Array<webpack.StatsAsset>
    webpackCompilationHash = stats.hash as string
  } catch (err) {
    buildActivityTimer.panic(structureWebpackErrors(Stage.BuildJavascript, err))
  } finally {
    buildActivityTimer.end()
  }

  // Run Static Queries prior to building the Query Engine. Static Query Context
  // is needed for engine creation
  await runStaticQueries({
    queryIds,
    parentSpan: buildSpan,
    store,
    graphqlRunner,
  })

  // create scope so we don't leak state object
  {
    const state = store.getState()
    await writeQueryContext({
      staticQueriesByTemplate: state.staticQueriesByTemplate,
      components: state.components,
    })
  }

  // Page Gen
  const PAGE_GEN_ENABLED = process.env.GATSBY_EXPERIMENTAL_PAGE_GENERATION

  const externalJobsEnabled =
    process.env.ENABLE_GATSBY_EXTERNAL_JOBS === `1` ||
    process.env.ENABLE_GATSBY_EXTERNAL_JOBS === `true`

  const pageGenerationJobsEnabled =
    PAGE_GEN_ENABLED && externalJobsEnabled && process.send

  /**
   * Rendering Engine
   */

  if (
    _CFLAGS_.GATSBY_MAJOR === `4` &&
    (shouldGenerateEngines() || pageGenerationJobsEnabled)
  ) {
    const state = store.getState()
    const buildActivityTimer = report.activityTimer(
      `Building Rendering Engines`,
      { parentSpan: buildSpan }
    )
    try {
      buildActivityTimer.start()
      // bundle graphql-engine
      engineBundlingPromises.push(
        createGraphqlEngineBundle(program.directory, report, program.verbose)
      )

      engineBundlingPromises.push(
        createPageSSRBundle({
          rootDir: program.directory,
          components: state.components,
          staticQueriesByTemplate: state.staticQueriesByTemplate,
          webpackCompilationHash: webpackCompilationHash as string, // we set webpackCompilationHash above
          reporter: report,
          isVerbose: program.verbose,
        })
      )
      await Promise.all(engineBundlingPromises)
    } catch (err) {
      reporter.panic(err)
    } finally {
      buildActivityTimer.end()
    }
  }

  /**
   * HTML Renderer
   */

  const buildSSRBundleActivityProgress = report.activityTimer(
    `Building HTML renderer`,
    { parentSpan: buildSpan }
  )
  buildSSRBundleActivityProgress.start()
  try {
    const { close, stats } = await buildRenderer(
      program,
      Stage.BuildHTML,
      buildSSRBundleActivityProgress.span
    )

    closeHTMLBundleCompilation = close
    webpackSSRCompilationHash = stats.hash as string

    await close()
  } catch (err) {
    buildActivityTimer.panic(structureWebpackErrors(Stage.BuildHTML, err))
  } finally {
    buildSSRBundleActivityProgress.end()
  }

  // exec outer config function for each template
  const pageConfigActivity = report.activityTimer(`Execute page configs`, {
    parentSpan: buildSpan,
  })
  pageConfigActivity.start()
  try {
    await preparePageTemplateConfigs(gatsbyNodeGraphQLFunction)
  } catch (err) {
    reporter.panic(err)
  } finally {
    pageConfigActivity.end()
  }

  /**
   * Engine Validation
   */

  if (
    _CFLAGS_.GATSBY_MAJOR === `4` &&
    (shouldGenerateEngines() || pageGenerationJobsEnabled)
  ) {
    const validateEnginesActivity = report.activityTimer(
      `Validating Rendering Engines`,
      {
        parentSpan: buildSpan,
      }
    )
    validateEnginesActivity.start()
    try {
      await validateEngines(store.getState().program.directory)
    } catch (error) {
      validateEnginesActivity.panic({ id: `98001`, context: {}, error })
    } finally {
      validateEnginesActivity.end()
    }
  }

  const cacheActivity = report.activityTimer(`Caching Webpack compilations`, {
    parentSpan: buildSpan,
  })
  try {
    cacheActivity.start()
    await Promise.all([
      closeJavascriptBundleCompilation?.(),
      closeHTMLBundleCompilation?.(),
    ])
  } finally {
    cacheActivity.end()
  }

  // Start saving page.mode in the main process (while queries run in workers in parallel)
  const waitMaterializePageMode = materializePageMode()

  if (engineBundlingPromises.length) {
    if (process.send) {
      await waitMaterializePageMode
      process.send({
        type: `LOG_ACTION`,
        action: {
          type: `ENGINES_READY`,
          timestamp: new Date().toJSON(),
          payload: {
            createPageGeneratorService: !!pageGenerationJobsEnabled,
            createSSRService: shouldGenerateEngines(),
          },
        },
      })
    }
  }

  /**
   * Query Running
   */

  const PQR_ENABLED = process.env.GATSBY_EXPERIMENTAL_PARALLEL_QUERY_RUNNING

  let waitForWorkerPoolRestart = Promise.resolve()

  if (pageGenerationJobsEnabled) {
    // TODO RUN OUR JOB FUNCTION
    await runPageGenerationJobs(queryIds, waitUntilAllJobsComplete)
  } else if (PQR_ENABLED) {
    await runQueriesInWorkersQueue(workerPool, queryIds, {
      parentSpan: buildSpan,
    })
    // Jobs still might be running even though query running finished
    await waitUntilAllJobsComplete()
    // Restart worker pool before merging state to lower memory pressure while merging state
    waitForWorkerPoolRestart = workerPool.restart()
    await mergeWorkerState(workerPool, buildSpan)
  } else {
    await runPageQueries({
      queryIds,
      graphqlRunner,
      parentSpan: buildSpan,
      store,
    })
  }

  await apiRunnerNode(`onPreBuild`, {
    graphql: gatsbyNodeGraphQLFunction,
    parentSpan: buildSpan,
  })

  // Copy files from the static directory to
  // an equivalent static directory within public.
  copyStaticDirs()

  // create scope so we don't leak state object
  {
    const state = store.getState()
    if (
      webpackCompilationHash !== state.webpackCompilationHash ||
      !appDataUtil.exists(publicDir)
    ) {
      store.dispatch({
        type: `SET_WEBPACK_COMPILATION_HASH`,
        payload: webpackCompilationHash,
      })

      const rewriteActivityTimer = report.activityTimer(
        `Rewriting compilation hashes`,
        {
          parentSpan: buildSpan,
        }
      )
      rewriteActivityTimer.start()

      await appDataUtil.write(publicDir, webpackCompilationHash as string)

      rewriteActivityTimer.end()
    }

    if (state.html.ssrCompilationHash !== webpackSSRCompilationHash) {
      store.dispatch({
        type: `SET_SSR_WEBPACK_COMPILATION_HASH`,
        payload: webpackSSRCompilationHash,
      })
    }
  }

  if (!pageGenerationJobsEnabled) {
    await flushPendingPageDataWrites(buildSpan)

    markWebpackStatusAsDone()
  }

  if (telemetry.isTrackingEnabled()) {
    // transform asset size to kB (from bytes) to fit 64 bit to numbers
    const bundleSizes = (webpackAssets as Array<webpack.StatsAsset>)
      .filter(asset => asset.name.endsWith(`.js`))
      .map(asset => asset.size / 1000)
    const pageDataSizes = [...store.getState().pageDataStats.values()]

    telemetry.addSiteMeasurement(`BUILD_END`, {
      bundleStats: telemetry.aggregateStats(bundleSizes),
      pageDataStats: telemetry.aggregateStats(pageDataSizes),
      queryStats: graphqlRunner.getStats(),
    })
  }

  store.dispatch(actions.setProgramStatus(`BOOTSTRAP_QUERY_RUNNING_FINISHED`))

  await db.saveState()

  await waitUntilAllJobsComplete()

  // we need to save it again to make sure our latest state has been saved
  await db.saveState()

  let toRegenerate: Array<string> = []
  let toDelete: Array<string> = []

  /**
   * HTML GENERATION
   */

  if (!pageGenerationJobsEnabled) {
    if (_CFLAGS_.GATSBY_MAJOR === `4` && shouldGenerateEngines()) {
      // well, tbf we should just generate this in `.cache` and avoid deleting it :shrug:
      program.keepPageRenderer = true
    }

    await waitForWorkerPoolRestart

    const res = await buildHTMLPagesAndDeleteStaleArtifacts({
      program,
      workerPool,
      parentSpan: buildSpan,
    })

    toRegenerate = res.toRegenerate
    toDelete = res.toDelete
  }

  await waitMaterializePageMode
  const waitWorkerPoolEnd = Promise.all(workerPool.end())

  {
    let SSGCount = 0
    let DSGCount = 0
    let SSRCount = 0
    for (const page of store.getState().pages.values()) {
      if (page.mode === `SSR`) {
        SSRCount++
      } else if (page.mode === `DSG`) {
        DSGCount++
      } else {
        SSGCount++
      }
    }

    telemetry.addSiteMeasurement(`BUILD_END`, {
      pagesCount: toRegenerate.length, // number of html files that will be written
      totalPagesCount: store.getState().pages.size, // total number of pages
      SSRCount,
      DSGCount,
      SSGCount,
    })
  }

  const postBuildActivityTimer = report.activityTimer(`onPostBuild`, {
    parentSpan: buildSpan,
  })
  postBuildActivityTimer.start()
  await apiRunnerNode(`onPostBuild`, {
    graphql: gatsbyNodeGraphQLFunction,
    parentSpan: postBuildActivityTimer.span,
  })
  postBuildActivityTimer.end()

  // Wait for any jobs that were started in onPostBuild
  // This could occur due to queries being run which invoke sharp for instance
  await waitUntilAllJobsComplete()

  if (!pageGenerationJobsEnabled) {
    try {
      await waitWorkerPoolEnd
    } catch (e) {
      report.warn(`Error when closing WorkerPool: ${e.message}`)
    }
  }

  // Make sure we saved the latest state so we have all jobs cached
  await db.saveState()

  const state = store.getState()
  reporter._renderPageTree({
    components: state.components,
    functions: state.functions,
    pages: state.pages,
    root: state.program.directory,
  })

  if (process.send) {
    const gatsbyCloudConfig = constructConfigObject(state.config)

    process.send({
      type: `LOG_ACTION`,
      action: {
        type: `GATSBY_CONFIG_KEYS`,
        payload: gatsbyCloudConfig,
        timestamp: new Date().toJSON(),
      },
    })
  }

  report.info(`Done building in ${process.uptime()} sec`)

  buildActivity.end()
  if (!externalTelemetryAttributes) {
    await stopTracer()
  }

  if (program.logPages) {
    if (toRegenerate.length) {
      report.info(
        `Built pages:\n${toRegenerate
          .map(path => `Updated page: ${path}`)
          .join(`\n`)}`
      )
    }

    if (toDelete.length) {
      report.info(
        `Deleted pages:\n${toDelete
          .map(path => `Deleted page: ${path}`)
          .join(`\n`)}`
      )
    }
  }

  if (program.writeToFile) {
    const createdFilesPath = path.resolve(
      `${program.directory}/.cache`,
      `newPages.txt`
    )
    const createdFilesContent = toRegenerate.length
      ? `${toRegenerate.join(`\n`)}\n`
      : ``

    const deletedFilesPath = path.resolve(
      `${program.directory}/.cache`,
      `deletedPages.txt`
    )
    const deletedFilesContent = toDelete.length
      ? `${toDelete.join(`\n`)}\n`
      : ``

    await fs.writeFile(createdFilesPath, createdFilesContent, `utf8`)
    report.info(`.cache/newPages.txt created`)

    await fs.writeFile(deletedFilesPath, deletedFilesContent, `utf8`)
    report.info(`.cache/deletedPages.txt created`)
  }

  showExperimentNotices()

  /**
   * User Feedback Survey
   */

  if (await userGetsSevenDayFeedback()) {
    showSevenDayFeedbackRequest()
  } else if (await userPassesFeedbackRequestHeuristic()) {
    showFeedbackRequest()
  }
}
