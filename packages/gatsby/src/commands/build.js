/* @flow */

const report = require(`gatsby-cli/lib/reporter`)
const buildHTML = require(`./build-html`)
const buildProductionBundle = require(`./build-javascript`)
const bootstrap = require(`../bootstrap`)
const apiRunnerNode = require(`../utils/api-runner-node`)
const copyStaticDirectory = require(`../utils/copy-static-directory`)
const slash = require(`slash`)
const fs = require(`fs`)
const path = require(`path`)
const opentracing = require(`opentracing`)

function reportFailure(msg, err: Error) {
  report.log(``)
  report.panic(msg, err)
}

type BuildArgs = {
  directory: string,
  sitePackageJson: object,
  browserslist: string[],
  prefixPaths: boolean,
  noUglify: boolean,
  openTracingConfigFile: string,
}

function loadTracer(tracerFile) {
  let tracer
  if (tracerFile) {
    console.log(tracerFile)
    const resolvedPath = slash(path.resolve(tracerFile))
    const createTracer = require(resolvedPath)
    tracer = createTracer()
  } else {
    console.log('using noop tracer')
    tracer = new opentracing.Tracer() // Noop
  }

  return tracer
}

module.exports = async function build(program: BuildArgs) {

  const tracer = loadTracer(program.openTracingConfigFile)
  opentracing.initGlobalTracer(tracer)
  // const tracer = opentracing.globalTracer()
  // const buildSpan = tracer.startSpan(`build`)
  // buildSpan.setTag(`directory`, program.directory)
  // program.span = buildSpan

  const { graphqlRunner } = await bootstrap(program)

  await apiRunnerNode(`onPreBuild`, { graphql: graphqlRunner })

  // Copy files from the static directory to
  // an equivalent static directory within public.
  copyStaticDirectory()

  let activity
  activity = report.activityTimer(
    `Building production JavaScript and CSS bundles`
  )
  activity.start()
  await buildProductionBundle(program).catch(err => {
    reportFailure(`Generating JavaScript bundles failed`, err)
  })
  activity.end()

  activity = report.activityTimer(`Building static HTML for pages`)
  activity.start()
  await buildHTML(program).catch(err => {
    reportFailure(
      report.stripIndent`
        Building static HTML for pages failed

        See our docs page on debugging HTML builds for help https://goo.gl/yL9lND
      `,
      err
    )
  })
  activity.end()

  await apiRunnerNode(`onPostBuild`, { graphql: graphqlRunner })

  report.info(`Done building in ${process.uptime()} sec`)

  // buildSpan.finish()
  // jaegerTracer.close(() => process.exit())
}
