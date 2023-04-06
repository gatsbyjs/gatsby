const childProcess = require(`child_process`)
const path = require(`path`)

const IS_CI = !!(
  process.env.CI || // Travis CI, CircleCI, Cirrus CI, Gitlab CI, Appveyor, CodeShip, dsari
  process.env.CONTINUOUS_INTEGRATION || // Travis CI, Cirrus CI
  process.env.BUILD_NUMBER || // Jenkins, TeamCity
  process.env.RUN_ID || // TaskCluster, dsari
  exports.name ||
  false
)

const shouldRecord = !!process.env.CYPRESS_RECORD_KEY && IS_CI

const cypressBin = path.join(process.cwd(), `node_modules/.bin/cypress`)

// first arg is node binary itself
// second arg is .js file entry point (as in - path to this file)
// we only care about extra args
const cypressArgs = [`run`, ...process.argv.slice(2)]

if (shouldRecord) {
  cypressArgs.push(`--record`)

  if (process.env.CYPRESS_GROUP_NAME) {
    cypressArgs.push(`--group`, process.env.CYPRESS_GROUP_NAME)
  }
}

childProcess.execFileSync(cypressBin, cypressArgs, {
  cwd: process.cwd(),
  stdio: `inherit`,
})
