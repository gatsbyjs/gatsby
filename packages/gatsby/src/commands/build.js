/* @flow */
const path = require(`path`)
const fs = require(`fs-extra`)
const report = require(`gatsby-cli/lib/reporter`)
const buildHTML = require(`./build-html`)
const buildProductionBundle = require(`./build-javascript`)
const bootstrap = require(`../bootstrap`)
const apiRunnerNode = require(`../utils/api-runner-node`)
const { copyStaticDirs } = require(`../utils/get-static-dir`)
const { initTracer, stopTracer } = require(`../utils/tracer`)
const db = require(`../db`)
const signalExit = require(`signal-exit`)
const telemetry = require(`gatsby-telemetry`)
const { store, emitter, readState } = require(`../redux`)
const queryUtil = require(`../query`)
const appDataUtil = require(`../utils/app-data`)
const WorkerPool = require(`../utils/worker/pool`)
const { structureWebpackErrors } = require(`../utils/webpack-error-utils`)
const pageDataUtil = require(`../utils/page-data`)

type BuildArgs = {
  directory: string,
  sitePackageJson: object,
  prefixPaths: boolean,
  noUglify: boolean,
  openTracingConfigFile: string,
}

const waitJobsFinished = () =>
  new Promise((resolve, reject) => {
    const onEndJob = () => {
      if (store.getState().jobs.active.length === 0) {
        resolve()
        emitter.off(`END_JOB`, onEndJob)
      }
    }
    emitter.on(`END_JOB`, onEndJob)
    onEndJob()
  })

module.exports = async function build(program: BuildArgs) {
  const publicDir = path.join(program.directory, `public`)
  const incrementalBuild =
    process.env.GATSBY_INCREMENTAL_BUILD === `true` || false
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
  } = await queryUtil.getInitialQueryProcessors({
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
  const stats = await buildProductionBundle(program, {
    parentSpan: activity.span,
  }).catch(err => {
    activity.panic(structureWebpackErrors(`build-javascript`, err))
  })
  activity.end()

  const workerPool = WorkerPool.create()

  const webpackCompilationHash = stats.hash
  if (
    webpackCompilationHash !== store.getState().webpackCompilationHash ||
    (!incrementalBuild && !appDataUtil.exists(publicDir))
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
  await waitJobsFinished()

  activity = report.activityTimer(`Building static HTML for pages`, {
    parentSpan: buildSpan,
  })
  const pagePaths = incrementalBuild
    ? await pageDataUtil.getNewPageKeys(store.getState(), readState())
    : [...store.getState().pages.keys()]
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
    await buildHTML.buildPages({
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
  if (incrementalBuild) {
    activity = report.activityTimer(`Delete previous page data`)
    activity.start()
    deletedPageKeys = await pageDataUtil.removePreviousPageData(
      program.directory,
      store.getState(),
      readState()
    )
    activity.end()
  }

  activity = report.activityTimer(`Update cache for next build`, {
    parentSpan: buildSpan,
  })
  activity.start()
  await db.saveState()
  activity.end()

  await apiRunnerNode(`onPostBuild`, {
    graphql: graphqlRunner,
    parentSpan: buildSpan,
  })

  report.info(`Done building in ${process.uptime()} sec`)

  buildSpan.finish()
  await stopTracer()
  workerPool.end()
  buildActivity.end()
  if (incrementalBuild && process.argv.indexOf(`--log-pages`) > -1) {
    if (pagePaths.length) {
      report.info(
        `Incremental build pages:\n${pagePaths.map(
          path => `Updated page: ${path}\n`
        )}`.replace(/,/g, ``)
      )
    }
    if (deletedPageKeys.length) {
      report.info(
        `Incremental build deleted pages:\n${deletedPageKeys.map(
          path => `Deleted page: ${path}\n`
        )}`.replace(/,/g, ``)
      )
    }
  }

  if (incrementalBuild && process.argv.indexOf(`--write-to-file`) > -1) {
    const createdFilesPath = path.resolve(
      `${program.directory}/.cache`,
      `newPages.txt`
    )
    const deletedFilesPath = path.resolve(
      `${program.directory}/.cache`,
      `deletedPages.txt`
    )

    if (pagePaths.length) {
      fs.writeFileSync(createdFilesPath, `${pagePaths.join(`\n`)}\n`, `utf8`)
      report.info(`newPages.txt created`)
    }
    if (deletedPageKeys.length) {
      fs.writeFileSync(
        deletedFilesPath,
        `${deletedPageKeys.join(`\n`)}\n`,
        `utf8`
      )
      report.info(`deletedPages.txt created`)
    }
  }
}
