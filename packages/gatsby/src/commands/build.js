/* @flow */

const report = require(`gatsby-cli/lib/reporter`)
const buildHTML = require(`./build-html`)
const buildProductionBundle = require(`./build-javascript`)
const bootstrap = require(`../bootstrap`)
const apiRunnerNode = require(`../utils/api-runner-node`)
const { copyStaticDirs } = require(`../utils/get-static-dir`)
const { initTracer, stopTracer } = require(`../utils/tracer`)
const db = require(`../db`)
const chalk = require(`chalk`)
const tracer = require(`opentracing`).globalTracer()
const signalExit = require(`signal-exit`)
const telemetry = require(`gatsby-telemetry`)
const { store, emitter } = require(`../redux`)
const queryUtil = require(`../query`)

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
  await buildProductionBundle(program).catch(err => {
    reportFailure(`Generating JavaScript bundles failed`, err)
  })
  activity.end()

  activity = report.activityTimer(`run page queries`)
  activity.start()
  await queryUtil.processPageQueries(pageQueryIds, { activity })
  activity.end()

  require(`../redux/actions`).boundActionCreators.setProgramStatus(
    `BOOTSTRAP_QUERY_RUNNING_FINISHED`
  )

  await waitJobsFinished()

  await db.saveState()

  activity = report.activityTimer(`Building static HTML for pages`, {
    parentSpan: buildSpan,
  })
  activity.start()
  try {
    await buildHTML.buildPages({
      program,
      stage: `build-html`,
      pagePaths: [...store.getState().pages.keys()],
      activity,
    })
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
