const { spawn } = require(`child_process`)
const path = require(`path`)
const rimraf = require("rimraf")

const gatsbyBin = path.join(`node_modules`, `.bin`, `gatsby`)

exports.gatsbyCleanBeforeAll = async done => {
  const gatsbySiteDir = path.join(__dirname, `..`, `..`)

  const publicDir = path.join(gatsbySiteDir, `public`)
  await new Promise(resolve => rimraf(publicDir, resolve))

  const cacheDir = path.join(gatsbySiteDir, `.cache`)
  await new Promise(resolve => rimraf(cacheDir, resolve))

  const wordpressDir = path.join(gatsbySiteDir, `WordPress`)
  await new Promise(resolve => rimraf(wordpressDir, resolve))

  if (typeof done === `function`) {
    done()
  }
}

exports.spawnGatsbyProcess = (command = `develop`, env = {}) =>
  spawn(
    gatsbyBin,
    [command, ...(command === `develop` ? ["-H", "localhost"] : [])],
    {
      stdio: [`inherit`, `inherit`, `inherit`, `inherit`],
      env: {
        ...process.env,
        NODE_ENV: command === `develop` ? `development` : `production`,
        ...env,
      },
    }
  )
