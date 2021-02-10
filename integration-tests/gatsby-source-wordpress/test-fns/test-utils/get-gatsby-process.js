const { spawn } = require(`child_process`)
const path = require(`path`)
const rimraf = require("rimraf")

const gatsbyBin = path.join(`node_modules`, `.bin`, `gatsby`)

exports.gatsbyCleanBeforeAll = async done => {
  const gatsbySiteDir = path.join(__dirname, `..`, `..`)

  const publicDir = path.join(gatsbySiteDir, `public`)
  console.log("Deleting ​publicDir", publicDir)
  await new Promise(resolve => rimraf(publicDir, resolve))

  const cacheDir = path.join(gatsbySiteDir, `.cache`)
  console.log("Deleting ​cacheDir", cacheDir)
  await new Promise(resolve => rimraf(cacheDir, resolve))

  if (typeof done === `function`) {
    done()
  }
}

exports.getGatsbyProcess = (command = `develop`, env = {}) =>
  spawn(gatsbyBin, [command], {
    stdio: [`inherit`, `inherit`, `inherit`, `inherit`],
    env: {
      ...process.env,
      NODE_ENV: command === `develop` ? `development` : `production`,
      ...env,
    },
  })
