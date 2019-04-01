/* @flow */

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
const { store } = require(`../redux`)
const db = require(`../db`)

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

module.exports = async function build(program: BuildArgs) {
  let activity
  initTracer(program.openTracingConfigFile)

  telemetry.trackCli(`BUILD_START`)
  signalExit(() => {
    telemetry.trackCli(`BUILD_END`)
  })

  const buildSpan = tracer.startSpan(`build`)
  buildSpan.setTag(`directory`, program.directory)

  const { pageQueryIds, graphqlRunner } = await bootstrap({
    ...program,
    parentSpan: buildSpan,
  })

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
  store.dispatch({
    type: `SET_WEBPACK_COMPILATION_HASH`,
    payload: webpackCompilationHash,
  })

  const state = store.getState()
  activity = report.activityTimer(`run page queries`)
  activity.start()
  await queryRunner.processQueries(
    pageQueryIds.map(id => queryRunner.makePageQueryJob(state, id)),
    { activity }
  )
  activity.end()

  require(`../redux/actions`).boundActionCreators.setProgramStatus(
    `BOOTSTRAP_QUERY_RUNNING_FINISHED`
  )

  await db.saveState()

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
