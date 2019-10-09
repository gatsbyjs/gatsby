/* @flow */
const path = require(`path`)
const report = require(`gatsby-cli/lib/reporter`)
const buildHTML = require(`./build-html`)
const buildProductionBundle = require(`./build-javascript`)
const bootstrap = require(`../bootstrap`)
const apiRunnerNode = require(`../utils/api-runner-node`)
const { copyStaticDirs } = require(`../utils/get-static-dir`)
const { initTracer, stopTracer } = require(`../utils/tracer`)
const db = require(`../db`)
const del = require(`del`)
const fs = require(`fs-extra`)
const tracer = require(`opentracing`).globalTracer()
const signalExit = require(`signal-exit`)
const telemetry = require(`gatsby-telemetry`)
const { store, emitter } = require(`../redux`)
const queryUtil = require(`../query`)
const pageDataUtil = require(`../utils/page-data`)
const WorkerPool = require(`../utils/worker/pool`)
const handleWebpackError = require(`../utils/webpack-error-parser`)

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
  initTracer(program.openTracingConfigFile)

  telemetry.trackCli(`BUILD_START`)
  signalExit(() => {
    telemetry.trackCli(`BUILD_END`)
  })

  const buildSpan = tracer.startSpan(`build`)
  buildSpan.setTag(`directory`, program.directory)

  const { graphqlRunner } = await bootstrap({
    ...program,
    parentSpan: buildSpan,
  })

  const queryIds = queryUtil.calcInitialDirtyQueryIds(store.getState())
  const { staticQueryIds, pageQueryIds } = queryUtil.groupQueryIds(queryIds)

  let activity = report.activityTimer(`run static queries`, {
    parentSpan: buildSpan,
  })
  activity.start()
  await queryUtil.processStaticQueries(staticQueryIds, {
    activity,
    state: store.getState(),
  })
  activity.end()

  await apiRunnerNode(`onPreBuild`, {
    graphql: graphqlRunner,
    parentSpan: buildSpan,
  })

  // Copy files from the static directory to
  // an equivalent static directory within public.
  copyStaticDirs()

  activity = report.activityTimer(
    `Building production JavaScript and CSS bundles`,
    { parentSpan: buildSpan }
  )
  activity.start()
  const stats = await buildProductionBundle(program, {
    parentSpan: activity.span,
  }).catch(err => {
    report.panic(handleWebpackError(`build-javascript`, err))
  })
  activity.end()

  const workerPool = WorkerPool.create()
  let isNewBuild = false // by default we don't want to do a rebuild of all html

  /*
   * A new webpack hash is returned from JS build if there are code changes
   * if the code is changed we want to delete the old html and build new ones
   */

  if (fs.existsSync(`${program.directory}/temp/redux-state-old.json`)) {
    const previousWebpackCompilationHash = require(`${program.directory}/temp/redux-state-old.json`)
    console.log("test");
    if (
      stats.hash !== previousWebpackCompilationHash.webpackCompilationHashOld
    ) {
      isNewBuild = true
      activity = report.activityTimer(
        `delete html and css files from previous builds`,
        {}
      )
      activity.start()
      await del([
        `public/**/*.{html}`,
        `!public/static`,
        `!public/static/**/*.{html,css}`,
      ])
      activity.end()
    }
  }

  /*
   * We let the page queries run creating the page data
   */

  activity = report.activityTimer(`run page queries`, {
    parentSpan: buildSpan,
  })
  activity.start()
  await queryUtil.processPageQueries(pageQueryIds, program, isNewBuild, {
    activity,
  })
  activity.end()

  require(`../redux/actions`).boundActionCreators.setProgramStatus(
    `BOOTSTRAP_QUERY_RUNNING_FINISHED`
  )

  /*
   * (This maybe reduanant code below as we are not updating the webpackHash)
   * We check if the page-data fold exists if so we then change the webpack hash to blank
   * This removes the check that reloads the page if the html's window and the page-data hashs do not match.
   */

  if (fs.existsSync(`${program.directory}/public/page-data`)) {
    activity = report.activityTimer(`Rewriting compilation hashes`, {
      parentSpan: buildSpan,
    })
    activity.start()
    await pageDataUtil.updateCompilationHashes(
      {
        publicDir,
        workerPool,
      },
      [...store.getState().pages.keys()],
      ``
    )
    activity.end()
  }

  /*
   * Lets start building some new HTML pages
   */
  activity = report.activityTimer(`Building static HTML for pages`, {
    parentSpan: buildSpan,
  })
  activity.start()

  /*
   * Next we compare the old page data to the new data in state and returns the different page keys
   */
  const newPageKeys = await pageDataUtil.getNewPageKeys(
    program.directory,
    store,
    isNewBuild
  )

  try {
    await buildHTML.buildPages({
      program,
      stage: `build-html`,
      pagePaths: newPageKeys,
      activity,
      workerPool,
    })
  } catch (err) {
    let id = `95313` // TODO: verify error IDs exist

    if (err.message === `ReferenceError: window is not defined`) {
      id = `95312`
    }

    report.panic({
      id,
      error: err,
      context: {
        errorPath: err.context && err.context.path,
      },
    })
  }
  activity.end()

  /*
   * We then check for pages that may have been removed and delete them.
   */
  if (
    !isNewBuild ||
    fs.existsSync(`${program.directory}/temp/redux-state-old.json`)
  ) {
    activity = report.activityTimer(`Delete old page and page data`)
    activity.start()
    await pageDataUtil.removeOldPageData(program.directory, store)
    activity.end()
  }

  /*
   * We then save the JS compiled hash to compare in the next build
   */
  store.dispatch({
    type: `SET_WEBPACK_COMPILATION_HASH`,
    payload: stats.hash,
  })
  await waitJobsFinished()
  await db.saveState()

  await apiRunnerNode(`onPostBuild`, {
    graphql: graphqlRunner,
    parentSpan: buildSpan,
  })

  report.info(`Done building in ${process.uptime()} sec`)

  buildSpan.finish()
  await stopTracer()
  workerPool.end()
}
