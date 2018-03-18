/* @flow */

const report = require(`gatsby-cli/lib/reporter`)
const buildHTML = require(`./build-html`)
const buildProductionBundle = require(`./build-javascript`)
const bootstrap = require(`../bootstrap`)
const apiRunnerNode = require(`../utils/api-runner-node`)
const copyStaticDirectory = require(`../utils/copy-static-directory`)

function reportFailure(msg, err: Error) {
  report.log(``)
  report.panic(msg, err)
}

type BuildArgs = {
  directory: string,
  sitePackageJson: object,
  browserslist: string[],
  prefixPaths: boolean,
}

module.exports = async function build(program: BuildArgs) {
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
}
