import path from "path"
import report from "gatsby-cli/lib/reporter"
import signalExit from "signal-exit"
import fs from "fs-extra"
import telemetry from "gatsby-telemetry"
import { updateSiteMetadata, isTruthy } from "gatsby-core-utils"
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
import webpackConfig from "../utils/webpack.config.js"
import { webpack } from "webpack"
import { createGraphqlEngineBundle } from "../schema/graphql-engine/bundle-webpack"
import { createPageSSRBundle } from "../utils/page-ssr-module/bundle-webpack"
import { shouldGenerateEngines } from "../utils/engines-helpers"

module.exports = async function build(program: IBuildArgs): Promise<void> {
  if (isTruthy(process.env.VERBOSE)) {
    program.verbose = true
  }
  report.setVerbose(program.verbose)

  if (program.profile) {
    report.warn(
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
  initTracer(program.openTracingConfigFile)
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

  const { gatsbyNodeGraphQLFunction, workerPool } = await bootstrap({
    program,
    parentSpan: buildSpan,
  })

  const engineBundlingPromises: Array<Promise<any>> = []

  if (_CFLAGS_.GATSBY_MAJOR === `4` && shouldGenerateEngines()) {
    // bundle graphql-engine
    engineBundlingPromises.push(createGraphqlEngineBundle())
  }

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

  let waitForWorkerPoolRestart = Promise.resolve()
  if (process.env.GATSBY_EXPERIMENTAL_PARALLEL_QUERY_RUNNING) {
    await runQueriesInWorkersQueue(workerPool, queryIds)
    // Jobs still might be running even though query running finished
    await waitUntilAllJobsComplete()
    // Restart worker pool before merging state to lower memory pressure while merging state
    waitForWorkerPoolRestart = workerPool.restart()
    await mergeWorkerState(workerPool)
  } else {
    await runStaticQueries({
      queryIds,
      parentSpan: buildSpan,
      store,
      graphqlRunner,
    })

    await runPageQueries({
      queryIds,
      graphqlRunner,
      parentSpan: buildSpan,
      store,
    })
  }

  await writeOutRequires({
    store,
    parentSpan: buildSpan,
  })

  await apiRunnerNode(`onPreBuild`, {
    graphql: gatsbyNodeGraphQLFunction,
    parentSpan: buildSpan,
  })

  // Copy files from the static directory to
  // an equivalent static directory within public.
  copyStaticDirs()

  const buildActivityTimer = report.activityTimer(
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
      reportWebpackWarnings(rawMessages.warnings, report)
    }
  } catch (err) {
    buildActivityTimer.panic(structureWebpackErrors(Stage.BuildJavascript, err))
  } finally {
    buildActivityTimer.end()
  }

  if (_CFLAGS_.GATSBY_MAJOR === `4` && shouldGenerateEngines()) {
    // client bundle is produced so static query maps should be ready
    engineBundlingPromises.push(createPageSSRBundle())
  }

  const webpackCompilationHash = stats.hash
  if (
    webpackCompilationHash !== store.getState().webpackCompilationHash ||
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

    await appDataUtil.write(publicDir, webpackCompilationHash)

    rewriteActivityTimer.end()
  }

  await flushPendingPageDataWrites()
  markWebpackStatusAsDone()

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
      queryStats: graphqlRunner.getStats(),
    })
  }

  store.dispatch(actions.setProgramStatus(`BOOTSTRAP_QUERY_RUNNING_FINISHED`))

  await db.saveState()

  await waitUntilAllJobsComplete()

  // we need to save it again to make sure our latest state has been saved
  await db.saveState()

  const buildSSRBundleActivityProgress = report.activityTimer(
    `Building HTML renderer`,
    { parentSpan: buildSpan }
  )
  buildSSRBundleActivityProgress.start()
  let pageRenderer = ``
  let waitForCompilerCloseBuildHtml
  try {
    const result = await buildRenderer(program, Stage.BuildHTML, buildSpan)
    pageRenderer = result.rendererPath
    if (_CFLAGS_.GATSBY_MAJOR === `4` && shouldGenerateEngines()) {
      // for now copy page-render to `.cache` so page-ssr module can require it as a sibling module
      const outputDir = path.join(program.directory, `.cache`, `page-ssr`)
      engineBundlingPromises.push(
        fs
          .ensureDir(outputDir)
          .then(() =>
            fs.copyFile(
              result.rendererPath,
              path.join(outputDir, `render-page.js`)
            )
          )
      )
    }
    waitForCompilerCloseBuildHtml = result.waitForCompilerClose

    // TODO Move to page-renderer
    if (_CFLAGS_.GATSBY_MAJOR === `4`) {
      const routesWebpackConfig = await webpackConfig(
        program,
        program.directory,
        `build-ssr`,
        null,
        { parentSpan: buildSSRBundleActivityProgress.span }
      )

      await new Promise((resolve, reject) => {
        const compiler = webpack(routesWebpackConfig)
        compiler.run(err => {
          if (err) {
            return void reject(err)
          }

          compiler.close(error => {
            if (error) {
              return void reject(error)
            }
            return void resolve(undefined)
          })

          return undefined
        })
      })
    }
  } catch (err) {
    buildActivityTimer.panic(structureWebpackErrors(Stage.BuildHTML, err))
  } finally {
    buildSSRBundleActivityProgress.end()
  }

  if (_CFLAGS_.GATSBY_MAJOR === `4` && shouldGenerateEngines()) {
    // well, tbf we should just generate this in `.cache` and avoid deleting it :shrug:
    program.keepPageRenderer = true
  }

  await waitForWorkerPoolRestart

  const { toRegenerate, toDelete } =
    await buildHTMLPagesAndDeleteStaleArtifacts({
      program,
      pageRenderer,
      workerPool,
      buildSpan,
    })

  const waitWorkerPoolEnd = Promise.all(workerPool.end())

  telemetry.addSiteMeasurement(`BUILD_END`, {
    pagesCount: toRegenerate.length, // number of html files that will be written
    totalPagesCount: store.getState().pages.size, // total number of pages
  })

  const postBuildActivityTimer = report.activityTimer(`onPostBuild`, {
    parentSpan: buildSpan,
  })
  postBuildActivityTimer.start()
  await apiRunnerNode(`onPostBuild`, {
    graphql: gatsbyNodeGraphQLFunction,
    parentSpan: buildSpan,
  })
  postBuildActivityTimer.end()

  // Wait for any jobs that were started in onPostBuild
  // This could occur due to queries being run which invoke sharp for instance
  await waitUntilAllJobsComplete()

  try {
    await waitWorkerPoolEnd
  } catch (e) {
    report.warn(`Error when closing WorkerPool: ${e.message}`)
  }

  // Make sure we saved the latest state so we have all jobs cached
  await db.saveState()

  await Promise.all([waitForCompilerClose, waitForCompilerCloseBuildHtml])

  report.info(`Done building in ${process.uptime()} sec`)

  buildSpan.finish()
  await stopTracer()
  buildActivity.end()

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

  await Promise.all(engineBundlingPromises)

  showExperimentNotices()

  if (await userGetsSevenDayFeedback()) {
    showSevenDayFeedbackRequest()
  } else if (await userPassesFeedbackRequestHeuristic()) {
    showFeedbackRequest()
  }
}
