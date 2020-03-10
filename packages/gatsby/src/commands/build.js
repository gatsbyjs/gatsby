/* @flow */

const path = require(`path`)
const report = require(`gatsby-cli/lib/reporter`)
const fs = require(`fs-extra`)
import { buildHTML } from "./build-html"
import { buildProductionBundle } from "./build-javascript"
const bootstrap = require(`../bootstrap`)
const apiRunnerNode = require(`../utils/api-runner-node`)
const { copyStaticDirs } = require(`../utils/get-static-dir`)
const { initTracer, stopTracer } = require(`../utils/tracer`)
const db = require(`../db`)
const signalExit = require(`signal-exit`)
const telemetry = require(`gatsby-telemetry`)
const { store, emitter, readState } = require(`../redux`)
const queryUtil = require(`../query`)
import * as appDataUtil from "../utils/app-data"
const WorkerPool = require(`../utils/worker/pool`)
const { structureWebpackErrors } = require(`../utils/webpack-error-utils`)
const {
  waitUntilAllJobsComplete: waitUntilAllJobsV2Complete,
} = require(`../utils/jobs-manager`)
import {
  userPassesFeedbackRequestHeuristic,
  showFeedbackRequest,
} from "../utils/feedback"
const buildUtils = require(`../commands/build-utils`)
const { boundActionCreators } = require(`../redux/actions`)

let cachedPageData
let cachedWebpackCompilationHash
if (process.env.GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES) {
  const { pageData, webpackCompilationHash } = readState()
  // extract only data that we need to reuse and let v8 garbage collect rest of state
  cachedPageData = pageData
  cachedWebpackCompilationHash = webpackCompilationHash
}

type BuildArgs = {
  directory: string,
  sitePackageJson: object,
  prefixPaths: boolean,
  noUglify: boolean,
  profile: boolean,
  openTracingConfigFile: string,
}

const waitUntilAllJobsComplete = () => {
  const jobsV1Promise = new Promise(resolve => {
    const onEndJob = () => {
      if (store.getState().jobs.active.length === 0) {
        resolve()
        emitter.off(`END_JOB`, onEndJob)
      }
    }
    emitter.on(`END_JOB`, onEndJob)
    onEndJob()
  })

  return Promise.all([
    jobsV1Promise,
    waitUntilAllJobsV2Complete(),
  ]).then(() => {})
}

module.exports = async function build(program: BuildArgs) {
  if (program.profile) {
    report.warn(
      `React Profiling is enabled. This can have a performance impact. See https://www.gatsbyjs.org/docs/profiling-site-performance-with-react-profiler/#performance-impact`
    )
  }

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

  const { graphqlRunner } = await bootstrap({
    ...program,
    parentSpan: buildSpan,
  })

  const {
    processPageQueries,
    processStaticQueries,
  } = queryUtil.getInitialQueryProcessors({
    parentSpan: buildSpan,
  })

  await processStaticQueries()

  await apiRunnerNode(`onPreBuild`, {
    graphql: graphqlRunner,
    parentSpan: buildSpan,
  })

  // Copy files from the static directory to
  // an equivalent static directory within public.
  copyStaticDirs()

  let activity = report.activityTimer(
    `Building production JavaScript and CSS bundles`,
    { parentSpan: buildSpan }
  )
  activity.start()
  const stats = await buildProductionBundle(program, activity.span).catch(
    err => {
      activity.panic(structureWebpackErrors(`build-javascript`, err))
    }
  )
  activity.end()

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

    activity = report.activityTimer(`Rewriting compilation hashes`, {
      parentSpan: buildSpan,
    })
    activity.start()

    await appDataUtil.write(publicDir, webpackCompilationHash)

    activity.end()
  }

  await processPageQueries()

  if (process.env.GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES) {
    const { pages } = store.getState()
    if (cachedPageData) {
      cachedPageData.forEach((_value, key) => {
        if (!pages.has(key)) {
          boundActionCreators.removePageData({
            id: key,
          })
        }
      })
    }
  }

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
    })
  }

  require(`../redux/actions`).boundActionCreators.setProgramStatus(
    `BOOTSTRAP_QUERY_RUNNING_FINISHED`
  )

  await db.saveState()

  await waitUntilAllJobsComplete()

  // we need to save it again to make sure our latest state has been saved
  await db.saveState()

  let pagePaths = [...store.getState().pages.keys()]

  // Rebuild subset of pages if user opt into GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES
  // if there were no source files (for example components, static queries, etc) changes since last build, otherwise rebuild all pages
  if (
    process.env.GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES &&
    cachedWebpackCompilationHash === store.getState().webpackCompilationHash
  ) {
    pagePaths = buildUtils.getChangedPageDataKeys(
      store.getState(),
      cachedPageData
    )
  }

  activity = report.createProgress(
    `Building static HTML for pages`,
    pagePaths.length,
    0,
    {
      parentSpan: buildSpan,
    }
  )
  activity.start()
  try {
    await buildHTML({
      program,
      stage: `build-html`,
      pagePaths,
      activity,
      workerPool,
    })
  } catch (err) {
    let id = `95313` // TODO: verify error IDs exist
    const context = {
      errorPath: err.context && err.context.path,
    }

    const match = err.message.match(
      /ReferenceError: (window|document|localStorage|navigator|alert|location) is not defined/i
    )
    if (match && match[1]) {
      id = `95312`
      context.ref = match[1]
    }

    activity.panic({
      id,
      context,
      error: err,
    })
  }
  activity.done()

  let deletedPageKeys = []
  if (process.env.GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES) {
    activity = report.activityTimer(`Delete previous page data`)
    activity.start()
    deletedPageKeys = buildUtils.collectRemovedPageData(
      store.getState(),
      cachedPageData
    )
    await buildUtils.removePageFiles({ publicDir }, deletedPageKeys)

    activity.end()
  }

  activity = report.activityTimer(`onPostBuild`, { parentSpan: buildSpan })
  activity.start()
  await apiRunnerNode(`onPostBuild`, {
    graphql: graphqlRunner,
    parentSpan: buildSpan,
  })
  activity.end()

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
    if (pagePaths.length) {
      report.info(
        `Built pages:\n${pagePaths
          .map(path => `Updated page: ${path}`)
          .join(`\n`)}`
      )
    }

    if (deletedPageKeys.length) {
      report.info(
        `Deleted pages:\n${deletedPageKeys
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
    const deletedFilesPath = path.resolve(
      `${program.directory}/.cache`,
      `deletedPages.txt`
    )

    if (pagePaths.length) {
      await fs.writeFile(createdFilesPath, `${pagePaths.join(`\n`)}\n`, `utf8`)
      report.info(`.cache/newPages.txt created`)
    }
    if (deletedPageKeys.length) {
      await fs.writeFile(
        deletedFilesPath,
        `${deletedPageKeys.join(`\n`)}\n`,
        `utf8`
      )
      report.info(`.cache/deletedPages.txt created`)
    }
  }

  if (await userPassesFeedbackRequestHeuristic()) {
    showFeedbackRequest()
  }
}
