import path from "path"
import report from "gatsby-cli/lib/reporter"
import signalExit from "signal-exit"
import fs from "fs-extra"
import telemetry from "gatsby-telemetry"

import { doBuildPages, buildRenderer, deleteRenderer } from "./build-html"
import { buildProductionBundle } from "./build-javascript"
import { bootstrap } from "../bootstrap"
import apiRunnerNode from "../utils/api-runner-node"
import { GraphQLRunner } from "../query/graphql-runner"
import { copyStaticDirs } from "../utils/get-static-dir"
import { initTracer, stopTracer } from "../utils/tracer"
import db from "../db"
import { store } from "../redux"
import * as appDataUtil from "../utils/app-data"
import { flush as flushPendingPageDataWrites } from "../utils/page-data"
import * as WorkerPool from "../utils/worker/pool"
import { structureWebpackErrors } from "../utils/webpack-error-utils"
import {
  userGetsSevenDayFeedback,
  userPassesFeedbackRequestHeuristic,
  showFeedbackRequest,
  showSevenDayFeedbackRequest,
} from "../utils/feedback"
import * as buildUtils from "./build-utils"
import { actions } from "../redux/actions"
import { waitUntilAllJobsComplete } from "../utils/wait-until-jobs-complete"
import { IProgram, Stage } from "./types"
import { PackageJson } from "../.."
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
import { updateSiteMetadata } from "gatsby-core-utils"

interface IBuildArgs extends IProgram {
  directory: string
  sitePackageJson: PackageJson
  prefixPaths: boolean
  noUglify: boolean
  profile: boolean
  graphqlTracing: boolean
  openTracingConfigFile: string
  keepPageRenderer: boolean
}

module.exports = async function build(program: IBuildArgs): Promise<void> {
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
    telemetry.trackCli(`BUILD_END`, { exitCode })
  })

  const buildSpan = buildActivity.span
  buildSpan.setTag(`directory`, program.directory)

  const { gatsbyNodeGraphQLFunction } = await bootstrap({
    program,
    parentSpan: buildSpan,
  })

  const graphqlRunner = new GraphQLRunner(store, {
    collectStats: true,
    graphqlTracing: program.graphqlTracing,
  })

  const { queryIds } = await calculateDirtyQueries({ store })

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
  try {
    stats = await buildProductionBundle(program, buildActivityTimer.span)
  } catch (err) {
    buildActivityTimer.panic(structureWebpackErrors(Stage.BuildJavascript, err))
  } finally {
    buildActivityTimer.end()
  }

  const workerPool = WorkerPool.create()

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
  let pageRenderer: string
  try {
    pageRenderer = await buildRenderer(program, Stage.BuildHTML, buildSpan)
  } catch (err) {
    buildActivityTimer.panic(structureWebpackErrors(Stage.BuildHTML, err))
  } finally {
    buildSSRBundleActivityProgress.end()
  }

  buildUtils.markHtmlDirtyIfResultOfUsedStaticQueryChanged()

  const { toRegenerate, toDelete } = process.env
    .GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES
    ? buildUtils.calcDirtyHtmlFiles(store.getState())
    : {
        toRegenerate: [...store.getState().pages.keys()],
        toDelete: [],
      }

  telemetry.addSiteMeasurement(`BUILD_END`, {
    pagesCount: toRegenerate.length, // number of html files that will be written
    totalPagesCount: store.getState().pages.size, // total number of pages
  })

  const buildHTMLActivityProgress = report.createProgress(
    `Building static HTML for pages`,
    toRegenerate.length,
    0,
    {
      parentSpan: buildSpan,
    }
  )
  buildHTMLActivityProgress.start()
  try {
    await doBuildPages(
      pageRenderer,
      toRegenerate,
      buildHTMLActivityProgress,
      workerPool,
      Stage.BuildHTML
    )
  } catch (err) {
    let id = `95313` // TODO: verify error IDs exist
    const context = {
      errorPath: err.context && err.context.path,
      ref: ``,
    }

    const match = err.message.match(
      /ReferenceError: (window|document|localStorage|navigator|alert|location) is not defined/i
    )
    if (match && match[1]) {
      id = `95312`
      context.ref = match[1]
    }

    buildHTMLActivityProgress.panic({
      id,
      context,
      error: err,
    })
  }
  buildHTMLActivityProgress.end()

  if (!program.keepPageRenderer) {
    try {
      await deleteRenderer(pageRenderer)
    } catch (err) {
      // pass through
    }
  }

  if (toDelete.length > 0) {
    const deletePageDataActivityTimer = report.activityTimer(
      `Delete previous page data`
    )
    deletePageDataActivityTimer.start()
    await buildUtils.removePageFiles(publicDir, toDelete)

    deletePageDataActivityTimer.end()
  }

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

  // Make sure we saved the latest state so we have all jobs cached
  await db.saveState()

  report.info(`Done building in ${process.uptime()} sec`)

  buildSpan.finish()
  await stopTracer()
  workerPool.end()
  buildActivity.end()

  if (
    process.env.GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES &&
    process.argv.includes(`--log-pages`)
  ) {
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

  if (
    process.env.GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES &&
    process.argv.includes(`--write-to-file`)
  ) {
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

  if (await userGetsSevenDayFeedback()) {
    showSevenDayFeedbackRequest()
  } else if (await userPassesFeedbackRequestHeuristic()) {
    showFeedbackRequest()
  }
}
