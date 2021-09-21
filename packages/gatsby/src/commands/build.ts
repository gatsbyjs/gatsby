import path from "path"
import reporter from "gatsby-cli/lib/reporter"
import { ITimerReporter } from "gatsby-cli/lib/reporter/reporter-timer"
import signalExit from "signal-exit"
import fs from "fs-extra"
import telemetry from "gatsby-telemetry"
import { updateSiteMetadata, isTruthy } from "gatsby-core-utils"
import webpack, { WebpackError } from "webpack"
import uuidv4 from "uuid/v4"
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
import { createPageSSRBundle } from "../utils/page-ssr-module/bundle-webpack"
import { shouldGenerateEngines } from "../utils/engines-helpers"
import { runPageGenerationJobs } from "../services/run-page-generation-jobs"

async function buildAndReportProductionBundle({ program, buildSpan }): Promise<{
  stats: webpack.Stats | Error | Array<WebpackError>
  waitForCompilerClose: Promise<void>
  buildActivityTimer: ITimerReporter
}> {
  const buildActivityTimer = reporter.activityTimer(
    `Building production JavaScript and CSS bundles`,
    { parentSpan: buildSpan }
  )
  buildActivityTimer.start()
  let stats
  let waitForCompilerClose
  try {
    const result = await buildProductionBundle(program, buildActivityTimer.span)
    stats = result.stats
    waitForCompilerClose = result.waitForCompilerClose

    if (stats.hasWarnings()) {
      const rawMessages = stats.toJson({ moduleTrace: false })
      reportWebpackWarnings(rawMessages.warnings, reporter)
    }
  } catch (err) {
    buildActivityTimer.panic(structureWebpackErrors(Stage.BuildJavascript, err))
  } finally {
    buildActivityTimer.end()
  }

  return {
    stats,
    waitForCompilerClose,
    buildActivityTimer,
  }
}

async function buildAndReportQueryEngineBundle({ buildSpan }): Promise<{
  engineBundlingPromises: Array<Promise<any>>
}> {
  const engineBundlingPromises: Array<Promise<any>> = []

  if (_CFLAGS_.GATSBY_MAJOR === `4` && shouldGenerateEngines()) {
    const buildQueryEngineActivityTimer = reporter.activityTimer(
      `Building Rendering Engines`,
      { parentSpan: buildSpan }
    )
    try {
      buildQueryEngineActivityTimer.start()
      // bundle graphql-engine
      engineBundlingPromises.push(createGraphqlEngineBundle())
      engineBundlingPromises.push(createPageSSRBundle())
      await Promise.all(engineBundlingPromises)
    } catch (err) {
      reporter.panic(err)
    } finally {
      buildQueryEngineActivityTimer.end()
    }
  }

  return { engineBundlingPromises }
}

async function buildAndReportHtmlRenderer({
  buildSpan,
  program,
  buildActivityTimer,
}): Promise<{
  waitForCompilerCloseBuildHtml: Promise<void>
}> {
  const buildSSRBundleActivityProgress = reporter.activityTimer(
    `Building HTML renderer`,
    { parentSpan: buildSpan }
  )
  buildSSRBundleActivityProgress.start()
  let waitForCompilerCloseBuildHtml
  try {
    const result = await buildRenderer(
      program,
      Stage.BuildHTML,
      buildSSRBundleActivityProgress.span
    )
    waitForCompilerCloseBuildHtml = result.waitForCompilerClose
  } catch (err) {
    buildActivityTimer.panic(structureWebpackErrors(Stage.BuildHTML, err))
  } finally {
    buildSSRBundleActivityProgress.end()
  }

  return {
    waitForCompilerCloseBuildHtml,
  }
}

function trackBuildStats({ queryStats, stats }): void {
  if (telemetry.isTrackingEnabled()) {
    // transform asset size to kB (from bytes) to fit 64 bit to numbers
    const bundleSizes = stats
      .toJson({ assets: true })
      .assets.filter(asset => asset.name.endsWith(`.js`))
      .map(asset => asset.size / 1000)
    const pageDataSizes = [...store.getState().pageDataStats.values()]

    telemetry.addSiteMeasurement(`BUILD_END`, {
      bundleStats: telemetry.aggregateStats(bundleSizes),
      pageDataStats: telemetry.aggregateStats(pageDataSizes),
      queryStats,
    })
  }
}

module.exports = async function build(program: IBuildArgs): Promise<void> {
  // global gatsby object to use without store
  global.__GATSBY = {
    buildId: uuidv4(),
    root: program!.directory,
  }

  if (isTruthy(process.env.VERBOSE)) {
    program.verbose = true
  }
  reporter.setVerbose(program.verbose)

  if (program.profile) {
    reporter.warn(
      `React Profiling is enabled. This can have a performance impact. See https://www.gatsbyjs.org/docs/profiling-site-performance-with-react-profiler/#performance-impact`
    )
  }

  await updateSiteMetadata({
    name: program.sitePackageJson.name,
    sitePath: program.directory,
    lastRun: Date.now(),
    pid: process.pid,
  })

  markWebpackStatusAsPending()

  const publicDir = path.join(program.directory, `public`)
  initTracer(
    process.env.GATSBY_OPEN_TRACING_CONFIG_FILE || program.openTracingConfigFile
  )
  const buildActivity = reporter.phantomActivity(`build`)
  buildActivity.start()

  telemetry.trackCli(`BUILD_START`)
  signalExit(exitCode => {
    telemetry.trackCli(`BUILD_END`, {
      exitCode: exitCode as number | undefined,
    })
  })

  const buildSpan = buildActivity.span
  buildSpan.setTag(`directory`, program.directory)

  const { gatsbyNodeGraphQLFunction, workerPool } = await bootstrap({
    program,
    parentSpan: buildSpan,
  })

  await writeOutRequires({
    store,
    parentSpan: buildSpan,
  })

  const graphqlRunner = new GraphQLRunner(store, {
    collectStats: true,
    graphqlTracing: program.graphqlTracing,
  })

  const { queryIds } = await calculateDirtyQueries({ store })

  // Only run queries with mode SSG
  if (_CFLAGS_.GATSBY_MAJOR === `4`) {
    queryIds.pageQueryIds = queryIds.pageQueryIds.filter(
      query => query.mode === `SSG`
    )
  }

  /**
   * Bundling
   */

  // Build Production JS and CSS Bundles
  const { stats, waitForCompilerClose, buildActivityTimer } =
    await buildAndReportProductionBundle({ program, buildSpan })

  // Run Static Queries prior to building the Query Engine. Static Query Context
  // is needed for engine creation
  await runStaticQueries({
    queryIds,
    parentSpan: buildSpan,
    store,
    graphqlRunner,
  })

  // Build Query Engine and Utilities
  const { engineBundlingPromises } = await buildAndReportQueryEngineBundle({
    buildSpan,
  })

  // Build HTML Renderer
  const { waitForCompilerCloseBuildHtml } = await buildAndReportHtmlRenderer({
    buildSpan,
    buildActivityTimer,
    program,
  })

  if (engineBundlingPromises.length) {
    if (process.send) {
      process.send({
        type: `LOG_ACTION`,
        action: {
          type: `ENGINES_READY`,
          timestamp: new Date().toJSON(),
        },
      })
    }
  }

  const PQR_ENABLED = process.env.GATSBY_EXPERIMENTAL_PARALLEL_QUERY_RUNNING

  const externalJobsEnabled =
    process.env.ENABLE_GATSBY_EXTERNAL_JOBS === `1` ||
    process.env.ENABLE_GATSBY_EXTERNAL_JOBS === `true`

  const pageGenerationJobsEnabled = externalJobsEnabled && process.send

  let waitForWorkerPoolRestart = Promise.resolve()

  if (pageGenerationJobsEnabled) {
    runPageGenerationJobs(queryIds)
    await waitUntilAllJobsComplete()
  } else if (PQR_ENABLED) {
    await runQueriesInWorkersQueue(workerPool, queryIds)
    // Jobs still might be running even though query running finished
    await waitUntilAllJobsComplete()
    // Restart worker pool before merging state to lower memory pressure while merging state
    waitForWorkerPoolRestart = workerPool.restart()
    await mergeWorkerState(workerPool)
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

  const webpackCompilationHash = (stats as webpack.Stats).hash as string
  if (
    webpackCompilationHash !== store.getState().webpackCompilationHash ||
    !appDataUtil.exists(publicDir)
  ) {
    store.dispatch({
      type: `SET_WEBPACK_COMPILATION_HASH`,
      payload: webpackCompilationHash,
    })

    const rewriteActivityTimer = reporter.activityTimer(
      `Rewriting compilation hashes`,
      {
        parentSpan: buildSpan,
      }
    )
    rewriteActivityTimer.start()

    await appDataUtil.write(publicDir, webpackCompilationHash)

    rewriteActivityTimer.end()
  }

  await flushPendingPageDataWrites(buildSpan)
  markWebpackStatusAsDone()

  /**
   * Telemetry tracking for
   * - bundleStats
   * - pageDataStats
   * - queryStats
   */
  trackBuildStats({ stats, queryStats: graphqlRunner.getStats() })

  store.dispatch(actions.setProgramStatus(`BOOTSTRAP_QUERY_RUNNING_FINISHED`))

  await db.saveState()

  await waitUntilAllJobsComplete()

  // we need to save it again to make sure our latest state has been saved
  await db.saveState()

  let toRegenerate: Array<string> = []
  let toDelete: Array<string> = []

  if (!pageGenerationJobsEnabled) {
    if (_CFLAGS_.GATSBY_MAJOR === `4` && shouldGenerateEngines()) {
      // well, tbf we should just generate this in `.cache` and avoid deleting it :shrug:
      program.keepPageRenderer = true
    }

    await waitForWorkerPoolRestart

    const res = await buildHTMLPagesAndDeleteStaleArtifacts({
      program,
      workerPool,
      buildSpan,
    })
    toRegenerate = res.toRegenerate
    toDelete = res.toDelete
  }
  const waitWorkerPoolEnd = Promise.all(workerPool.end())

  telemetry.addSiteMeasurement(`BUILD_END`, {
    pagesCount: toRegenerate.length, // number of html files that will be written
    totalPagesCount: store.getState().pages.size, // total number of pages
  })

  const postBuildActivityTimer = reporter.activityTimer(`onPostBuild`, {
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

  try {
    await waitWorkerPoolEnd
  } catch (e) {
    reporter.warn(`Error when closing WorkerPool: ${e.message}`)
  }

  // Make sure we saved the latest state so we have all jobs cached
  await db.saveState()

  await Promise.all([waitForCompilerClose, waitForCompilerCloseBuildHtml])

  const state = store.getState()
  reporter._renderPageTree({
    components: state.components,
    functions: state.functions,
    pages: state.pages,
    root: state.program.directory,
  })

  reporter.info(`Done building in ${process.uptime()} sec`)

  buildSpan.finish()
  await stopTracer()
  buildActivity.end()

  if (program.logPages) {
    if (toRegenerate.length) {
      reporter.info(
        `Built pages:\n${toRegenerate
          .map(path => `Updated page: ${path}`)
          .join(`\n`)}`
      )
    }

    if (toDelete.length) {
      reporter.info(
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
    reporter.info(`.cache/newPages.txt created`)

    await fs.writeFile(deletedFilesPath, deletedFilesContent, `utf8`)
    reporter.info(`.cache/deletedPages.txt created`)
  }

  showExperimentNotices()

  if (await userGetsSevenDayFeedback()) {
    showSevenDayFeedbackRequest()
  } else if (await userPassesFeedbackRequestHeuristic()) {
    showFeedbackRequest()
  }
}
