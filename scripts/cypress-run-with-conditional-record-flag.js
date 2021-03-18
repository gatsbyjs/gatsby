const childProcess = require(`child_process`)
const path = require(`path`)
const { isCI } = require(`gatsby-core-utils`)

const shouldRecord =
  !!process.env.CYPRESS_PROJECT_ID && !!process.env.CYPRESS_RECORD_KEY && isCI()

const cypressBin = path.join(process.cwd(), `node_modules/.bin/cypress`)

// first arg is node binary itself
// second arg is .js file entry point (as in - path to this file)
// we only care about extra args
const cypressArgs = [`run`, ...process.argv.slice(2)]

if (shouldRecord) {
  cypressArgs.push(`--record`)
}

childProcess.execFileSync(cypressBin, cypressArgs, {
  cwd: process.cwd(),
  stdio: `inherit`,
})
