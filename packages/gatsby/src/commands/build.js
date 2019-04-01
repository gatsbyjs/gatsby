/* @flow */

const _ = require(`lodash`)
const path = require(`path`)
const report = require(`gatsby-cli/lib/reporter`)
const buildHTML = require(`./build-html`)
const buildProductionBundle = require(`./build-javascript`)
const bootstrap = require(`../bootstrap`)
const apiRunnerNode = require(`../utils/api-runner-node`)
const { copyStaticDirs } = require(`../utils/get-static-dir`)
const { initTracer, stopTracer } = require(`../utils/tracer`)
const chalk = require(`chalk`)
const tracer = require(`opentracing`).globalTracer()
const signalExit = require(`signal-exit`)
const telemetry = require(`gatsby-telemetry`)
const queryRunner = require(`../query`)
const { store, emitter } = require(`../redux`)
const db = require(`../db`)
const pageDataUtil = require(`../utils/page-data`)

function reportFailure(msg, err: Error) {
  report.log(``)
  report.panic(msg, err)
}

type BuildArgs = {
  directory: string,
  sitePackageJson: object,
  prefixPaths: boolean,
  noUglify: boolean,
  openTracingConfigFile: string,
}

const handleChangedCompilationHash = async (state, pageQueryIds, newHash) => {
  const publicDir = path.join(state.program.directory, `public`)
  const stalePaths = _.difference([...state.pages.keys()], pageQueryIds)
  await pageDataUtil.rewriteCompilationHashes(
    { publicDir },
    stalePaths,
    newHash
  )
  store.dispatch({
    type: `SET_WEBPACK_COMPILATION_HASH`,
    payload: newHash,
  })
}

module.exports = async function build(program: BuildArgs) {
  let activity
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

  const queryIds = queryRunner.calcBootstrapDirtyQueryIds(store.getState())
  const { staticQueryIds, pageQueryIds } = queryRunner.groupQueryIds(queryIds)

  activity = report.activityTimer(`run static queries`, {
    parentSpan: buildSpan,
  })
  activity.start()
  await queryRunner.processStaticQueries(staticQueryIds, { activity })
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
  const stats = await buildProductionBundle(program).catch(err => {
    reportFailure(`Generating JavaScript bundles failed`, err)
  })
  activity.end()

  const webpackCompilationHash = stats.hash
  if (webpackCompilationHash !== store.getState().webpackCompilationHash) {
    activity = report.activityTimer(`Rewriting compilation hashes`, {
      parentSpan: buildSpan,
    })
    activity.start()
    await handleChangedCompilationHash(
      store.getState(),
      pageQueryIds,
      webpackCompilationHash
    )
    activity.end()
  }

  activity = report.activityTimer(`run page queries`)
  activity.start()
  await queryRunner.processPageQueries(pageQueryIds, { activity })
  activity.end()

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

  await waitJobsFinished()

  await db.saveState()

  require(`../redux/actions`).boundActionCreators.setProgramStatus(
    `BOOTSTRAP_QUERY_RUNNING_FINISHED`
  )

  activity = report.activityTimer(`Building static HTML for pages`, {
    parentSpan: buildSpan,
  })
  activity.start()
  try {
    await buildHTML.buildRenderer(program, `build-html`)
    const pagePaths = [...store.getState().pages.keys()]
    await buildHTML.buildPages({ program, pagePaths, activity })
  } catch (err) {
    reportFailure(
      report.stripIndent`
        Building static HTML failed${
          err.context && err.context.path
            ? ` for path "${chalk.bold(err.context.path)}"`
            : ``
        }

        See our docs page on debugging HTML builds for help https://gatsby.dev/debug-html
      `,
      err
    )
  }
  activity.end()

  await apiRunnerNode(`onPostBuild`, {
    graphql: graphqlRunner,
    parentSpan: buildSpan,
  })

  report.info(`Done building in ${process.uptime()} sec`)

  buildSpan.finish()
  await stopTracer()
}
